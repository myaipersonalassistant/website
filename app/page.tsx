'use client'

import {
  Calendar,
  Brain,
  Smartphone,
  Zap,
  Shield,
  CheckCircle,
  MessageSquare,
  BarChart3,
  Users,
  Star,
  ArrowRight,
  Download,
  Clock,
  Target,
  Sparkles,
  TrendingUp,
  Globe,
  Lock,
  Rocket,
  Mail,
  Inbox,
  FileText,
  AlertCircle,
  Plus,
  Bell,
  CheckSquare,
  Layers,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '@/public/ai.json';
import firstAsset from '@/public/main.json';

const InternalCalendarSection = () => {
  const internalFeatures = [
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Assistant's Scheduling Tool",
      description: "Your assistant uses its built-in calendar (or Google Calendar sync) as a tool to manage your time - all through conversation.",
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: <CheckSquare className="h-6 w-6" />,
      title: "Proactive Task Management",
      description: "Based on your conversations, your assistant creates and prioritizes tasks for you. Just talk about what needs doing.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: <Bell className="h-6 w-6" />,
      title: "Context-Aware Alerts",
      description: "Your assistant knows when to alert you - through app notifications, email, or phone calls for important matters.",
      color: "from-orange-500 to-amber-600"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50 relative overflow-hidden hidden sm:block">
      {/* Background Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4 mr-2" />
            Assistant Tools, Not Standalone Apps
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            Tools Your Assistant <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Uses to Serve You</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Calendar, tasks, and reminders are tools your AI assistant uses - not features you manage yourself. Talk naturally to your assistant, and it handles everything using the right tools at the right time.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Features */}
          <div className="space-y-6">
            {internalFeatures.map((feature, index) => (
              <div key={index} className="flex items-start group">
                <div className={`bg-gradient-to-br ${feature.color} text-white p-3 rounded-xl mr-4 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-600 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}

            <div className="bg-white border border-teal-200 rounded-2xl p-6 mt-8 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg mr-3">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm font-bold text-teal-700">One Conversation, Many Tools</span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                You never interact with these tools directly. Instead, you talk to your assistant naturally, and it uses calendar, tasks, and reminders behind the scenes to serve you.
              </p>
            </div>
          </div>

          {/* Right Side - Visual Demo */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 font-bold text-slate-900">Assistant's View</span>
              </div>
              <button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-2 rounded-lg hover:scale-110 transition-transform duration-300 shadow-lg hover:shadow-teal-300">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Sample Events */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">Team Meeting</h4>
                  <span className="text-xs text-teal-700 bg-teal-100 px-2 py-1 rounded-full font-medium">Event</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Clock className="h-4 w-4 mr-1.5 text-teal-600" />
                  10:00 AM - 11:00 AM
                </div>
              </div>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">Complete Project Proposal</h4>
                  <span className="text-xs text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full font-medium">Task</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <CheckSquare className="h-4 w-4 mr-1.5 text-emerald-600" />
                  Due: Today 5:00 PM
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-all duration-300 group cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">Call Mom</h4>
                  <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full font-medium">Reminder</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Bell className="h-4 w-4 mr-1.5 text-orange-600" />
                  6:00 PM
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/download"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-300/50 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                Get Your AI Assistant
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white border border-teal-200 rounded-3xl p-8 inline-block shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg mr-3">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">
                Your Assistant, Your Way
              </h3>
            </div>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Don't think of MAI-PA as a calendar app or task manager. Think of it as your AI companion who uses these tools to help you. Just talk - your assistant does the rest.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default function HomePage() {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const features = [
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Your Conversational Companion",
      description: "Talk naturally with your AI assistant through voice or text. It understands context, remembers what you discussed, and proactively suggests what you need.",
      color: "from-teal-500 to-cyan-600"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Proactive Intelligence",
      description: "Your assistant anticipates your needs, suggests actions before you ask, learns your patterns, and adapts to how you work and communicate.",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Morning Briefings",
      description: "Your assistant calls you each morning with a personalized briefing covering today's schedule, weather, priorities, and important updates.",
      color: "from-cyan-600 to-teal-600"
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Assistant's Scheduling Tool",
      description: "Your AI uses its built-in calendar (or Google Calendar sync) to manage your time, create events, and prevent conflicts - all through conversation.",
      color: "from-teal-600 to-emerald-600"
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Email Intelligence Processor",
      description: "Your assistant monitors emails and extracts flights, hotels, meetings, and deadlines - then proactively suggests adding them to your calendar.",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "Task Management for You",
      description: "Your assistant creates, prioritizes, and tracks tasks based on your conversations. It reminds you at the right time through app, email, or phone calls.",
      color: "from-emerald-500 to-teal-600"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Marketing Executive",
      content: "I don't use an app - I talk to my assistant. MAI-PA calls me every morning with my briefing, manages my schedule through conversation, and feels like having a real PA.",
      rating: 5,
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      name: "Michael Chen",
      role: "Software Engineer",
      content: "This isn't a productivity tool with AI - it's an AI companion with productivity tools. I just talk naturally about what I need, and my assistant handles everything.",
      rating: 5,
      image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200"
    },
    {
      name: "Emma Rodriguez",
      role: "Project Manager",
      content: "MAI-PA remembers our conversations and anticipates what I need. It's proactive, context-aware, and truly feels like having an always-available assistant by my side.",
      rating: 5,
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200"
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users", icon: <Users className="h-6 w-6" /> },
    { number: "1M+", label: "Events Managed", icon: <Calendar className="h-6 w-6" /> },
    { number: "99.9%", label: "Uptime", icon: <TrendingUp className="h-6 w-6" /> },
    { number: "4.9", label: "App Store Rating", icon: <Star className="h-6 w-6 fill-current" /> }
  ];


  return (
    <>
      <div className="min-h-screen bg-white" suppressHydrationWarning>
      {/* Hero Section */}
      <section id='action' className="relative bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 pt-10 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            {/* Left Content */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 border border-teal-200 rounded-full text-sm font-medium mb-6 text-teal-700 mx-auto lg:mx-0">
                <Sparkles className="h-4 w-4 mr-2" />
                AI-Powered Personal Assistant
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Your Personal<br />
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">AI Assistant</span>
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed">
                MAI-PA is your always-available AI companion that you talk to naturally, just like a real personal assistant. It happens to have powerful tools - calendar, email intelligence, task management - that it uses to help you navigate daily life.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/download"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-teal-300/50 transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  <Download className="h-5 w-5 mr-2 group-hover:animate-bounce" />
                  Download App
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold text-lg hover:border-teal-300 hover:bg-teal-50 transition-all duration-300">
                  <Rocket className="h-5 w-5 mr-2" />
                  Watch Demo
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6">
                <div className="flex items-center text-sm text-slate-600">
                  <Shield className="h-5 w-5 mr-2 text-teal-600" />
                  <span className="font-medium">Enterprise-Grade Security</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-teal-600" />
                  <span className="font-medium">GDPR Compliant</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <Globe className="h-5 w-5 mr-2 text-teal-600" />
                  <span className="font-medium">50K+ Active Users</span>
                </div>
              </div>
            </div>

            {/* Right Content - Lottie Animation Placeholder */}
            <div className="relative order-1 lg:order-2">
              <div className="relative">
                
                {/* Lottie Animation */}
                <div className="relative aspect-square flex items-center justify-center overflow-hidden">
                  <Lottie animationData={firstAsset} loop={true} className="w-full h-full drop-shadow-2xl" />
                </div>
                
                {/* Floating Badge - Glassmorphism */}
                <div className="absolute -top-2 -right-6 bg-white px-6 py-4 rounded-2xl shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-xl">+99%</p>
                      <p className="text-slate-600 text-xs">Productivity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 left-10 opacity-10">
          <Brain className="h-24 w-24 text-teal-600 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10">
          <Zap className="h-20 w-20 text-cyan-500 animate-bounce" />
        </div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="flex items-center justify-center mb-4">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-teal-200">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-overview" className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              The Core Experience
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              An AI Companion <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">With Powerful Tools</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              MAI-PA is not a productivity app with AI features - it's an AI assistant that uses productivity tools to serve you. Talk naturally, and your assistant handles the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100 relative overflow-hidden text-center"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className={`relative bg-gradient-to-br ${feature.color} text-white p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg mx-auto`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-600 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>
                <div className="flex items-center text-teal-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center justify-center">
                  Learn more
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Demo Video Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium mb-6">
              <Smartphone className="h-4 w-4 mr-2" />
              See It In Action
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Experience <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">MAI-PA</span> In Action
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Watch how your personal AI assistant seamlessly manages conversations, schedules, and tasks—all in one intelligent interface.
            </p>
          </div>

          {/* Single Large Video Container */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-3xl p-8 shadow-2xl border border-teal-200/50 backdrop-blur-sm">
              {/* Video Container with Phone Mockup Style */}
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
                {/* Decorative Top Bar (Simulating Phone Status Bar) */}
                <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-950/50 to-transparent z-10 flex items-center justify-between px-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/70 text-xs font-medium">MAI-PA Active</span>
                  </div>
                  <div className="text-white/70 text-xs">9:41 AM</div>
                </div>

                {/* Main Video */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-white">
                  <video 
                    className="w-full h-full object-cover"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Crect fill='%23f0fdfa' width='1920' height='1080'/%3E%3C/svg%3E"
                  >
                    <source src="/maipa-demo.mp4" type="video/mp4" />
                    {/* Fallback content */}
                    <div className="w-full h-full bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 flex flex-col items-center justify-center p-12">
                      <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-8 rounded-3xl shadow-2xl mb-6 animate-pulse">
                        <Brain className="h-32 w-32 text-white" />
                      </div>
                      <p className="text-slate-600 text-lg font-medium">Loading Demo Video...</p>
                    </div>
                  </video>
                  
                  {/* Play/Pause Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-6 shadow-2xl">
                      <div className="w-12 h-12 border-l-4 border-t-4 border-teal-600 rounded-full animate-spin"></div>
                    </div>
                  </div>
                </div>

                {/* Decorative Bottom Elements */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                  <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse animation-delay-500"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse animation-delay-1000"></div>
                </div>
              </div>

              {/* Floating Feature Badges */}
              <div className="absolute -top-4 -left-4 bg-gradient-to-br from-teal-500 to-cyan-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-bounce">
                <MessageSquare className="h-5 w-5" />
                <span className="font-bold text-sm">AI Chat</span>
              </div>

              <div className="absolute -top-4 -right-4 bg-gradient-to-br from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <span className="font-bold text-sm">Smart Calendar</span>
              </div>

              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-pulse">
                <CheckSquare className="h-5 w-5" />
                <span className="font-bold text-sm">Task Management</span>
              </div>
            </div>

            {/* Feature Pills Below Video */}
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Natural Conversations</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Intelligent Scheduling</span>
              </div>
              <div className="bg-white px-6 py-3 rounded-full shadow-lg border border-slate-200 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Proactive Tasks</span>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-slate-600 mb-6 text-lg">Full app demonstration showing real interactions</p>
            <Link
              href="/download"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl hover:shadow-teal-300/50 transition-all duration-300 transform hover:-translate-y-1 group"
            >
              <Download className="h-5 w-5 mr-2" />
              Download MAI-PA Now
              <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              <Rocket className="h-4 w-4 mr-2" />
              Simple Process
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Get started in <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">three easy steps</span>
            </h2>
            <p className="text-xl text-slate-600">Transform your productivity in minutes, not hours</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-16 left-0 right-0 h-1 bg-gradient-to-r from-teal-200 via-cyan-200 to-teal-200"></div>

            <div className="relative text-center">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-300/50 relative z-10">
                <span className="text-3xl font-bold">1</span>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Meet Your Assistant</h3>
                <p className="text-slate-600">Download MAI-PA and meet your always-available AI companion. Your digital personal assistant is ready in seconds.</p>
              </div>
            </div>

            <div className="relative text-center">
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-300/50 relative z-10">
                <span className="text-3xl font-bold">2</span>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Give It Access to Help You</h3>
                <p className="text-slate-600">Optionally connect Google Calendar and email so your assistant can use these tools to manage everything for you.</p>
              </div>
            </div>

            <div className="relative text-center">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-300/50 relative z-10">
                <span className="text-3xl font-bold">3</span>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-3">Start Talking</h3>
                <p className="text-slate-600">Just talk naturally to your assistant through voice or text. No commands to learn - it understands you like a real person would.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internal Calendar Section */}
      <InternalCalendarSection />

      {/* AI Assistant Section */}
      <section id="ai-assistant" className="py-20 bg-white scroll-mt-24 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium mb-6">
                <Brain className="h-4 w-4" />
                AI Assistant
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Your Intelligent
                <span className="block bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                  Conversational Companion
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                MAI-PA isn't just another chatbot—it's your always-available personal assistant that understands context,
                remembers your preferences, and anticipates your needs. Talk naturally through voice or text, just like you
                would with a real human assistant.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
                  <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Natural Conversations</h3>
                    <p className="text-sm text-gray-600">Speak or type naturally. No commands to memorize, no rigid syntax—just talk like you're chatting with a friend.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Context & Memory</h3>
                    <p className="text-sm text-gray-600">Your assistant remembers past conversations and learns your patterns, making every interaction more personalized.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Proactive Assistance</h3>
                    <p className="text-sm text-gray-600">Get suggestions and reminders before you even ask. Your assistant anticipates what you need and when you need it.</p>
                  </div>
                </div>
              </div>

              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Try Your AI Assistant
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-start gap-3 animate-fade-in">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4">
                        <p className="text-sm text-gray-700">Hey MAI-PA, what's on my schedule today?</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">You · 9:30 AM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 animate-fade-in animation-delay-500">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl rounded-tl-none p-4">
                        <p className="text-sm">Good morning! You have 3 meetings today. Your first one is at 10:30 AM with the marketing team. Should I brief you on the agenda?</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">MAI-PA · 9:31 AM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 animate-fade-in animation-delay-1000">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4">
                        <p className="text-sm text-gray-700">Yes, please!</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">You · 9:31 AM</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Calendar Section */}
      <section id="smart-calendar" className="py-20 bg-gradient-to-br from-teal-50 to-emerald-50 scroll-mt-24 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-white rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">February 2025</h3>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-teal-100 transition-colors">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </button>
                    <button className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-teal-100 transition-colors">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {[...Array(35)].map((_, i) => {
                    const date = i - 2;
                    const isToday = date === 15;
                    const hasEvent = [10, 15, 18, 22].includes(date);
                    return (
                      <div
                        key={i}
                        className={`aspect-square flex items-center justify-center rounded-lg text-sm relative ${
                          date < 1 || date > 28
                            ? 'text-gray-300'
                            : isToday
                            ? 'bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold shadow-lg'
                            : hasEvent
                            ? 'bg-teal-100 text-teal-900 font-semibold'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {date > 0 && date <= 28 ? date : ''}
                        {hasEvent && !isToday && (
                          <div className="absolute bottom-1 w-1 h-1 bg-teal-500 rounded-full"></div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Today's Schedule</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-lg">
                      <div className="w-2 h-12 bg-teal-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Team Meeting</p>
                        <p className="text-xs text-gray-600">10:30 AM - 11:30 AM</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-12 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Client Call</p>
                        <p className="text-xs text-gray-600">2:00 PM - 3:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
                <Calendar className="h-4 w-4" />
                Smart Calendar
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Let Your Assistant
                <span className="block bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Manage Your Time
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Your AI assistant uses its built-in calendar (or syncs with Google Calendar) to intelligently manage
                your schedule. Just tell it what you need, and it handles all the calendar work for you.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Conversational Scheduling</h3>
                    <p className="text-gray-600">Simply say "Schedule a meeting with John next Tuesday at 2pm" and your assistant handles the rest.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Smart Conflict Detection</h3>
                    <p className="text-gray-600">Your assistant automatically detects conflicts and suggests alternative times that work for everyone.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Proactive Reminders</h3>
                    <p className="text-gray-600">Get timely reminders via app notifications, email, or even voice calls before important events.</p>
                  </div>
                </div>
              </div>

              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Start Managing Your Calendar
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Email Intelligence Section */}
      <section id="email-intelligence" className="py-20 bg-white scroll-mt-24 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium mb-6">
                <Mail className="h-4 w-4" />
                Email Intelligence
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Never Miss Important
                <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Email Details Again
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Your AI assistant continuously monitors your inbox and intelligently extracts important information
                like flight bookings, hotel reservations, meeting invitations, and deadlines—then proactively suggests
                adding them to your calendar.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Inbox className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Smart Email Parsing</h3>
                    <p className="text-sm text-gray-600">Automatically detects flights, hotels, events, meetings, and deadlines from your emails.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Proactive Suggestions</h3>
                    <p className="text-sm text-gray-600">Your assistant suggests adding important items to your calendar before you forget about them.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-100">
                  <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Contextual Intelligence</h3>
                    <p className="text-sm text-gray-600">Understands context and relationships between emails to provide comprehensive event details.</p>
                  </div>
                </div>
              </div>

              <Link
                href="/download"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Enable Email Intelligence
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-100 to-red-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Inbox className="h-5 w-5 text-orange-600" />
                      Recent Emails
                    </h3>
                    <div className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                      3 Actions Found
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Flight Confirmation</p>
                          <p className="text-xs text-gray-600">American Airlines</p>
                        </div>
                        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">SFO → JFK · Feb 25, 2025 · 6:30 AM</p>
                      <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
                        + Add to Calendar
                      </button>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-l-4 border-purple-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Hotel Reservation</p>
                          <p className="text-xs text-gray-600">Hilton Hotels</p>
                        </div>
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">New York Hilton · Feb 25-27, 2025</p>
                      <button className="text-xs font-medium text-purple-600 hover:text-purple-700">
                        + Add to Calendar
                      </button>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-l-4 border-green-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">Meeting Invitation</p>
                          <p className="text-xs text-gray-600">Sarah from Marketing</p>
                        </div>
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">Q1 Review · Feb 26, 2025 · 2:00 PM</p>
                      <button className="text-xs font-medium text-green-600 hover:text-green-700">
                        + Add to Calendar
                      </button>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -left-4 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-semibold">3 New Items</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
            {/* Left Side - Lottie Animation */}
            <div className="order-1 lg:order-1 relative">
              <div className="relative backdrop-blur-sm bg-white/10 rounded-3xl p-8 shadow-2xl border border-white/20">
                {/* Animated gradient orbs in background */}
                <div className="absolute inset-0 overflow-hidden rounded-3xl">
                  <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-cyan-300/40 to-blue-400/40 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-br from-teal-300/40 to-cyan-400/40 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
                </div>
                
                {/* Lottie Animation */}
                <div className="relative aspect-square flex items-center justify-center overflow-hidden">
                  <Lottie animationData={animationData} loop={true} className="w-full h-full drop-shadow-2xl" />
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-6 -left-6 bg-gradient-to-br from-teal-500 to-cyan-600 p-4 rounded-2xl shadow-xl animate-bounce">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-xl animate-pulse">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="order-2 lg:order-2 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium mb-6 mx-auto lg:mx-0">
                <Brain className="h-4 w-4 mr-2" />
                Powered by DeepSeek AI
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                More Than an App - <br/>
                <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">It's Your Assistant</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Think of MAI-PA as having a highly capable human assistant who's always available. The assistant is the product. Calendar, email, and task management are simply tools your assistant uses to help you navigate daily life.
              </p>

              <div className="space-y-6">
                <div className="flex items-start group">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2 rounded-xl mr-4 mt-1 group-hover:scale-110 transition-transform flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">Voice-First Experience</h4>
                    <p className="text-slate-600">Talk naturally through voice or text - no rigid commands. Your assistant calls you with morning briefings and important updates.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-2 rounded-xl mr-4 mt-1 group-hover:scale-110 transition-transform flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-cyan-600 transition-colors">Proactive & Context-Aware</h4>
                    <p className="text-slate-600">Your assistant remembers conversations, anticipates needs, and suggests actions before you ask. It learns your patterns over time.</p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl mr-4 mt-1 group-hover:scale-110 transition-transform flex-shrink-0">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">Uses Tools to Serve You</h4>
                    <p className="text-slate-600">Calendar, email intelligence, tasks, and reminders are tools your assistant uses to manage your life - all through conversation.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/download"
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-teal-300/50 transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  Experience AI Power
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4 mr-2" />
              User Testimonials
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Loved by <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">thousands</span> worldwide
            </h2>
            <p className="text-xl text-slate-600">See what our users have to say about MAI-PA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-slate-100 group relative">
                {/* Profile Image */}
                <div className="flex items-center mb-6">
                  <Image 
                    src={testimonial.image} 
                    alt={testimonial.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover border-4 border-teal-100 group-hover:border-teal-200 transition-all"
                  />
                  <div className="ml-4">
                    <div className="font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>

                {/* Stars */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-amber-400 fill-current group-hover:scale-110 transition-transform duration-200" style={{ transitionDelay: `${i * 50}ms` }} />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-700 leading-relaxed mb-4 italic">"{testimonial.content}"</p>

                {/* Decorative Quote Mark */}
                <div className="absolute top-6 right-6 text-6xl text-teal-100 font-serif opacity-50">"</div>

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-teal-200 to-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-cyan-200 to-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
      </section>
    </div>
    </>
  );
}