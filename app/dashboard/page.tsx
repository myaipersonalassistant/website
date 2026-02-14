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
import { getDb } from '@/lib/firebase';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';
import DashboardSidebar from '@/app/components/DashboardSidebar';

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
  const [productivityMetrics, setProductivityMetrics] = useState({
    productivityScore: 0,
    completedTasksThisMonth: 0,
    totalTasksThisMonth: 0,
    completedTasksThisWeek: 0,
    totalTasksThisWeek: 0
  });

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
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Priority: 1. fullName, 2. onboardingData.userName, 3. settings.display_name, 4. auth displayName, 5. email prefix
        setUserName(
          userData.fullName || 
          userData.onboardingData?.userName || 
          userData.settings?.display_name || 
          user.displayName || 
          user.email?.split('@')[0] || 
          'User'
        );
      } else {
        // Fallback to auth user data if Firestore document doesn't exist
        setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to auth user data on error
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
    }
  };

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const db = getDb();
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Fetch upcoming events (all future events for count, next 7 days for display)
      let upcomingEventsCount = 0;
      let upcomingActivitiesData: CalendarActivity[] = [];
      
      // Count all upcoming events
      try {
        const allEventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', user.uid),
          where('start_time', '>=', Timestamp.fromDate(now))
        );
        const allEventsSnapshot = await getDocs(allEventsQuery);
        upcomingEventsCount = allEventsSnapshot.size;
      } catch (err: any) {
        // Fallback: fetch all and filter client-side
        if (err.code === 'failed-precondition') {
          const allEventsQueryFallback = query(
            collection(db, 'events'),
            where('userId', '==', user.uid)
          );
          const allEventsSnapshotFallback = await getDocs(allEventsQueryFallback);
          let count = 0;
          allEventsSnapshotFallback.forEach((doc) => {
            const data = doc.data() as any;
            const startTime = data.start_time instanceof Timestamp 
              ? data.start_time.toDate() 
              : new Date(data.start_time);
            if (startTime >= now) count++;
          });
          upcomingEventsCount = count;
        }
      }
      
      // Fetch events for next 7 days for display
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', user.uid),
          where('start_time', '>=', Timestamp.fromDate(now)),
          where('start_time', '<=', Timestamp.fromDate(nextWeek)),
          orderBy('start_time', 'asc'),
          limit(5)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        
        eventsSnapshot.forEach((doc) => {
          const data = doc.data();
          const startTime = data.start_time instanceof Timestamp 
            ? data.start_time.toDate() 
            : new Date(data.start_time);
          const endTime = data.end_time instanceof Timestamp 
            ? data.end_time.toDate() 
            : data.end_time ? new Date(data.end_time) : undefined;
          
          upcomingActivitiesData.push({
            id: doc.id,
            title: data.title || 'Untitled Event',
            start_date: startTime.toISOString(),
            end_date: endTime?.toISOString(),
            category: data.category || 'general',
            location: data.location || undefined,
            color: '#3b82f6'
          });
        });
      } catch (err: any) {
        // Fallback: fetch all user events and filter client-side
        if (err.code === 'failed-precondition') {
          const eventsQueryFallback = query(
            collection(db, 'events'),
            where('userId', '==', user.uid)
          );
          const eventsSnapshotFallback = await getDocs(eventsQueryFallback);
          const allEvents: CalendarActivity[] = [];
          
          eventsSnapshotFallback.forEach((doc) => {
            const data = doc.data();
            const startTime = data.start_time instanceof Timestamp 
              ? data.start_time.toDate() 
              : new Date(data.start_time);
            
            if (startTime >= now && startTime <= nextWeek) {
              const endTime = data.end_time instanceof Timestamp 
                ? data.end_time.toDate() 
                : data.end_time ? new Date(data.end_time) : undefined;
              
              allEvents.push({
                id: doc.id,
                title: data.title || 'Untitled Event',
                start_date: startTime.toISOString(),
                end_date: endTime?.toISOString(),
                category: data.category || 'general',
                location: data.location || undefined,
                color: '#3b82f6'
              });
            }
          });
          
          allEvents.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
          upcomingActivitiesData = allEvents.slice(0, 5);
        }
      }
      
      // Also fetch reminders for next 7 days and add to activities
      try {
        const remindersQuery = query(
          collection(db, 'reminders'),
          where('userId', '==', user.uid),
          where('remind_at', '>=', Timestamp.fromDate(now)),
          where('remind_at', '<=', Timestamp.fromDate(nextWeek)),
          orderBy('remind_at', 'asc'),
          limit(3)
        );
        const remindersSnapshot = await getDocs(remindersQuery);
        
        remindersSnapshot.forEach((doc) => {
          const data = doc.data();
          const remindAt = data.remind_at instanceof Timestamp 
            ? data.remind_at.toDate() 
            : new Date(data.remind_at);
          
          upcomingActivitiesData.push({
            id: doc.id,
            title: data.title || 'Untitled Reminder',
            start_date: remindAt.toISOString(),
            category: data.category || 'reminder',
            location: undefined,
            color: '#8b5cf6'
          });
        });
        
        // Sort all activities by date
        upcomingActivitiesData.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        upcomingActivitiesData = upcomingActivitiesData.slice(0, 5);
      } catch (err: any) {
        // Fallback: fetch all reminders and filter client-side
        if (err.code === 'failed-precondition') {
          const remindersQueryFallback = query(
            collection(db, 'reminders'),
            where('userId', '==', user.uid)
          );
          const remindersSnapshotFallback = await getDocs(remindersQueryFallback);
          const allReminders: CalendarActivity[] = [];
          
          remindersSnapshotFallback.forEach((doc) => {
            const data = doc.data();
            const remindAt = data.remind_at instanceof Timestamp 
              ? data.remind_at.toDate() 
              : new Date(data.remind_at);
            
            if (remindAt >= now && remindAt <= nextWeek) {
              allReminders.push({
                id: doc.id,
                title: data.title || 'Untitled Reminder',
                start_date: remindAt.toISOString(),
                category: data.category || 'reminder',
                location: undefined,
                color: '#8b5cf6'
              });
            }
          });
          
          // Merge with existing activities and sort
          upcomingActivitiesData = [...upcomingActivitiesData, ...allReminders];
          upcomingActivitiesData.sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
          upcomingActivitiesData = upcomingActivitiesData.slice(0, 5);
        }
      }

      // Fetch pending tasks and calculate productivity metrics
      let pendingTasksCount = 0;
      let pendingTodosData: ExtractedTodo[] = [];
      
      // Calculate date ranges for this month and this week
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
      startOfWeek.setHours(0, 0, 0, 0);
      
      let totalTasks = 0;
      let completedTasks = 0;
      let completedTasksThisMonth = 0;
      let totalTasksThisMonth = 0;
      let completedTasksThisWeek = 0;
      let totalTasksThisWeek = 0;
      
      // Fetch all tasks and filter client-side (to avoid 'in' query index issues)
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const allTasks: ExtractedTodo[] = [];
        
        tasksSnapshot.forEach((doc) => {
          const data = doc.data();
          const status = data.status || 'pending';
          totalTasks++;
          
          // Check if completed
          if (status === 'completed') {
            completedTasks++;
          }
          
          // Check created_at for this month/week calculations
          const createdAt = data.created_at instanceof Timestamp 
            ? data.created_at.toDate() 
            : data.created_at ? new Date(data.created_at) : new Date();
          
          if (createdAt >= startOfMonth) {
            totalTasksThisMonth++;
            if (status === 'completed') {
              completedTasksThisMonth++;
            }
          }
          
          if (createdAt >= startOfWeek) {
            totalTasksThisWeek++;
            if (status === 'completed') {
              completedTasksThisWeek++;
            }
          }
          
          // Count pending/approved tasks
          if (status === 'pending' || status === 'approved') {
            pendingTasksCount++;
            
            const dueDate = data.due_date instanceof Timestamp 
              ? data.due_date.toDate().toISOString() 
              : data.due_date ? new Date(data.due_date).toISOString() : undefined;
            
            allTasks.push({
              id: doc.id,
              title: data.title || 'Untitled Task',
              description: data.description || '',
              due_date: dueDate,
              priority: data.priority || 'normal',
              status: status
            });
          }
        });
        
        // Sort by due date (tasks without due dates go to end)
        allTasks.sort((a, b) => {
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        });
        
        pendingTodosData = allTasks.slice(0, 5);
      } catch (err: any) {
        console.error('Error fetching tasks:', err);
      }
      
      // Calculate productivity score (completed / total, or 0 if no tasks)
      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // Fetch unprocessed emails (pending extracted_items)
      let unprocessedEmailsCount = 0;
      try {
        const extractedItemsQuery = query(
          collection(db, 'extracted_items'),
          where('userId', '==', user.uid),
          where('status', '==', 'pending')
        );
        const extractedItemsSnapshot = await getDocs(extractedItemsQuery);
        unprocessedEmailsCount = extractedItemsSnapshot.size;
      } catch (err) {
        console.error('Error fetching unprocessed emails:', err);
      }

      // Fetch unread notifications
      let unreadNotificationsCount = 0;
      let recentNotificationsData: Notification[] = [];
      
      // Fetch all notifications and filter client-side (to avoid index issues)
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', user.uid)
        );
        const notificationsSnapshot = await getDocs(notificationsQuery);
        const allNotifications: Notification[] = [];
        
        notificationsSnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.created_at instanceof Timestamp 
            ? data.created_at.toDate().toISOString() 
            : data.created_at ? new Date(data.created_at).toISOString() : new Date().toISOString();
          
          const isRead = data.is_read || false;
          if (!isRead) {
            unreadNotificationsCount++;
          }
          
          allNotifications.push({
            id: doc.id,
            title: data.title || 'Notification',
            message: data.message || '',
            type: data.type || 'info',
            category: data.category || 'general',
            priority: data.priority || 'medium',
            is_read: isRead,
            created_at: createdAt,
            action_url: data.action_url || undefined
          });
        });
        
        // Sort by created_at descending and take first 5
        allNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        recentNotificationsData = allNotifications.slice(0, 5);
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
      }

      // Generate AI insights based on actual data
      const insights: AssistantInsight[] = [];
      
      if (upcomingEventsCount > 0) {
        insights.push({
          id: '1',
          type: 'reminder',
          title: `${upcomingEventsCount} Upcoming Event${upcomingEventsCount > 1 ? 's' : ''}`,
          message: `You have ${upcomingEventsCount} event${upcomingEventsCount > 1 ? 's' : ''} coming up. Stay organized!`,
          action: 'View Calendar',
          actionUrl: '/calendar',
          icon: Calendar,
          color: 'from-blue-500 to-cyan-600'
        });
      }
      
      if (pendingTasksCount > 0) {
        insights.push({
          id: '2',
          type: 'suggestion',
          title: `${pendingTasksCount} Pending Task${pendingTasksCount > 1 ? 's' : ''}`,
          message: `You have ${pendingTasksCount} task${pendingTasksCount > 1 ? 's' : ''} waiting for your attention.`,
          action: 'View Tasks',
          actionUrl: '/calendar',
          icon: CheckSquare,
          color: 'from-emerald-500 to-teal-600'
        });
      }
      
      if (unprocessedEmailsCount > 0) {
        insights.push({
          id: '3',
          type: 'insight',
          title: `${unprocessedEmailsCount} Email Insight${unprocessedEmailsCount > 1 ? 's' : ''} Pending`,
          message: `You have ${unprocessedEmailsCount} email insight${unprocessedEmailsCount > 1 ? 's' : ''} ready for review.`,
          action: 'Review Now',
          actionUrl: '/email-insights',
          icon: Mail,
          color: 'from-teal-500 to-cyan-600'
        });
      }

      // Set stats
      setStats({
        upcomingEvents: upcomingEventsCount,
        pendingTasks: pendingTasksCount,
        unprocessedEmails: unprocessedEmailsCount,
        unreadNotifications: unreadNotificationsCount
      });

      setUpcomingActivities(upcomingActivitiesData);
      setRecentNotifications(recentNotificationsData);
      setPendingTodos(pendingTodosData);
      setAssistantInsights(insights);
      
      // Set productivity metrics
      setProductivityMetrics({
        productivityScore,
        completedTasksThisMonth,
        totalTasksThisMonth,
        completedTasksThisWeek,
        totalTasksThisWeek
      });
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

  // Only show full-page loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xs text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex">
      {/* Sidebar */}
      <DashboardSidebar userName={userName} userEmail={user?.email || undefined} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-w-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Hero Section with Greeting */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg flex-shrink-0">
                    <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 truncate">
                    {getGreeting()}, {userName.split(' ')[0] || 'there'}!
                  </h1>
                </div>
                <p className="text-[11px] sm:text-xs lg:text-sm text-slate-600">
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
                  <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 hidden sm:inline">Refresh</span>
                </button>
                <Link
                  href="/assistant"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg shadow-teal-200 active:scale-95 text-[10px] sm:text-[11px] font-semibold"
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
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Productivity Overview</h2>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                    <div className="animate-pulse">
                      <div className="h-20 bg-slate-200 rounded-lg mb-3"></div>
                      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="
              grid 
              grid-cols-2 
              grid-rows-2
              sm:grid-cols-2 sm:grid-rows-1
              lg:grid-cols-3 lg:grid-rows-1
              gap-4 sm:gap-6
              [&>*:nth-child(3)]:col-span-2
              sm:[&>*:nth-child(3)]:col-span-1
            ">
              {/* Productivity Score Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-right min-w-0 flex-1 ml-3">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-0.5 sm:mb-1">{productivityMetrics.productivityScore}%</h3>
                    <p className="text-[10px] text-slate-500">Score</p>
                  </div>
                </div>
                <h4 className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mb-2 sm:mb-3">Productivity Score</h4>
                <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2.5 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${productivityMetrics.productivityScore}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">Based on completed tasks</p>
              </div>

              {/* Weekly Tasks Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all group">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-right min-w-0 flex-1 ml-3">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-0.5 sm:mb-1">
                      {productivityMetrics.completedTasksThisWeek}/{productivityMetrics.totalTasksThisWeek}
                    </h3>
                    <p className="text-[10px] text-slate-500">Tasks</p>
                  </div>
                </div>
                <h4 className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mb-2 sm:mb-3">This Week</h4>
                <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2.5 sm:h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: productivityMetrics.totalTasksThisWeek > 0 ? `${Math.round((productivityMetrics.completedTasksThisWeek / productivityMetrics.totalTasksThisWeek) * 100)}%` : '0%' }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">
                  {productivityMetrics.totalTasksThisWeek - productivityMetrics.completedTasksThisWeek} task{productivityMetrics.totalTasksThisWeek - productivityMetrics.completedTasksThisWeek !== 1 ? 's' : ''} remaining
                </p>
              </div>

              {/* Tasks Completed Card */}
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all group sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                    <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="text-right min-w-0 flex-1 ml-3">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-0.5 sm:mb-1">{productivityMetrics.completedTasksThisMonth}</h3>
                    <p className="text-[10px] text-slate-500">Tasks</p>
                  </div>
                </div>
                <h4 className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mb-2 sm:mb-3">Tasks Completed</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: productivityMetrics.totalTasksThisMonth > 0 ? `${Math.round((productivityMetrics.completedTasksThisMonth / productivityMetrics.totalTasksThisMonth) * 100)}%` : '0%' }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-amber-600 flex-shrink-0">
                    {productivityMetrics.totalTasksThisMonth > 0 ? Math.round((productivityMetrics.completedTasksThisMonth / productivityMetrics.totalTasksThisMonth) * 100) : 0}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-1">
                  This month • {productivityMetrics.totalTasksThisMonth - productivityMetrics.completedTasksThisMonth} remaining
                </p>
              </div>
            </div>
            )}
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <div className="animate-pulse">
                    <div className="h-12 bg-slate-200 rounded-lg mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <Link
              href="/calendar"
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-blue-600">{stats.upcomingEvents}</span>
              </div>
              <h3 className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mb-0.5 sm:mb-1 line-clamp-1">Upcoming Events</h3>
              <p className="text-[10px] text-slate-500 hidden sm:block">In your calendar</p>
            </Link>

            <Link
              href="/email-insights"
              className="bg-gradient-to-br from-teal-50 to-green-50 border-2 border-teal-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-teal-500 to-green-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  <Inbox className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-teal-600">{stats.unprocessedEmails}</span>
              </div>
              <h3 className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mb-0.5 sm:mb-1 line-clamp-1">Email Insights</h3>
              <p className="text-[10px] text-slate-500 hidden sm:block">Awaiting review</p>
            </Link>

            <Link
              href="/assistant"
              className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  <ListTodo className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-purple-600">{stats.pendingTasks}</span>
              </div>
              <h3 className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mb-0.5 sm:mb-1 line-clamp-1">Pending Tasks</h3>
              <p className="text-[10px] text-slate-500 hidden sm:block">Need your attention</p>
            </Link>

            <Link
              href="/notifications"
              className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-xl transition-all group cursor-pointer active:scale-95"
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform flex-shrink-0">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <span className="text-lg sm:text-xl font-bold text-orange-600">{stats.unreadNotifications}</span>
              </div>
              <h3 className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mb-0.5 sm:mb-1 line-clamp-1">Notifications</h3>
              <p className="text-[10px] text-slate-500 hidden sm:block">Unread messages</p>
            </Link>
          </div>
          )}

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
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">Upcoming Schedule</h2>
                  </div>
                  <Link
                    href="/calendar"
                    className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {loading ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto mb-3"></div>
                      <p className="text-[11px] text-slate-500">Loading activities...</p>
                    </div>
                  ) : upcomingActivities.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-[11px] sm:text-xs text-slate-500">No upcoming events</p>
                      <Link
                        href="/calendar"
                        className="inline-flex items-center gap-2 mt-4 text-[10px] sm:text-[11px] text-teal-600 hover:text-teal-700 font-semibold"
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
                              <h3 className="text-[11px] sm:text-xs font-semibold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors line-clamp-1">
                                {activity.title}
                              </h3>
                              <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1.5 sm:gap-3 text-[10px] sm:text-[11px] text-slate-600">
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
                            <span className="px-2 sm:px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-medium text-slate-700 flex-shrink-0 self-start sm:self-auto">
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
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">Pending Tasks</h2>
                  </div>
                  <Link
                    href="/assistant"
                    className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {loading ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto mb-3"></div>
                      <p className="text-[11px] text-slate-500">Loading tasks...</p>
                    </div>
                  ) : pendingTodos.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-[11px] sm:text-xs text-slate-500">No pending tasks</p>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1">You're all caught up!</p>
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
                              <h3 className="text-[11px] sm:text-xs font-semibold text-slate-900 mb-1 line-clamp-1">{todo.title}</h3>
                              {todo.description && (
                                <p className="text-[10px] sm:text-[11px] text-slate-600 mb-2 line-clamp-2">{todo.description}</p>
                              )}
                              <div className="flex items-center gap-2">
                                {todo.due_date && (
                                  <span className="text-[10px] text-slate-500">
                                    Due: {new Date(todo.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className={`px-2 sm:px-3 py-1 border rounded-lg text-[10px] font-medium flex-shrink-0 self-start sm:self-auto ${getPriorityColor(todo.priority)}`}>
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
                  <h3 className="text-xs sm:text-sm font-bold">AI Insights</h3>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  {loading ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white/50 mx-auto mb-2"></div>
                      <p className="text-[10px] text-white/70">Loading insights...</p>
                    </div>
                  ) : assistantInsights.length === 0 ? (
                    <div className="text-center py-6">
                      <Sparkles className="h-8 w-8 text-white/50 mx-auto mb-2" />
                      <p className="text-[10px] text-white/80">No insights at the moment</p>
                      <p className="text-[9px] text-white/60 mt-1">Everything looks good!</p>
                    </div>
                  ) : (
                    assistantInsights.map((insight) => {
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
                              <h4 className="font-semibold text-[10px] sm:text-[11px] mb-1 line-clamp-1">{insight.title}</h4>
                              <p className="text-[10px] text-white/90 mb-2 line-clamp-2">{insight.message}</p>
                              {insight.action && insight.actionUrl && (
                                <Link
                                  href={insight.actionUrl}
                                  className="inline-flex items-center gap-1 text-[10px] font-medium text-white hover:text-teal-100 transition-colors"
                                >
                                  {insight.action}
                                  <ArrowRight className="h-3 w-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
                <Link
                  href="/assistant"
                  className="mt-3 sm:mt-4 w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg sm:rounded-xl transition-all text-[11px] sm:text-xs font-semibold backdrop-blur-sm border border-white/30 active:scale-95"
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
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">Notifications</h2>
                  </div>
                  <Link
                    href="/notifications"
                    className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] text-teal-600 hover:text-teal-700 font-semibold"
                  >
                    View All
                    <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {loading ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto mb-3"></div>
                      <p className="text-[11px] text-slate-500">Loading notifications...</p>
                    </div>
                  ) : recentNotifications.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Bell className="h-10 w-10 sm:h-12 sm:w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-[11px] sm:text-xs text-slate-500">No new notifications</p>
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
                            <h3 className="font-semibold text-slate-900 text-[10px] sm:text-[11px] mb-1 line-clamp-1">
                              {notification.title}
                            </h3>
                            <p className="text-[10px] text-slate-600 mb-2 line-clamp-2">
                              {notification.message}
                            </p>
                            <span className="text-[10px] text-slate-400">
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

