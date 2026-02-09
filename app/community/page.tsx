'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  MessageCircle,
  ThumbsUp,
  Award,
  TrendingUp,
  Calendar,
  Star,
  ExternalLink,
  Search,
  Filter,
  Globe,
  BookOpen,
  Zap,
  Heart,
  Share2,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  Sparkles,
  Trophy,
  Target,
  Rocket,
  Coffee,
  Code,
  Shield
} from 'lucide-react';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    badge: string;
    role: string;
  };
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  stats: {
    views: number;
    likes: number;
  };
  timeAgo: string;
  solved: boolean;
}

const CommunityPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts', icon: Globe, count: 1247 },
    { id: 'general', name: 'General Discussion', icon: MessageCircle, count: 423 },
    { id: 'tips', name: 'Tips & Tricks', icon: Zap, count: 312 },
    { id: 'help', name: 'Help & Support', icon: Users, count: 289 },
    { id: 'feedback', name: 'Feature Requests', icon: Star, count: 156 },
    { id: 'showcase', name: 'Success Stories', icon: Trophy, count: 67 },
  ];

  const posts: Post[] = [
    {
      id: '1',
      author: {
        name: 'Sarah Mitchell',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        badge: 'Expert',
        role: 'Community Champion'
      },
      title: 'How I talk to my assistant to plan my entire week',
      excerpt: 'After 3 months with my AI companion, I\'ve learned the best ways to have natural conversations that save me 10+ hours per week. Here\'s what I say to my assistant...',
      category: 'Tips & Tricks',
      tags: ['automation', 'productivity', 'workflow'],
      stats: { views: 2847, likes: 156 },
      timeAgo: '2 hours ago',
      solved: false
    },
    {
      id: '2',
      author: {
        name: 'Marcus Chen',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100',
        badge: 'Pro',
        role: 'Professional Plan'
      },
      title: 'Morning briefing calls not working with international numbers?',
      excerpt: 'Has anyone successfully set up morning briefings and phone calls from their assistant with a non-US number? Need help configuring this...',
      category: 'Help & Support',
      tags: ['phone-reminders', 'technical', 'international'],
      stats: { views: 421, likes: 8 },
      timeAgo: '4 hours ago',
      solved: true
    },
    {
      id: '3',
      author: {
        name: 'Emily Rodriguez',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
        badge: 'Rising Star',
        role: 'Student Plan'
      },
      title: 'Just hit 500 completed tasks! My assistant journey',
      excerpt: 'Got my AI companion at the beginning of the semester and it\'s completely transformed how I manage coursework. Here\'s how I work with my assistant...',
      category: 'Success Stories',
      tags: ['milestone', 'student', 'productivity'],
      stats: { views: 1532, likes: 94 },
      timeAgo: '6 hours ago',
      solved: false
    },
    {
      id: '4',
      author: {
        name: 'David Park',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
        badge: 'Expert',
        role: 'Executive Plan'
      },
      title: 'Request: Tell my assistant to color-code events by priority',
      excerpt: 'Would love to be able to say "Color my high-priority events red" and have my assistant do it automatically. This would make visual scanning easier...',
      category: 'Feature Requests',
      tags: ['feature-request', 'calendar', 'ui'],
      stats: { views: 892, likes: 127 },
      timeAgo: '1 day ago',
      solved: false
    },
    {
      id: '5',
      author: {
        name: 'Lisa Anderson',
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
        badge: 'Pro',
        role: 'Team Plan'
      },
      title: 'Best practices for team calendar management',
      excerpt: 'Our team of 8 just switched to the Team Plan. Looking for advice on how to organize shared calendars and task delegation...',
      category: 'General Discussion',
      tags: ['team', 'collaboration', 'best-practices'],
      stats: { views: 634, likes: 42 },
      timeAgo: '1 day ago',
      solved: false
    },
    {
      id: '6',
      author: {
        name: 'James Wilson',
        avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100',
        badge: 'Veteran',
        role: 'Professional Plan'
      },
      title: 'Natural ways to talk to your assistant that actually work',
      excerpt: 'I\'ve been experimenting with different conversation styles with my AI companion. Here are 15 ways to talk naturally that get amazing results...',
      category: 'Tips & Tricks',
      tags: ['ai', 'prompts', 'advanced'],
      stats: { views: 3241, likes: 203 },
      timeAgo: '2 days ago',
      solved: false
    }
  ];

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' ||
                           post.category.toLowerCase().replace(/\s+&\s+/g, '-').replace(/\s+/g, '-') === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6">
              <Users className="h-10 w-10" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Community Hub
            </h1>
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Connect with others who use their AI companion to navigate daily life
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-1">15,000+</div>
                <div className="text-white/80">Members</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">1,247</div>
                <div className="text-white/80">Discussions</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-1">3,892</div>
                <div className="text-white/80">Solutions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {category.name}
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/20' : 'bg-slate-200'
                  }`}>
                    {category.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative bg-white rounded-2xl border-2 border-slate-200 shadow-lg">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400" />
              <input
                type="text"
                placeholder="Search discussions, tips, and solutions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-lg text-slate-900 border-0 focus:ring-2 focus:ring-teal-500 placeholder-slate-400 transition-all duration-200"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              <span className="text-sm text-slate-600">Popular searches:</span>
              {['Tips & tricks', 'Getting started', 'Team collaboration', 'Success stories'].map((term) => (
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

          {/* Posts */}
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Recent Discussions</h2>
            </div>

            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl">
                <MessageCircle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No posts found</h3>
                <p className="text-slate-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="block bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{post.author.name}</h3>
                            <span className="px-2 py-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                              {post.author.badge}
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">{post.author.role}</p>
                        </div>
                        <span className="text-sm text-slate-500 flex-shrink-0">{post.timeAgo}</span>
                      </div>

                      <div className="mb-3">
                        <div className="flex items-start gap-2 mb-2">
                          <h4 className="text-xl font-bold text-slate-900 hover:text-teal-600 transition-colors flex-1">
                            {post.title}
                          </h4>
                          {post.solved && (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0">
                              <CheckCircle className="h-3 w-3" />
                              Solved
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 leading-relaxed">{post.excerpt}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-200 text-sm text-slate-500">
                        <button className="flex items-center gap-2 hover:text-teal-600 transition-colors">
                          <Eye className="h-4 w-4" />
                          {post.stats.views.toLocaleString()} views
                        </button>
                        <button className="flex items-center gap-2 hover:text-teal-600 transition-colors">
                          <ThumbsUp className="h-4 w-4" />
                          {post.stats.likes} likes
                        </button>
                        <button className="flex items-center gap-2 hover:text-teal-600 transition-colors ml-auto">
                          <Share2 className="h-4 w-4" />
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Community Guidelines */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Community Guidelines
            </h2>
            <p className="text-xl text-slate-600">
              Help us maintain a positive and supportive environment
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-4 rounded-2xl w-fit mx-auto mb-4">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Be Respectful</h3>
              <p className="text-sm text-slate-600">Treat everyone with kindness and respect</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white p-4 rounded-2xl w-fit mx-auto mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Share Knowledge</h3>
              <p className="text-sm text-slate-600">Help others learn and grow</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-4 rounded-2xl w-fit mx-auto mb-4">
                <Target className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Stay On Topic</h3>
              <p className="text-sm text-slate-600">Keep discussions relevant and focused</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 rounded-2xl w-fit mx-auto mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Report Issues</h3>
              <p className="text-sm text-slate-600">Flag inappropriate content promptly</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;