'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Server,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Zap,
  Shield,
  BarChart3,
  RefreshCw,
  Download,
  Filter,
  Search,
  Eye,
  Ban,
  AlertCircle,
  Brain,
  Volume2,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import AdminSidebar from '@/app/components/AdminSidebar';
import Header from '@/app/components/Header';

interface APIUsage {
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  deepseekRequests: number;
  elevenlabsRequests: number;
  totalRequests: number;
  deepseekCost: number;
  elevenlabsCost: number;
  totalCost: number;
  lastRequestAt: Date | null;
  rateLimitHits: number;
  blockedRequests: number;
  period: string; // 'daily' | 'weekly' | 'monthly'
}

interface UsageRecord {
  id: string;
  userId: string;
  apiType: 'deepseek' | 'elevenlabs';
  timestamp: Date;
  cost: number;
  success: boolean;
  blocked: boolean;
  rateLimitExceeded: boolean;
  userPlan: string;
  requestSize?: number;
  responseTime?: number;
}

interface RateLimitConfig {
  planId: string;
  planName: string;
  deepseekDaily: number;
  deepseekMonthly: number;
  elevenlabsDaily: number;
  elevenlabsMonthly: number;
  costPerDeepseek: number;
  costPerElevenlabs: number;
}

const RATE_LIMITS: RateLimitConfig[] = [
  {
    planId: 'student',
    planName: 'Student',
    deepseekDaily: 100,
    deepseekMonthly: 2000,
    elevenlabsDaily: 50,
    elevenlabsMonthly: 1000,
    costPerDeepseek: 0.001,
    costPerElevenlabs: 0.003
  },
  {
    planId: 'professional',
    planName: 'Professional',
    deepseekDaily: 500,
    deepseekMonthly: 10000,
    elevenlabsDaily: 200,
    elevenlabsMonthly: 5000,
    costPerDeepseek: 0.001,
    costPerElevenlabs: 0.003
  },
  {
    planId: 'executive',
    planName: 'Executive',
    deepseekDaily: 2000,
    deepseekMonthly: 50000,
    elevenlabsDaily: 1000,
    elevenlabsMonthly: 25000,
    costPerDeepseek: 0.001,
    costPerElevenlabs: 0.003
  },
  {
    planId: 'team',
    planName: 'Team',
    deepseekDaily: 5000,
    deepseekMonthly: 100000,
    elevenlabsDaily: 2500,
    elevenlabsMonthly: 50000,
    costPerDeepseek: 0.001,
    costPerElevenlabs: 0.003
  }
];

export default function AdminAPIUsagePage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalCost: 0,
    activeUsers: 0,
    rateLimitHits: 0,
    blockedRequests: 0,
    deepseekRequests: 0,
    elevenlabsRequests: 0,
    avgResponseTime: 0,
    // Percentage changes from previous period
    totalRequestsChange: 0,
    totalCostChange: 0,
    rateLimitHitsChange: 0,
    activeUsersChange: 0,
    // Actual costs from backend
    deepseekCost: 0,
    elevenlabsCost: 0,
    // Progress percentages (based on total usage vs all users' combined limits)
    deepseekUsagePercent: 0,
    elevenlabsUsagePercent: 0
  });
  const [usageData, setUsageData] = useState<APIUsage[]>([]);
  const [recentActivity, setRecentActivity] = useState<UsageRecord[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'requests' | 'cost' | 'name'>('requests');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?view=login');
        return;
      }
      checkAdminAccess();
    }
  }, [authLoading, isAuthenticated, router, user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      loadData();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const loadData = async (period?: 'daily' | 'weekly' | 'monthly') => {
    try {
      setLoading(true);
      const periodParam = period || selectedPeriod;
      await Promise.all([
        fetchUsageStats(periodParam),
        fetchUserUsage(periodParam),
        fetchRecentActivity()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsageStats = async (period?: 'daily' | 'weekly' | 'monthly') => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const periodParam = period || selectedPeriod;
      const response = await fetch(`${API_BASE_URL}/admin/api-usage/stats?period=${periodParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch usage stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching usage stats:', error);
    }
  };

  const fetchUserUsage = async (period?: 'daily' | 'weekly' | 'monthly', plan?: string, sort?: string, order?: string) => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const periodParam = period || selectedPeriod;
      const planParam = plan !== undefined ? plan : selectedPlan;
      const sortParam = sort || sortBy;
      const orderParam = order || sortOrder;
      
      const response = await fetch(`${API_BASE_URL}/admin/api-usage/users?period=${periodParam}&plan=${planParam}&sort=${sortParam}&order=${orderParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsageData(data.users || []);
      } else {
        console.error('Failed to fetch user usage:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user usage:', error);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/admin/api-usage/activity?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data.activity || []);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_BASE_URL}/admin/api-usage/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blocked: block }),
      });

      if (response.ok) {
        await loadData();
      }
    } catch (error) {
      console.error('Error blocking user:', error);
    }
  };

  const filteredUsage = usageData.filter(usage => {
    const matchesSearch = 
      usage.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      usage.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getPlanLimit = (planId: string, apiType: 'deepseek' | 'elevenlabs', period: 'daily' | 'monthly') => {
    const plan = RATE_LIMITS.find(p => p.planId === planId);
    if (!plan) return 0;
    if (apiType === 'deepseek') {
      return period === 'daily' ? plan.deepseekDaily : plan.deepseekMonthly;
    } else {
      return period === 'daily' ? plan.elevenlabsDaily : plan.elevenlabsMonthly;
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-teal-500';
  };

  // Only show full-page loading during auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-teal-500 animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col h-screen overflow-hidden -mt-16">
        <Header userRole="admin" user={user} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                    <Server className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900">API Usage & Rate Limiting</h1>
                    <p className="text-xs sm:text-sm text-slate-600">Monitor and manage Deepseek & ElevenLabs API usage</p>
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-medium">Refresh</span>
                </button>
              </div>

              {/* Period Selector */}
              <div className="flex items-center gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((period) => (
                <button
                  key={period}
                  onClick={async () => {
                    setSelectedPeriod(period);
                    // Pass period directly to avoid race condition
                    await loadData(period);
                  }}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
              </div>
            </div>

            {/* Stats Cards */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-center h-20">
                      <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-slate-600">Total Requests</p>
                    <Activity className="h-4 w-4 text-teal-500" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">{stats.totalRequests.toLocaleString()}</p>
                  {stats.totalRequestsChange !== 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {stats.totalRequestsChange > 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-[9px] ${stats.totalRequestsChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stats.totalRequestsChange > 0 ? '+' : ''}{stats.totalRequestsChange.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-slate-600">Total Cost</p>
                    <DollarSign className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">${stats.totalCost.toFixed(2)}</p>
                  {stats.totalCostChange !== 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {stats.totalCostChange > 0 ? (
                        <TrendingUp className="h-3 w-3 text-amber-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-[9px] ${stats.totalCostChange > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                        {stats.totalCostChange > 0 ? '+' : ''}{stats.totalCostChange.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-slate-600">Rate Limit Hits</p>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">{stats.rateLimitHits}</p>
                  {stats.rateLimitHitsChange !== 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {stats.rateLimitHitsChange < 0 ? (
                        <TrendingDown className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <TrendingUp className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-[9px] ${stats.rateLimitHitsChange < 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stats.rateLimitHitsChange > 0 ? '+' : ''}{stats.rateLimitHitsChange.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] text-slate-600">Active Users</p>
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900">{stats.activeUsers}</p>
                  {stats.activeUsersChange !== 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      {stats.activeUsersChange > 0 ? (
                        <TrendingUp className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span className={`text-[9px] ${stats.activeUsersChange > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stats.activeUsersChange > 0 ? '+' : ''}{stats.activeUsersChange.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* API Breakdown */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h3 className="text-sm font-bold text-slate-900">Deepseek API</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">Requests</span>
                        <span className="text-xs font-bold text-slate-900">{stats.deepseekRequests.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(stats.deepseekUsagePercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Cost</span>
                      <span className="font-bold text-slate-900">${stats.deepseekCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Volume2 className="h-5 w-5 text-teal-500" />
                    <h3 className="text-sm font-bold text-slate-900">ElevenLabs API</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-600">Requests</span>
                        <span className="text-xs font-bold text-slate-900">{stats.elevenlabsRequests.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-teal-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(stats.elevenlabsUsagePercent, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Cost</span>
                      <span className="font-bold text-slate-900">${stats.elevenlabsCost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <select
                  value={selectedPlan}
                  onChange={async (e) => {
                    setSelectedPlan(e.target.value);
                    await fetchUserUsage();
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Plans</option>
                  {RATE_LIMITS.map(plan => (
                    <option key={plan.planId} value={plan.planId}>{plan.planName}</option>
                  ))}
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={async (e) => {
                    const [by, order] = e.target.value.split('-');
                    setSortBy(by as 'requests' | 'cost' | 'name');
                    setSortOrder(order as 'asc' | 'desc');
                    await fetchUserUsage();
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="requests-desc">Most Requests</option>
                  <option value="requests-asc">Least Requests</option>
                  <option value="cost-desc">Highest Cost</option>
                  <option value="cost-asc">Lowest Cost</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                </select>
              </div>
            </div>

            {/* User Usage Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">User Usage ({loading ? '...' : filteredUsage.length})</h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">User</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Plan</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Deepseek</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">ElevenLabs</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Total</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Cost</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsage.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          No usage data found
                        </td>
                      </tr>
                    ) : (
                      filteredUsage.map((usage) => {
                        const deepseekLimit = getPlanLimit(usage.planId, 'deepseek', selectedPeriod === 'daily' ? 'daily' : 'monthly');
                        const elevenlabsLimit = getPlanLimit(usage.planId, 'elevenlabs', selectedPeriod === 'daily' ? 'daily' : 'monthly');
                        const deepseekPercent = getUsagePercentage(usage.deepseekRequests, deepseekLimit);
                        const elevenlabsPercent = getUsagePercentage(usage.elevenlabsRequests, elevenlabsLimit);
                        const isOverLimit = deepseekPercent >= 100 || elevenlabsPercent >= 100;

                        return (
                          <tr key={usage.userId} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-slate-900">{usage.userName}</p>
                                <p className="text-[10px] text-slate-500">{usage.userEmail}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                {usage.planName}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-slate-900">{usage.deepseekRequests}</span>
                                <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className={`h-1.5 rounded-full ${getUsageColor(deepseekPercent)}`}
                                    style={{ width: `${Math.min(deepseekPercent, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-[9px] text-slate-500 mt-0.5">
                                  {usage.deepseekRequests}/{deepseekLimit}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium text-slate-900">{usage.elevenlabsRequests}</span>
                                <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className={`h-1.5 rounded-full ${getUsageColor(elevenlabsPercent)}`}
                                    style={{ width: `${Math.min(elevenlabsPercent, 100)}%` }}
                                  ></div>
                                </div>
                                <span className="text-[9px] text-slate-500 mt-0.5">
                                  {usage.elevenlabsRequests}/{elevenlabsLimit}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-medium text-slate-900">{usage.totalRequests}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-medium text-slate-900">${usage.totalCost.toFixed(2)}</span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isOverLimit ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                                  <AlertCircle className="h-3 w-3" />
                                  Over Limit
                                </span>
                              ) : usage.rateLimitHits > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
                                  <AlertTriangle className="h-3 w-3" />
                                  Warning
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                                  <CheckCircle className="h-3 w-3" />
                                  Normal
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => router.push(`/admin/users?userId=${usage.userId}`)}
                                  className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                  title="View User"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                {isOverLimit && (
                                  <button
                                    onClick={() => handleBlockUser(usage.userId, true)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Block User"
                                  >
                                    <Ban className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
              </div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Time</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">User</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">API</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Cost</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Response Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentActivity.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                          No recent activity
                        </td>
                      </tr>
                    ) : (
                      recentActivity.map((activity) => (
                        <tr key={activity.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 text-slate-600">
                            {new Date(activity.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-slate-900">{activity.userId.substring(0, 8)}...</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                              activity.apiType === 'deepseek'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-teal-100 text-teal-700'
                            }`}>
                              {activity.apiType === 'deepseek' ? 'Deepseek' : 'ElevenLabs'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {activity.blocked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-medium">
                                <Ban className="h-3 w-3" />
                                Blocked
                              </span>
                            ) : activity.rateLimitExceeded ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-[10px] font-medium">
                                <AlertTriangle className="h-3 w-3" />
                                Rate Limited
                              </span>
                            ) : activity.success ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                                <CheckCircle className="h-3 w-3" />
                                Success
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-[10px] font-medium">
                                <AlertCircle className="h-3 w-3" />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-slate-900">${activity.cost.toFixed(4)}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-slate-600">
                              {activity.responseTime ? `${activity.responseTime}ms` : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

