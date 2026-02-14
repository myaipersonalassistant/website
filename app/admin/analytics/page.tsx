'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Circle,
  Clock,
  MousePointerClick,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Calendar as CalendarIcon,
  Activity,
  Target,
  Zap,
  Navigation,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, where, limit, doc, getDoc, Timestamp } from 'firebase/firestore';
import { getAllStoredVisits, clearOldAnalyticsData } from '@/lib/analytics';
import AdminSidebar from '@/app/components/AdminSidebar';
import Header from '@/app/components/Header';

interface VisitorMetrics {
  totalVisitors: number;
  uniqueVisitors: number;
  pageViews: number;
  sessions: number;
  avgSessionDuration: number;
  bounceRate: number;
  newVisitors: number;
  returningVisitors: number;
  growthRate: number;
}

interface LocationData {
  country: string;
  city?: string;
  visitors: number;
  percentage: number;
  flag?: string;
}

interface DeviceData {
  type: 'desktop' | 'mobile' | 'tablet';
  count: number;
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface BrowserData {
  name: string;
  count: number;
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface PageView {
  path: string;
  views: number;
  uniqueViews: number;
  avgTime: number;
}

interface VisitorTrend {
  date: string;
  visitors: number;
  pageViews: number;
  sessions: number;
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<VisitorMetrics | null>(null);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [browsers, setBrowsers] = useState<BrowserData[]>([]);
  const [trafficSources, setTrafficSources] = useState<TrafficSource[]>([]);
  const [topPages, setTopPages] = useState<PageView[]>([]);
  const [trends, setTrends] = useState<VisitorTrend[]>([]);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?view=login');
        return;
      }
      checkAdminAccess();
    }
  }, [authLoading, isAuthenticated, router, timeRange]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      loadAnalytics();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const db = getDb();
      
      // Calculate date ranges
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const rangeStart = timeRange === '7d' ? weekAgo : timeRange === '30d' ? monthAgo : timeRange === '90d' ? new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000) : new Date(0);

      // Load visitor analytics from CLIENT-SIDE STORAGE (localStorage)
      // This avoids expensive Firestore read/write operations
      let visitorData: any[] = [];
      let hasRealData = false;
      
      try {
        // Get all stored visits from client-side storage (localStorage)
        const allVisits = getAllStoredVisits();
        
        // Filter by time range
        visitorData = allVisits.filter((visit: any) => {
          const visitDate = new Date(visit.timestamp);
          return visitDate >= rangeStart;
        });
        
        hasRealData = visitorData.length > 0;
      } catch (error) {
        console.error('Error loading analytics from storage:', error);
        hasRealData = false;
      }

      // If no real data exists, show empty state
      if (!hasRealData) {
        setMetrics({
          totalVisitors: 0,
          uniqueVisitors: 0,
          pageViews: 0,
          sessions: 0,
          avgSessionDuration: 0,
          bounceRate: 0,
          newVisitors: 0,
          returningVisitors: 0,
          growthRate: 0
        });
        setLocations([]);
        setDevices([]);
        setBrowsers([]);
        setTrafficSources([]);
        setTopPages([]);
        setTrends([]);
        return;
      }

      // Process real visitor data
      const uniqueVisitorIds = new Set<string>();
      const visitorLocations: Record<string, number> = {};
      const deviceCounts: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
      const browserCounts: Record<string, number> = {};
      const sourceCounts: Record<string, number> = {};
      const pageCounts: Record<string, { views: number; uniqueViews: Set<string>; totalTime: number; count: number }> = {};
      const dailyStats: Record<string, { visitors: Set<string>; pageViews: number; sessions: Set<string> }> = {};

      // Filter out event types and only process page views
      const pageViewData = visitorData.filter((v: any) => !v.type || v.type !== 'event');

      pageViewData.forEach((visit: any) => {
        const visitorId = visit.visitorId || visit.userId || 'anonymous';
        // Handle both Firestore Timestamp and regular Date
        let date: Date;
        if (visit.timestamp?.toDate) {
          date = visit.timestamp.toDate();
        } else if (visit.timestamp instanceof Timestamp) {
          date = visit.timestamp.toDate();
        } else {
          date = new Date(visit.timestamp);
        }
        const dateStr = date.toISOString().split('T')[0];
        
        uniqueVisitorIds.add(visitorId);
        
        // Location
        const country = visit.country || 'Unknown';
        visitorLocations[country] = (visitorLocations[country] || 0) + 1;
        
        // Device
        const device = (visit.device || 'desktop').toLowerCase();
        if (device === 'desktop' || device === 'mobile' || device === 'tablet') {
          deviceCounts[device] = (deviceCounts[device] || 0) + 1;
        } else {
          // Map other device types to closest match
          if (device.includes('mobile') || device.includes('phone')) {
            deviceCounts.mobile = (deviceCounts.mobile || 0) + 1;
          } else if (device.includes('tablet') || device.includes('ipad')) {
            deviceCounts.tablet = (deviceCounts.tablet || 0) + 1;
          } else {
            deviceCounts.desktop = (deviceCounts.desktop || 0) + 1;
          }
        }
        
        // Browser
        const browser = visit.browser || 'Unknown';
        browserCounts[browser] = (browserCounts[browser] || 0) + 1;
        
        // Source
        const source = visit.source || visit.referrer || 'Direct';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        
        // Pages
        const path = visit.path || visit.page || '/';
        if (!pageCounts[path]) {
          pageCounts[path] = { views: 0, uniqueViews: new Set(), totalTime: 0, count: 0 };
        }
        pageCounts[path].views++;
        pageCounts[path].uniqueViews.add(visitorId);
        pageCounts[path].totalTime += visit.duration || 0;
        pageCounts[path].count++;
        
        // Daily stats
        if (!dailyStats[dateStr]) {
          dailyStats[dateStr] = { visitors: new Set(), pageViews: 0, sessions: new Set() };
        }
        dailyStats[dateStr].visitors.add(visitorId);
        dailyStats[dateStr].pageViews++;
        dailyStats[dateStr].sessions.add(visit.sessionId || visitorId);
      });

      const uniqueVisitors = uniqueVisitorIds.size;
      const totalVisitors = pageViewData.length;
      const pageViews = pageViewData.length;
      const sessions = new Set(pageViewData.map(v => v.sessionId || v.visitorId || 'anonymous')).size;
      const totalDuration = pageViewData.reduce((sum, v) => sum + (v.duration || 0), 0);
      const avgSessionDuration = sessions > 0 ? totalDuration / sessions / 60 : 0; // Convert to minutes
      const singlePageSessions = pageViewData.filter(v => {
        const sessionId = v.sessionId || v.visitorId;
        return pageViewData.filter(v2 => (v2.sessionId || v2.visitorId) === sessionId).length === 1;
      }).length;
      const bounceRate = sessions > 0 ? (singlePageSessions / sessions) * 100 : 0;
      
      // Calculate new vs returning (simplified - would need historical data)
      const newVisitors = Math.floor(uniqueVisitors * 0.4); // Estimate
      const returningVisitors = uniqueVisitors - newVisitors;
      
      // Growth rate (would need previous period data)
      const growthRate = 0;

      setMetrics({
        totalVisitors,
        uniqueVisitors,
        pageViews,
        sessions,
        avgSessionDuration,
        bounceRate,
        newVisitors,
        returningVisitors,
        growthRate
      });

      // Process location data
      const totalLocationVisitors = Object.values(visitorLocations).reduce((a, b) => a + b, 0);
      const locationsData: LocationData[] = Object.entries(visitorLocations)
        .map(([country, count]) => ({
          country,
          visitors: count,
          percentage: totalLocationVisitors > 0 ? (count / totalLocationVisitors) * 100 : 0
        }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 10);
      setLocations(locationsData);

      // Process device data
      const totalDevices = Object.values(deviceCounts).reduce((a, b) => a + b, 0);
      const deviceData: DeviceData[] = [
        {
          type: 'desktop' as const,
          count: deviceCounts.desktop || 0,
          percentage: totalDevices > 0 ? ((deviceCounts.desktop || 0) / totalDevices) * 100 : 0,
          icon: Monitor,
          color: 'from-blue-500 to-indigo-600'
        },
        {
          type: 'mobile' as const,
          count: deviceCounts.mobile || 0,
          percentage: totalDevices > 0 ? ((deviceCounts.mobile || 0) / totalDevices) * 100 : 0,
          icon: Smartphone,
          color: 'from-emerald-500 to-teal-600'
        },
        {
          type: 'tablet' as const,
          count: deviceCounts.tablet || 0,
          percentage: totalDevices > 0 ? ((deviceCounts.tablet || 0) / totalDevices) * 100 : 0,
          icon: Tablet,
          color: 'from-purple-500 to-pink-600'
        }
      ].filter(d => d.count > 0);
      setDevices(deviceData);

      // Process browser data
      const totalBrowsers = Object.values(browserCounts).reduce((a, b) => a + b, 0);
      const browserData: BrowserData[] = Object.entries(browserCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: totalBrowsers > 0 ? (count / totalBrowsers) * 100 : 0,
          icon: name.toLowerCase().includes('chrome') ? Chrome : Circle,
          color: name.toLowerCase().includes('chrome') ? 'from-blue-500 to-cyan-600' :
                 name.toLowerCase().includes('safari') ? 'from-slate-500 to-slate-600' :
                 name.toLowerCase().includes('firefox') ? 'from-orange-500 to-red-600' :
                 'from-blue-600 to-indigo-700'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      setBrowsers(browserData);

      // Process traffic sources
      const totalSources = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
      const trafficData: TrafficSource[] = Object.entries(sourceCounts)
        .map(([source, count]) => ({
          source: source === 'Direct' ? 'Direct' :
                 source.toLowerCase().includes('google') || source.toLowerCase().includes('search') ? 'Organic Search' :
                 source.toLowerCase().includes('facebook') || source.toLowerCase().includes('twitter') || source.toLowerCase().includes('linkedin') ? 'Social Media' :
                 'Referral',
          visitors: count,
          percentage: totalSources > 0 ? (count / totalSources) * 100 : 0,
          icon: source === 'Direct' ? Navigation : source.toLowerCase().includes('search') ? Target : LinkIcon,
          color: source === 'Direct' ? 'from-amber-500 to-orange-600' :
                 source.toLowerCase().includes('search') ? 'from-emerald-500 to-teal-600' :
                 source.toLowerCase().includes('social') ? 'from-purple-500 to-pink-600' :
                 'from-blue-500 to-indigo-600'
        }))
        .sort((a, b) => b.visitors - a.visitors)
        .slice(0, 5);
      setTrafficSources(trafficData);

      // Process top pages
      const pagesData: PageView[] = Object.entries(pageCounts)
        .map(([path, data]) => ({
          path,
          views: data.views,
          uniqueViews: data.uniqueViews.size,
          avgTime: data.count > 0 ? data.totalTime / data.count / 60 : 0 // Convert to minutes
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
      setTopPages(pagesData);

      // Process trend data
      const trendData: VisitorTrend[] = Object.entries(dailyStats)
        .map(([date, stats]) => ({
          date,
          visitors: stats.visitors.size,
          pageViews: stats.pageViews,
          sessions: stats.sessions.size
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
      setTrends(trendData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

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

  if (!metrics) {
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
                    <p className="text-slate-600">Loading analytics...</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No analytics data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Visitors',
      value: metrics.totalVisitors.toLocaleString(),
      change: `${metrics.uniqueVisitors.toLocaleString()} unique`,
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      trend: metrics.growthRate >= 0 ? 'up' : 'down',
      trendValue: `${metrics.growthRate >= 0 ? '+' : ''}${metrics.growthRate.toFixed(1)}%`
    },
    {
      title: 'Page Views',
      value: metrics.pageViews.toLocaleString(),
      change: `${(metrics.pageViews / metrics.sessions).toFixed(1)} per session`,
      icon: Eye,
      color: 'from-emerald-500 to-teal-600',
      trend: 'up',
      trendValue: `${metrics.sessions.toLocaleString()} sessions`
    },
    {
      title: 'Avg Session Duration',
      value: `${metrics.avgSessionDuration.toFixed(1)}m`,
      change: `${metrics.bounceRate.toFixed(1)}% bounce rate`,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      trend: 'neutral',
      trendValue: `${metrics.returningVisitors.toLocaleString()} returning`
    },
    {
      title: 'New Visitors',
      value: metrics.newVisitors.toLocaleString(),
      change: `${((metrics.newVisitors / metrics.uniqueVisitors) * 100).toFixed(1)}% of total`,
      icon: Zap,
      color: 'from-purple-500 to-pink-600',
      trend: 'up',
      trendValue: `${metrics.returningVisitors.toLocaleString()} returning`
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
                  <p className="text-slate-600">Loading analytics...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Visitor Analytics</h1>
                      <p className="text-sm text-slate-600">Track visitor behavior, locations, and traffic sources</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d' | 'all')}
                        className="px-3 py-1.5 text-sm border-2 border-slate-200 rounded-xl focus:border-amber-300 focus:outline-none transition-colors bg-white"
                      >
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="90d">Last 90 days</option>
                        <option value="all">All time</option>
                      </select>
                      <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border-2 border-slate-200 rounded-xl hover:border-amber-300 hover:bg-amber-50 transition-all text-slate-700 font-medium disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm('Clear analytics data older than 30 days? This will free up storage space.')) {
                            const cleared = clearOldAnalyticsData(30);
                            alert(`Cleared ${cleared} old analytics records. Refresh to see updated data.`);
                            handleRefresh();
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border-2 border-slate-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all text-slate-700 font-medium"
                        title="Clear old analytics data (older than 30 days)"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Cleanup
                      </button>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
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
                          {card.trend === 'up' && <ArrowUpRight className="h-2.5 w-2.5 text-emerald-600" />}
                          {card.trend === 'down' && <ArrowDownRight className="h-2.5 w-2.5 text-red-600" />}
                          <span className={card.trend === 'up' ? 'text-emerald-600' : card.trend === 'down' ? 'text-red-600' : 'text-slate-500'}>
                            {card.change}
                          </span>
                        </div>
                        <div className="mt-2 text-[10px] text-slate-400">{card.trendValue}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Visitor Trends Chart */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5 mb-8">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Visitor Trends</h3>
                      <p className="text-xs text-slate-600">Daily visitors, page views, and sessions</p>
                    </div>
                    <Activity className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="h-80 flex items-end justify-between gap-1">
                    {trends.slice(-30).map((point, index) => {
                      const maxVisitors = Math.max(...trends.map(p => p.visitors), 1);
                      const height = (point.visitors / maxVisitors) * 100;
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center group">
                          <div className="relative w-full">
                            <div
                              className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-cyan-500 cursor-pointer"
                              style={{ height: `${Math.max(height, 5)}%` }}
                              title={`${point.visitors} visitors, ${point.pageViews} page views on ${new Date(point.date).toLocaleDateString()}`}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 mt-1">
                            {new Date(point.date).getDate()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[10px] text-slate-600">Total Visitors</p>
                      <p className="text-base font-bold text-slate-900">{metrics.totalVisitors.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600">Total Page Views</p>
                      <p className="text-base font-bold text-slate-900">{metrics.pageViews.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-600">Total Sessions</p>
                      <p className="text-base font-bold text-slate-900">{metrics.sessions.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Location & Device Breakdown */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {/* Visitor Locations */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-amber-600" />
                      Visitor Locations
                    </h3>
                    <div className="space-y-3">
                      {locations.map((location, index) => (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              <span className="text-xs font-medium text-slate-900">
                                {location.city ? `${location.city}, ` : ''}{location.country}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-slate-900">{location.visitors.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-500 w-10 text-right">{location.percentage}%</span>
                            </div>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full transition-all"
                              style={{ width: `${location.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device Breakdown */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <Monitor className="h-4 w-4 text-amber-600" />
                      Device Breakdown
                    </h3>
                    <div className="space-y-3">
                      {devices.map((device, index) => {
                        const Icon = device.icon;
                        return (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 bg-gradient-to-br ${device.color} rounded-lg flex items-center justify-center`}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-xs font-medium text-slate-900 capitalize">{device.type}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900">{device.count.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500 w-10 text-right">{device.percentage}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`bg-gradient-to-r ${device.color} h-2 rounded-full transition-all`}
                                style={{ width: `${device.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Browser & Traffic Sources */}
                <div className="grid lg:grid-cols-2 gap-6 mb-8">
                  {/* Browser Breakdown */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <Chrome className="h-4 w-4 text-amber-600" />
                      Browser Breakdown
                    </h3>
                    <div className="space-y-3">
                      {browsers.map((browser, index) => {
                        const Icon = browser.icon;
                        return (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 bg-gradient-to-br ${browser.color} rounded-lg flex items-center justify-center`}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-xs font-medium text-slate-900">{browser.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900">{browser.count.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500 w-10 text-right">{browser.percentage}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`bg-gradient-to-r ${browser.color} h-2 rounded-full transition-all`}
                                style={{ width: `${browser.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Traffic Sources */}
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                    <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-amber-600" />
                      Traffic Sources
                    </h3>
                    <div className="space-y-3">
                      {trafficSources.map((source, index) => {
                        const Icon = source.icon;
                        return (
                          <div key={index}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 bg-gradient-to-br ${source.color} rounded-lg flex items-center justify-center`}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-xs font-medium text-slate-900">{source.source}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900">{source.visitors.toLocaleString()}</span>
                                <span className="text-[10px] text-slate-500 w-10 text-right">{source.percentage}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`bg-gradient-to-r ${source.color} h-2 rounded-full transition-all`}
                                style={{ width: `${source.percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                  <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                    <MousePointerClick className="h-4 w-4 text-amber-600" />
                    Top Pages
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">Page</th>
                          <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">Views</th>
                          <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">Unique Views</th>
                          <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">Avg Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {topPages.map((page, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="font-mono text-xs text-slate-900">{page.path}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs font-semibold text-slate-900">{page.views.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs text-slate-600">{page.uniqueViews.toLocaleString()}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs text-slate-600">{page.avgTime.toFixed(1)}m</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
