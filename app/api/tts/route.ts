import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, voiceId } = body;

    if (!text || !voiceId) {
      return NextResponse.json(
        { error: 'Text and voiceId are required' },
        { status: 400 }
      );
    }

    if (!ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      );
    }

    // Get auth token from request
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      try {
        const verifyResponse = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (verifyResponse.ok) {
          const verifyData = await verifyResponse.json();
          userId = verifyData.uid;
          
          // Check if user is blocked
          const blockCheckResponse = await fetch(`${API_BASE_URL}/api-usage/check-block?userId=${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (blockCheckResponse.ok) {
            const blockData = await blockCheckResponse.json();
            if (blockData.blocked) {
              await fetch(`${API_BASE_URL}/api-usage/record`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId,
                  apiType: 'elevenlabs',
                  success: false,
                  blocked: true,
                  rateLimitExceeded: false,
                }),
              });
              
              return NextResponse.json(
                { error: 'API access blocked', message: 'Your API access has been temporarily blocked. Please contact support.' },
                { status: 403 }
              );
            }
          }
          
          // Check rate limits
          const rateLimitResponse = await fetch(`${API_BASE_URL}/api-usage/check-rate-limit?userId=${userId}&apiType=elevenlabs`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (rateLimitResponse.ok) {
            const rateLimitData = await rateLimitResponse.json();
            if (!rateLimitData.allowed) {
              await fetch(`${API_BASE_URL}/api-usage/record`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userId,
                  apiType: 'elevenlabs',
                  success: false,
                  blocked: false,
                  rateLimitExceeded: true,
                }),
              });
              
              return NextResponse.json(
                { 
                  error: 'Rate limit exceeded',
                  message: rateLimitData.message,
                  limit: rateLimitData.limit,
                  used: rateLimitData.used,
                  resetTime: rateLimitData.resetTime
                },
                { status: 429 }
              );
            }
          }
        }
      } catch (error) {
        console.error('Error verifying token or checking limits:', error);
        // Continue if check fails (fail open for availability)
      }
    }

    // Measure request size and time
    const requestSize = text.length;
    const startTime = performance.now();

    // Call ElevenLabs API
    const response = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    const responseTime = Math.round(performance.now() - startTime);
    const success = response.ok;

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API error:', errorData);
      
      // Record failed request
      if (userId && authHeader) {
        try {
          const token = authHeader.split('Bearer ')[1];
          await fetch(`${API_BASE_URL}/api-usage/record`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              apiType: 'elevenlabs',
              success: false,
              blocked: false,
              rateLimitExceeded: false,
              responseTime,
              requestSize,
            }),
          });
        } catch (error) {
          console.error('Error recording usage:', error);
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to generate audio', details: errorData },
        { status: response.status }
      );
    }

    // Get audio as blob
    const audioBlob = await response.blob();
    const audioBuffer = await audioBlob.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    // Record successful usage
    if (userId && authHeader) {
      try {
        const token = authHeader.split('Bearer ')[1];
        await fetch(`${API_BASE_URL}/api-usage/record`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            apiType: 'elevenlabs',
            success: true,
            blocked: false,
            rateLimitExceeded: false,
            responseTime,
            requestSize,
          }),
        });
      } catch (error) {
        console.error('Error recording usage:', error);
        // Don't fail the request if usage tracking fails
      }
    }

    return NextResponse.json({
      audio: `data:audio/mpeg;base64,${audioBase64}`,
      format: 'mp3',
    });
  } catch (error: any) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

