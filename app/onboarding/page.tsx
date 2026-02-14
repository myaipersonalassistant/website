'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, ArrowLeft, Check,
  User, Volume2, Calendar, MessageSquare, Bell, Clock,
  Sparkles, Heart, Brain, Zap, Users, Mail, Video
} from 'lucide-react';
import { auth, getDb } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, addDoc } from 'firebase/firestore';

interface OnboardingData {
  aiName: string;
  userName: string;
  ageConfirmed: boolean;
  selectedVoice: string;
  personalityTraits: string[];
  referralSource: string;
  connectedServices: string[];
  callTime: string;
  notificationPreference: string;
}

const RECOMMENDED_AI_NAMES = ['Luna', 'Atlas', 'Nova', 'Sage', 'MAI'];
// Voice Options (10 premium voices)
export const VOICE_OPTIONS = [
  { id: 'gAMZphRyrWJnLMDnom6H', name: 'Keith', description: 'Deep and professional', gender: 'Male' },
  { id: '6OzrBCQf8cjERkYgzSg8', name: 'Jamal', description: 'Black African American', gender: 'Male' },
  { id: 'NQMJRVvPew6HsaebYnZj', name: 'Cecily', description: 'Conversational and warm', gender: 'Female' },
  { id: '8L53MDQFE8FzIw7uiRtS', name: 'Michael', description: 'Nigerian and Conversational', gender: 'Male' },
  { id: 'RpiHVNPKGBg7UmgmrKrN', name: 'Aashish', description: 'Natural Indian male', gender: 'Male' },
  { id: 'AYQJi30bKdh5rHiPdUGX', name: 'Kaylin', description: 'Bright and energetic', gender: 'Female' },
  { id: 'bCwW7dMszE8OyqvhCaQY', name: 'Connor', description: 'Calm and Neutral', gender: 'Male' },
  { id: 'IQjnnInWsKbdAesop75D', name: 'John', description: 'Engaging and Clear', gender: 'Male' },
  { id: 'EST9Ui6982FZPSi7gCHi', name: 'Elise', description: 'Warm, Natural and Engaging', gender: 'Female' },
  { id: 'EnjklPXGBMNldCJ7jqkE', name: 'Bill', description: 'Casual and Balanced', gender: 'Male' },
];

const PERSONALITY_TRAITS = [
  { id: 'proactive', label: 'Proactive', icon: Zap, description: 'Takes initiative' },
  { id: 'empathetic', label: 'Empathetic', icon: Heart, description: 'Understanding and caring' },
  { id: 'analytical', label: 'Analytical', icon: Brain, description: 'Data-driven insights' },
  { id: 'concise', label: 'Concise', icon: MessageSquare, description: 'Brief and to the point' },
  { id: 'creative', label: 'Creative', icon: Sparkles, description: 'Innovative solutions' },
  { id: 'collaborative', label: 'Collaborative', icon: Users, description: 'Team-oriented' },
];

const SERVICES = [
  { id: 'gmail', name: 'Gmail', icon: Mail, color: 'bg-red-500' },
  { id: 'google-calendar', name: 'Google Calendar', icon: Calendar, color: 'bg-blue-500' },
  { id: 'zoom', name: 'Zoom', icon: Video, color: 'bg-blue-600' },
];

const REFERRAL_SOURCES = [
  'Search Engine',
  'Social Media',
  'Friend or Colleague',
  'Blog or Article',
  'Advertisement',
  'Other',
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [connectingService, setConnectingService] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<Record<string, { status: string }>>({});

  const [formData, setFormData] = useState<OnboardingData>({
    aiName: 'MAI',
    userName: '',
    ageConfirmed: false,
    selectedVoice: '',
    personalityTraits: [],
    referralSource: '',
    connectedServices: [],
    callTime: '8:00 AM',
    notificationPreference: 'important',
  });

  const totalSteps = 8;

  // Check authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!firebaseUser) {
        // User not authenticated, redirect to auth page
        router.push('/auth?view=login');
        return;
      }

      setUser(firebaseUser);

      // Check if user has already completed onboarding
      try {
        // Ensure Firebase is initialized
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }
        let db;
        try {
          db = getDb();
        } catch (dbError) {
          console.error('Firestore initialization error:', dbError);
          setLoading(false);
          return;
        }
        if (!db) {
          console.error('Firestore is not initialized');
          setLoading(false);
          return;
        }
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.onboardingCompleted) {
            // Already completed onboarding, redirect to dashboard
            router.push('/dashboard');
            return;
          }
          // Load existing onboarding data if available
          if (userData.onboardingData) {
            setFormData(prev => ({
              ...prev,
              ...userData.onboardingData
            }));
          }
          
          // Load connected services
          if (userData.connectedServices) {
            setFormData(prev => ({
              ...prev,
              connectedServices: userData.connectedServices || []
            }));
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Check for OAuth callback and fetch service status
  useEffect(() => {
    if (!user || loading) return;

    // Check URL parameters for OAuth callback
    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    const connected = params.get('connected');
    const error = params.get('error');

    if (service) {
      if (connected === 'true') {
        // Service connected successfully
        fetchServiceStatus();
        // Clean URL
        window.history.replaceState({}, '', '/onboarding');
      } else if (error) {
        // OAuth error
        alert(`Failed to connect ${service}: ${error}`);
        window.history.replaceState({}, '', '/onboarding');
      }
    } else {
      // Fetch current service status
      fetchServiceStatus();
    }
  }, [user, loading]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep === totalSteps) {
      // Save onboarding data to Firestore
      if (!user) {
        router.push('/auth?view=login');
        return;
      }

      setSaving(true);
      try {
        // Ensure Firebase is initialized
        if (typeof window === 'undefined') {
          alert('Firebase is not available. Please refresh the page.');
          setSaving(false);
          return;
        }
        let db;
        try {
          db = getDb();
        } catch (dbError) {
          console.error('Firestore initialization error:', dbError);
          alert('Firestore is not initialized. Please check your environment variables.');
          setSaving(false);
          return;
        }
        if (!db) {
          alert('Firestore is not initialized. Please check your environment variables.');
          setSaving(false);
          return;
        }
        const userRef = doc(db, 'users', user.uid);
        
        // Update user document with onboarding data and mark as completed
        await updateDoc(userRef, {
          onboardingCompleted: true,
          onboardingCompletedAt: serverTimestamp(),
          onboardingData: {
            aiName: formData.aiName,
            userName: formData.userName,
            selectedVoice: formData.selectedVoice,
            personalityTraits: formData.personalityTraits,
            referralSource: formData.referralSource,
            connectedServices: formData.connectedServices,
            callTime: formData.callTime,
            notificationPreference: formData.notificationPreference,
          },
          // Update fullName if provided
          ...(formData.userName && { fullName: formData.userName }),
        });

        // Create onboarding completion notification
        try {
          await addDoc(collection(db, 'notifications'), {
            userId: user.uid,
            title: `Welcome, ${formData.userName || 'there'}! 🎊`,
            message: `Your AI assistant ${formData.aiName || 'MAI'} is ready to help! Start exploring your dashboard and let ${formData.aiName || 'MAI'} assist you with your daily tasks.`,
            type: 'success',
            category: 'system',
            priority: 'high',
            is_read: false,
            is_archived: false,
            action_url: '/dashboard',
            created_at: serverTimestamp(),
          });
        } catch (notificationError) {
          // Don't fail onboarding if notification creation fails
          console.error('Error creating onboarding completion notification:', notificationError);
        }

        // Redirect to dashboard after successful save
        router.push('/dashboard');
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        alert('Failed to save onboarding data. Please try again.');
      } finally {
        setSaving(false);
      }
    } else {
      // Save progress for current step (optional - can be implemented for draft saving)
      handleNext();
    }
  };

  const togglePersonalityTrait = (traitId: string) => {
    setFormData(prev => {
      const traits = prev.personalityTraits.includes(traitId)
        ? prev.personalityTraits.filter(t => t !== traitId)
        : prev.personalityTraits.length < 3
        ? [...prev.personalityTraits, traitId]
        : prev.personalityTraits;
      return { ...prev, personalityTraits: traits };
    });
  };

  const connectService = async (serviceId: string) => {
    if (!user || connectingService) return;

    try {
      setConnectingService(serviceId);
      
      // Get Firebase Auth token
      const token = await user.getIdToken();
      
      // Get API base URL
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const redirectUri = `${window.location.origin}/onboarding?service=${serviceId}&step=6`;
      
      // Initiate OAuth flow
      const response = await fetch(`${API_BASE_URL}/services/connect/${serviceId}?redirectUri=${encodeURIComponent(redirectUri)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate connection');
      }

      const data = await response.json();
      
      // Redirect to OAuth provider
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (error: any) {
      console.error('Error connecting service:', error);
      alert(`Failed to connect ${serviceId}: ${error.message || 'Please try again.'}`);
      setConnectingService(null);
    }
  };

  const disconnectService = async (serviceId: string) => {
    if (!user || connectingService) return;

    try {
      setConnectingService(serviceId);
      
      // Get Firebase Auth token
      const token = await user.getIdToken();
      
      // Get API base URL
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // Disconnect service
      const response = await fetch(`${API_BASE_URL}/services/disconnect/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disconnect service');
      }

      // Update local state
      setFormData(prev => ({
        ...prev,
        connectedServices: prev.connectedServices.filter(s => s !== serviceId)
      }));

      // Refresh service status
      await fetchServiceStatus();
    } catch (error: any) {
      console.error('Error disconnecting service:', error);
      alert(`Failed to disconnect ${serviceId}: ${error.message || 'Please try again.'}`);
    } finally {
      setConnectingService(null);
    }
  };

  const fetchServiceStatus = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      const response = await fetch(`${API_BASE_URL}/services/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServiceStatus(data.connections || {});
        
        // Update connectedServices based on actual status
        const connected = Object.keys(data.connections || {}).filter(
          serviceId => data.connections[serviceId].status === 'connected'
        );
        
        setFormData(prev => ({
          ...prev,
          connectedServices: connected
        }));
      }
    } catch (error) {
      console.error('Error fetching service status:', error);
    }
  };

  const playVoicePreview = async (voiceId: string) => {
    // Stop any currently playing audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      // Clean up the previous audio URL if it exists
      if (currentAudio.src.startsWith('blob:')) {
        URL.revokeObjectURL(currentAudio.src);
      }
      setCurrentAudio(null);
      setPlayingVoice(null);
    }
    
    setPlayingVoice(voiceId);
    
    try {
      // Use the AI assistant name set by the user instead of the voice name
      const aiName = formData.aiName || 'your AI assistant';
      const previewText = `Hello, I'm ${aiName}. This is how I sound, and I look forward to helping you achieve more every day. Together, we'll manage your schedule, answer your questions, and make your life easier. Let's get started on your journey to greater productivity and peace of mind!`;
      
      // Get API key from environment variable
      const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!API_KEY) {
        console.warn('Voice API key not found. Add NEXT_PUBLIC_ELEVENLABS_API_KEY to your .env.local file');
        // Fallback: Just show visual feedback
        setTimeout(() => setPlayingVoice(null), 2000);
        return;
      }
      
      // Call voice API
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': API_KEY,
        },
        body: JSON.stringify({
          text: previewText,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Store the audio instance
        setCurrentAudio(audio);
        
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          setCurrentAudio(null);
          setPlayingVoice(null);
        };
        
        audio.onerror = () => {
          URL.revokeObjectURL(audioUrl);
          setCurrentAudio(null);
          setPlayingVoice(null);
        };
        
        await audio.play();
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Voice API error:', errorData);
        // Fallback: Just show visual feedback if API call fails
        setTimeout(() => setPlayingVoice(null), 2000);
      }
    } catch (error) {
      console.error('Error playing voice preview:', error);
      // Fallback: Just show visual feedback if there's an error
      setTimeout(() => setPlayingVoice(null), 2000);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Name your AI Assistant</h2>
              <p className="text-slate-600">Choose from our recommendations or create your own</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {RECOMMENDED_AI_NAMES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setFormData({ ...formData, aiName: name })}
                  className={`px-6 py-4 rounded-xl border-2 transition-all duration-200 font-medium ${
                    formData.aiName === name
                      ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-lg'
                      : 'border-slate-300 hover:border-teal-300 text-slate-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-slate-500 font-medium">Or create your own</span>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={formData.aiName}
                onChange={(e) => setFormData({ ...formData, aiName: e.target.value })}
                className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                placeholder="Enter a custom name"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">What should {formData.aiName} call you?</h2>
              <p className="text-slate-600">Help us personalize your experience</p>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                className="block w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
                placeholder="Enter your preferred name"
              />
            </div>

            <div className="mt-8 bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
              <div className="flex items-start">
                <input
                  id="age-confirm"
                  type="checkbox"
                  checked={formData.ageConfirmed}
                  onChange={(e) => setFormData({ ...formData, ageConfirmed: e.target.checked })}
                  className="h-5 w-5 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer mt-0.5"
                />
                <label htmlFor="age-confirm" className="ml-3 block text-sm text-slate-700 cursor-pointer">
                  <span className="font-medium">I am 18 years or older</span>
                  <p className="text-slate-600 mt-1">You must be at least 18 years old to use Mai-PA</p>
                </label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Choose {formData.aiName}'s voice</h2>
              <p className="text-slate-600">Click any voice to hear a preview</p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto pr-2">
              {VOICE_OPTIONS.map((voice) => (
                <div
                  key={voice.id}
                  className={`relative border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer ${
                    formData.selectedVoice === voice.id
                      ? 'border-teal-500 bg-teal-50 shadow-lg'
                      : 'border-slate-300 hover:border-teal-300'
                  }`}
                  onClick={() => setFormData({ ...formData, selectedVoice: voice.id })}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">{voice.name}</h4>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                          {voice.gender}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{voice.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playVoicePreview(voice.id);
                      }}
                      disabled={playingVoice === voice.id}
                      className={`ml-4 p-2 rounded-full transition-all ${
                        playingVoice === voice.id
                          ? 'bg-teal-500 text-white shadow-lg animate-pulse'
                          : 'bg-slate-100 text-slate-600 hover:bg-teal-100 hover:text-teal-600'
                      }`}
                    >
                      <Volume2 className="h-5 w-5" />
                    </button>
                  </div>
                  {formData.selectedVoice === voice.id && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-teal-500 text-white rounded-full p-1 shadow-lg">
                        <Check className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-2"
            >
              Skip for now
            </button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Define {formData.aiName}'s personality</h2>
              <p className="text-slate-600">Select up to 3 traits that resonate with you</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PERSONALITY_TRAITS.map((trait) => {
                const Icon = trait.icon;
                const isSelected = formData.personalityTraits.includes(trait.id);
                return (
                  <button
                    key={trait.id}
                    type="button"
                    onClick={() => togglePersonalityTrait(trait.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 shadow-lg'
                        : 'border-slate-300 hover:border-teal-300'
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-teal-600' : 'text-slate-400'}`} />
                    <h4 className="font-semibold text-slate-900 text-sm">{trait.label}</h4>
                    <p className="text-xs text-slate-600 mt-1">{trait.description}</p>
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="bg-teal-500 text-white rounded-full p-1 shadow-lg">
                          <Check className="h-3 w-3" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="text-center text-sm text-slate-500">
              {formData.personalityTraits.length} of 3 selected
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">How did you hear about us?</h2>
              <p className="text-slate-600">Help us understand how you discovered Mai-PA</p>
            </div>

            <div className="space-y-2">
              {REFERRAL_SOURCES.map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setFormData({ ...formData, referralSource: source })}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left font-medium ${
                    formData.referralSource === source
                      ? 'border-teal-500 bg-teal-50 text-teal-700 shadow-lg'
                      : 'border-slate-300 hover:border-teal-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{source}</span>
                    {formData.referralSource === source && (
                      <Check className="h-5 w-5 text-teal-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Connect your services</h2>
              <p className="text-slate-600">Integrate tools to maximize {formData.aiName}'s capabilities</p>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800 text-center">
                <strong>Note:</strong> Service connections are currently under development and will be available soon.
              </p>
            </div>

            <div className="space-y-3">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                const isConnected = formData.connectedServices.includes(service.id);
                const isConnecting = connectingService === service.id;
                const status = serviceStatus[service.id];
                
                return (
                  <div
                    key={service.id}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                      isConnected
                        ? 'border-teal-500 bg-teal-50 shadow-lg'
                        : 'border-slate-300 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`${service.color} p-2 rounded-xl shadow-md`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-slate-900">{service.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isConnected ? (
                          <>
                            <div className="bg-teal-500 text-white rounded-full px-3 py-1 text-sm font-medium shadow-md">
                              Connected
                            </div>
                            <button
                              type="button"
                              onClick={() => disconnectService(service.id)}
                              disabled={true}
                              className="text-xs text-red-600 hover:text-red-700 px-2 py-1 hover:bg-red-50 rounded transition-colors disabled:opacity-50 cursor-not-allowed"
                            >
                              Disconnect
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => connectService(service.id)}
                            disabled={true}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-all bg-slate-300 text-slate-500 cursor-not-allowed"
                          >
                            Coming Soon
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="w-full text-center text-sm text-teal-600 hover:text-teal-700 font-medium py-2"
            >
              Skip for now
            </button>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Set your preferences</h2>
              <p className="text-slate-600">Customize when and how {formData.aiName} reaches out</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Preferred morning briefing time
              </label>
              <select
                value={formData.callTime}
                onChange={(e) => setFormData({ ...formData, callTime: e.target.value })}
                className="block w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900"
              >
                <option value="6:00 AM">6:00 AM</option>
                <option value="7:00 AM">7:00 AM</option>
                <option value="8:00 AM">8:00 AM</option>
                <option value="9:00 AM">9:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                <Bell className="inline h-4 w-4 mr-1" />
                Notification preferences
              </label>
              <div className="space-y-2">
                {[
                  { value: 'all', label: 'All notifications', description: 'Stay fully informed' },
                  { value: 'important', label: 'Important only', description: 'Critical updates and reminders' },
                  { value: 'minimal', label: 'Minimal', description: 'Urgent matters only' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, notificationPreference: option.value })}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.notificationPreference === option.value
                        ? 'border-teal-500 bg-teal-50 shadow-lg'
                        : 'border-slate-300 hover:border-teal-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-slate-900">{option.label}</div>
                        <div className="text-sm text-slate-600">{option.description}</div>
                      </div>
                      {formData.notificationPreference === option.value && (
                        <Check className="h-5 w-5 text-teal-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-100 rounded-full mb-4">
                <Sparkles className="h-8 w-8 text-teal-600" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">You're all set!</h2>
              <p className="text-slate-600">Review your choices and start your journey</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-6 space-y-4 border-2 border-teal-100">
              <div className="flex justify-between items-center pb-3 border-b-2 border-teal-200">
                <span className="text-sm text-slate-600 font-medium">AI Companion</span>
                <span className="font-semibold text-slate-900">{formData.aiName}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-teal-200">
                <span className="text-sm text-slate-600 font-medium">Your Name</span>
                <span className="font-semibold text-slate-900">{formData.userName}</span>
              </div>
              {formData.selectedVoice && (
                <div className="flex justify-between items-center pb-3 border-b-2 border-teal-200">
                  <span className="text-sm text-slate-600 font-medium">Voice</span>
                  <span className="font-semibold text-slate-900">
                    {VOICE_OPTIONS.find(v => v.id === formData.selectedVoice)?.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pb-3 border-b-2 border-teal-200">
                <span className="text-sm text-slate-600 font-medium">Personality Traits</span>
                <span className="font-semibold text-slate-900">{formData.personalityTraits.length} selected</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b-2 border-teal-200">
                <span className="text-sm text-slate-600 font-medium">Connected Services</span>
                <span className="font-semibold text-slate-900">{formData.connectedServices.length} services</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 font-medium">Morning Briefing</span>
                <span className="font-semibold text-slate-900">{formData.callTime}</span>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can always change these settings later in your profile preferences.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">
              Mai-PA
            </h1>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-slate-500">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-600 h-2.5 rounded-full transition-all duration-300 shadow-md"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderStepContent()}

            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={(currentStep === 2 && !formData.ageConfirmed) || saving}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 shadow-lg ${
                  (currentStep === 2 && !formData.ageConfirmed) || saving
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 shadow-teal-200'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    {currentStep === totalSteps ? 'Get Started' : 'Continue'}
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}