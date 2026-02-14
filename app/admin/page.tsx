'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Mail,
  CreditCard,
  BarChart3,
  Shield,
  Database,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Activity,
  Server,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  UserPlus,
  MailCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useState } from 'react';
import AdminSidebar from '@/app/components/AdminSidebar';
import Header from '@/app/components/Header';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    newSubmissions: 0,
    unreadSubmissions: 0,
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    resolvedSubmissions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?view=login');
        return;
      }
      // Check if user is admin
      checkAdminAccess();
    }
  }, [authLoading, isAuthenticated, router, user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // User document doesn't exist, redirect to dashboard
        router.push('/dashboard');
        return;
      }
      
      const userData = userDoc.data();
      if (userData.role !== 'admin') {
        // User is not admin, redirect to dashboard
        router.push('/dashboard');
        return;
      }
      
      // User is admin, load stats
      loadStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      // On error, redirect to dashboard
      router.push('/dashboard');
    }
  };

  const loadStats = async () => {
    try {
      const db = getDb();
      
      // Load contact submission stats
      const submissionsQuery = query(collection(db, 'contact_submissions'));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      let newCount = 0;
      let unreadCount = 0;
      let resolvedCount = 0;
      submissionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'new') newCount++;
        if (!data.read) unreadCount++;
        if (data.status === 'resolved') resolvedCount++;
      });

      // Load user stats
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      const allUsers = usersSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt;
        let createdAtDate: Date;
        
        if (createdAt instanceof Timestamp) {
          createdAtDate = createdAt.toDate();
        } else if (createdAt?.toDate) {
          createdAtDate = createdAt.toDate();
        } else if (createdAt instanceof Date) {
          createdAtDate = createdAt;
        } else {
          createdAtDate = new Date();
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt: createdAtDate
        };
      });

      // Calculate new users
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const newUsersToday = allUsers.filter(user => 
        user.createdAt >= today
      ).length;
      
      const newUsersThisWeek = allUsers.filter(user => 
        user.createdAt >= weekAgo
      ).length;

      // Load subscription stats
      let activeSubscriptions = 0;
      let totalRevenue = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        try {
          // Check subscription subcollection
          const subscriptionRef = collection(db, 'users', userId, 'subscription');
          const subscriptionSnapshot = await getDocs(subscriptionRef);
          
          if (subscriptionSnapshot.size > 0) {
            subscriptionSnapshot.forEach(subDoc => {
              const subData = subDoc.data();
              if (subData.status === 'active' || subData.status === 'trialing') {
                activeSubscriptions++;
                // Estimate revenue (you'd need actual pricing data)
                const planPrices: Record<string, { monthly: number; annual: number }> = {
                  student: { monthly: 9.99, annual: 99.99 },
                  professional: { monthly: 29.99, annual: 299.99 },
                  executive: { monthly: 99.99, annual: 999.99 },
                  team: { monthly: 199.99, annual: 1999.99 }
                };
                const planId = (subData.planId || subData.plan_id || 'student').toLowerCase();
                const cycle = subData.billingCycle || subData.billing_cycle || 'monthly';
                const price = planPrices[planId]?.[cycle as 'monthly' | 'annual'] || 0;
                totalRevenue += price;
              }
            });
          } else {
            // Check user document for subscription
            const userData = userDoc.data();
            if (userData.subscription && (userData.subscription.status === 'active' || userData.subscription.status === 'trialing')) {
              activeSubscriptions++;
            }
          }
        } catch (error) {
          // Skip if subscription collection doesn't exist
        }
      }

      setStats({
        newSubmissions: newCount,
        unreadSubmissions: unreadCount,
        totalUsers: usersSnapshot.size,
        activeSubscriptions,
        totalRevenue,
        newUsersToday,
        newUsersThisWeek,
        resolvedSubmissions: resolvedCount,
      });

      // Load recent activity (recent submissions)
      let activities: any[] = [];
      
      try {
        // Try with orderBy first (requires index)
        const recentSubmissionsQuery = query(
          collection(db, 'contact_submissions'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentSubmissionsSnapshot = await getDocs(recentSubmissionsQuery);
        activities = recentSubmissionsSnapshot.docs.map(doc => {
          const data = doc.data();
          const createdAt = data.createdAt;
          let timestamp: Date;
          
          if (createdAt instanceof Timestamp) {
            timestamp = createdAt.toDate();
          } else if (createdAt?.toDate) {
            timestamp = createdAt.toDate();
          } else if (createdAt instanceof Date) {
            timestamp = createdAt;
          } else {
            timestamp = new Date();
          }
          
          return {
            id: doc.id,
            type: 'submission',
            title: data.subject || 'New Contact Submission',
            description: `From ${data.name || 'Unknown'}`,
            timestamp,
            status: data.status
          };
        });
      } catch (err: any) {
        // Fallback: fetch all and sort client-side if index is missing
        if (err.code === 'failed-precondition') {
          const allSubmissionsQuery = query(collection(db, 'contact_submissions'));
          const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);
          
          const allActivities = allSubmissionsSnapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt;
            let timestamp: Date;
            
            if (createdAt instanceof Timestamp) {
              timestamp = createdAt.toDate();
            } else if (createdAt?.toDate) {
              timestamp = createdAt.toDate();
            } else if (createdAt instanceof Date) {
              timestamp = createdAt;
            } else {
              timestamp = new Date();
            }
            
            return {
              id: doc.id,
              type: 'submission',
              title: data.subject || 'New Contact Submission',
              description: `From ${data.name || 'Unknown'}`,
              timestamp,
              status: data.status
            };
          });
          
          // Sort by createdAt descending (newest first) and take top 5
          allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          activities = allActivities.slice(0, 5);
          
          // Show alert with index creation URL
          const indexUrl = err.message?.includes('index') 
            ? err.message.match(/https:\/\/[^\s]+/)?.[0]
            : null;
          if (indexUrl) {
            console.warn('Firestore index required. Create it at:', indexUrl);
            // Optionally show a one-time alert to admin
            if (typeof window !== 'undefined' && !sessionStorage.getItem('admin_dashboard_index_alert_shown')) {
              alert(`Firestore index required for recent activity. Please create it:\n\n${indexUrl}\n\nThis alert will only show once.`);
              sessionStorage.setItem('admin_dashboard_index_alert_shown', 'true');
            }
          }
        } else {
          throw err;
        }
      }
      
      setRecentActivity(activities);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  // Only show full-page loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const adminCards = [
    {
      title: 'Contact Submissions',
      description: 'Manage customer inquiries',
      href: '/admin/contact-submissions',
      icon: Mail,
      color: 'from-teal-500 to-cyan-600',
      badge: stats.newSubmissions > 0 ? stats.newSubmissions : undefined,
      badgeColor: 'bg-red-500',
      stats: [
        { label: 'New', value: stats.newSubmissions },
        { label: 'Unread', value: stats.unreadSubmissions },
      ]
    },
    {
      title: 'Users',
      description: 'View and manage users',
      href: '/admin/users',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      stats: [
        { label: 'Total Users', value: stats.totalUsers },
      ]
    },
    {
      title: 'Analytics',
      description: 'Platform insights and metrics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Subscriptions',
      description: 'Manage user subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
      color: 'from-orange-500 to-red-600',
    },
  ];

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: `+${stats.newUsersThisWeek} this week`,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      trend: 'up'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions,
      change: `${((stats.activeSubscriptions / stats.totalUsers) * 100 || 0).toFixed(1)}% conversion`,
      icon: CreditCard,
      color: 'from-emerald-500 to-teal-600',
      trend: 'up'
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: 'Estimated',
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
      trend: 'up'
    },
    {
      title: 'New Submissions',
      value: stats.newSubmissions,
      change: `${stats.unreadSubmissions} unread`,
      icon: Mail,
      color: 'from-teal-500 to-cyan-600',
      trend: stats.newSubmissions > 0 ? 'up' : 'neutral',
      badge: stats.newSubmissions > 0 ? stats.newSubmissions : undefined
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <Header userRole="admin" user={user} />
      <div className="flex -mt-16">
        <AdminSidebar />
        <div className="flex-1 lg:ml-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading admin dashboard...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
        <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
                  <p className="text-sm text-slate-600">Monitor and manage your platform</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg shadow-lg">
                  <Shield className="h-4 w-4" />
                  <span className="text-xs font-semibold">Admin Mode</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6 hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      {card.badge && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                          {card.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{card.value}</h3>
                    <p className="text-xs text-slate-600 mb-2">{card.title}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      {card.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-600" />}
                      {card.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-600" />}
                      <span className={card.trend === 'up' ? 'text-emerald-600' : card.trend === 'down' ? 'text-red-600' : 'text-slate-500'}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                );
              })}
        </div>

            {/* Quick Access Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                    className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6 hover:border-amber-300 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {card.badge && (
                        <span className={`${card.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse`}>
                      {card.badge}
                    </span>
                  )}
                </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-amber-600 transition-colors">
                  {card.title}
                </h3>
                    <p className="text-xs text-slate-600 mb-4">{card.description}</p>
                {card.stats && (
                  <div className="flex gap-4 pt-4 border-t border-slate-200">
                    {card.stats.map((stat, index) => (
                      <div key={index}>
                            <div className="text-lg sm:text-xl font-bold text-slate-900">{stat.value}</div>
                            <div className="text-[10px] text-slate-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
                    <div className="mt-4 flex items-center text-amber-600 text-xs font-medium group-hover:gap-2 transition-all">
                      <span>View Details</span>
                      <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
              </Link>
            );
          })}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-600" />
                    Recent Activity
                  </h2>
                  <Link href="/admin/contact-submissions" className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-xs text-slate-500">No recent activity</p>
                    </div>
                  ) : (
                    recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-3.5 w-3.5 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-900 truncate">{activity.title}</p>
                          <p className="text-[10px] text-slate-600">{activity.description}</p>
                          <p className="text-[9px] text-slate-500 mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                          activity.status === 'new' ? 'bg-red-100 text-red-700' :
                          activity.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          activity.status === 'resolved' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
        </div>

        {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
            <Link
              href="/admin/contact-submissions"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-amber-50 hover:border-amber-300 border-2 border-transparent transition-all group"
            >
                    <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                      <Mail className="h-4 w-4 text-amber-600" />
              </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-amber-600">Review Submissions</div>
                      <div className="text-xs text-slate-500">{stats.newSubmissions} new messages</div>
              </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/admin/users"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all group"
            >
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Users className="h-4 w-4 text-blue-600" />
              </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-blue-600">Manage Users</div>
                      <div className="text-xs text-slate-500">{stats.totalUsers} total users</div>
              </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              href="/admin/analytics"
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all group"
            >
                    <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
              </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-900 group-hover:text-purple-600">View Analytics</div>
                      <div className="text-xs text-slate-500">Platform insights</div>
              </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
                </div>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

