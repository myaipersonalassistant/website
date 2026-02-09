'use client';

import { useState } from 'react';
import {
  Search,
  BookOpen,
  Video,
  FileText,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  ChevronRight,
  Zap,
  Calendar,
  Users,
  Shield,
  CreditCard,
  Settings,
  Bell,
  Download,
  PlayCircle,
  Book,
  Headphones,
  ExternalLink,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Import
} from 'lucide-react';
import Link from 'next/link';

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  articles: number;
  popular: boolean;
}

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  views: string;
}

interface VideoTutorial {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  category: string;
}

const HelpCenterPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const popularArticles: Article[] = [
    {
      id: '1',
      title: 'Talking to your AI assistant: Natural conversation tips',
      category: 'Getting Started',
      readTime: '5 min read',
      views: '12.5k'
    },
    {
      id: '2',
      title: 'How your assistant uses Google Calendar to help you',
      category: 'Assistant Tools',
      readTime: '3 min read',
      views: '10.2k'
    },
    {
      id: '3',
      title: 'Morning briefings: Getting daily updates from your assistant',
      category: 'Getting Started',
      readTime: '4 min read',
      views: '9.8k'
    },
    {
      id: '4',
      title: 'Email intelligence: How your assistant monitors emails for you',
      category: 'Your AI Companion',
      readTime: '6 min read',
      views: '8.7k'
    },
    {
      id: '5',
      title: 'Setting up team calendars and shared events',
      category: 'Team Collaboration',
      readTime: '7 min read',
      views: '7.9k'
    },
    {
      id: '6',
      title: 'How to upgrade or downgrade your plan',
      category: 'Billing & Payments',
      readTime: '3 min read',
      views: '6.5k'
    }
  ];

  const filteredArticles = popularArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <BookOpen className="h-10 w-10" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto">
              Learn how to talk to your AI companion and let it manage your daily life
            </p>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/faq"
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <MessageCircle className="h-5 w-5 text-teal-600" />
              <span className="font-medium">FAQs</span>
            </Link>
            <Link
              href="/community"
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
            >
              <Users className="h-5 w-5 text-teal-600" />
              <span className="font-medium">Community</span>
            </Link>
            <a
              href="#contact"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-lg rounded-xl transition-all"
            >
              <Headphones className="h-5 w-5" />
              <span className="font-medium">Contact Support</span>
            </a>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
              <input
                type="text"
                placeholder="Search for help articles, guides, and tutorials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-lg text-slate-900 border-0 focus:ring-2 focus:ring-teal-500 placeholder-slate-400 transition-all duration-200"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="text-sm text-slate-600">Popular searches:</span>
              {['Calendar sync', 'AI assistant', 'Phone reminders', 'Team setup'].map((term) => (
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

          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4">
                Articles
              </h2>
              <p className="text-xl text-slate-600">
                Help articles and guides to get you started
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-teal-600" />
          </div>

          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No articles found</h3>
              <p className="text-slate-600 mb-6">Try adjusting your search query</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-teal-600 hover:text-teal-700 font-medium"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/help_center/${article.id}`}
                  className="bg-slate-50 rounded-2xl p-6 hover:shadow-lg transition-all border-2 border-transparent hover:border-teal-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="inline-flex items-center px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                      {article.category}
                    </span>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {article.readTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {article.views} views
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Support */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-slate-600">
              Our support team is here to assist you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border-2 border-teal-200">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-4 rounded-2xl w-fit mb-6">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Email Support</h3>
              <p className="text-slate-600 mb-6">
                Get detailed responses within 24 hours
              </p>
              <a
                href="mailto:support@example.com"
                className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-700"
              >
                support@example.com
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-blue-200">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-2xl w-fit mb-6">
                <MessageCircle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Live Chat</h3>
              <p className="text-slate-600 mb-6">
                Chat with us in real-time during business hours
              </p>
              <button className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700">
                Start Chat
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-200">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-4 rounded-2xl w-fit mb-6">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Phone Support</h3>
              <p className="text-slate-600 mb-6">
                Premium plan members get priority phone support
              </p>
              <a
                href="tel:+1234567890"
                className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700"
              >
                +1 (234) 567-890
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-12 bg-slate-900 rounded-2xl p-8 text-white text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-teal-400" />
            <h3 className="text-2xl font-bold mb-2">Support Hours</h3>
            <p className="text-slate-300">
              Monday - Friday: 9:00 AM - 6:00 PM EST
              <br />
              Weekend: Email support only
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;
