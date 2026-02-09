'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Mail,
  Bell,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Brain,
  Inbox,
  ListTodo,
  Users,
  Target,
  Zap,
  Activity,
  ChevronRight,
  Plus,
  RefreshCw,
  MapPin,
  Plane,
  Sun,
  Cloud,
  Coffee,
  Briefcase,
  Home as HomeIcon,
  BarChart3,
  CheckSquare,
  Eye,
  Filter,
  MoreVertical,
  Phone,
  Video,
  FileText,
  Star,
  Lightbulb,
  Timer,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface DashboardStats {
  upcomingEvents: number;
  pendingTasks: number;
  unprocessedEmails: number;
  unreadNotifications: number;
}

interface CalendarActivity {
  id: string;
  title: string;
  start_date: string;
  end_date?: string;
  category: string;
  location?: string;
  color: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
}

interface ExtractedTodo {
  id: string;
  title: string;
  description: string;
  due_date?: string;
  priority: string;
  status: string;
}

interface AssistantInsight {
  id: string;
  type: 'suggestion' | 'reminder' | 'insight' | 'achievement';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  icon: any;
  color: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingEvents: 0,
    pendingTasks: 0,
    unprocessedEmails: 0,
    unreadNotifications: 0
  });
  const [upcomingActivities, setUpcomingActivities] = useState<CalendarActivity[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [pendingTodos, setPendingTodos] = useState<ExtractedTodo[]>([]);
  const [assistantInsights, setAssistantInsights] = useState<AssistantInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?view=login');
      return;
    }

    if (user) {
      fetchUserData();
      fetchDashboardData();
    }
  }, [user, authLoading, router]);

  const fetchUserData = async () => {
    if (!user) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.fullName || userData.onboardingData?.userName || user.displayName || 'User');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual Firebase queries later
      const mockStats: DashboardStats = {
        upcomingEvents: 5,
        pendingTasks: 8,
        unprocessedEmails: 12,
        unreadNotifications: 3
      };

      const mockActivities: CalendarActivity[] = [
        {
          id: '1',
          title: 'Team Standup',
          start_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 2.5 * 60 * 60 * 1000).toISOString(),
          category: 'meeting',
          location: 'Conference Room A',
          color: '#3b82f6'
        },
        {
          id: '2',
          title: 'Client Presentation',
          start_date: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          category: 'meeting',
          location: 'Virtual',
          color: '#8b5cf6'
        },
        {
          id: '3',
          title: 'Lunch with Sarah',
          start_date: new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          category: 'personal',
          location: 'Downtown Café',
          color: '#10b981'
        }
      ];

      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Meeting in 2 hours',
          message: 'Team Standup is scheduled for 10:00 AM in Conference Room A',
          type: 'reminder',
          category: 'meeting',
          priority: 'medium',
          is_read: false,
          created_at: new Date().toISOString(),
          action_url: '/calendar'
        },
        {
          id: '2',
          title: 'Flight booking detected',
          message: 'Your assistant found a flight confirmation in your emails',
          type: 'info',
          category: 'email',
          priority: 'high',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          action_url: '/email-insights'
        },
        {
          id: '3',
          title: 'Daily briefing ready',
          message: 'Your morning briefing is available. Would you like to hear it?',
          type: 'activity',
          category: 'briefing',
          priority: 'low',
          is_read: false,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          action_url: '/assistant'
        }
      ];

      const mockTodos: ExtractedTodo[] = [
        {
          id: '1',
          title: 'Review Q1 marketing proposal',
          description: 'Review and provide feedback on the Q1 marketing proposal',
          due_date: new Date(Date.now() + 86400000).toISOString(),
          priority: 'high',
          status: 'pending'
        },
        {
          id: '2',
          title: 'Prepare slides for Friday presentation',
          description: 'Create presentation slides for the Friday client meeting',
          due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
          priority: 'high',
          status: 'pending'
        },
        {
          id: '3',
          title: 'Follow up with John about budget',
          description: 'Send follow-up email regarding the Q2 budget discussion',
          priority: 'medium',
          status: 'pending'
        }
      ];

      const mockInsights: AssistantInsight[] = [
        {
          id: '1',
          type: 'suggestion',
          title: 'Schedule Focus Time',
          message: 'You have 3 hours free tomorrow morning. Perfect for deep work on your presentation.',
          action: 'Block Time',
          actionUrl: '/calendar',
          icon: Lightbulb,
          color: 'from-amber-500 to-yellow-500'
        },
        {
          id: '2',
          type: 'reminder',
          title: 'NYC Trip in 3 Days',
          message: 'Your flight to New York is coming up. I\'ve prepared a travel checklist for you.',
          action: 'View Checklist',
          actionUrl: '/assistant',
          icon: Plane,
          color: 'from-sky-500 to-blue-600'
        },
        {
          id: '3',
          type: 'achievement',
          title: 'Productivity Streak!',
          message: 'You\'ve completed 12 tasks this week. Keep up the great work!',
          icon: Star,
          color: 'from-purple-500 to-pink-500'
        }
      ];

      setStats(mockStats);
      setUpcomingActivities(mockActivities);
      setRecentNotifications(mockNotifications);
      setPendingTodos(mockTodos);
      setAssistantInsights(mockInsights);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatActivityDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder':
        return Clock;
      case 'warning':
        return AlertCircle;
      case 'success':
        return CheckCircle2;
      case 'activity':
        return Activity;
      default:
        return Bell;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Hero Section with Greeting */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg flex-shrink-0">
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 truncate">
                    {getGreeting()}, {userName.split(' ')[0] || 'there'}!
                  </h1>
                </div>
                <p className="text-sm sm:text-base lg:text-lg text-slate-600">
                  <span className="block sm:inline">{formatDate(currentTime)}</span>
                  <span className="hidden sm:inline"> • </span>
                  <span className="block sm:inline">{formatTime(currentTime)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <button
                  onClick={fetchDashboardData}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-lg transition-all active:scale-95"
                >
                  <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:inline">Refresh</span>
                </button>
                <Link
                  href="/assistant"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg shadow-teal-200 active:scale-95 text-xs sm:text-sm font-semibold"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Ask Assistant</span>
                  <span className="sm:hidden">Ask</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Productivity Metrics */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Productivity Overview</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Productivity Score Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-right min-w-0 flex-1 ml-3">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">85%</h3>
                    <p className="text-xs text-slate-500">Score</p>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Productivity Score</h4>
                <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2.5 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: '85%' }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-1">Based on completed tasks and goals</p>
              </div>

              {/* Weekly Goals Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-right min-w-0 flex-1 ml-3">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">12/15</h3>
                    <p className="text-xs text-slate-500">Goals</p>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Weekly Goals</h4>
                <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: '80%' }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-1">3 goals remaining this week</p>
              </div>

              {/* Tasks Completed Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all group sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-right min-w-0 flex-1 ml-3">
                    <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 sm:mb-1">45</h3>
                    <p className="text-xs text-slate-500">Tasks</p>
                  </div>
                </div>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3">Tasks Completed</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: '90%' }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 flex-shrink-0">90%</span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-1">This month • 5 remaining</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Link
              href="/calendar"
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.upcomingEvents}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1 line-clamp-1">Upcoming Events</h3>
              <p className="text-xs text-slate-500 hidden sm:block">In your calendar</p>
            </Link>

            <Link
              href="/email-insights"
              className="bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  <Inbox className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-teal-600">{stats.unprocessedEmails}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1 line-clamp-1">Email Insights</h3>
              <p className="text-xs text-slate-500 hidden sm:block">Awaiting review</p>
            </Link>

            <Link
              href="/assistant"
              className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  <ListTodo className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.pendingTasks}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1 line-clamp-1">Pending Tasks</h3>
              <p className="text-xs text-slate-500 hidden sm:block">Need your attention</p>
            </Link>

            <Link
              href="/notifications"
              className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.unreadNotifications}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-slate-700 mb-0.5 sm:mb-1 line-clamp-1">Notifications</h3>
              <p className="text-xs text-slate-500 hidden sm:block">Unread messages</p>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Left Column - Upcoming Schedule & Tasks */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Upcoming Schedule */}
              <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex-shrink-0">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Upcoming Schedule</h2>
                  </div>
                  <Link
                    href="/calendar"
                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {upcomingActivities.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm sm:text-base text-slate-500">No upcoming events</p>
                      <Link
                        href="/calendar"
                        className="inline-flex items-center gap-2 mt-4 text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-semibold"
                      >
                        Add an Event
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Link>
                    </div>
                  ) : (
                    upcomingActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-teal-50 border border-slate-200 rounded-lg sm:rounded-xl hover:shadow-lg transition-all group cursor-pointer"
                      >
                        <div
                          className="w-1.5 sm:w-2 h-full rounded-full flex-shrink-0 min-h-[60px]"
                          style={{ backgroundColor: activity.color }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">
                                {activity.title}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1.5 sm:gap-3 text-xs sm:text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                  <span className="line-clamp-1">{formatActivityDate(activity.start_date)}</span>
                                </span>
                                {activity.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                    <span className="line-clamp-1">{activity.location}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="px-2 sm:px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex-shrink-0 self-start sm:self-auto">
                              {activity.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex-shrink-0">
                      <ListTodo className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Pending Tasks</h2>
                  </div>
                  <Link
                    href="/assistant"
                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {pendingTodos.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm sm:text-base text-slate-500">No pending tasks</p>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    pendingTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-start gap-2 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-200 rounded-lg sm:rounded-xl hover:shadow-lg transition-all group cursor-pointer"
                      >
                        <button className="mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 border-slate-300 hover:border-teal-500 transition-colors flex-shrink-0"></button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-1 line-clamp-1">{todo.title}</h3>
                              {todo.description && (
                                <p className="text-xs sm:text-sm text-slate-600 mb-2 line-clamp-2">{todo.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                {todo.due_date && (
                                  <span className="text-xs text-slate-500">
                                    Due: {new Date(todo.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-2 sm:px-3 py-1 border rounded-lg text-xs font-medium flex-shrink-0 self-start sm:self-auto ${getPriorityColor(todo.priority)}`}>
                              {todo.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - AI Insights & Notifications */}
            <div className="space-y-4 sm:space-y-6">
              {/* AI Assistant Insights */}
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0">
                    <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold">AI Insights</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {assistantInsights.map((insight) => {
                    const Icon = insight.icon;
                    return (
                      <div
                        key={insight.id}
                        className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 border border-white/20 hover:bg-white/20 transition-all"
                      >
                        <div className="flex items-start gap-2 sm:gap-3">
                          <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${insight.color} rounded-lg flex-shrink-0`}>
                            <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-1">{insight.title}</h4>
                            <p className="text-xs text-white/90 mb-2 line-clamp-2">{insight.message}</p>
                            {insight.action && insight.actionUrl && (
                              <Link
                                href={insight.actionUrl}
                                className="inline-flex items-center gap-1 text-xs font-medium text-white hover:text-teal-100 transition-colors"
                              >
                                {insight.action}
                                <ArrowRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Link
                  href="/assistant"
                  className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm font-semibold backdrop-blur-sm border border-white/30 active:scale-95"
                >
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Chat with Assistant</span>
                  <span className="sm:hidden">Chat</span>
                </Link>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex-shrink-0">
                      <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">Notifications</h2>
                  </div>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm sm:text-base text-slate-500">No new notifications</p>
                    </div>
                  ) : (
                    recentNotifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg sm:rounded-xl hover:shadow-lg transition-all group cursor-pointer ${
                            !notification.is_read
                              ? 'bg-gradient-to-r from-slate-50 to-orange-50 border border-orange-200'
                              : 'bg-slate-50 border border-slate-200'
                          }`}
                        >
                          <div className="p-1.5 sm:p-2 bg-white rounded-lg border border-slate-200 flex-shrink-0">
                            <IconComponent className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-xs sm:text-sm mb-1 line-clamp-1">
                              {notification.title}
                            </h3>
                            <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-xs text-slate-400">
                              {new Date(notification.created_at).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}
                            </span>
                          </div>
                          {!notification.is_read && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1.5 sm:mt-2"></div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

