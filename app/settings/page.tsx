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
  Moon,
  Sun,
  Sparkles,
  Zap,
  Brain,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
  theme: string;
  accent_color: string;
  compact_mode: boolean;
}

type SettingsTab = 'profile' | 'notifications' | 'assistant' | 'email' | 'calendar' | 'privacy' | 'theme';

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
    activity_tracking: true,
    theme: 'light',
    accent_color: '#14b8a6',
    compact_mode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      fetchUserData();
      fetchSettings();
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
    try {
      setLoading(true);
      // TODO: Fetch actual settings from Firebase
      // For now, using default values
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      // TODO: Save settings to Firebase
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
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

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'assistant' as SettingsTab, label: 'AI Assistant', icon: MessageSquare },
    { id: 'email' as SettingsTab, label: 'Email Insights', icon: Mail },
    { id: 'calendar' as SettingsTab, label: 'Calendar', icon: Calendar },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: Shield },
    { id: 'theme' as SettingsTab, label: 'Appearance', icon: Palette }
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
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">AI Assistant Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Assistant Personality</label>
                  <select
                    value={settings.assistant_personality}
                    onChange={(e) => setSettings({ ...settings, assistant_personality: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                  </select>
                </div>
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Response Length</label>
                  <select
                    value={settings.assistant_response_length}
                    onChange={(e) => setSettings({ ...settings, assistant_response_length: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
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
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Email Insights Settings</h3>
              <div className="space-y-4">
                <ToggleSwitch
                  checked={settings.auto_process_emails}
                  onChange={(checked) => setSettings({ ...settings, auto_process_emails: checked })}
                  label="Auto Process Emails"
                  description="Automatically extract insights from emails"
                />
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
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
                  <p className="text-xs text-slate-500 mt-1">Only show items above this confidence level</p>
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
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Calendar Settings</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Default Event Duration (minutes)</label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={settings.default_event_duration}
                      onChange={(e) => setSettings({ ...settings, default_event_duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                  <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Default Reminder Time (minutes before)</label>
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={settings.default_reminder_time}
                      onChange={(e) => setSettings({ ...settings, default_reminder_time: parseInt(e.target.value) })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                </div>
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Default View</label>
                  <select
                    value={settings.calendar_view_preference}
                    onChange={(e) => setSettings({ ...settings, calendar_view_preference: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Work Hours Start</label>
                    <input
                      type="time"
                      value={settings.work_hours_start}
                      onChange={(e) => setSettings({ ...settings, work_hours_start: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                    />
                  </div>
                  <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Work Hours End</label>
                    <input
                      type="time"
                      value={settings.work_hours_end}
                      onChange={(e) => setSettings({ ...settings, work_hours_end: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
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

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    <Eye className="h-3.5 w-3.5 inline mr-1.5" />
                    Profile Visibility
                  </label>
                  <select
                    value={settings.profile_visibility}
                    onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                  >
                    <option value="private">Private</option>
                    <option value="contacts">Contacts Only</option>
                    <option value="public">Public</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">Control who can see your profile</p>
                </div>
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Data Retention (days)</label>
                  <input
                    type="number"
                    min="30"
                    step="30"
                    value={settings.data_retention_days}
                    onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">How long to keep your data</p>
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

      case 'theme':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4">Appearance Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Theme</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        settings.theme === 'light'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Sun className="h-4 w-4" />
                      <span className="text-xs font-medium">Light</span>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-teal-500 bg-teal-50 text-teal-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <Moon className="h-4 w-4" />
                      <span className="text-xs font-medium">Dark</span>
                    </button>
                  </div>
                </div>
                <div className="p-4 bg-white border-2 border-slate-200 rounded-xl">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Accent Color</label>
                  <input
                    type="color"
                    value={settings.accent_color}
                    onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                    className="w-full h-12 rounded-xl cursor-pointer"
                  />
                </div>
                <ToggleSwitch
                  checked={settings.compact_mode}
                  onChange={(checked) => setSettings({ ...settings, compact_mode: checked })}
                  label="Compact Mode"
                  description="Use a more compact layout"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xs text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex">
      {/* Dashboard Sidebar */}
      <DashboardSidebar userName={userName} userEmail={user?.email || undefined} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <SettingsIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Settings</h1>
                  <p className="text-xs sm:text-sm text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Customize your experience
                  </p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-xs sm:text-sm">Saving...</span>
                  </>
                ) : saveStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                      <span className="text-xs font-semibold">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

