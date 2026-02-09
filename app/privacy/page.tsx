import { Shield, Lock, Eye, Database, Users, AlertCircle } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            Your privacy is our top priority. Learn how we protect your conversations, calls, and personal data.
          </p>
          <div className="text-xs sm:text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 sm:p-8 rounded-2xl mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <Eye className="h-6 w-6 mr-2 text-teal-600" />
              Our Privacy Commitment
            </h2>
            <p className="text-sm sm:text-base text-gray-700">
              MAI-PA is committed to protecting your privacy and ensuring the security of your personal information.
              This Privacy Policy explains how we collect, use, store, and protect your conversations, voice data, call recordings, and other personal information when you use our AI companion service.
            </p>
          </div>

          {/* Information We Collect */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Database className="h-8 w-8 mr-3 text-teal-600" />
              Information We Collect
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Conversation & Voice Data</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  As a conversational AI service, we collect and process:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>Text conversations with your AI assistant</li>
                  <li>Voice input and audio recordings</li>
                  <li>Phone call recordings (Professional+ plans)</li>
                  <li>Conversation transcripts and context</li>
                  <li>Voice preferences and settings</li>
                  <li>Assistant learning data and personalization patterns</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Email & Calendar Data</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  When you enable monitoring features:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>Email content from connected accounts (for intelligent extraction)</li>
                  <li>Calendar events and scheduling information</li>
                  <li>Tasks, reminders, and notes you create</li>
                  <li>Contact information mentioned in emails and events</li>
                  <li>Meeting invitations and responses</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>Name, email address, and phone number</li>
                  <li>Profile information and preferences</li>
                  <li>Time zone and location settings</li>
                  <li>Payment information (securely processed)</li>
                  <li>Communication and notification preferences</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Usage & Analytics Data</h3>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>Interaction patterns with your assistant</li>
                  <li>Feature usage and preferences</li>
                  <li>Performance metrics and error reports</li>
                  <li>Device information and operating system</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">How We Use Your Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 sm:p-6 rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Core Functionality</h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2">
                  <li>• Enable natural conversations with your assistant</li>
                  <li>• Make morning briefing phone calls</li>
                  <li>• Monitor and extract information from emails</li>
                  <li>• Manage calendar events and tasks</li>
                  <li>• Send proactive reminders and notifications</li>
                  <li>• Sync data across your devices</li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-green-50 p-4 sm:p-6 rounded-xl">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">AI Personalization</h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2">
                  <li>• Learn your communication style and preferences</li>
                  <li>• Provide personalized scheduling recommendations</li>
                  <li>• Improve voice recognition accuracy</li>
                  <li>• Enhance natural language understanding</li>
                  <li>• Adapt to your workflows and patterns</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Lock className="h-8 w-8 mr-3 text-teal-600" />
              Data Security & Protection
            </h2>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 sm:p-8 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Encryption</h3>
                  <ul className="text-sm sm:text-base text-gray-600 space-y-2">
                    <li>• End-to-end encryption for data transmission</li>
                    <li>• AES-256 encryption for stored data</li>
                    <li>• Encrypted database storage</li>
                    <li>• Secure API communications</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Access Controls</h3>
                  <ul className="text-sm sm:text-base text-gray-600 space-y-2">
                    <li>• Multi-factor authentication</li>
                    <li>• Role-based access permissions</li>
                    <li>• Regular security audits</li>
                    <li>• Automated threat detection</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Data Sharing */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Users className="h-8 w-8 mr-3 text-teal-600" />
              Data Sharing & Third Parties
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 p-4 sm:p-6 rounded-xl mb-4 sm:mb-6">
              <div className="flex items-start">
                <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Important: We Do Not Sell Your Data</h3>
                  <p className="text-sm sm:text-base text-gray-700">
                    We never sell, rent, or trade your personal information to third parties for marketing purposes.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Limited Sharing</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">We only share your information in these specific circumstances:</p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>With trusted service providers who help us operate our service</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Service Providers</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">We work with the following types of service providers:</p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>Cloud hosting services (with strict data processing agreements)</li>
                  <li>AI processing services (DeepSeek) for conversational AI functionality</li>
                  <li>Telephony services for phone call features</li>
                  <li>Email service providers (only when you enable email monitoring)</li>
                  <li>Calendar synchronization services (for Google Calendar integration)</li>
                  <li>Analytics services for performance monitoring</li>
                  <li>Customer support and communication tools</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Your Privacy Rights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Access & Control</h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2">
                  <li>• View all data we have about you</li>
                  <li>• Update or correct your information</li>
                  <li>• Download your data</li>
                  <li>• Delete your account and data</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Privacy Controls</h3>
                <ul className="text-sm sm:text-base text-gray-600 space-y-2">
                  <li>• Opt out of data collection</li>
                  <li>• Control notification preferences</li>
                  <li>• Manage data sharing settings</li>
                  <li>• Request data portability</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Contact Us</h2>
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 sm:p-8 rounded-2xl">
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or how we handle your conversations and data, please contact us:
              </p>
              <div className="space-y-2 text-sm sm:text-base text-gray-600">
                <p><strong>Email:</strong> info@maipa.ai</p>
                <p><strong>Address:</strong> MAI-PA, 15 Queen Street, Belfast BT1 6EA, United Kingdom</p>
                <p><strong>Phone:</strong> +44 74 5741 0471</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};