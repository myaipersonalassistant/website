import { Scale, AlertTriangle, Shield, FileText, Info, Gavel } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
            <Scale className="h-8 w-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">Legal & Disclaimer</h1>
          <p className="text-lg sm:text-xl text-gray-600 px-4">
            Important legal information and disclaimers regarding the use of MAI-PA.
          </p>
          <div className="text-xs sm:text-sm text-gray-500 mt-4">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          {/* Important Notice */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 p-6 sm:p-8 rounded-2xl mb-6 sm:mb-8">
            <div className="flex items-start">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mr-4 mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Important Legal Notice</h2>
                <p className="text-sm sm:text-base text-gray-700">
                  Please read this legal disclaimer carefully before using MAI-PA. By using our service, including conversing with your AI assistant, receiving phone calls, or enabling email monitoring, you acknowledge that you have read, understood, and agree to be bound by these legal terms and disclaimers.
                </p>
              </div>
            </div>
          </div>

          {/* Software License */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <FileText className="h-8 w-8 mr-3 text-teal-600" />
              Software License
            </h2>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">License Grant</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Subject to your compliance with these terms, we grant you a limited, non-exclusive, non-transferable,
                revocable license to use MAI-PA on your compatible devices for personal or internal business purposes.
              </p>
              
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">License Restrictions</h4>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2 mb-6">
                <li>You may not modify, reverse engineer, or decompile the application</li>
                <li>You may not redistribute, sell, or sublicense the software</li>
                <li>You may not use the application for illegal or unauthorized purposes</li>
                <li>You may not remove or alter any proprietary notices or labels</li>
                <li>You may not use the application to compete with our services</li>
              </ul>
              
              <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg">
                <p className="text-sm sm:text-base text-teal-800">
                  <strong>Note:</strong> This license is automatically terminated if you violate any of these restrictions.
                </p>
              </div>
            </div>
          </section>

          {/* AI Disclaimer */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Shield className="h-8 w-8 mr-3 text-teal-600" />
              AI Technology Disclaimer
            </h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 p-6 sm:p-8 rounded-2xl">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Conversational AI Disclaimer</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4">
                  MAI-PA uses advanced artificial intelligence (DeepSeek AI) to provide a conversational assistant experience, including natural language understanding, scheduling recommendations, email monitoring, and phone call interactions. Please be aware of the following:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>AI responses and actions are generated based on algorithms and may not always be accurate or complete</li>
                  <li>Your assistant's suggestions and interpretations should be reviewed before acting on them</li>
                  <li>The AI continuously learns from your interactions but may occasionally misunderstand context</li>
                  <li>Phone call transcriptions and email interpretations may contain errors</li>
                  <li>AI-generated recommendations are suggestions only and should not replace human judgment for important decisions</li>
                  <li>Your assistant learns your preferences over time, but you remain responsible for all actions taken based on its suggestions</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Accuracy Limitations</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  While we strive to provide accurate AI-powered features, we cannot guarantee that all AI-generated 
                  content, suggestions, or insights will be error-free, complete, or suitable for your specific needs. 
                  Users are responsible for verifying AI recommendations before acting on them.
                </p>
              </div>
            </div>
          </section>

          {/* Data Disclaimer */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Data & Integration Disclaimer</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Phone Call Disclaimer</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Professional and higher plans include phone call features. Please be aware:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>Call quality depends on your phone carrier and network conditions</li>
                  <li>Calls are recorded and transcribed for assistant functionality</li>
                  <li>Call transcriptions may contain errors or inaccuracies</li>
                  <li>We are not liable for missed calls due to network or technical issues</li>
                  <li>Important information received during calls should be verified independently</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Email Monitoring Disclaimer</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  When you enable email monitoring:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>Your assistant processes email content to extract relevant information</li>
                  <li>Email interpretation by AI may not always be accurate</li>
                  <li>You remain responsible for important email communications</li>
                  <li>We are not liable for missed or misinterpreted emails</li>
                  <li>Email service integration depends on third-party providers</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Third-Party Integration Disclaimer</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  MAI-PA integrates with external services. We disclaim liability for:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2">
                  <li>Service interruptions caused by third-party API changes or downtime</li>
                  <li>Data synchronization delays or failures with Google Calendar or email providers</li>
                  <li>Changes to third-party terms of service that may affect functionality</li>
                  <li>Loss of data due to third-party service issues</li>
                </ul>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Data Backup Responsibility</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  While we implement robust data protection measures, users are responsible for maintaining their own
                  backups of important conversations, calendar data, and task information. We recommend regularly exporting your data.
                </p>
              </div>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Gavel className="h-8 w-8 mr-3 text-teal-600" />
              Limitation of Liability
            </h2>
            
            <div className="bg-red-50 border border-red-200 p-6 sm:p-8 rounded-2xl">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Disclaimer of Warranties</h3>
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                MAI-PA is provided "AS IS" and "AS AVAILABLE" without any warranties of any kind,
                either express or implied, including but not limited to:
              </p>
              <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2 mb-6">
                <li>Merchantability or fitness for a particular purpose</li>
                <li>Uninterrupted or error-free operation of AI assistant, phone calls, or email monitoring</li>
                <li>Accuracy or reliability of AI-generated responses, transcriptions, or interpretations</li>
                <li>Quality or reliability of phone call connections</li>
                <li>Accuracy of email content extraction and analysis</li>
                <li>Security of data transmission, voice data, or call recordings</li>
                <li>Compatibility with all devices, phone carriers, or email providers</li>
              </ul>

              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Liability Limitation</h4>
              <p className="text-sm sm:text-base text-gray-700">
                In no event shall MAI-PA, its developers, or affiliates be liable for any direct,
                indirect, incidental, special, consequential, or punitive damages arising out of or relating to your
                use of the service, including but not limited to damages for lost profits, lost data, missed calls, misinterpreted emails, business interruption, or reliance on AI-generated content.
              </p>
            </div>
          </section>

          {/* Third-Party Services */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Third-Party Services</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">External Dependencies</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  MAI-PA integrates with third-party services including:
                </p>
                <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 space-y-2 mb-4">
                  <li><strong>DeepSeek AI:</strong> For conversational AI and natural language processing</li>
                  <li><strong>Telephony Services:</strong> For phone call functionality and voice features</li>
                  <li><strong>Email Service Providers:</strong> For email monitoring when enabled</li>
                  <li><strong>Calendar APIs:</strong> For Google Calendar synchronization</li>
                  <li><strong>Cloud Storage Services:</strong> For data backup and synchronization</li>
                  <li><strong>Push Notification Services:</strong> For alerts and reminders</li>
                </ul>
                <p className="text-sm sm:text-base text-gray-600">
                  We are not responsible for the availability, functionality, accuracy, or terms of service of these third-party providers.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Third-Party Links</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  Our application may contain links to third-party websites or services. We are not responsible for 
                  the content, privacy policies, or practices of any third-party sites or services.
                </p>
              </div>
            </div>
          </section>

          {/* Governing Law */}
          <section className="mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Governing Law & Jurisdiction</h2>
            
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 sm:p-8 rounded-2xl">
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                These legal terms and disclaimers shall be governed by and construed in accordance with the laws of
                the jurisdiction where MAI-PA is incorporated, without regard to conflict of law principles.
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                Any disputes arising out of or relating to these terms shall be resolved through binding arbitration
                or in the courts of competent jurisdiction in the applicable jurisdiction.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
              <Info className="h-8 w-8 mr-3 text-teal-600" />
              Legal Contact Information
            </h2>

            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 sm:p-8 rounded-2xl">
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                For legal inquiries, questions about these disclaimers, or to report legal concerns, please contact:
              </p>
              <div className="space-y-2 text-sm sm:text-base text-gray-600">
                <p><strong>Legal Department:</strong> info@maipa.ai</p>
                <p><strong>Address:</strong> MAI-PA Legal Department</p>
                <p className="ml-16">15 Queen Street</p>
                <p className="ml-16">Belfast BT1 6EA</p>
                <p className="ml-16">United Kingdom</p>
                <p><strong>Phone:</strong> +44 74 5741 0471</p>
              </div>
            </div>
          </section>

          {/* Updates Notice */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 sm:p-6 rounded-xl">
            <div className="flex items-start">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Updates to Legal Terms</h3>
                <p className="text-sm sm:text-base text-gray-700">
                  We may update these legal terms and disclaimers from time to time. Continued use of the application 
                  after such changes constitutes acceptance of the updated terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};