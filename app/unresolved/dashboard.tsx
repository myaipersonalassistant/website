import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  BarChart3,
  ListTodo,
  Users,
  Target,
  Zap,
  Activity,
  Calendar as CalendarIcon,
  Inbox,
  Star,
  Plus,
  Search,
  Settings,
  ChevronRight,
  RefreshCw,
  Filter,
  MoreVertical,
  Eye,
  Archive,
  Trash2,
  MapPin,
  Video,
  Phone
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import Footer from '../components/Footer';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface DashboardStats {
  unreadNotifications: number;
  upcomingEvents: number;
  pendingTodos: number;
  unprocessedEmails: number;
}

interface CalendarActivity {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    unreadNotifications: 0,
    upcomingEvents: 0,
    pendingTodos: 0,
    unprocessedEmails: 0
  });
  const [upcomingActivities, setUpcomingActivities] = useState<CalendarActivity[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [pendingTodos, setPendingTodos] = useState<ExtractedTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);

//       const userId = '00000000-0000-0000-0000-000000000000';

//       const [notificationsRes, eventsRes, todosRes, emailsRes, activitiesRes] = await Promise.all([
//         supabase
//           .from('notifications')
//           .select('*')
//           .eq('user_id', userId)
//           .eq('is_read', false)
//           .eq('is_archived', false)
//           .order('created_at', { ascending: false }),
//         supabase
//           .from('calendar_activities')
//           .select('*')
//           .eq('user_id', userId)
//           .gte('start_date', new Date().toISOString())
//           .order('start_date', { ascending: true })
//           .limit(5),
//         supabase
//           .from('extracted_todos')
//           .select('*')
//           .eq('user_id', userId)
//           .eq('status', 'pending')
//           .order('created_at', { ascending: false })
//           .limit(5),
//         supabase
//           .from('emails')
//           .select('*')
//           .eq('user_id', userId)
//           .eq('processed', false),
//         supabase
//           .from('calendar_activities')
//           .select('*')
//           .eq('user_id', userId)
//           .gte('start_date', new Date().toISOString())
//           .order('start_date', { ascending: true })
//           .limit(3)
//       ]);

//       setStats({
//         unreadNotifications: notificationsRes.data?.length || 0,
//         upcomingEvents: eventsRes.data?.length || 0,
//         pendingTodos: todosRes.data?.length || 0,
//         unprocessedEmails: emailsRes.data?.length || 0
//       });

//       setRecentNotifications(notificationsRes.data?.slice(0, 5) || []);
//       setUpcomingActivities(activitiesRes.data || []);
//       setPendingTodos(todosRes.data || []);
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

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
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
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

  const quickActions = [
    {
      title: 'AI Assistant',
      description: 'Chat with your AI assistant',
      icon: MessageSquare,
      href: '/assistant',
      color: 'from-purple-500 to-pink-500',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Email Insights',
      description: 'View AI-powered email analysis',
      icon: Mail,
      href: '/email-insights',
      color: 'from-blue-500 to-cyan-500',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Calendar',
      description: 'Manage your schedule',
      icon: Calendar,
      href: '/calendar',
      color: 'from-teal-500 to-green-500',
      iconColor: 'text-teal-600'
    },
    {
      title: 'Notifications',
      description: 'Check all notifications',
      icon: Bell,
      href: '/notifications',
      color: 'from-orange-500 to-red-500',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      <Header />

      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                  {getGreeting()}, User
                </h1>
                <p className="text-lg text-slate-600">
                  {formatDate(currentTime)} • {formatTime(currentTime)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                //   onClick={fetchDashboardData}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-200 rounded-xl hover:border-teal-300 hover:shadow-lg transition-all"
                >
                  <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-sm font-medium text-slate-700">Refresh</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg shadow-teal-200">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-semibold">New Task</span>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
                  <Inbox className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-blue-600">{stats.unprocessedEmails}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Unprocessed Emails</h3>
              <p className="text-xs text-slate-500">Awaiting AI analysis</p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-green-500 rounded-xl">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-teal-600">{stats.upcomingEvents}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Upcoming Events</h3>
              <p className="text-xs text-slate-500">In your calendar</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                  <ListTodo className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-purple-600">{stats.pendingTodos}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Pending Tasks</h3>
              <p className="text-xs text-slate-500">Need your attention</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <span className="text-3xl font-bold text-orange-600">{stats.unreadNotifications}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-700 mb-1">Notifications</h3>
              <p className="text-xs text-slate-500">Unread messages</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg">
                      <CalendarIcon className="h-5 w-5 text-teal-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Upcoming Schedule</h2>
                  </div>
                  <Link
                    href="/calendar"
                    className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {upcomingActivities.length === 0 ? (
                    <div className="text-center py-12">
                      <CalendarIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No upcoming events</p>
                      <Link
                        href="/calendar"
                        className="inline-flex items-center gap-2 mt-4 text-sm text-teal-600 hover:text-teal-700 font-semibold"
                      >
                        Add an Event
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    upcomingActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-teal-50 border border-slate-200 rounded-xl hover:shadow-lg transition-all group"
                      >
                        <div
                          className="w-2 h-full rounded-full"
                          style={{ backgroundColor: activity.color }}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">{activity.title}</h3>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {formatActivityDate(activity.start_date)}
                                </span>
                                {activity.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {activity.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                              {activity.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                      <ListTodo className="h-5 w-5 text-purple-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Pending Tasks</h2>
                  </div>
                  <Link
                    href="/email-insights"
                    className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {pendingTodos.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No pending tasks</p>
                      <p className="text-sm text-slate-400 mt-1">You're all caught up!</p>
                    </div>
                  ) : (
                    pendingTodos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-purple-50 border border-slate-200 rounded-xl hover:shadow-lg transition-all group"
                      >
                        <button className="mt-1 w-5 h-5 rounded border-2 border-slate-300 hover:border-teal-500 transition-colors"></button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900 mb-1">{todo.title}</h3>
                              {todo.description && (
                                <p className="text-sm text-slate-600 mb-2">{todo.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                {todo.due_date && (
                                  <span className="text-xs text-slate-500">
                                    Due: {new Date(todo.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-3 py-1 border rounded-lg text-xs font-medium ${getPriorityColor(todo.priority)}`}>
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

            <div className="space-y-6">
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                      <Bell className="h-5 w-5 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
                  </div>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No new notifications</p>
                    </div>
                  ) : (
                    recentNotifications.map((notification) => {
                      const IconComponent = getNotificationIcon(notification.type);
                      return (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 p-4 bg-gradient-to-r from-slate-50 to-orange-50 border border-slate-200 rounded-xl hover:shadow-lg transition-all group cursor-pointer"
                        >
                          <div className="p-2 bg-white rounded-lg border border-slate-200">
                            <IconComponent className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 text-sm mb-1">
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
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">Quick Actions</h3>
                </div>
                <div className="space-y-2">
                  {quickActions.map((action, idx) => (
                    <Link
                      key={idx}
                      href={action.href}
                      className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all group"
                    >
                      <action.icon className="h-5 w-5 text-white" />
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{action.title}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 rounded-2xl p-8 text-white">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-teal-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">85%</h3>
                <p className="text-slate-300">Productivity Score</p>
              </div>
              <div className="text-center">
                <Target className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">12/15</h3>
                <p className="text-slate-300">Weekly Goals</p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">45</h3>
                <p className="text-slate-300">Tasks Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* <Footer isAuthenticated={true} /> */}
    </div>
  );
}