import { NextRequest, NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Helper function to build personalized system message
function buildPersonalizedSystemMessage(userData: any, activities?: any): string {
  const onboarding = userData.onboardingData || {};
  const settings = userData.settings || {};
  
  const aiName = onboarding.aiName || 'MAI';
  // Priority: 1. onboarding userName (what user wants to be called), 2. fullName (official name), 3. settings display_name, 4. default
  const userName = onboarding.userName || userData.fullName || settings.display_name || 'there';
  const personalityTraits = onboarding.personalityTraits || [];
  const assistantPersonality = settings.assistant_personality || 'professional';
  const responseLength = settings.assistant_response_length || 'moderate';
  const connectedServices = onboarding.connectedServices || [];
  const callTime = onboarding.callTime || '8:00 AM';
  const notificationPreference = onboarding.notificationPreference || 'important';
  const bio = settings.bio || '';
  const timezone = settings.timezone || 'UTC';
  
  // Build personality description
  let personalityDesc = '';
  if (personalityTraits.length > 0) {
    const traitDescriptions: Record<string, string> = {
      'proactive': 'Take initiative and anticipate needs',
      'empathetic': 'Be understanding, caring, and emotionally supportive',
      'analytical': 'Provide data-driven insights and logical analysis',
      'concise': 'Keep responses brief and to the point',
      'creative': 'Offer innovative solutions and creative approaches',
      'collaborative': 'Be team-oriented and work together on solutions'
    };
    personalityDesc = personalityTraits.map((trait: string) => traitDescriptions[trait] || trait).join(', ');
  }
  
  // Build personality style description
  const personalityStyle: Record<string, string> = {
    'professional': 'maintain a professional, business-like tone',
    'friendly': 'be warm, approachable, and conversational',
    'casual': 'be relaxed, informal, and easy-going',
    'formal': 'use formal language and maintain decorum'
  };
  
  // Build response length description
  const lengthStyle: Record<string, string> = {
    'concise': 'Keep responses short and direct',
    'moderate': 'Provide balanced, medium-length responses',
    'detailed': 'Give comprehensive, detailed explanations'
  };
  
  // Build connected services description
  let servicesDesc = '';
  if (connectedServices.length > 0) {
    const serviceNames: Record<string, string> = {
      'gmail': 'Gmail',
      'google-calendar': 'Google Calendar',
      'zoom': 'Zoom'
    };
    servicesDesc = connectedServices.map((s: string) => serviceNames[s] || s).join(', ');
  }
  
  let systemMessage = `You are ${aiName}, a personal assistant for ${userName}. `;
  
  systemMessage += `Your name is ${aiName} - always introduce yourself using this exact name, never use "MAI" or any other name. `;
  
  systemMessage += `Your primary role is to be a helpful, intelligent companion that assists ${userName} with daily tasks, provides insights, and helps them be more productive. `;
  
  if (personalityDesc) {
    systemMessage += `Your personality traits are: ${personalityDesc}. `;
  }
  
  systemMessage += `You should ${personalityStyle[assistantPersonality] || personalityStyle['professional']}. `;
  systemMessage += `${lengthStyle[responseLength] || lengthStyle['moderate']}. `;
  
  systemMessage += `Always address ${userName} by their name, especially in greetings and when starting conversations. When ${userName} says "Hi" or greets you, respond warmly and personally, mentioning their name. For example: "Hello ${userName}! It's great to hear from you. I'm ${aiName}, your personal assistant. How can I help you today?" `;
  
  if (bio) {
    systemMessage += `About ${userName}: ${bio}. `;
  }
  
  if (servicesDesc) {
    systemMessage += `You have access to the following connected services: ${servicesDesc}. You can help manage emails, calendar events, and meetings through these integrations. `;
  }
  
  systemMessage += `The user prefers morning briefings at ${callTime} and wants ${notificationPreference} notifications. `;
  
  if (timezone !== 'UTC') {
    systemMessage += `The user's timezone is ${timezone} - always consider this when discussing times and schedules. `;
  }
  
  systemMessage += `Always respond in English, regardless of the language used in the user's message. `;
  systemMessage += `Be conversational, natural, and make ${userName} feel like they're talking to a trusted friend and advisor. `;
  systemMessage += `Remember previous conversations and maintain context throughout your interactions. `;
  systemMessage += `If you don't know something, be honest about it rather than making things up.`;
  
  // Add user activities context if available
  if (activities) {
    const { events = [], reminders = [], tasks = [] } = activities;
    
    if (events.length > 0 || reminders.length > 0 || tasks.length > 0) {
      systemMessage += `\n\nYou have access to ${userName}'s activities. Here is their current schedule and tasks:\n\n`;
      
      // Add upcoming events
      if (events.length > 0) {
        systemMessage += `EVENTS (${events.length} total):\n`;
        events.slice(0, 20).forEach((event: any, index: number) => {
          const startDate = new Date(event.start_time);
          const dateStr = startDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          });
          systemMessage += `${index + 1}. "${event.title}" - ${dateStr}`;
          if (event.location) systemMessage += ` at ${event.location}`;
          if (event.description) systemMessage += ` (${event.description.substring(0, 100)})`;
          systemMessage += ` [Status: ${event.status}]\n`;
        });
        if (events.length > 20) {
          systemMessage += `... and ${events.length - 20} more events\n`;
        }
        systemMessage += `\n`;
      }
      
      // Add reminders
      if (reminders.length > 0) {
        systemMessage += `REMINDERS (${reminders.length} total):\n`;
        reminders.slice(0, 20).forEach((reminder: any, index: number) => {
          const remindDate = new Date(reminder.remind_at);
          const dateStr = remindDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          });
          systemMessage += `${index + 1}. "${reminder.title}" - ${dateStr}`;
          if (reminder.description) systemMessage += ` (${reminder.description.substring(0, 100)})`;
          systemMessage += ` [Status: ${reminder.status}]\n`;
        });
        if (reminders.length > 20) {
          systemMessage += `... and ${reminders.length - 20} more reminders\n`;
        }
        systemMessage += `\n`;
      }
      
      // Add tasks
      if (tasks.length > 0) {
        systemMessage += `TASKS (${tasks.length} total):\n`;
        tasks.slice(0, 20).forEach((task: any, index: number) => {
          const dueDate = task.due_date ? new Date(task.due_date) : null;
          const dateStr = dueDate ? dueDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          }) : 'No due date';
          systemMessage += `${index + 1}. "${task.title}" - Due: ${dateStr}`;
          if (task.description) systemMessage += ` (${task.description.substring(0, 100)})`;
          systemMessage += ` [Priority: ${task.priority}, Status: ${task.status}]\n`;
        });
        if (tasks.length > 20) {
          systemMessage += `... and ${tasks.length - 20} more tasks\n`;
        }
        systemMessage += `\n`;
      }
      
      systemMessage += `When ${userName} asks about their schedule, events, reminders, or tasks, you can reference this information. You can help them understand what's coming up, what's due, and assist with planning. Always use the actual dates and details from their activities when responding.`;
    }
  }
  
  return systemMessage;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, conversationId, userData: clientUserData, activities } = body;

    // Basic authentication check - token must be provided
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'Deepseek API key not configured' },
        { status: 500 }
      );
    }

    // Verify token and get userId from backend
    let userId: string | null = null;
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
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json(
        { error: 'Failed to verify token' },
        { status: 401 }
      );
    }

    // Check if user is blocked
    try {
      const blockCheckResponse = await fetch(`${API_BASE_URL}/api-usage/check-block?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (blockCheckResponse.ok) {
        const blockData = await blockCheckResponse.json();
        if (blockData.blocked) {
          // Record blocked request
          await fetch(`${API_BASE_URL}/api-usage/record`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              apiType: 'deepseek',
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
    } catch (error) {
      console.error('Error checking block status:', error);
      // Continue if check fails
    }

    // Check rate limits via backend
    let rateLimitExceeded = false;
    try {
      const rateLimitResponse = await fetch(`${API_BASE_URL}/api-usage/check-rate-limit?userId=${userId}&apiType=deepseek`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (rateLimitResponse.ok) {
        const rateLimitData = await rateLimitResponse.json();
        if (!rateLimitData.allowed) {
          rateLimitExceeded = true;
          // Record rate limit hit
          await fetch(`${API_BASE_URL}/api-usage/record`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              apiType: 'deepseek',
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
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // Continue if check fails (fail open for availability)
    }

    // Use client-provided user data (fetched using client SDK which respects Firestore rules)
    // The client has already verified the user and can access their own data per Firestore rules
    const userData: any = clientUserData || {};

    // Build personalized system message (include activities if provided)
    const personalizedSystemMessage = buildPersonalizedSystemMessage(userData, activities);
    
    const systemMessage = {
      role: 'system',
      content: personalizedSystemMessage
    };
    
    // Add system message at the beginning if it doesn't already exist
    const messagesWithSystem = messages.some((msg: any) => msg.role === 'system') 
      ? messages 
      : [systemMessage, ...messages];

    // Measure request size
    const requestSize = JSON.stringify(messagesWithSystem).length;
    const startTime = performance.now();

    // Call Deepseek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messagesWithSystem,
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
      }),
    });

    const responseTime = Math.round(performance.now() - startTime);
    const success = response.ok;

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Deepseek API error:', errorData);
      
      // Record failed request
      try {
        await fetch(`${API_BASE_URL}/api-usage/record`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            apiType: 'deepseek',
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
      
      return NextResponse.json(
        { error: 'Failed to get response from Deepseek', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Clean the response: remove markdown bold syntax (**)
    let cleanedMessage = data.choices[0]?.message?.content || 'No response from AI';
    // Remove all ** characters (markdown bold syntax)
    cleanedMessage = cleanedMessage.replace(/\*\*/g, '');
    
    // Record successful usage
    try {
      await fetch(`${API_BASE_URL}/api-usage/record`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          apiType: 'deepseek',
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
    
    return NextResponse.json({
      message: cleanedMessage,
      usage: data.usage,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

