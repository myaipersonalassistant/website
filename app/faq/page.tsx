'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Mail,
  Zap,
  Calendar,
  Users,
  CreditCard,
  Shield,
  Settings,
  Phone,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Sparkles
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const FAQsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);

  const categories: Category[] = [
    { id: 'all', name: 'All Questions', icon: HelpCircle, color: 'from-slate-600 to-slate-800' },
    { id: 'general', name: 'General', icon: Sparkles, color: 'from-teal-500 to-cyan-600' },
    { id: 'features', name: 'Features', icon: Zap, color: 'from-blue-500 to-indigo-600' },
    { id: 'billing', name: 'Billing', icon: CreditCard, color: 'from-orange-500 to-red-600' },
    { id: 'technical', name: 'Technical', icon: Settings, color: 'from-purple-500 to-pink-600' },
    { id: 'security', name: 'Security', icon: Shield, color: 'from-emerald-500 to-teal-600' },
  ];

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'What is MAI-PA and how does it work?',
      answer: 'MAI-PA is your personal AI companion - think of it as having a highly capable human assistant who\'s always available. You talk to it naturally through voice or text, and it manages your life using tools like calendar, email intelligence, and task management. It\'s not a productivity app with AI features - it\'s an AI assistant that uses productivity tools to serve you. The assistant understands context, remembers your conversations, anticipates your needs, and even calls you with morning briefings and important reminders.',
      category: 'general'
    },
    {
      id: '2',
      question: 'How do I get started with my AI assistant?',
      answer: 'Getting started is easy! Download MAI-PA and meet your AI companion. Optionally connect email and calendar so your assistant can use these tools to help you. Then just start talking naturally - say things like "What\'s on my schedule today?" or "Remind me to call John next week." No commands to learn. Your assistant understands you like a real person would and gets smarter over time as it learns your patterns.',
      category: 'general'
    },
    {
      id: '3',
      question: 'Can my assistant use my existing calendar (Google Calendar, Outlook, etc.)?',
      answer: 'Yes! Your AI assistant can use Google Calendar, Outlook, or its own built-in calendar system - your choice. When you connect an external calendar, your assistant uses it as a tool to manage your time. Just tell your assistant "Schedule a meeting tomorrow at 2pm" and it handles the rest, whether that\'s creating events in Google Calendar or its internal system. Either way, you never interact with the calendar directly - you just talk to your assistant.',
      category: 'features'
    },
    {
      id: '4',
      question: 'What are morning briefings and phone call reminders?',
      answer: 'Your AI assistant can call you every morning with a personalized briefing covering your schedule, weather, priorities, and important updates - just like a real personal assistant would. For critical events, your assistant can also call you with reminders. This voice-first experience means you can get updates while driving, exercising, or cooking. You control when your assistant calls and for what types of events. Available in Professional, Executive, and Team plans.',
      category: 'features'
    },
    {
      id: '5',
      question: 'How does my assistant use my email?',
      answer: 'Your assistant monitors connected email accounts (1-3 depending on plan, unlimited for Executive/Team) and extracts important information like flight bookings, hotel reservations, meetings, and deadlines. It then proactively suggests "I found a flight booking - shall I add it to your calendar?" This email intelligence happens automatically and securely. Your assistant uses this information as a tool to help you - you never have to manually create events from emails.',
      category: 'features'
    },
    {
      id: '6',
      question: 'Is there a limit on the number of events I can create?',
      answer: 'Student Plan users can create up to 50 events per month, which is perfect for managing classes and assignments. Professional, Executive, and Team Plan users enjoy unlimited events. An "event" includes meetings, appointments, reminders, tasks, and any scheduled item. Past events don\'t count toward your limit, so you only need to consider active and future events.',
      category: 'features'
    },
    {
      id: '7',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), debit cards, and PayPal. All payments are processed securely through industry-leading payment processor Stripe. We use bank-level encryption and never store your complete credit card information on our servers. Your payment information is always secure and protected.',
      category: 'billing'
    },
    {
      id: '8',
      question: 'Can I cancel my subscription at any time?',
      answer: 'Absolutely! You can cancel your subscription at any time with no cancellation fees or penalties. Your access will continue until the end of your current billing period. To cancel, simply go to Settings > Billing and click "Cancel Subscription." You can also downgrade to a different plan if you prefer. We believe in complete flexibility and transparency.',
      category: 'billing'
    },
    {
      id: '9',
      question: 'Do you offer refunds?',
      answer: 'We offer a 100% money-back guarantee within the first 30 days of your paid subscription (after the free trial). If you\'re not completely satisfied, contact our support team and we\'ll process a full refund, no questions asked. After 30 days, refunds are considered on a case-by-case basis for extenuating circumstances.',
      category: 'billing'
    },
    {
      id: '10',
      question: 'What happens when I upgrade or downgrade my plan?',
      answer: 'When you upgrade, the new features are available immediately, and we\'ll prorate the charge for the remainder of your billing cycle. When you downgrade, the change takes effect at the end of your current billing period, so you can enjoy your current plan\'s features until then. Any data exceeding the new plan\'s limits will be archived but not deleted, so you can access it if you upgrade again later.',
      category: 'billing'
    },
    {
      id: '11',
      question: 'Is my data secure and private?',
      answer: 'Security and privacy are our top priorities. We use bank-level 256-bit AES encryption for data at rest and TLS 1.3 for data in transit. We\'re SOC 2 Type II certified and GDPR compliant. We never sell your data to third parties, and you maintain complete ownership of your information. Our AI processing happens in secure, isolated environments. You can delete your data at any time, and we\'ll permanently remove it from our systems.',
      category: 'security'
    },
    {
      id: '12',
      question: 'Where are your servers located and where is my data stored?',
      answer: 'Our servers are hosted in enterprise-grade data centers across North America and Europe (AWS and Google Cloud Platform). You can choose your preferred data region during signup for data residency compliance. All data centers are ISO 27001 certified and maintain 99.99% uptime. We perform regular backups and have disaster recovery systems in place to ensure your data is always safe and accessible.',
      category: 'security'
    },
    {
      id: '13',
      question: 'Can the AI access all my emails and calendar events?',
      answer: 'The AI only accesses information you explicitly grant permission for. When you connect an email account or calendar, you control the level of access through granular permissions. By default, the AI only reads metadata (sender, subject, date) to identify important items. You can enable or disable specific features like email parsing, contact extraction, or calendar event creation at any time in your privacy settings.',
      category: 'security'
    },
    {
      id: '14',
      question: 'Does the platform work on mobile devices?',
      answer: 'Yes! We have native mobile apps for both iOS (iPhone/iPad) and Android devices, available on the App Store and Google Play Store. The mobile apps offer the full functionality of the web platform, optimized for smaller screens. You can chat with your AI assistant, view and manage your calendar, receive push notifications, and access all features on the go. Your data syncs seamlessly across all devices in real-time.',
      category: 'technical'
    },
    {
      id: '15',
      question: 'What browsers do you support?',
      answer: 'Our web platform works best on modern browsers including Google Chrome (recommended), Mozilla Firefox, Safari, and Microsoft Edge (latest versions). We recommend keeping your browser updated to ensure optimal performance and security. The platform is also fully responsive and works on tablets and mobile devices through mobile browsers, though we recommend our native apps for the best mobile experience.',
      category: 'technical'
    },
    {
      id: '16',
      question: 'Can I use the AI assistant in different languages?',
      answer: 'Currently, our AI assistant primarily supports English, with beta support for Spanish, French, German, and Portuguese. We\'re actively working on expanding language support. The AI can understand and respond to basic queries in over 20 languages, but for the best experience, we recommend using English until full multilingual support is available. Stay tuned for updates!',
      category: 'technical'
    },
    {
      id: '17',
      question: 'How does team collaboration work?',
      answer: 'Team Plans enable seamless collaboration for up to 10 team members. You get shared calendars where everyone can see team availability, shared task lists, and the ability to delegate and assign tasks. The admin dashboard lets you manage team members, view team analytics, and control permissions. Team members can schedule meetings across the team with automatic conflict detection and smart time suggestions based on everyone\'s availability.',
      category: 'features'
    },
    {
      id: '18',
      question: 'What kind of customer support do you offer?',
      answer: 'Support level varies by plan. All users get email support with responses within 24 hours. Professional plan users receive priority email support (12-hour response time). Executive plan users get 24/7 priority support including phone support. Team plan users get a dedicated account manager plus 24/7 support. We also offer live chat during business hours (Monday-Friday, 9 AM - 6 PM EST) for all paid plans.',
      category: 'general'
    },
    {
      id: '19',
      question: 'Can I import my existing tasks and events?',
      answer: 'Yes! We support importing data from various formats including CSV, ICS (calendar format), and direct imports from popular tools like Todoist, Asana, Trello, Google Tasks, and Microsoft To-Do. To import, go to Settings > Import/Export and choose your data source. Our import wizard will guide you through the process, and you can preview the data before finalizing the import.',
      category: 'technical'
    },
    {
      id: '20',
      question: 'What can my AI assistant do for me?',
      answer: 'Your assistant manages your entire workflow through natural conversation. It maintains your calendar, creates and prioritizes tasks, monitors emails for important information, sends intelligent reminders, calls you with morning briefings and critical updates, learns your patterns, anticipates your needs, and provides proactive suggestions. It\'s like having a highly capable human assistant. It can\'t make calls on your behalf or perform financial transactions, but it excels at being your always-available personal companion for daily life management.',
      category: 'general'
    }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <HelpCircle className="h-10 w-10" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
              Find quick answers about your AI companion and how it helps you manage daily life
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="text-4xl font-bold text-teal-600 mb-2">{faqs.length}+</div>
              <div className="text-sm text-slate-600">Questions Answered</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="text-4xl font-bold text-blue-600 mb-2">{categories.length - 1}</div>
              <div className="text-sm text-slate-600">Categories</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-sm text-slate-600">Support Available</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center shadow-md">
              <div className="text-4xl font-bold text-orange-600 mb-2">15 min</div>
              <div className="text-sm text-slate-600">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-12">
            <div className="relative bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
              <input
                type="text"
                placeholder="Search questions, topics, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-lg text-slate-900 border-0 focus:ring-2 focus:ring-teal-500 placeholder-slate-400 transition-all duration-200"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="text-sm text-slate-600">Popular searches:</span>
              {['Billing', 'Security', 'Mobile apps', 'Team features'].map((term) => (
                <button
                  key={term}
                  onClick={() => setSearchQuery(term)}
                  className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1 rounded-full transition-all"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <HelpCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No questions found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your search or category filter</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => {
                const isOpen = openFAQ === faq.id;
                const categoryInfo = categories.find(c => c.id === faq.category);
                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-2xl border-2 transition-all duration-300 ${
                      isOpen ? 'border-teal-500 shadow-lg' : 'border-slate-200 hover:border-teal-300'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-5 flex items-start justify-between text-left"
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2 mb-2">
                          {categoryInfo && (
                            <span className={`inline-flex items-center px-2 py-1 bg-gradient-to-r ${categoryInfo.color} text-white text-xs font-medium rounded-full`}>
                              {categoryInfo.name}
                            </span>
                          )}
                        </div>
                        <h3 className={`text-lg font-semibold transition-colors ${
                          isOpen ? 'text-teal-600' : 'text-slate-900'
                        }`}>
                          {faq.question}
                        </h3>
                      </div>
                      <div className={`flex-shrink-0 transform transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}>
                        {isOpen ? (
                          <ChevronUp className="h-6 w-6 text-teal-600" />
                        ) : (
                          <ChevronDown className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <div className="pt-4 border-t border-slate-200">
                          <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Still Have Questions */}
      <section className="py-20 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Still Have Questions?
            </h2>
            <p className="text-xl text-white/90">
              We're here to help you get the answers you need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link
              href="/help_center"
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all text-center group border border-white/20"
            >
              <div className="bg-white/20 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Help Center</h3>
              <p className="text-white/80 mb-4">Browse our comprehensive guides and tutorials</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                Visit Help Center
                <ExternalLink className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/community"
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all text-center group border border-white/20"
            >
              <div className="bg-white/20 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Community</h3>
              <p className="text-white/80 mb-4">Connect with other users and share experiences</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                Join Community
                <ExternalLink className="h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/contact"
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all text-center group border border-white/20"
            >
              <div className="bg-white/20 p-4 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Contact Support</h3>
              <p className="text-white/80 mb-4">Get personalized help from our support team</p>
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                Contact Us
                <ExternalLink className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQsPage;