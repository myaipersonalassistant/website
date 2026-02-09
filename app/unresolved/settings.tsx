import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Filter,
  Layout,
  Home
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import Footer from '../components/Footer';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface UserSettings {
  id?: string;
  user_id?: string;
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
    calendar_view_preference: 'week',
    work_hours_start: '09:00:00',
    work_hours_end: '17:00:00',
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

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   const fetchSettings = async () => {
//     try {
//       setLoading(true);
//       const userId = '00000000-0000-0000-0000-000000000000';

//       const { data, error } = await supabase
//         .from('user_settings')
//         .select('*')
//         .eq('user_id', userId)
//         .maybeSingle();

//       if (error) throw error;

//       if (data) {
//         setSettings(data);
//       }
//     } catch (error) {
//       console.error('Error fetching settings:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSave = async () => {
//     try {
//       setSaving(true);
//       setSaveStatus('idle');
//       const userId = '00000000-0000-0000-0000-000000000000';

//       const { error } = await supabase
//         .from('user_settings')
//         .upsert({
//           ...settings,
//           user_id: userId
//         });

//       if (error) throw error;

//       setSaveStatus('success');
//       setTimeout(() => setSaveStatus('idle'), 3000);
//     } catch (error) {
//       console.error('Error saving settings:', error);
//       setSaveStatus('error');
//       setTimeout(() => setSaveStatus('idle'), 3000);
//     } finally {
//       setSaving(false);
//     }
//   };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profile', icon: User },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'assistant' as SettingsTab, label: 'AI Assistant', icon: MessageSquare },
    { id: 'email' as SettingsTab, label: 'Email Insights', icon: Mail },
    { id: 'calendar' as SettingsTab, label: 'Calendar', icon: Calendar },
    { id: 'privacy' as SettingsTab, label: 'Privacy', icon: Shield },
    { id: 'theme' as SettingsTab, label: 'Appearance', icon: Palette }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={settings.display_name}
                    onChange={(e) => setSettings({ ...settings, display_name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={settings.avatar_url || ''}
                    onChange={(e) => setSettings({ ...settings, avatar_url: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    value={settings.bio || ''}
                    onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors resize-none"
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Globe className="h-4 w-4 inline mr-2" />
                      Timezone
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
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
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Email Notifications</div>
                      <div className="text-sm text-slate-600">Receive notifications via email</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications}
                      onChange={(e) => setSettings({ ...settings, email_notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Push Notifications</div>
                      <div className="text-sm text-slate-600">Receive push notifications</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.push_notifications}
                      onChange={(e) => setSettings({ ...settings, push_notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {settings.notification_sound ? (
                      <Volume2 className="h-5 w-5 text-slate-600" />
                    ) : (
                      <VolumeX className="h-5 w-5 text-slate-600" />
                    )}
                    <div>
                      <div className="font-medium text-slate-900">Notification Sound</div>
                      <div className="text-sm text-slate-600">Play sound for notifications</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notification_sound}
                      onChange={(e) => setSettings({ ...settings, notification_sound: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Notification Frequency
                  </label>
                  <select
                    value={settings.notification_frequency}
                    onChange={(e) => setSettings({ ...settings, notification_frequency: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  >
                    <option value="instant">Instant</option>
                    <option value="hourly">Hourly Digest</option>
                    <option value="daily">Daily Digest</option>
                    <option value="weekly">Weekly Digest</option>
                  </select>
                </div>

                <div className="border-t-2 border-slate-200 pt-4 mt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Notify me about</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notify_calendar_events}
                        onChange={(e) => setSettings({ ...settings, notify_calendar_events: e.target.checked })}
                        className="w-5 h-5 text-teal-500 border-2 border-slate-300 rounded focus:ring-2 focus:ring-teal-300"
                      />
                      <span className="text-slate-700">Calendar events and reminders</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notify_email_insights}
                        onChange={(e) => setSettings({ ...settings, notify_email_insights: e.target.checked })}
                        className="w-5 h-5 text-teal-500 border-2 border-slate-300 rounded focus:ring-2 focus:ring-teal-300"
                      />
                      <span className="text-slate-700">Email insights and extractions</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notify_task_reminders}
                        onChange={(e) => setSettings({ ...settings, notify_task_reminders: e.target.checked })}
                        className="w-5 h-5 text-teal-500 border-2 border-slate-300 rounded focus:ring-2 focus:ring-teal-300"
                      />
                      <span className="text-slate-700">Task reminders and deadlines</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'assistant':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Assistant Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Sparkles className="h-4 w-4 inline mr-2" />
                    Assistant Personality
                  </label>
                  <select
                    value={settings.assistant_personality}
                    onChange={(e) => setSettings({ ...settings, assistant_personality: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="casual">Casual</option>
                  </select>
                  <p className="text-sm text-slate-500 mt-1">Choose how the AI assistant communicates with you</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Response Length
                  </label>
                  <select
                    value={settings.assistant_response_length}
                    onChange={(e) => setSettings({ ...settings, assistant_response_length: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  >
                    <option value="brief">Brief</option>
                    <option value="moderate">Moderate</option>
                    <option value="detailed">Detailed</option>
                  </select>
                  <p className="text-sm text-slate-500 mt-1">Preferred level of detail in responses</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Auto-Suggestions</div>
                      <div className="text-sm text-slate-600">Enable automatic suggestions</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_suggest_enabled}
                      onChange={(e) => setSettings({ ...settings, auto_suggest_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Context Awareness</div>
                      <div className="text-sm text-slate-600">Use conversation history for better responses</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.context_awareness}
                      onChange={(e) => setSettings({ ...settings, context_awareness: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Insights Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Auto-Process Emails</div>
                      <div className="text-sm text-slate-600">Automatically analyze incoming emails</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_process_emails}
                      onChange={(e) => setSettings({ ...settings, auto_process_emails: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Email Categories</div>
                      <div className="text-sm text-slate-600">Automatically categorize emails</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_categories_enabled}
                      onChange={(e) => setSettings({ ...settings, email_categories_enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Auto-Approve High Confidence</div>
                      <div className="text-sm text-slate-600">Automatically approve high-confidence extractions</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_approve_high_confidence}
                      onChange={(e) => setSettings({ ...settings, auto_approve_high_confidence: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confidence Threshold: {(settings.extraction_confidence_threshold * 100).toFixed(0)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.extraction_confidence_threshold}
                    onChange={(e) => setSettings({ ...settings, extraction_confidence_threshold: parseFloat(e.target.value) })}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <p className="text-sm text-slate-500 mt-1">Minimum confidence level for auto-extraction</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Calendar Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Default Calendar View
                  </label>
                  <select
                    value={settings.calendar_view_preference}
                    onChange={(e) => setSettings({ ...settings, calendar_view_preference: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  >
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                    <option value="month">Month</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Default Event Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="15"
                      step="15"
                      value={settings.default_event_duration}
                      onChange={(e) => setSettings({ ...settings, default_event_duration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Default Reminder (minutes before)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5"
                      value={settings.default_reminder_time}
                      onChange={(e) => setSettings({ ...settings, default_reminder_time: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Work Hours Start
                    </label>
                    <input
                      type="time"
                      value={settings.work_hours_start}
                      onChange={(e) => setSettings({ ...settings, work_hours_start: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Work Hours End
                    </label>
                    <input
                      type="time"
                      value={settings.work_hours_end}
                      onChange={(e) => setSettings({ ...settings, work_hours_end: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Show Weekends</div>
                      <div className="text-sm text-slate-600">Display Saturday and Sunday in calendar</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_weekends}
                      onChange={(e) => setSettings({ ...settings, show_weekends: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Privacy Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Eye className="h-4 w-4 inline mr-2" />
                    Profile Visibility
                  </label>
                  <select
                    value={settings.profile_visibility}
                    onChange={(e) => setSettings({ ...settings, profile_visibility: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  >
                    <option value="private">Private</option>
                    <option value="contacts">Contacts Only</option>
                    <option value="public">Public</option>
                  </select>
                  <p className="text-sm text-slate-500 mt-1">Control who can see your profile</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Data Retention (days)
                  </label>
                  <input
                    type="number"
                    min="30"
                    step="30"
                    value={settings.data_retention_days}
                    onChange={(e) => setSettings({ ...settings, data_retention_days: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                  />
                  <p className="text-sm text-slate-500 mt-1">How long to keep your data</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    {/* <Activity className="h-5 w-5 text-slate-600" /> */}
                    <div>
                      <div className="font-medium text-slate-900">Activity Tracking</div>
                      <div className="text-sm text-slate-600">Track activity for insights</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.activity_tracking}
                      onChange={(e) => setSettings({ ...settings, activity_tracking: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <SettingsIcon className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Share Analytics</div>
                      <div className="text-sm text-slate-600">Help improve Mai-PA with anonymous usage data</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.share_analytics}
                      onChange={(e) => setSettings({ ...settings, share_analytics: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'theme':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Appearance Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Theme
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        settings.theme === 'light'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Sun className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                      <div className="text-sm font-medium">Light</div>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        settings.theme === 'dark'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Moon className="h-6 w-6 mx-auto mb-2 text-slate-700" />
                      <div className="text-sm font-medium">Dark</div>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'auto' })}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        settings.theme === 'auto'
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <Sparkles className="h-6 w-6 mx-auto mb-2 text-teal-500" />
                      <div className="text-sm font-medium">Auto</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <Palette className="h-4 w-4 inline mr-2" />
                    Accent Color
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {[
                      { name: 'Teal', value: '#14b8a6' },
                      { name: 'Blue', value: '#3b82f6' },
                      { name: 'Purple', value: '#a855f7' },
                      { name: 'Pink', value: '#ec4899' },
                      { name: 'Green', value: '#10b981' },
                      { name: 'Orange', value: '#f97316' }
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSettings({ ...settings, accent_color: color.value })}
                        className={`h-12 rounded-xl border-2 transition-all ${
                          settings.accent_color === color.value
                            ? 'border-slate-900 scale-110'
                            : 'border-slate-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {settings.accent_color === color.value && (
                          <Check className="h-5 w-5 text-white mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Layout className="h-5 w-5 text-slate-600" />
                    <div>
                      <div className="font-medium text-slate-900">Compact Mode</div>
                      <div className="text-sm text-slate-600">Use a more compact interface</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.compact_mode}
                      onChange={(e) => setSettings({ ...settings, compact_mode: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Link href="/dashboard" className="text-slate-500 hover:text-slate-700">
                <Home className="h-5 w-5" />
              </Link>
              <ChevronRight className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">Settings</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Settings</h1>
            <p className="text-lg text-slate-600">Manage your preferences and account settings</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sticky top-4">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{tab.label}</span>
                        {activeTab === tab.id && <ChevronRight className="h-4 w-4 ml-auto" />}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 md:p-8">
                {renderTabContent()}

                <div className="flex items-center justify-between mt-8 pt-6 border-t-2 border-slate-200">
                  <div>
                    {saveStatus === 'success' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">Settings saved successfully</span>
                      </div>
                    )}
                    {saveStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <X className="h-5 w-5" />
                        <span className="font-medium">Error saving settings</span>
                      </div>
                    )}
                  </div>
                  <button
                    // onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span className="font-semibold">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span className="font-semibold">Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
