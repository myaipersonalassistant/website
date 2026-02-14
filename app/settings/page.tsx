'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  Mail,
  Calendar,
  Shield,
  Palette,
  MessageSquare,
  Save,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  Settings as SettingsIcon,
  Globe,
  Clock,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Brain,
  RefreshCw,
  CheckCircle2,
  Video,
  Plug,
  PlugZap
} from 'lucide-react';
import { VOICE_OPTIONS } from '@/app/onboarding/page';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import DashboardSidebar from '@/app/components/DashboardSidebar';

interface UserSettings {
  display_name: string;
  avatar_url?: string;
  bio?: string;
  timezone: string;
  language: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_sound: boolean;
  notification_frequency: string;
  notify_calendar_events: boolean;
  notify_email_insights: boolean;
  notify_task_reminders: boolean;
  assistant_personality: string;
  auto_suggest_enabled: boolean;
  context_awareness: boolean;
  assistant_response_length: string;
  selectedVoice: string;
  auto_process_emails: boolean;
  extraction_confidence_threshold: number;
  auto_approve_high_confidence: boolean;
  email_categories_enabled: boolean;
  default_event_duration: number;
  default_reminder_time: number;
  calendar_view_preference: string;
  work_hours_start: string;
  work_hours_end: string;
  show_weekends: boolean;
  profile_visibility: string;
  data_retention_days: number;
  share_analytics: boolean;
  activity_tracking: boolean;
}

type SettingsTab = 'profile' | 'notifications' | 'assistant' | 'email' | 'calendar' | 'privacy' | 'integrations';

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [settings, setSettings] = useState<UserSettings>({
    display_name: '',
    timezone: 'UTC',
    language: 'en',
    email_notifications: true,
    push_notifications: true,
    notification_sound: true,
    notification_frequency: 'instant',
    notify_calendar_events: true,
    notify_email_insights: true,
    notify_task_reminders: true,
    assistant_personality: 'professional',
    auto_suggest_enabled: true,
    context_awareness: true,
    assistant_response_length: 'moderate',
    selectedVoice: '',
    auto_process_emails: true,
    extraction_confidence_threshold: 0.7,
    auto_approve_high_confidence: false,
    email_categories_enabled: true,
    default_event_duration: 60,
    default_reminder_time: 15,
    calendar_view_preference: 'month',
    work_hours_start: '09:00',
    work_hours_end: '17:00',
    show_weekends: true,
    profile_visibility: 'private',
    data_retention_days: 365,
    share_analytics: false,
    activity_tracking: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [userName, setUserName] = useState<string>('');
  const [connectingService, setConnectingService] = useState<string | null>(null);
  const [serviceStatus, setServiceStatus] = useState<Record<string, { status: string; connectedAt?: string }>>({});
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);

  const SERVICES = [
    { id: 'gmail', name: 'Gmail', icon: Mail, color: 'bg-red-500' },
    { id: 'google-calendar', name: 'Google Calendar', icon: Calendar, color: 'bg-blue-500' },
    { id: 'zoom', name: 'Zoom', icon: Video, color: 'bg-blue-600' },
  ];

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      fetchUserData();
      fetchSettings();
      fetchServiceStatus();
    }
  }, [user, authLoading]);

  // Check for OAuth callback
  useEffect(() => {
    if (!user || authLoading) return;

    const params = new URLSearchParams(window.location.search);
    const service = params.get('service');
    const connected = params.get('connected');
    const error = params.get('error');

    if (service) {
      if (connected === 'true') {
        // Service connected successfully - update Firestore immediately
        const updateConnectedService = async () => {
          try {
            const db = getDb();
            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const currentConnectedServices = userData.connectedServices || userData.onboardingData?.connectedServices || [];
              
              // Add service if not already in the list
              if (!currentConnectedServices.includes(service)) {
                const updatedConnectedServices = [...currentConnectedServices, service];
                
                const updateData: any = {
                  connectedServices: updatedConnectedServices,
                  [`serviceConnections.${service}`]: {
                    status: 'connected',
                    connectedAt: serverTimestamp()
                  },
                  updatedAt: serverTimestamp()
                };
                
                // Also update in onboardingData if it exists
                if (userData.onboardingData) {
                  updateData.onboardingData = {
                    ...userData.onboardingData,
                    connectedServices: updatedConnectedServices
                  };
                }
                
                await updateDoc(userRef, updateData);
              }
            }
          } catch (error) {
            console.error('Error updating connected service:', error);
          }
        };
        
        updateConnectedService();
        fetchServiceStatus();
        window.history.replaceState({}, '', '/settings?tab=integrations');
      } else if (error) {
        alert(`Failed to connect ${service}: ${decodeURIComponent(error)}`);
        window.history.replaceState({}, '', '/settings?tab=integrations');
      }
    }

    // Check for tab parameter
    const tab = params.get('tab');
    if (tab && ['profile', 'notifications', 'assistant', 'email', 'calendar', 'privacy', 'integrations'].includes(tab)) {
      setActiveTab(tab as SettingsTab);
    }
  }, [user, authLoading]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.fullName || userData.onboardingData?.userName || user.displayName || 'User');
        if (userData.fullName) {
          setSettings(prev => ({ ...prev, display_name: userData.fullName }));
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
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
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const settingsData = userData.settings || {};
        
        // Update settings with fetched data, keeping defaults for missing values
        setSettings(prev => ({
          ...prev,
          display_name: settingsData.display_name || userData.fullName || prev.display_name,
          bio: settingsData.bio || userData.bio || prev.bio,
          timezone: settingsData.timezone || userData.timezone || prev.timezone,
          language: settingsData.language || prev.language,
          email_notifications: settingsData.email_notifications !== undefined ? settingsData.email_notifications : prev.email_notifications,
          push_notifications: settingsData.push_notifications !== undefined ? settingsData.push_notifications : prev.push_notifications,
          notification_sound: settingsData.notification_sound !== undefined ? settingsData.notification_sound : prev.notification_sound,
          notification_frequency: settingsData.notification_frequency || prev.notification_frequency,
          notify_calendar_events: settingsData.notify_calendar_events !== undefined ? settingsData.notify_calendar_events : prev.notify_calendar_events,
          notify_email_insights: settingsData.notify_email_insights !== undefined ? settingsData.notify_email_insights : prev.notify_email_insights,
          notify_task_reminders: settingsData.notify_task_reminders !== undefined ? settingsData.notify_task_reminders : prev.notify_task_reminders,
          assistant_personality: settingsData.assistant_personality || prev.assistant_personality,
          auto_suggest_enabled: settingsData.auto_suggest_enabled !== undefined ? settingsData.auto_suggest_enabled : prev.auto_suggest_enabled,
          context_awareness: settingsData.context_awareness !== undefined ? settingsData.context_awareness : prev.context_awareness,
          assistant_response_length: settingsData.assistant_response_length || prev.assistant_response_length,
          // Load selectedVoice with priority:
          // 1. From settings.selectedVoice (if user changed it in settings page)
          // 2. From onboardingData.selectedVoice (if set during onboarding)
          // 3. Default empty string (no voice selected)
          selectedVoice: settingsData.selectedVoice || userData.onboardingData?.selectedVoice || '',
          auto_process_emails: settingsData.auto_process_emails !== undefined ? settingsData.auto_process_emails : prev.auto_process_emails,
          extraction_confidence_threshold: settingsData.extraction_confidence_threshold !== undefined ? settingsData.extraction_confidence_threshold : prev.extraction_confidence_threshold,
          auto_approve_high_confidence: settingsData.auto_approve_high_confidence !== undefined ? settingsData.auto_approve_high_confidence : prev.auto_approve_high_confidence,
          email_categories_enabled: settingsData.email_categories_enabled !== undefined ? settingsData.email_categories_enabled : prev.email_categories_enabled,
          default_event_duration: settingsData.default_event_duration !== undefined ? settingsData.default_event_duration : prev.default_event_duration,
          default_reminder_time: settingsData.default_reminder_time !== undefined ? settingsData.default_reminder_time : prev.default_reminder_time,
          calendar_view_preference: settingsData.calendar_view_preference || prev.calendar_view_preference,
          work_hours_start: settingsData.work_hours_start || prev.work_hours_start,
          work_hours_end: settingsData.work_hours_end || prev.work_hours_end,
          show_weekends: settingsData.show_weekends !== undefined ? settingsData.show_weekends : prev.show_weekends,
          profile_visibility: settingsData.profile_visibility || prev.profile_visibility,
          data_retention_days: settingsData.data_retention_days !== undefined ? settingsData.data_retention_days : prev.data_retention_days,
          share_analytics: settingsData.share_analytics !== undefined ? settingsData.share_analytics : prev.share_analytics,
          activity_tracking: settingsData.activity_tracking !== undefined ? settingsData.activity_tracking : prev.activity_tracking,
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      setSaveStatus('idle');
      
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
        setSaveStatus('error');
        setSaving(false);
        return;
      }
      if (!db) {
        setSaveStatus('error');
        setSaving(false);
        return;
      }
      
      const userRef = doc(db, 'users', user.uid);
      
      // Helper function to remove undefined values (Firestore doesn't allow undefined)
      const removeUndefined = (obj: any): any => {
        const cleaned: any = {};
        for (const key in obj) {
          if (obj[key] !== undefined) {
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && !(obj[key] instanceof Date)) {
              cleaned[key] = removeUndefined(obj[key]);
            } else {
              cleaned[key] = obj[key];
            }
          }
        }
        return cleaned;
      };
      
      // Prepare settings object to save
      const settingsToSave = {
        settings: {
          display_name: settings.display_name,
          ...(settings.bio !== undefined && { bio: settings.bio }),
          timezone: settings.timezone,
          language: settings.language,
          email_notifications: settings.email_notifications,
          push_notifications: settings.push_notifications,
          notification_sound: settings.notification_sound,
          notification_frequency: settings.notification_frequency,
          notify_calendar_events: settings.notify_calendar_events,
          notify_email_insights: settings.notify_email_insights,
          notify_task_reminders: settings.notify_task_reminders,
          assistant_personality: settings.assistant_personality,
          auto_suggest_enabled: settings.auto_suggest_enabled,
          context_awareness: settings.context_awareness,
          assistant_response_length: settings.assistant_response_length,
          selectedVoice: settings.selectedVoice || '', // Always save selectedVoice
          auto_process_emails: settings.auto_process_emails,
          extraction_confidence_threshold: settings.extraction_confidence_threshold,
          auto_approve_high_confidence: settings.auto_approve_high_confidence,
          email_categories_enabled: settings.email_categories_enabled,
          default_event_duration: settings.default_event_duration,
          default_reminder_time: settings.default_reminder_time,
          calendar_view_preference: settings.calendar_view_preference,
          work_hours_start: settings.work_hours_start,
          work_hours_end: settings.work_hours_end,
          show_weekends: settings.show_weekends,
          profile_visibility: settings.profile_visibility,
          data_retention_days: settings.data_retention_days,
          share_analytics: settings.share_analytics,
          activity_tracking: settings.activity_tracking,
        },
        // Also update fullName if display_name changed
        ...(settings.display_name && { fullName: settings.display_name }),
        updatedAt: serverTimestamp()
      };
      
      // Remove undefined values before saving
      const cleanedSettings = removeUndefined(settingsToSave);
      
      await updateDoc(userRef, cleanedSettings);
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setSaving(false);
    }
  };

  const connectService = async (serviceId: string) => {
    if (!user || connectingService) return;

    try {
      setConnectingService(serviceId);
      
      // Get Firebase Auth token
      const token = await user.getIdToken();
      
      // Get API base URL
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const redirectUri = `${window.location.origin}/settings?tab=integrations&service=${serviceId}`;
      
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

    if (!confirm(`Are you sure you want to disconnect ${SERVICES.find(s => s.id === serviceId)?.name}?`)) {
      return;
    }

    try {
      setConnectingService(serviceId);
      
      const db = getDb();
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Remove service from connectedServices array
        const currentConnectedServices = userData.connectedServices || userData.onboardingData?.connectedServices || [];
        const updatedConnectedServices = currentConnectedServices.filter((s: string) => s !== serviceId);
        
        // Update serviceConnections object if it exists
        const serviceConnections = userData.serviceConnections || {};
        const updatedServiceConnections = { ...serviceConnections };
        if (updatedServiceConnections[serviceId]) {
          updatedServiceConnections[serviceId] = {
            ...updatedServiceConnections[serviceId],
            status: 'disconnected',
            disconnectedAt: serverTimestamp()
          };
        }
        
        // Update Firestore
        const updateData: any = {
          connectedServices: updatedConnectedServices,
          updatedAt: serverTimestamp()
        };
        
        // Only update serviceConnections if it exists
        if (Object.keys(serviceConnections).length > 0) {
          updateData.serviceConnections = updatedServiceConnections;
        }
        
        // Also update in onboardingData if it exists
        if (userData.onboardingData) {
          updateData.onboardingData = {
            ...userData.onboardingData,
            connectedServices: updatedConnectedServices
          };
        }
        
        await updateDoc(userRef, updateData);
      }

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
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check for connectedServices array (from onboarding or settings)
        const connectedServices = userData.connectedServices || userData.onboardingData?.connectedServices || [];
        
        // Check for serviceConnections object (more detailed status)
        const serviceConnections = userData.serviceConnections || {};
        
        // Build status object from Firestore data
        const status: Record<string, { status: string; connectedAt?: string }> = {};
        
        SERVICES.forEach(service => {
          const isConnected = connectedServices.includes(service.id) || serviceConnections[service.id]?.status === 'connected';
          
          if (isConnected) {
            status[service.id] = {
              status: 'connected',
              connectedAt: serviceConnections[service.id]?.connectedAt || 
                          serviceConnections[service.id]?.connected_at ||
                          userData.onboardingCompletedAt?.toDate?.()?.toISOString() ||
                          undefined
            };
          } else {
            status[service.id] = {
              status: 'disconnected'
            };
          }
        });
        
        setServiceStatus(status);
      }
    } catch (error) {
      console.error('Error fetching service status:', error);
      // Fallback: set all services as disconnected
      const disconnectedStatus: Record<string, { status: string }> = {};
      SERVICES.forEach(service => {
        disconnectedStatus[service.id] = { status: 'disconnected' };
      });
      setServiceStatus(disconnectedStatus);
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
      // Get AI assistant name from user data
      let aiName = 'your AI assistant';
      if (user) {
        try {
          const db = getDb();
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            aiName = userData.onboardingData?.aiName || 'your AI assistant';
          }
        } catch (error) {
          console.error('Error fetching AI name:', error);
        }
      }
      
      const previewText = `Hello, I'm ${aiName}. This is how I sound, and I look forward to helping you achieve more every day. Together, we'll manage your schedule, answer your questions, and make your life easier. Let's get started on your journey to greater productivity and peace of mind!`;
      
      const API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!API_KEY) {
        console.warn('Voice API key not found');
        setTimeout(() => setPlayingVoice(null), 2000);
        return;
      }
      
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
        setTimeout(() => setPlayingVoice(null), 2000);
      }
    } catch (error) {
      console.error('Error playing voice preview:', error);
      setTimeout(() => setPlayingVoice(null), 2000);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'assistant' as SettingsTab, label: 'AI Assistant', icon: MessageSquare },
    { id: 'email' as SettingsTab, label: 'Email Insights', icon: Mail },
    { id: 'calendar' as SettingsTab, label: 'Calendar', icon: Calendar },
    { id: 'integrations' as SettingsTab, label: 'Integrations', icon: Plug },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: Shield }
  ];

  const ToggleSwitch = ({ checked, onChange, label, description }: { checked: boolean; onChange: (checked: boolean) => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-teal-300 transition-all">
      <div className="flex-1">
        <div className="font-medium text-sm text-slate-900 mb-0.5">{label}</div>
        {description && <div className="text-xs text-slate-500">{description}</div>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
      </label>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={settings.display_name}
                    onChange={(e) => setSettings({ ...settings, display_name: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Bio</label>
                  <textarea
                    value={settings.bio || ''}
                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors resize-none text-sm"
                    placeholder="Tell us about yourself"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">
                      <Globe className="h-3.5 w-3.5 inline mr-1.5" />
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                      <option value="Europe/London">London</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                <ToggleSwitch
                  checked={settings.email_notifications}
                  onChange={(checked) => setSettings({ ...settings, email_notifications: checked })}
                  label="Email Notifications"
                  description="Receive notifications via email"
                />
                <ToggleSwitch
                  checked={settings.push_notifications}
                  onChange={(checked) => setSettings({ ...settings, push_notifications: checked })}
                  label="Push Notifications"
                  description="Receive browser push notifications"
                />
                <ToggleSwitch
                  checked={settings.notification_sound}
                  onChange={(checked) => setSettings({ ...settings, notification_sound: checked })}
                  label="Notification Sound"
                  description="Play sound when notifications arrive"
                />
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Notification Frequency</label>
                  <select
                    value={settings.notification_frequency}
                    onChange={(e) => setSettings({ ...settings, notification_frequency: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                  >
                    <option value="instant">Instant</option>
                    <option value="hourly">Hourly Digest</option>
                    <option value="daily">Daily Digest</option>
                  </select>
                </div>
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Notification Types</h4>
                  <ToggleSwitch
                    checked={settings.notify_calendar_events}
                    onChange={(checked) => setSettings({ ...settings, notify_calendar_events: checked })}
                    label="Calendar Events"
                    description="Get notified about upcoming events"
                  />
                  <ToggleSwitch
                    checked={settings.notify_email_insights}
                    onChange={(checked) => setSettings({ ...settings, notify_email_insights: checked })}
                    label="Email Insights"
                    description="Notifications for new email insights"
                  />
                  <ToggleSwitch
                    checked={settings.notify_task_reminders}
                    onChange={(checked) => setSettings({ ...settings, notify_task_reminders: checked })}
                    label="Task Reminders"
                    description="Reminders for upcoming tasks"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'assistant':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4">AI Assistant Settings</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Assistant Voice</label>
                  <p className="text-[10px] sm:text-xs text-slate-500 mb-3">
                    {settings.selectedVoice 
                      ? `Current voice: ${VOICE_OPTIONS.find(v => v.id === settings.selectedVoice)?.name || 'Selected'}`
                      : 'Choose a voice for your AI assistant'}
                  </p>
                  <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                    {VOICE_OPTIONS.map((voice) => (
                      <div
                        key={voice.id}
                        className={`relative border-2 rounded-lg p-3 transition-all duration-200 cursor-pointer ${
                          settings.selectedVoice === voice.id
                            ? 'border-teal-500 bg-teal-50 shadow-md'
                            : 'border-slate-200 hover:border-teal-300'
                        }`}
                        onClick={() => setSettings({ ...settings, selectedVoice: voice.id })}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-xs sm:text-sm text-slate-900">{voice.name}</h4>
                              <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                                {voice.gender}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5">{voice.description}</p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playVoicePreview(voice.id);
                            }}
                            disabled={playingVoice === voice.id}
                            className={`ml-2 p-1.5 sm:p-2 rounded-full transition-all flex-shrink-0 ${
                              playingVoice === voice.id
                                ? 'bg-teal-500 text-white shadow-lg animate-pulse'
                                : 'bg-slate-100 text-slate-600 hover:bg-teal-100 hover:text-teal-600'
                            }`}
                          >
                            <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                        {settings.selectedVoice === voice.id && (
                          <div className="absolute top-2 right-2">
                            <div className="bg-teal-500 text-white rounded-full p-0.5 shadow-lg">
                              <Check className="h-3 w-3" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Assistant Personality</label>
                  <select
                    value={settings.assistant_personality}
                    onChange={(e) => setSettings({ ...settings, assistant_personality: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
                <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Response Length</label>
                  <select
                    value={settings.assistant_response_length}
                    onChange={(e) => setSettings({ ...settings, assistant_response_length: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                  >
                    <option value="concise">Concise</option>
                    <option value="moderate">Moderate</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
                <ToggleSwitch
                  checked={settings.auto_suggest_enabled}
                  onChange={(checked) => setSettings({ ...settings, auto_suggest_enabled: checked })}
                  label="Auto Suggestions"
                  description="Enable automatic suggestions in conversations"
                />
                <ToggleSwitch
                  checked={settings.context_awareness}
                  onChange={(checked) => setSettings({ ...settings, context_awareness: checked })}
                  label="Context Awareness"
                  description="Assistant remembers conversation history"
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4">Email Insights Settings</h3>
              <div className="space-y-3 sm:space-y-4">
                <ToggleSwitch
                  checked={settings.auto_process_emails}
                  onChange={(checked) => setSettings({ ...settings, auto_process_emails: checked })}
                  label="Auto Process Emails"
                  description="Automatically extract insights from emails"
                />
                <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">
                    Confidence Threshold: {Math.round(settings.extraction_confidence_threshold * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="1"
                    step="0.05"
                    value={settings.extraction_confidence_threshold}
                    onChange={(e) => setSettings({ ...settings, extraction_confidence_threshold: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Only show items above this confidence level</p>
                </div>
                <ToggleSwitch
                  checked={settings.auto_approve_high_confidence}
                  onChange={(checked) => setSettings({ ...settings, auto_approve_high_confidence: checked })}
                  label="Auto Approve High Confidence"
                  description="Automatically approve items with high confidence scores"
                />
                <ToggleSwitch
                  checked={settings.email_categories_enabled}
                  onChange={(checked) => setSettings({ ...settings, email_categories_enabled: checked })}
                  label="Email Categories"
                  description="Enable automatic email categorization"
                />
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4">Calendar Settings</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                    <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Default Event Duration (minutes)</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={settings.default_event_duration}
                      onChange={(e) => setSettings({ ...settings, default_event_duration: parseInt(e.target.value) })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                    <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Default Reminder Time (minutes before)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={settings.default_reminder_time}
                      onChange={(e) => setSettings({ ...settings, default_reminder_time: parseInt(e.target.value) })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Default View</label>
                  <select
                    value={settings.calendar_view_preference}
                    onChange={(e) => setSettings({ ...settings, calendar_view_preference: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                    <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Work Hours Start</label>
                    <input
                      type="time"
                      value={settings.work_hours_start}
                      onChange={(e) => setSettings({ ...settings, work_hours_start: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                    />
                  </div>
                  <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                    <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Work Hours End</label>
                    <input
                      type="time"
                      value={settings.work_hours_end}
                      onChange={(e) => setSettings({ ...settings, work_hours_end: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.show_weekends}
                  onChange={(checked) => setSettings({ ...settings, show_weekends: checked })}
                  label="Show Weekends"
                  description="Display weekends in calendar view"
                />
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1 sm:mb-2">Service Integrations</h3>
              <p className="text-[10px] sm:text-xs text-slate-600 mb-4 sm:mb-6">Connect your accounts to enhance your experience</p>
              <div className="space-y-3 sm:space-y-4">
                {SERVICES.map((service) => {
                  const Icon = service.icon;
                  const status = serviceStatus[service.id];
                  const isConnected = status?.status === 'connected';
                  const isConnecting = connectingService === service.id;
                  const connectedDate = status?.connectedAt 
                    ? new Date(status.connectedAt).toLocaleDateString()
                    : null;
                  
                  return (
                    <div
                      key={service.id}
                      className={`p-3 sm:p-5 border-2 rounded-xl transition-all ${
                        isConnected
                          ? 'border-teal-500 bg-teal-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className={`${service.color} p-2 sm:p-3 rounded-xl shadow-sm flex-shrink-0`}>
                            <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-xs sm:text-sm text-slate-900 mb-0.5 truncate">{service.name}</h4>
                            {isConnected ? (
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <div className="flex items-center gap-1">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full"></div>
                                  <span className="text-[10px] sm:text-xs text-slate-600">Connected</span>
                                </div>
                                {connectedDate && (
                                  <span className="text-[10px] sm:text-xs text-slate-400">• {connectedDate}</span>
                                )}
                              </div>
                            ) : (
                              <p className="text-[10px] sm:text-xs text-slate-500">Not connected</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:flex-shrink-0">
                          {isConnected ? (
                            <button
                              type="button"
                              onClick={() => disconnectService(service.id)}
                              disabled={isConnecting}
                              className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-200"
                            >
                              {isConnecting ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => connectService(service.id)}
                              disabled={isConnecting}
                              className={`w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium rounded-lg transition-all ${
                                isConnecting
                                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                  : 'bg-teal-500 text-white hover:bg-teal-600 shadow-md'
                              }`}
                            >
                              {isConnecting ? 'Connecting...' : 'Connect'}
                            </button>
                          )}
                        </div>
                      </div>
                      {isConnected && (
                        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-teal-200">
                          <p className="text-[10px] sm:text-xs text-slate-600">
                            {service.id === 'gmail' && 'Access to read and send emails'}
                            {service.id === 'google-calendar' && 'Access to view and manage calendar events'}
                            {service.id === 'zoom' && 'Access to manage Zoom meetings and recordings'}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[10px] sm:text-xs font-semibold text-blue-900 mb-1">About Service Integrations</h4>
                    <p className="text-[10px] sm:text-xs text-blue-700 leading-relaxed">
                      Connecting services allows Mai-PA to access your data to provide personalized insights and automation. 
                      You can disconnect any service at any time. Your data is securely stored and encrypted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 sm:mb-4">Privacy Settings</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">
                    <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1 sm:mr-1.5" />
                    Profile Visibility
                  </label>
                  <select
                    value={settings.profile_visibility}
                    onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                  >
                    <option value="private">Private</option>
                    <option value="contacts">Contacts Only</option>
                    <option value="public">Public</option>
                  </select>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Control who can see your profile</p>
                </div>
                <div className="p-3 sm:p-4 bg-white border-2 border-slate-200 rounded-lg sm:rounded-xl">
                  <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1.5 sm:mb-2">Data Retention (days)</label>
                  <input
                    type="number"
                    min="30"
                    step="30"
                    value={settings.data_retention_days}
                    onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-slate-200 rounded-lg sm:rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-xs sm:text-sm"
                  />
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1">How long to keep your data</p>
                </div>
                <ToggleSwitch
                  checked={settings.share_analytics}
                  onChange={(checked) => setSettings({ ...settings, share_analytics: checked })}
                  label="Share Analytics"
                  description="Help improve the app by sharing usage data"
                />
                <ToggleSwitch
                  checked={settings.activity_tracking}
                  onChange={(checked) => setSettings({ ...settings, activity_tracking: checked })}
                  label="Activity Tracking"
                  description="Track your activity for personalized insights"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Only show full-page loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xs text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex">
      {/* Dashboard Sidebar */}
      <DashboardSidebar userName={userName} userEmail={user?.email || undefined} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg">
                  <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-0.5 sm:mb-1">Settings</h1>
                  <p className="text-[10px] sm:text-xs lg:text-sm text-teal-50 flex items-center gap-1 sm:gap-1.5">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span className="hidden sm:inline">Customize your experience</span>
                    <span className="sm:hidden">Customize</span>
                  </p>
                </div>
              </div>
              <div className="flex justify-end flex-1 sm:flex-none">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-teal-50 text-teal-700 rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : saveStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Save Changes</span>
                      <span className="sm:hidden">Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-slate-200 px-2 sm:px-4 lg:px-8 py-2 sm:py-4 flex-shrink-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide pb-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="text-[10px] sm:text-xs font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

