'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Eye,
  Edit,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Crown,
  Briefcase,
  User,
  Building2,
  BarChart3,
  Activity,
  Mail
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, where, getDoc } from 'firebase/firestore';
import AdminSidebar from '@/app/components/AdminSidebar';
import Header from '@/app/components/Header';

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'expired' | 'incomplete';
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: string;
  currentPeriodStart?: any;
  currentPeriodEnd?: any;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: any;
  trialStart?: any;
  trialEnd?: any;
  createdAt?: any;
  updatedAt?: any;
}

interface SubscriptionStats {
  total: number;
  active: number;
  trialing: number;
  pastDue: number;
  canceled: number;
  expired: number;
  monthlyRevenue: number;
  annualRevenue: number;
  totalRevenue: number;
  averageRevenue: number;
  churnRate: number;
  conversionRate: number;
}

const PLAN_DETAILS: Record<string, { name: string; icon: any; color: string; monthlyPrice: number; annualPrice: number }> = {
  student: { name: 'Student', icon: User, color: 'from-teal-500 to-cyan-600', monthlyPrice: 4.99, annualPrice: 49.99 },
  professional: { name: 'Professional', icon: Briefcase, color: 'from-cyan-500 to-blue-600', monthlyPrice: 14.99, annualPrice: 149.99 },
  executive: { name: 'Executive', icon: Crown, color: 'from-amber-500 to-orange-600', monthlyPrice: 29.99, annualPrice: 299.99 },
  team: { name: 'Team', icon: Building2, color: 'from-purple-500 to-pink-600', monthlyPrice: 49.99, annualPrice: 499.99 },
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<SubscriptionStats>({
    total: 0,
    active: 0,
    trialing: 0,
    pastDue: 0,
    canceled: 0,
    expired: 0,
    monthlyRevenue: 0,
    annualRevenue: 0,
    totalRevenue: 0,
    averageRevenue: 0,
    churnRate: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterCycle, setFilterCycle] = useState<string>('all');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    planId: '',
    status: 'active',
    billingCycle: 'monthly' as 'monthly' | 'annual',
    cancelAtPeriodEnd: false,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?view=login');
        return;
      }
      checkAdminAccess();
    }
  }, [authLoading, isAuthenticated, router]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      loadSubscriptions();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const db = getDb();
      
      // Get all users
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);
      
      const subscriptionsData: Subscription[] = [];
      let activeCount = 0;
      let trialingCount = 0;
      let pastDueCount = 0;
      let canceledCount = 0;
      let expiredCount = 0;
      let monthlyRevenue = 0;
      let annualRevenue = 0;
      
      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        
        // Check subscription subcollection first
        try {
          const subscriptionRef = collection(db, 'users', userId, 'subscription');
          const subscriptionSnapshot = await getDocs(subscriptionRef);
          
          if (subscriptionSnapshot.size > 0) {
            subscriptionSnapshot.forEach(subDoc => {
              const subData = subDoc.data();
              const planId = (subData.planId || subData.plan_id || 'student').toLowerCase();
              const planDetails = PLAN_DETAILS[planId] || PLAN_DETAILS.student;
              const cycle = subData.billingCycle || subData.billing_cycle || 'monthly';
              const amount = planDetails[cycle === 'monthly' ? 'monthlyPrice' : 'annualPrice'];
              
              const subscription: Subscription = {
                id: subDoc.id,
                userId,
                userEmail: userData.email || 'Unknown',
                userName: userData.fullName || userData.displayName || userData.email?.split('@')[0] || 'User',
                planId,
                planName: planDetails.name,
                status: subData.status || 'active',
                billingCycle: cycle as 'monthly' | 'annual',
                amount,
                currency: subData.currency || 'USD',
                currentPeriodStart: subData.currentPeriodStart,
                currentPeriodEnd: subData.currentPeriodEnd,
                cancelAtPeriodEnd: subData.cancelAtPeriodEnd || false,
                canceledAt: subData.canceledAt,
                trialStart: subData.trialStart,
                trialEnd: subData.trialEnd,
                createdAt: subData.createdAt,
                updatedAt: subData.updatedAt,
              };
              
              subscriptionsData.push(subscription);
              
              // Update stats
              if (subscription.status === 'active') {
                activeCount++;
                if (cycle === 'monthly') monthlyRevenue += amount;
                else annualRevenue += amount;
              } else if (subscription.status === 'trialing') {
                trialingCount++;
              } else if (subscription.status === 'past_due') {
                pastDueCount++;
              } else if (subscription.status === 'canceled') {
                canceledCount++;
              } else if (subscription.status === 'expired') {
                expiredCount++;
              }
            });
          } else if (userData.subscription) {
            // Check user document for subscription
            const subData = userData.subscription;
            const planId = (subData.planId || subData.plan_id || 'student').toLowerCase();
            const planDetails = PLAN_DETAILS[planId] || PLAN_DETAILS.student;
            const cycle = subData.billingCycle || subData.billing_cycle || 'monthly';
            const amount = planDetails[cycle === 'monthly' ? 'monthlyPrice' : 'annualPrice'];
            
            const subscription: Subscription = {
              id: `user-${userId}`,
              userId,
              userEmail: userData.email || 'Unknown',
              userName: userData.fullName || userData.displayName || userData.email?.split('@')[0] || 'User',
              planId,
              planName: planDetails.name,
              status: subData.status || 'active',
              billingCycle: cycle as 'monthly' | 'annual',
              amount,
              currency: subData.currency || 'USD',
              currentPeriodStart: subData.currentPeriodStart,
              currentPeriodEnd: subData.currentPeriodEnd,
              cancelAtPeriodEnd: subData.cancelAtPeriodEnd || false,
              canceledAt: subData.canceledAt,
              trialStart: subData.trialStart,
              trialEnd: subData.trialEnd,
              createdAt: subData.createdAt,
              updatedAt: subData.updatedAt,
            };
            
            subscriptionsData.push(subscription);
            
            if (subscription.status === 'active') {
              activeCount++;
              if (cycle === 'monthly') monthlyRevenue += amount;
              else annualRevenue += amount;
            } else if (subscription.status === 'trialing') {
              trialingCount++;
            } else if (subscription.status === 'past_due') {
              pastDueCount++;
            } else if (subscription.status === 'canceled') {
              canceledCount++;
            } else if (subscription.status === 'expired') {
              expiredCount++;
            }
          }
        } catch (error) {
          // Skip if subscription collection doesn't exist
        }
      }
      
      // Sort by updatedAt or createdAt
      subscriptionsData.sort((a, b) => {
        const aTime = a.updatedAt?.toDate?.() || a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.updatedAt?.toDate?.() || b.createdAt?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });
      
      setSubscriptions(subscriptionsData);
      
      // Calculate stats
      const total = subscriptionsData.length;
      const totalRevenue = monthlyRevenue + annualRevenue;
      const averageRevenue = total > 0 ? totalRevenue / total : 0;
      const churnRate = total > 0 ? (canceledCount / total) * 100 : 0;
      
      // Get total users for conversion rate
      const totalUsers = usersSnapshot.size;
      const conversionRate = totalUsers > 0 ? (activeCount / totalUsers) * 100 : 0;
      
      setStats({
        total,
        active: activeCount,
        trialing: trialingCount,
        pastDue: pastDueCount,
        canceled: canceledCount,
        expired: expiredCount,
        monthlyRevenue,
        annualRevenue,
        totalRevenue,
        averageRevenue,
        churnRate,
        conversionRate,
      });
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedSubscription || !user) return;
    
    try {
      setSaving(true);
      const db = getDb();
      
      // Update subscription in subcollection or user document
      try {
        const subscriptionRef = collection(db, 'users', selectedSubscription.userId, 'subscription');
        const subscriptionSnapshot = await getDocs(subscriptionRef);
        
        if (subscriptionSnapshot.size > 0) {
          // Update in subcollection
          const subDoc = subscriptionSnapshot.docs[0];
          await updateDoc(doc(db, 'users', selectedSubscription.userId, 'subscription', subDoc.id), {
            planId: editFormData.planId,
            status: editFormData.status,
            billingCycle: editFormData.billingCycle,
            cancelAtPeriodEnd: editFormData.cancelAtPeriodEnd,
            updatedAt: serverTimestamp(),
          });
        } else {
          // Update in user document
          await updateDoc(doc(db, 'users', selectedSubscription.userId), {
            'subscription.planId': editFormData.planId,
            'subscription.status': editFormData.status,
            'subscription.billingCycle': editFormData.billingCycle,
            'subscription.cancelAtPeriodEnd': editFormData.cancelAtPeriodEnd,
            'subscription.updatedAt': serverTimestamp(),
          });
        }
      } catch (error) {
        // Fallback to user document
        await updateDoc(doc(db, 'users', selectedSubscription.userId), {
          'subscription.planId': editFormData.planId,
          'subscription.status': editFormData.status,
          'subscription.billingCycle': editFormData.billingCycle,
          'subscription.cancelAtPeriodEnd': editFormData.cancelAtPeriodEnd,
          'subscription.updatedAt': serverTimestamp(),
        });
      }
      
      setShowEditModal(false);
      await loadSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Failed to update subscription. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = 
      sub.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.planName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.planId === filterPlan;
    const matchesCycle = filterCycle === 'all' || sub.billingCycle === filterCycle;
    
    return matchesSearch && matchesStatus && matchesPlan && matchesCycle;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; bg: string; icon: any }> = {
      active: { color: 'text-emerald-700', bg: 'bg-emerald-100', icon: CheckCircle },
      trialing: { color: 'text-blue-700', bg: 'bg-blue-100', icon: Clock },
      past_due: { color: 'text-amber-700', bg: 'bg-amber-100', icon: AlertCircle },
      canceled: { color: 'text-red-700', bg: 'bg-red-100', icon: XCircle },
      expired: { color: 'text-slate-700', bg: 'bg-slate-100', icon: XCircle },
      incomplete: { color: 'text-orange-700', bg: 'bg-orange-100', icon: AlertCircle },
    };
    
    const badge = badges[status] || badges.active;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${badge.color} ${badge.bg}`}>
        <Icon className="h-2.5 w-2.5" />
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
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

  const statCards = [
    {
      title: 'Total Subscriptions',
      value: stats.total,
      change: `${stats.active} active`,
      icon: CreditCard,
      color: 'from-blue-500 to-indigo-600',
      trend: 'up' as const,
    },
    {
      title: 'Active Subscriptions',
      value: stats.active,
      change: `${stats.conversionRate.toFixed(1)}% conversion`,
      icon: CheckCircle,
      color: 'from-emerald-500 to-teal-600',
      trend: 'up' as const,
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      change: `+ $${stats.annualRevenue.toFixed(2)} annual`,
      icon: DollarSign,
      color: 'from-amber-500 to-orange-600',
      trend: 'up' as const,
    },
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      change: `Avg: $${stats.averageRevenue.toFixed(2)}/sub`,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      trend: 'up' as const,
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
                  <p className="text-slate-600">Loading subscriptions...</p>
                </div>
              </div>
            ) : (
              <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Subscriptions</h1>
                  <p className="text-sm text-slate-600">Manage user subscriptions and billing</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={loadSubscriptions}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border-2 border-slate-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all text-slate-700 font-medium"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Refresh
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-medium">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </button>
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
                      <div className={`w-10 h-10 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{card.value}</h3>
                    <p className="text-xs text-slate-600 mb-2">{card.title}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      {card.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-emerald-600" />}
                      {(card.trend === 'down' as any) && <ArrowDownRight className="h-3 w-3 text-red-600" />}
                      <span className={card.trend === 'up' ? 'text-emerald-600' : (card.trend === 'down' as any) ? 'text-red-600' : 'text-slate-500'}>
                        {card.change}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {[
                { label: 'Trialing', value: stats.trialing, color: 'from-blue-500 to-cyan-600' },
                { label: 'Past Due', value: stats.pastDue, color: 'from-amber-500 to-orange-600' },
                { label: 'Canceled', value: stats.canceled, color: 'from-red-500 to-pink-600' },
                { label: 'Expired', value: stats.expired, color: 'from-slate-500 to-gray-600' },
                { label: 'Churn Rate', value: `${stats.churnRate.toFixed(1)}%`, color: 'from-purple-500 to-indigo-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl border-2 border-slate-200 p-3 text-center">
                  <div className={`text-lg font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-slate-600">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by email, name, or plan..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none transition-colors"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none transition-colors"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="canceled">Canceled</option>
                  <option value="expired">Expired</option>
                </select>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none transition-colors"
                >
                  <option value="all">All Plans</option>
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="executive">Executive</option>
                  <option value="team">Team</option>
                </select>
                <select
                  value={filterCycle}
                  onChange={(e) => setFilterCycle(e.target.value)}
                  className="px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none transition-colors"
                >
                  <option value="all">All Cycles</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">User</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Plan</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Billing</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Period</th>
                      <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredSubscriptions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <CreditCard className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-xs text-slate-500">No subscriptions found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredSubscriptions.map((subscription) => {
                        const planDetails = PLAN_DETAILS[subscription.planId] || PLAN_DETAILS.student;
                        const PlanIcon = planDetails.icon;
                        const periodStart = subscription.currentPeriodStart?.toDate?.() || null;
                        const periodEnd = subscription.currentPeriodEnd?.toDate?.() || null;
                        
                        return (
                          <tr key={subscription.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <div className="text-xs font-medium text-slate-900">{subscription.userName}</div>
                                <div className="text-xs text-slate-500">{subscription.userEmail}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-7 h-7 bg-gradient-to-br ${planDetails.color} rounded-lg flex items-center justify-center`}>
                                  <PlanIcon className="h-3.5 w-3.5 text-white" />
                                </div>
                                <span className="text-xs font-medium text-slate-900">{subscription.planName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {getStatusBadge(subscription.status)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                subscription.billingCycle === 'monthly'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {subscription.billingCycle === 'monthly' ? 'Monthly' : 'Annual'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs font-semibold text-slate-900">
                                ${subscription.amount.toFixed(2)}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {subscription.currency}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {periodEnd ? (
                                <div>
                                  <div className="text-xs text-slate-900">
                                    {periodEnd.toLocaleDateString()}
                                  </div>
                                  <div className="text-[10px] text-slate-500">
                                    {subscription.cancelAtPeriodEnd ? 'Cancels' : 'Renews'}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">N/A</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setShowViewModal(true);
                                  }}
                                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="h-3.5 w-3.5 text-slate-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedSubscription(subscription);
                                    setEditFormData({
                                      planId: subscription.planId,
                                      status: subscription.status,
                                      billingCycle: subscription.billingCycle,
                                      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd || false,
                                    });
                                    setShowEditModal(true);
                                  }}
                                  className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="h-3.5 w-3.5 text-amber-600" />
                                </button>
                                <Link
                                  href={`/admin/users?userId=${subscription.userId}`}
                                  className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                  title="View User"
                                >
                                  <Users className="h-3.5 w-3.5 text-blue-600" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* View Modal */}
            {showViewModal && selectedSubscription && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-5 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-900">Subscription Details</h2>
                      <button
                        onClick={() => setShowViewModal(false)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <XCircle className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">User</label>
                        <div className="mt-1 text-xs font-medium text-slate-900">{selectedSubscription.userName}</div>
                        <div className="text-xs text-slate-500">{selectedSubscription.userEmail}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Plan</label>
                        <div className="mt-1 text-xs font-medium text-slate-900">{selectedSubscription.planName}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Status</label>
                        <div className="mt-1">{getStatusBadge(selectedSubscription.status)}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Billing Cycle</label>
                        <div className="mt-1 text-xs font-medium text-slate-900 capitalize">{selectedSubscription.billingCycle}</div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Amount</label>
                        <div className="mt-1 text-xs font-medium text-slate-900">
                          ${selectedSubscription.amount.toFixed(2)} {selectedSubscription.currency}
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 uppercase">Period End</label>
                        <div className="mt-1 text-xs font-medium text-slate-900">
                          {selectedSubscription.currentPeriodEnd?.toDate?.()?.toLocaleDateString() || 'N/A'}
                        </div>
                      </div>
                    </div>
                    {selectedSubscription.cancelAtPeriodEnd && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-xs text-amber-700">
                          <AlertCircle className="h-3.5 w-3.5 inline mr-1" />
                          This subscription will cancel at the end of the current period.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedSubscription && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
                  <div className="p-5 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-bold text-slate-900">Edit Subscription</h2>
                      <button
                        onClick={() => setShowEditModal(false)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <XCircle className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Plan</label>
                      <select
                        value={editFormData.planId}
                        onChange={(e) => setEditFormData({ ...editFormData, planId: e.target.value })}
                        className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                      >
                        {Object.entries(PLAN_DETAILS).map(([id, plan]) => (
                          <option key={id} value={id}>{plan.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                      <select
                        value={editFormData.status}
                        onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                        className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                      >
                        <option value="active">Active</option>
                        <option value="trialing">Trialing</option>
                        <option value="past_due">Past Due</option>
                        <option value="canceled">Canceled</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Billing Cycle</label>
                      <select
                        value={editFormData.billingCycle}
                        onChange={(e) => setEditFormData({ ...editFormData, billingCycle: e.target.value as 'monthly' | 'annual' })}
                        className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="cancelAtPeriodEnd"
                        checked={editFormData.cancelAtPeriodEnd}
                        onChange={(e) => setEditFormData({ ...editFormData, cancelAtPeriodEnd: e.target.checked })}
                        className="w-3.5 h-3.5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                      />
                      <label htmlFor="cancelAtPeriodEnd" className="text-xs text-slate-700">
                        Cancel at period end
                      </label>
                    </div>
                  </div>
                  <div className="p-5 border-t border-slate-200 flex justify-end gap-2">
                    <button
                      onClick={() => setShowEditModal(false)}
                      className="px-3 py-1.5 text-sm border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors text-slate-700 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateSubscription}
                      disabled={saving}
                      className="px-3 py-1.5 text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {saving ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}