'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Calendar,
  MapPin,
  Camera,
  TrendingUp,
  Clock,
  CheckCircle2,
  Star,
  BarChart3,
  Activity,
  Crown,
  Briefcase,
  GraduationCap,
  Users,
  Settings,
  Link as LinkIcon,
  Globe,
  Phone,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import Image from 'next/image';

interface UserProfile {
  fullName: string;
  email: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  phone?: string;
  company?: string;
  jobTitle?: string;
  timezone: string;
  joinDate: string;
  subscription?: {
    planId: string;
    planName: string;
    status: string;
  };
}

interface ProfileStat {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
}

interface ActivityItem {
  id: string;
  type: 'task' | 'event' | 'email' | 'achievement';
  title: string;
  description: string;
  timestamp: string; // Creation date
  activityDate?: string; // The actual date of the activity (start_time, due_date, remind_at)
  icon: any;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  unlocked: boolean;
  progress?: number;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements'>('overview');
  const [stats, setStats] = useState<ProfileStat[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?view=login');
      return;
    }

    if (user) {
      fetchProfile();
      fetchStats();
      fetchActivities();
      fetchAchievements();
    }
  }, [user, authLoading, router]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // Ensure Firebase is initialized
      if (typeof window === 'undefined') {
        setLoading(false);
        return;
      }
      let db;
      try {
        db = getDb();
      } catch (dbError) {
        console.error('Firestore initialization error:', dbError);
        setLoading(false);
        return;
      }
      if (!db) {
        console.error('Firestore is not initialized');
        setLoading(false);
        return;
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        const joinDate = data.createdAt instanceof Timestamp 
          ? data.createdAt.toDate() 
          : data.createdAt ? new Date(data.createdAt) : new Date();
        
        setUserName(data.fullName || data.onboardingData?.userName || user.displayName || 'User');
        
        // Fetch subscription from Firestore (like billing page does)
        let subscriptionData = undefined;
        try {
          // Try to get subscription from users/{uid}/subscription subcollection first
          const subscriptionRef = doc(db, 'users', user.uid, 'subscription', 'current');
          const subscriptionDoc = await getDoc(subscriptionRef);
          
          if (subscriptionDoc.exists()) {
            const subData = subscriptionDoc.data();
            subscriptionData = {
              planId: subData.planId || '',
              planName: subData.planName || '',
              status: subData.status || 'active'
            };
          } else if (data.subscription) {
            // Fallback to subscription field in user document
            subscriptionData = {
              planId: data.subscription.planId || '',
              planName: data.subscription.planName || '',
              status: data.subscription.status || 'active'
            };
          }
        } catch (subError) {
          console.error('Error fetching subscription:', subError);
        }
        
        const profileData = {
          fullName: data.fullName || user.displayName || 'User',
          email: user.email || '',
          bio: data.bio || data.onboardingData?.bio || '',
          avatar_url: data.avatar_url || user.photoURL || '',
          location: data.location || data.onboardingData?.location || '',
          website: data.website || '',
          phone: data.phone || '',
          company: data.company || data.onboardingData?.company || '',
          jobTitle: data.jobTitle || data.onboardingData?.jobTitle || '',
          timezone: data.timezone || 'UTC',
          joinDate: joinDate.toISOString(),
          subscription: subscriptionData
        };
        
        setProfile(profileData);
      } else {
        // Create default profile from auth user
        const defaultProfile = {
          fullName: user.displayName || 'User',
          email: user.email || '',
          timezone: 'UTC',
          joinDate: new Date().toISOString()
        };
        setProfile(defaultProfile);
        setUserName(user.displayName || 'User');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Fetch tasks
      const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', user.uid));
      const tasksSnapshot = await getDocs(tasksQuery);
      const totalTasks = tasksSnapshot.size;
      const completedTasks = tasksSnapshot.docs.filter(doc => doc.data().status === 'completed').length;
      
      // Fetch events
      const eventsQuery = query(collection(db, 'events'), where('userId', '==', user.uid));
      const eventsSnapshot = await getDocs(eventsQuery);
      const totalEvents = eventsSnapshot.size;
      const upcomingEvents = eventsSnapshot.docs.filter(doc => {
        const startTime = doc.data().start_time instanceof Timestamp 
          ? doc.data().start_time.toDate() 
          : new Date(doc.data().start_time);
        return startTime >= now;
      }).length;
      
      // Fetch emails processed
      const emailsQuery = query(collection(db, 'emails'), where('userId', '==', user.uid));
      const emailsSnapshot = await getDocs(emailsQuery);
      const totalEmails = emailsSnapshot.size;
      
      // Calculate productivity score
      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      setStats([
        {
          label: 'Tasks Completed',
          value: completedTasks,
          icon: CheckCircle2,
          color: 'from-emerald-500 to-teal-600',
          trend: `of ${totalTasks} total`
        },
        {
          label: 'Upcoming Events',
          value: upcomingEvents,
          icon: Calendar,
          color: 'from-blue-500 to-cyan-600',
          trend: `of ${totalEvents} total`
        },
        {
          label: 'Emails Processed',
          value: totalEmails,
          icon: Mail,
          color: 'from-purple-500 to-pink-600',
          trend: 'this month'
        },
        {
          label: 'Productivity Score',
          value: `${productivityScore}%`,
          icon: TrendingUp,
          color: 'from-amber-500 to-orange-600',
          trend: 'all time'
        }
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchActivities = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const activitiesList: ActivityItem[] = [];
      const now = new Date();
      
      // Fetch recent tasks (ordered by created_at) - fetch more for pagination
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(50)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        tasksSnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.created_at instanceof Timestamp 
            ? data.created_at.toDate().toISOString() 
            : new Date().toISOString();
          
          // Use due_date (activity date) if available, otherwise use created_at
          const activityDate = data.due_date 
            ? (data.due_date instanceof Timestamp 
                ? data.due_date.toDate().toISOString() 
                : new Date(data.due_date).toISOString())
            : undefined;
          
          activitiesList.push({
            id: doc.id,
            type: 'task',
            title: data.title || 'Task',
            description: `Status: ${data.status || 'pending'}`,
            timestamp: createdAt,
            activityDate: activityDate,
            icon: CheckCircle2,
            color: 'text-emerald-600'
          });
        });
      } catch (err: any) {
        // Fallback: fetch all and sort client-side
        if (err.code === 'failed-precondition') {
          const tasksQueryFallback = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid)
          );
          const tasksSnapshotFallback = await getDocs(tasksQueryFallback);
          const allTasks: ActivityItem[] = [];
          tasksSnapshotFallback.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.created_at instanceof Timestamp 
              ? data.created_at.toDate().toISOString() 
              : new Date().toISOString();
            
            // Use due_date (activity date) if available, otherwise use created_at
            const activityDate = data.due_date 
              ? (data.due_date instanceof Timestamp 
                  ? data.due_date.toDate().toISOString() 
                  : new Date(data.due_date).toISOString())
              : undefined;
            
            allTasks.push({
              id: doc.id,
              type: 'task',
              title: data.title || 'Task',
              description: `Status: ${data.status || 'pending'}`,
              timestamp: createdAt,
              activityDate: activityDate,
              icon: CheckCircle2,
              color: 'text-emerald-600'
            });
          });
          allTasks.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          activitiesList.push(...allTasks.slice(0, 50));
        }
      }
      
      // Fetch recent events (ordered by created_at) - fetch more for pagination
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', user.uid),
          orderBy('created_at', 'desc'),
          limit(50)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        eventsSnapshot.forEach((doc) => {
          const data = doc.data();
          const createdAt = data.created_at instanceof Timestamp 
            ? data.created_at.toDate().toISOString() 
            : new Date().toISOString();
          
          // Use start_time (activity date) if available
          const activityDate = data.start_time 
            ? (data.start_time instanceof Timestamp 
                ? data.start_time.toDate().toISOString() 
                : new Date(data.start_time).toISOString())
            : undefined;
          
          activitiesList.push({
            id: doc.id,
            type: 'event',
            title: data.title || 'Event',
            description: data.location || 'No location',
            timestamp: createdAt,
            activityDate: activityDate,
            icon: Calendar,
            color: 'text-blue-600'
          });
        });
      } catch (err: any) {
        // Fallback: fetch all and sort client-side
        if (err.code === 'failed-precondition') {
          const eventsQueryFallback = query(
            collection(db, 'events'),
            where('userId', '==', user.uid)
          );
          const eventsSnapshotFallback = await getDocs(eventsQueryFallback);
          const allEvents: ActivityItem[] = [];
          eventsSnapshotFallback.forEach((doc) => {
            const data = doc.data();
            const createdAt = data.created_at instanceof Timestamp 
              ? data.created_at.toDate().toISOString() 
              : new Date().toISOString();
            
            // Use start_time (activity date) if available
            const activityDate = data.start_time 
              ? (data.start_time instanceof Timestamp 
                  ? data.start_time.toDate().toISOString() 
                  : new Date(data.start_time).toISOString())
              : undefined;
            
            allEvents.push({
              id: doc.id,
              type: 'event',
              title: data.title || 'Event',
              description: data.location || 'No location',
              timestamp: createdAt,
              activityDate: activityDate,
              icon: Calendar,
              color: 'text-blue-600'
            });
          });
          allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          activitiesList.push(...allEvents.slice(0, 50));
        }
      }
      
      // Sort by timestamp and take most recent (fetch more for pagination)
      activitiesList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivities(activitiesList); // Store all activities, pagination will handle display
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const fetchAchievements = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Fetch tasks to calculate productivity score
      let totalTasks = 0;
      let completedTasks = 0;
      let tasksCompleted = 0;
      
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        
        tasksSnapshot.forEach((doc) => {
          const data = doc.data();
          totalTasks++;
          if (data.status === 'completed') {
            completedTasks++;
            tasksCompleted++;
          }
        });
      } catch (err: any) {
        console.error('Error fetching tasks for achievements:', err);
      }
      
      // Calculate productivity score
      const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      // Fetch events count
      let eventsCount = 0;
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', user.uid)
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        eventsCount = eventsSnapshot.size;
      } catch (err: any) {
        console.error('Error fetching events for achievements:', err);
      }
      
      // Fetch emails count
      let emailsCount = 0;
      try {
        const emailsQuery = query(
          collection(db, 'emails'),
          where('userId', '==', user.uid)
        );
        const emailsSnapshot = await getDocs(emailsQuery);
        emailsCount = emailsSnapshot.size;
      } catch (err: any) {
        console.error('Error fetching emails for achievements:', err);
      }
      
      // Calculate days active (check user creation date)
      let daysActive = 0;
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const createdAt = userData.createdAt instanceof Timestamp 
            ? userData.createdAt.toDate() 
            : userData.createdAt ? new Date(userData.createdAt) : new Date();
          const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
          daysActive = Math.min(daysSinceCreation, 30); // Cap at 30 for progress calculation
        }
      } catch (err: any) {
        console.error('Error fetching user data for achievements:', err);
      }
      
      // Calculate achievements based on real data
      const achievementsList: Achievement[] = [
        {
          id: '1',
          title: 'First Steps',
          description: 'Complete your first task',
          icon: Star,
          color: 'from-yellow-400 to-amber-500',
          unlocked: tasksCompleted >= 1,
          progress: tasksCompleted >= 1 ? 100 : Math.min((tasksCompleted / 1) * 100, 100)
        },
        {
          id: '2',
          title: 'Event Master',
          description: 'Create 10 events',
          icon: Calendar,
          color: 'from-blue-400 to-cyan-500',
          unlocked: eventsCount >= 10,
          progress: eventsCount >= 10 ? 100 : Math.min((eventsCount / 10) * 100, 100)
        },
        {
          id: '3',
          title: 'Productivity Pro',
          description: 'Achieve 80% productivity score',
          icon: TrendingUp,
          color: 'from-emerald-400 to-teal-500',
          unlocked: productivityScore >= 80,
          progress: productivityScore >= 80 ? 100 : Math.min((productivityScore / 80) * 100, 100)
        },
        {
          id: '4',
          title: 'Email Expert',
          description: 'Process 50 emails',
          icon: Mail,
          color: 'from-purple-400 to-pink-500',
          unlocked: emailsCount >= 50,
          progress: emailsCount >= 50 ? 100 : Math.min((emailsCount / 50) * 100, 100)
        },
        {
          id: '5',
          title: 'Consistency King',
          description: 'Active for 30 days',
          icon: Crown,
          color: 'from-amber-400 to-orange-500',
          unlocked: daysActive >= 30,
          progress: daysActive >= 30 ? 100 : Math.min((daysActive / 30) * 100, 100)
        }
      ];
      
      setAchievements(achievementsList);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      // Fallback to empty achievements on error
      setAchievements([]);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getPlanIcon = (planId?: string) => {
    switch (planId) {
      case 'student':
        return GraduationCap;
      case 'professional':
        return Briefcase;
      case 'executive':
        return Crown;
      case 'team':
        return Users;
      default:
        return User;
    }
  };

  const getPlanColor = (planId?: string) => {
    switch (planId) {
      case 'student':
        return 'from-teal-500 to-cyan-600';
      case 'professional':
        return 'from-cyan-500 to-blue-600';
      case 'executive':
        return 'from-amber-500 to-orange-600';
      case 'team':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  // Only show full-page loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-[11px] text-slate-600">Loading...</p>
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
        {loading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
              <p className="text-[11px] text-slate-600">Loading profile...</p>
            </div>
          </div>
        ) : !profile ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <User className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-sm text-slate-500">Profile not found</p>
            </div>
          </div>
        ) : (
          <>
            {(() => {
              const PlanIcon = getPlanIcon(profile.subscription?.planId);
              const memberSince = new Date(profile.joinDate).toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              });
              
              return (
                <>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-600 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-white/20 backdrop-blur-sm border-4 border-white/30 shadow-2xl overflow-hidden">
                  {profile.avatar_url || user?.photoURL ? (
                    <Image
                      src={profile.avatar_url || user?.photoURL || '/profile.jpg'}
                      alt={profile.fullName}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                      <User className="h-12 w-12 sm:h-16 sm:w-16 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                        {profile.fullName}
                      </h1>
                      {profile.subscription && (
                        <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getPlanColor(profile.subscription.planId)} text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-lg`}>
                          <PlanIcon className="h-3 w-3" />
                          <span>{profile.subscription.planName}</span>
                        </div>
                      )}
                    </div>
                    {profile.jobTitle && (
                      <p className="text-sm sm:text-base text-teal-50 mb-2 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {profile.jobTitle}
                        {profile.company && ` at ${profile.company}`}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-teal-50">
                      {profile.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {profile.location}
                        </span>
                      )}
                      {profile.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" />
                          {profile.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Joined {memberSince}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Edit in Settings</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'activity', label: 'Activity', icon: Activity },
              { id: 'achievements', label: 'Achievements', icon: Trophy }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-teal-300'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-[11px] font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={index}
                      className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all group"
                    >
                      <div className={`p-2 sm:p-3 bg-gradient-to-br ${stat.color} rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform shadow-lg w-fit mb-3`}>
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] font-semibold text-slate-700 mb-0.5">
                        {stat.label}
                      </p>
                      {stat.trend && (
                        <p className="text-[10px] text-slate-500">{stat.trend}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bio Section */}
              {profile.bio && (
                <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                      <User className="h-4 w-4 text-teal-600" />
                      About
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-sm text-slate-700 leading-relaxed">
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-teal-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {profile.email && (
                      <div className="flex items-center gap-3 text-[11px] sm:text-sm text-slate-700">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-3 text-[11px] sm:text-sm text-slate-700">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-3 text-[11px] sm:text-sm text-slate-700">
                        <LinkIcon className="h-4 w-4 text-slate-400" />
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">
                          {profile.website}
                        </a>
                      </div>
                    )}
                    {!profile.email && !profile.phone && !profile.website && (
                      <p className="text-[11px] text-slate-400 italic">No contact information added</p>
                    )}
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-teal-600" />
                    Preferences
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] sm:text-sm">
                      <span className="text-slate-700">Timezone</span>
                      <span className="font-medium text-slate-900">{profile.timezone}</span>
                    </div>
                    {profile.subscription && (
                      <div className="flex items-center justify-between text-[11px] sm:text-sm">
                        <span className="text-slate-700">Plan</span>
                        <span className="font-medium text-slate-900">{profile.subscription.planName}</span>
                      </div>
                    )}
                    <Link
                      href="/settings"
                      className="inline-flex items-center gap-2 text-[11px] sm:text-sm text-teal-600 hover:text-teal-700 font-semibold mt-2"
                    >
                      <Settings className="h-3.5 w-3.5" />
                      Manage Settings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
                  <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-500">No recent activity</p>
                </div>
              ) : (
                <>
                  {(() => {
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const endIndex = startIndex + itemsPerPage;
                    const paginatedActivities = activities.slice(startIndex, endIndex);
                    const totalPages = Math.ceil(activities.length / itemsPerPage);

                    return (
                      <>
                        {paginatedActivities.map((activity) => {
                          const Icon = activity.icon;
                          return (
                            <div
                              key={activity.id}
                              className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all"
                            >
                              <div className="flex items-start gap-2">
                                <div className={`p-2 bg-gradient-to-br ${activity.color.includes('text-') ? 'from-slate-100 to-slate-200' : 'from-teal-100 to-cyan-100'} rounded-lg flex-shrink-0`}>
                                  <Icon className={`h-4 w-4 ${activity.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-semibold text-slate-900 mb-1">
                                    {activity.title}
                                  </h4>
                                  <p className="text-[11px] text-slate-600 mb-2">
                                    {activity.description}
                                  </p>
                                  <div className="flex flex-col gap-1">
                                    {activity.activityDate && (
                                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {activity.type === 'task' && 'Due: '}
                                        {activity.type === 'event' && 'On: '}
                                        {new Date(activity.activityDate).toLocaleDateString('en-US', { 
                                          month: 'short', 
                                          day: 'numeric', 
                                          year: 'numeric',
                                          hour: 'numeric',
                                          minute: '2-digit'
                                        })}
                                      </span>
                                    )}
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      Created {getTimeAgo(activity.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl p-4 shadow-sm">
                            <div className="text-[11px] text-slate-600">
                              Showing {startIndex + 1} - {Math.min(endIndex, activities.length)} of {activities.length} activities
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                              >
                                Previous
                              </button>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                  let pageNum;
                                  if (totalPages <= 5) {
                                    pageNum = i + 1;
                                  } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                  } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                  } else {
                                    pageNum = currentPage - 2 + i;
                                  }
                                  return (
                                    <button
                                      key={pageNum}
                                      onClick={() => setCurrentPage(pageNum)}
                                      className={`w-8 h-8 rounded-lg text-[11px] font-semibold transition-all ${
                                        currentPage === pageNum
                                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                      }`}
                                    >
                                      {pageNum}
                                    </button>
                                  );
                                })}
                              </div>
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                              >
                                Next
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`bg-white border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden ${
                      achievement.unlocked ? 'border-teal-300' : 'border-slate-200 opacity-75'
                    }`}
                  >
                    {achievement.unlocked && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className={`p-3 bg-gradient-to-br ${achievement.color} rounded-xl mb-3 w-fit shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      {achievement.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 mb-3">
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>Progress</span>
                          <span>{achievement.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all"
                            style={{ width: `${achievement.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {achievement.unlocked && (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                        <Trophy className="h-3 w-3" />
                        <span>Unlocked</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

