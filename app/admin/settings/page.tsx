'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Settings,
  Globe,
  Mail,
  CreditCard,
  Shield,
  Key,
  Server,
  Database,
  Bell,
  Lock,
  Zap,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Plus,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import AdminSidebar from '@/app/components/AdminSidebar';
import Header from '@/app/components/Header';

interface AdminSettings {
  // General Settings
  appName: string;
  appDescription: string;
  supportEmail: string;
  supportPhone?: string;
  companyAddress?: string;
  
  // Email Settings
  emailProvider: 'smtp' | 'sendgrid' | 'ses';
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  fromEmail?: string;
  fromName?: string;
  
  // Payment Settings
  stripePublishableKey?: string;
  stripeSecretKey?: string;
  stripeWebhookSecret?: string;
  currency: string;
  enablePayments: boolean;
  
  // Feature Flags
  enableRegistration: boolean;
  enableEmailVerification: boolean;
  enableTwoFactor: boolean;
  enableMaintenanceMode: boolean;
  maintenanceMessage?: string;
  enableAnalytics: boolean;
  enableNotifications: boolean;
  
  // Security Settings
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecial: boolean;
  sessionTimeout: number; // minutes
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  
  // Integration Settings
  elevenlabsApiKey?: string;
  openaiApiKey?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  zoomClientId?: string;
  zoomClientSecret?: string;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  slackWebhook?: string;
  discordWebhook?: string;
  
  // Backup Settings
  autoBackup: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackup?: Date;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'email' | 'payment' | 'features' | 'security' | 'integrations' | 'notifications' | 'backup'>('general');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState<AdminSettings>({
    appName: 'MAI-PA',
    appDescription: 'Your Personal AI Assistant',
    supportEmail: 'support@maipa.ai',
    emailProvider: 'smtp',
    currency: 'USD',
    enablePayments: true,
    enableRegistration: true,
    enableEmailVerification: true,
    enableTwoFactor: false,
    enableMaintenanceMode: false,
    enableAnalytics: true,
    enableNotifications: true,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireLowercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecial: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    emailNotifications: true,
    pushNotifications: false,
    autoBackup: true,
    backupFrequency: 'daily'
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?view=login');
        return;
      }
      checkAdminAccess();
    }
  }, [authLoading, isAuthenticated, router, user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      loadSettings();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const db = getDb();
      const settingsDoc = await getDoc(doc(db, 'admin_settings', 'main'));
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        // Convert Firestore Timestamp to Date for lastBackup
        let lastBackup: Date | undefined = undefined;
        if (data.lastBackup) {
          if (data.lastBackup instanceof Timestamp) {
            lastBackup = data.lastBackup.toDate();
          } else if (data.lastBackup?.toDate) {
            lastBackup = data.lastBackup.toDate();
          } else if (data.lastBackup instanceof Date) {
            lastBackup = data.lastBackup;
          }
        }
        
        setSettings(prev => ({
          ...prev,
          ...data,
          lastBackup
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus('idle');
      const db = getDb();
      
      // Prepare settings for saving - convert Date objects to Timestamps
      const settingsToSave: any = {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: user?.uid
      };
      
      // Convert lastBackup Date to Timestamp if it exists
      if (settingsToSave.lastBackup instanceof Date) {
        settingsToSave.lastBackup = Timestamp.fromDate(settingsToSave.lastBackup);
      } else if (settingsToSave.lastBackup === null || settingsToSave.lastBackup === undefined) {
        // Don't include lastBackup if it's null/undefined (let it remain in Firestore if it exists)
        delete settingsToSave.lastBackup;
      }
      
      await setDoc(doc(db, 'admin_settings', 'main'), settingsToSave, { merge: true });
      
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

  const togglePasswordVisibility = (key: string) => {
    setShowPassword(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Key },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup', icon: Database }
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header userRole="admin" user={user} />
      <div className="flex -mt-16">
        <AdminSidebar />
        <div className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading settings...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Admin Settings</h1>
                      <p className="text-sm text-slate-600">Manage system configuration and preferences</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={loadSettings}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border-2 border-slate-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all text-slate-700 font-medium"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Refresh
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-1.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-3.5 w-3.5" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Save Status */}
                  {saveStatus === 'success' && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Settings saved successfully!</span>
                    </div>
                  )}
                  {saveStatus === 'error' && (
                    <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">Error saving settings. Please try again.</span>
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-slate-200 overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all border-b-2 ${
                            isActive
                              ? 'border-amber-500 text-amber-600 bg-amber-50'
                              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Settings Content */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5 sm:p-6">
                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Globe className="h-4 w-4 text-amber-600" />
                          General Information
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">App Name</label>
                            <input
                              type="text"
                              value={settings.appName}
                              onChange={(e) => setSettings(prev => ({ ...prev, appName: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Support Email</label>
                            <input
                              type="email"
                              value={settings.supportEmail}
                              onChange={(e) => setSettings(prev => ({ ...prev, supportEmail: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">App Description</label>
                            <textarea
                              value={settings.appDescription}
                              onChange={(e) => setSettings(prev => ({ ...prev, appDescription: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Support Phone (Optional)</label>
                            <input
                              type="tel"
                              value={settings.supportPhone || ''}
                              onChange={(e) => setSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Company Address (Optional)</label>
                            <input
                              type="text"
                              value={settings.companyAddress || ''}
                              onChange={(e) => setSettings(prev => ({ ...prev, companyAddress: e.target.value }))}
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Settings */}
                  {activeTab === 'email' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Mail className="h-4 w-4 text-amber-600" />
                          Email Configuration
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Email Provider</label>
                            <select
                              value={settings.emailProvider}
                              onChange={(e) => setSettings(prev => ({ ...prev, emailProvider: e.target.value as any }))}
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            >
                              <option value="smtp">SMTP</option>
                              <option value="sendgrid">SendGrid</option>
                              <option value="ses">AWS SES</option>
                            </select>
                          </div>
                          
                          {settings.emailProvider === 'smtp' && (
                            <>
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1.5">SMTP Host</label>
                                  <input
                                    type="text"
                                    value={settings.smtpHost || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                                    placeholder="smtp.gmail.com"
                                    className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1.5">SMTP Port</label>
                                  <input
                                    type="number"
                                    value={settings.smtpPort || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, smtpPort: parseInt(e.target.value) || undefined }))}
                                    placeholder="587"
                                    className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1.5">SMTP Username</label>
                                  <input
                                    type="text"
                                    value={settings.smtpUser || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-700 mb-1.5">SMTP Password</label>
                                  <div className="relative">
                                    <input
                                      type={showPassword['smtpPassword'] ? 'text' : 'password'}
                                      value={settings.smtpPassword || ''}
                                      onChange={(e) => setSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                                      className="w-full px-3 py-2 pr-9 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                    />
                                    <button
                                      onClick={() => togglePasswordVisibility('smtpPassword')}
                                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                      {showPassword['smtpPassword'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1.5">From Email</label>
                              <input
                                type="email"
                                value={settings.fromEmail || ''}
                                onChange={(e) => setSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                                placeholder="noreply@maipa.ai"
                                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1.5">From Name</label>
                              <input
                                type="text"
                                value={settings.fromName || ''}
                                onChange={(e) => setSettings(prev => ({ ...prev, fromName: e.target.value }))}
                                placeholder="MAI-PA"
                                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Settings */}
                  {activeTab === 'payment' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-amber-600" />
                          Payment Configuration
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Enable Payments</label>
                              <p className="text-[10px] text-slate-500">Allow users to subscribe and make payments</p>
                            </div>
                            <button
                              onClick={() => setSettings(prev => ({ ...prev, enablePayments: !prev.enablePayments }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.enablePayments ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.enablePayments ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          {settings.enablePayments && (
                            <>
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Currency</label>
                                <select
                                  value={settings.currency}
                                  onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                                  className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                >
                                  <option value="USD">USD ($)</option>
                                  <option value="EUR">EUR (€)</option>
                                  <option value="GBP">GBP (£)</option>
                                  <option value="CAD">CAD ($)</option>
                                  <option value="AUD">AUD ($)</option>
                                </select>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Stripe Publishable Key</label>
                                <div className="relative">
                                  <input
                                    type={showPassword['stripePublishableKey'] ? 'text' : 'password'}
                                    value={settings.stripePublishableKey || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, stripePublishableKey: e.target.value }))}
                                    className="w-full px-3 py-2 pr-16 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                      onClick={() => togglePasswordVisibility('stripePublishableKey')}
                                      className="p-1 text-slate-400 hover:text-slate-600"
                                    >
                                      {showPassword['stripePublishableKey'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                    {settings.stripePublishableKey && (
                                      <button
                                        onClick={() => copyToClipboard(settings.stripePublishableKey || '')}
                                        className="p-1 text-slate-400 hover:text-slate-600"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Stripe Secret Key</label>
                                <div className="relative">
                                  <input
                                    type={showPassword['stripeSecretKey'] ? 'text' : 'password'}
                                    value={settings.stripeSecretKey || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, stripeSecretKey: e.target.value }))}
                                    className="w-full px-3 py-2 pr-16 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                      onClick={() => togglePasswordVisibility('stripeSecretKey')}
                                      className="p-1 text-slate-400 hover:text-slate-600"
                                    >
                                      {showPassword['stripeSecretKey'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                    {settings.stripeSecretKey && (
                                      <button
                                        onClick={() => copyToClipboard(settings.stripeSecretKey || '')}
                                        className="p-1 text-slate-400 hover:text-slate-600"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1.5">Stripe Webhook Secret</label>
                                <div className="relative">
                                  <input
                                    type={showPassword['stripeWebhookSecret'] ? 'text' : 'password'}
                                    value={settings.stripeWebhookSecret || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, stripeWebhookSecret: e.target.value }))}
                                    className="w-full px-3 py-2 pr-16 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                  />
                                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    <button
                                      onClick={() => togglePasswordVisibility('stripeWebhookSecret')}
                                      className="p-1 text-slate-400 hover:text-slate-600"
                                    >
                                      {showPassword['stripeWebhookSecret'] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                    {settings.stripeWebhookSecret && (
                                      <button
                                        onClick={() => copyToClipboard(settings.stripeWebhookSecret || '')}
                                        className="p-1 text-slate-400 hover:text-slate-600"
                                      >
                                        <Copy className="h-3.5 w-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feature Flags */}
                  {activeTab === 'features' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-600" />
                          Feature Flags
                        </h3>
                        <div className="space-y-3">
                          {[
                            { key: 'enableRegistration', label: 'User Registration', description: 'Allow new users to create accounts' },
                            { key: 'enableEmailVerification', label: 'Email Verification', description: 'Require email verification for new accounts' },
                            { key: 'enableTwoFactor', label: 'Two-Factor Authentication', description: 'Enable 2FA for enhanced security' },
                            { key: 'enableMaintenanceMode', label: 'Maintenance Mode', description: 'Put the site in maintenance mode' },
                            { key: 'enableAnalytics', label: 'Analytics Tracking', description: 'Track visitor analytics' },
                            { key: 'enableNotifications', label: 'Notifications', description: 'Enable system notifications' }
                          ].map((feature) => (
                            <div key={feature.key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                              <div>
                                <label className="block text-xs font-medium text-slate-700 mb-1">{feature.label}</label>
                                <p className="text-[10px] text-slate-500">{feature.description}</p>
                              </div>
                              <button
                                onClick={() => setSettings(prev => ({ ...prev, [feature.key]: !prev[feature.key as keyof AdminSettings] }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  settings[feature.key as keyof AdminSettings] ? 'bg-amber-500' : 'bg-slate-300'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    settings[feature.key as keyof AdminSettings] ? 'translate-x-6' : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          ))}
                          
                          {settings.enableMaintenanceMode && (
                            <div className="mt-3">
                              <label className="block text-xs font-medium text-slate-700 mb-1.5">Maintenance Message</label>
                              <textarea
                                value={settings.maintenanceMessage || ''}
                                onChange={(e) => setSettings(prev => ({ ...prev, maintenanceMessage: e.target.value }))}
                                rows={3}
                                placeholder="We're currently performing maintenance. Please check back soon."
                                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === 'security' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-amber-600" />
                          Security Configuration
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Minimum Password Length</label>
                            <input
                              type="number"
                              min="6"
                              max="32"
                              value={settings.passwordMinLength}
                              onChange={(e) => setSettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) || 8 }))}
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-2">Password Requirements</label>
                            <div className="space-y-2">
                              {[
                                { key: 'passwordRequireUppercase', label: 'Require Uppercase Letters' },
                                { key: 'passwordRequireLowercase', label: 'Require Lowercase Letters' },
                                { key: 'passwordRequireNumbers', label: 'Require Numbers' },
                                { key: 'passwordRequireSpecial', label: 'Require Special Characters' }
                              ].map((req) => (
                                <div key={req.key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                                  <span className="text-xs text-slate-700">{req.label}</span>
                                  <button
                                    onClick={() => setSettings(prev => ({ ...prev, [req.key]: !prev[req.key as keyof AdminSettings] }))}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                      settings[req.key as keyof AdminSettings] ? 'bg-amber-500' : 'bg-slate-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        settings[req.key as keyof AdminSettings] ? 'translate-x-5' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1.5">Session Timeout (minutes)</label>
                              <input
                                type="number"
                                min="5"
                                max="1440"
                                value={settings.sessionTimeout}
                                onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 60 }))}
                                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1.5">Max Login Attempts</label>
                              <input
                                type="number"
                                min="3"
                                max="10"
                                value={settings.maxLoginAttempts}
                                onChange={(e) => setSettings(prev => ({ ...prev, maxLoginAttempts: parseInt(e.target.value) || 5 }))}
                                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1.5">Lockout Duration (minutes)</label>
                              <input
                                type="number"
                                min="5"
                                max="60"
                                value={settings.lockoutDuration}
                                onChange={(e) => setSettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) || 15 }))}
                                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Integration Settings */}
                  {activeTab === 'integrations' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Key className="h-4 w-4 text-amber-600" />
                          API Keys & Integrations
                        </h3>
                        <div className="space-y-4">
                          {[
                            { key: 'elevenlabsApiKey', label: 'ElevenLabs API Key', description: 'For text-to-speech functionality' },
                            { key: 'openaiApiKey', label: 'OpenAI API Key', description: 'For AI assistant features' },
                            { key: 'googleClientId', label: 'Google Client ID', description: 'For Google OAuth integration' },
                            { key: 'googleClientSecret', label: 'Google Client Secret', description: 'For Google OAuth integration' },
                            { key: 'zoomClientId', label: 'Zoom Client ID', description: 'For Zoom integration' },
                            { key: 'zoomClientSecret', label: 'Zoom Client Secret', description: 'For Zoom integration' }
                          ].map((integration) => (
                            <div key={integration.key}>
                              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                                {integration.label}
                                <span className="text-[10px] text-slate-500 font-normal ml-2">({integration.description})</span>
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword[integration.key] ? 'text' : 'password'}
                                  value={settings[integration.key as keyof AdminSettings] as string || ''}
                                  onChange={(e) => setSettings(prev => ({ ...prev, [integration.key]: e.target.value }))}
                                  className="w-full px-3 py-2 pr-16 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                  <button
                                    onClick={() => togglePasswordVisibility(integration.key)}
                                    className="p-1 text-slate-400 hover:text-slate-600"
                                  >
                                    {showPassword[integration.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                  </button>
                                  {settings[integration.key as keyof AdminSettings] && (
                                    <button
                                      onClick={() => copyToClipboard(settings[integration.key as keyof AdminSettings] as string || '')}
                                      className="p-1 text-slate-400 hover:text-slate-600"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notification Settings */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Bell className="h-4 w-4 text-amber-600" />
                          Notification Configuration
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Email Notifications</label>
                              <p className="text-[10px] text-slate-500">Send notifications via email</p>
                            </div>
                            <button
                              onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.emailNotifications ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Push Notifications</label>
                              <p className="text-[10px] text-slate-500">Enable browser push notifications</p>
                            </div>
                            <button
                              onClick={() => setSettings(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.pushNotifications ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Slack Webhook URL (Optional)</label>
                            <input
                              type="url"
                              value={settings.slackWebhook || ''}
                              onChange={(e) => setSettings(prev => ({ ...prev, slackWebhook: e.target.value }))}
                              placeholder="https://hooks.slack.com/services/..."
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Discord Webhook URL (Optional)</label>
                            <input
                              type="url"
                              value={settings.discordWebhook || ''}
                              onChange={(e) => setSettings(prev => ({ ...prev, discordWebhook: e.target.value }))}
                              placeholder="https://discord.com/api/webhooks/..."
                              className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Backup Settings */}
                  {activeTab === 'backup' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <Database className="h-4 w-4 text-amber-600" />
                          Backup & Export
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border-2 border-slate-200">
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1">Auto Backup</label>
                              <p className="text-[10px] text-slate-500">Automatically backup database on schedule</p>
                            </div>
                            <button
                              onClick={() => setSettings(prev => ({ ...prev, autoBackup: !prev.autoBackup }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                settings.autoBackup ? 'bg-amber-500' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  settings.autoBackup ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          {settings.autoBackup && (
                            <div>
                              <label className="block text-xs font-medium text-slate-700 mb-1.5">Backup Frequency</label>
                              <select
                                value={settings.backupFrequency}
                                onChange={(e) => setSettings(prev => ({ ...prev, backupFrequency: e.target.value as any }))}
                                className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                          )}
                          
                          <div className="p-3 bg-amber-50 border-2 border-amber-200 rounded-xl">
                            <div className="flex items-start gap-2">
                              <Info className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <h4 className="text-xs font-medium text-amber-900 mb-1">Backup Information</h4>
                                <p className="text-xs text-amber-700">
                                  {settings.lastBackup 
                                    ? `Last backup: ${settings.lastBackup instanceof Date ? settings.lastBackup.toLocaleString() : new Date(settings.lastBackup).toLocaleString()}`
                                    : 'No backups have been created yet.'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <button className="flex-1 px-3 py-2 text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-medium">
                              Create Backup Now
                            </button>
                            <button className="flex-1 px-3 py-2 text-xs bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all font-medium">
                              Export Data
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

