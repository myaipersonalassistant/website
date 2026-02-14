'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Bell,
  Check,
  X,
  Archive,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  Calendar,
  Mail,
  Briefcase,
  Settings,
  Clock,
  ExternalLink,
  RefreshCw,
  CheckCheck,
  ArchiveX,
  Inbox,
  Star,
  Sparkles,
  Brain,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import { getDb } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  limit,
  writeBatch,
  Timestamp
} from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'activity' | 'system';
  category: 'meeting' | 'flight' | 'task' | 'briefing' | 'calendar' | 'email' | 'general' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  is_archived: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
  read_at?: string;
  expires_at?: string;
}

const typeConfig = {
  info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
  success: { icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  warning: { icon: AlertTriangle, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  error: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-50', borderColor: 'border-red-200' },
  reminder: { icon: Clock, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
  activity: { icon: Star, color: 'text-teal-500', bgColor: 'bg-teal-50', borderColor: 'border-teal-200' },
  system: { icon: Settings, color: 'text-slate-500', bgColor: 'bg-slate-50', borderColor: 'border-slate-200' },
};

const categoryIcons = {
  meeting: Calendar,
  flight: Briefcase,
  task: CheckCircle2,
  briefing: Mail,
  calendar: Calendar,
  email: Mail,
  general: Bell,
  system: Settings,
};

const priorityConfig = {
  low: { color: 'text-slate-500', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  medium: { color: 'text-blue-500', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  high: { color: 'text-orange-500', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  urgent: { color: 'text-red-500', badge: 'bg-red-100 text-red-700 border-red-200 animate-pulse' },
};

// Fetch notifications directly from Firestore
const fetchNotifications = async (userId: string, showArchived: boolean = false): Promise<Notification[]> => {
  try {
    const db = getDb();
    let notificationsQuery;
    
    if (showArchived) {
      // Fetch all notifications (including archived)
      notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('created_at', 'desc')
      );
    } else {
      // Fetch only non-archived notifications
      notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        where('is_archived', '==', false),
        orderBy('created_at', 'desc')
      );
    }
    
    const snapshot = await getDocs(notificationsQuery);
    const notifications: Notification[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        message: data.message || '',
        type: data.type || 'info',
        category: data.category || 'general',
        priority: data.priority || 'medium',
        is_read: data.is_read || false,
        is_archived: data.is_archived || false,
        action_url: data.action_url,
        metadata: data.metadata,
        created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString(),
        read_at: data.read_at?.toDate?.()?.toISOString() || data.read_at,
        expires_at: data.expires_at?.toDate?.()?.toISOString() || data.expires_at
      };
    });
    
    return notifications;
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    
    // Handle Firestore index errors - fallback to client-side filtering
    if (error.code === 'failed-precondition') {
      try {
        // Fallback: fetch all notifications and filter client-side
        const fallbackDb = getDb();
        const allNotificationsQuery = query(
          collection(fallbackDb, 'notifications'),
          where('userId', '==', userId)
        );
        const allSnapshot = await getDocs(allNotificationsQuery);
        let allNotifications: Notification[] = allSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            title: data.title || '',
            message: data.message || '',
            type: data.type || 'info',
            category: data.category || 'general',
            priority: data.priority || 'medium',
            is_read: data.is_read || false,
            is_archived: data.is_archived || false,
            action_url: data.action_url,
            metadata: data.metadata,
            created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString(),
            read_at: data.read_at?.toDate?.()?.toISOString() || data.read_at,
            expires_at: data.expires_at?.toDate?.()?.toISOString() || data.expires_at
          };
        });
        
        // Filter by archived status
        if (!showArchived) {
          allNotifications = allNotifications.filter(n => !n.is_archived);
        }
        
        // Sort by created_at descending
        allNotifications.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });
        
        return allNotifications;
      } catch (fallbackError) {
        // If fallback also fails, throw the original index error
        const indexError = new Error('Firestore index required. Please create the required index in Firebase Console.');
        (indexError as any).isIndexError = true;
        throw indexError;
      }
    }
    
    throw error;
  }
};

const updateNotification = async (notificationId: string, updates: Partial<Notification>): Promise<void> => {
  try {
    const db = getDb();
    const notificationRef = doc(db, 'notifications', notificationId);
    
    // Convert date strings to Timestamps if needed
    const updateData: any = { ...updates };
    if (updates.read_at && typeof updates.read_at === 'string') {
      updateData.read_at = Timestamp.fromDate(new Date(updates.read_at));
    }
    if (updates.expires_at && typeof updates.expires_at === 'string') {
      updateData.expires_at = Timestamp.fromDate(new Date(updates.expires_at));
    }
    
    await updateDoc(notificationRef, updateData);
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    const db = getDb();
    
    // Get all unread notifications
    const unreadQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('is_read', '==', false),
      where('is_archived', '==', false)
    );
    
    const snapshot = await getDocs(unreadQuery);
    
    if (snapshot.empty) {
      return; // No unread notifications
    }
    
    // Use batch to update all at once
    const batch = writeBatch(db);
    const readAt = Timestamp.now();
    
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        is_read: true,
        read_at: readAt
      });
    });
    
    await batch.commit();
  } catch (error) {
    console.error('Error marking all as read:', error);
    throw error;
  }
};

const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const db = getDb();
    const notificationRef = doc(db, 'notifications', notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

const archiveNotification = async (notificationId: string): Promise<void> => {
  await updateNotification(notificationId, { is_archived: true });
};

const unarchiveNotification = async (notificationId: string): Promise<void> => {
  await updateNotification(notificationId, { is_archived: false });
};

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false); // For loading notifications list
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    try {
      // Always use isLoadingNotifications for list area loading
      setIsLoadingNotifications(true);
      setError('');
      const data = await fetchNotifications(user.uid, showArchived);
      setNotifications(data);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      
      // Handle Firestore index errors
      if (err.isIndexError) {
        setError(
          `${err.message}\n\n` +
          `This query requires a Firestore index. ` +
          `Please create a composite index in Firebase Console for:\n` +
          `- Collection: notifications\n` +
          `- Fields: userId (Ascending), is_archived (Ascending), created_at (Descending)\n\n` +
          `After creating the index, wait 2-5 minutes for it to build, then refresh the page.`
        );
      } else {
        setError(err.message || 'Failed to load notifications. Please try again.');
      }
    } finally {
      setIsLoadingNotifications(false);
      setIsRefreshing(false);
    }
  }, [user, showArchived]);

  // Track if we've done initial load
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (authLoading) {
      // Still loading auth, don't do anything yet
      return;
    }
    if (!user) {
      // No user, don't load
      return;
    }
    
    // Set userName from auth user object (no Firestore access needed)
    setUserName(user.displayName || user.email?.split('@')[0] || 'User');
    
    // Load notifications (will show loading in list area, not full page)
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadNotifications();
    }
  }, [user, authLoading, loadNotifications]);

  // Separate effect for when showArchived changes (not initial load)
  useEffect(() => {
    if (user && hasLoadedRef.current) {
      // This is a toggle, reload notifications
      loadNotifications();
    }
  }, [showArchived, user, loadNotifications]);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchQuery, filterType, filterCategory, showArchived]);

  const applyFilters = () => {
    let filtered = [...notifications];

    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      if (filterType === 'unread') {
        filtered = filtered.filter((n) => !n.is_read);
      } else if (filterType === 'read') {
        filtered = filtered.filter((n) => n.is_read);
      } else {
        filtered = filtered.filter((n) => n.type === filterType);
      }
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((n) => n.category === filterCategory);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    try {
      await updateNotification(id, { is_read: true, read_at: new Date().toISOString() });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
    } catch (err: any) {
      console.error('Error marking as read:', err);
      setError(err.message || 'Failed to update notification');
    }
  };

  const handleMarkAsUnread = async (id: string) => {
    if (!user) return;
    try {
      await updateNotification(id, { is_read: false, read_at: undefined });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: false, read_at: undefined } : n)
      );
    } catch (err: any) {
      console.error('Error marking as unread:', err);
      setError(err.message || 'Failed to update notification');
    }
  };

  const handleArchive = async (id: string) => {
    if (!user) return;
    try {
      await archiveNotification(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_archived: true } : n)
      );
    } catch (err: any) {
      console.error('Error archiving notification:', err);
      setError(err.message || 'Failed to archive notification');
    }
  };

  const handleUnarchive = async (id: string) => {
    if (!user) return;
    try {
      await unarchiveNotification(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_archived: false } : n)
      );
    } catch (err: any) {
      console.error('Error unarchiving notification:', err);
      setError(err.message || 'Failed to unarchive notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      setIsRefreshing(true);
      await markAllAsRead(user.uid);
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      setError(err.message || 'Failed to mark all as read');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleArchiveSelected = async () => {
    if (!user || selectedNotifications.length === 0) return;
    try {
      await Promise.all(selectedNotifications.map(id => archiveNotification(id)));
      setNotifications(prev =>
        prev.map(n => selectedNotifications.includes(n.id) ? { ...n, is_archived: true } : n)
      );
      setSelectedNotifications([]);
    } catch (err: any) {
      console.error('Error archiving selected:', err);
      setError(err.message || 'Failed to archive notifications');
    }
  };

  const handleDeleteSelected = async () => {
    if (!user || selectedNotifications.length === 0) return;
    if (!confirm(`Delete ${selectedNotifications.length} notification(s)?`)) return;
    
    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
      setSelectedNotifications([]);
    } catch (err: any) {
      console.error('Error deleting selected:', err);
      setError(err.message || 'Failed to delete notifications');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNotifications();
  };

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((nId) => nId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map((n) => n.id));
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

  const unreadCount = notifications.filter((n) => !n.is_read && !n.is_archived).length;
  const archivedCount = notifications.filter((n) => n.is_archived).length;

  // Only show full-page loading when auth is still loading
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
      {/* Dashboard Sidebar */}
      <DashboardSidebar userName={userName} userEmail={user?.email || undefined} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Mobile-Optimized Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-6 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="p-1.5 sm:p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg flex-shrink-0">
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-base lg:text-lg font-bold text-white truncate">Notifications</h1>
                  <p className="text-[9px] sm:text-[10px] text-teal-50 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoadingNotifications}
                  className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all active:scale-95 disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={isRefreshing}
                    className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all active:scale-95"
                    title="Mark all as read"
                  >
                    <CheckCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Stats - Horizontal Scroll */}
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 pb-1 sm:pb-2 lg:pb-0 w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 lg:p-3 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[80px] lg:min-w-0">
                <p className="text-[8px] sm:text-[9px] text-white/80 mb-0.5">Total</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{notifications.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 lg:p-3 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[80px] lg:min-w-0">
                <p className="text-[8px] sm:text-[9px] text-white/80 mb-0.5">Unread</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{unreadCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 lg:p-3 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[80px] lg:min-w-0">
                <p className="text-[8px] sm:text-[9px] text-white/80 mb-0.5">Read</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{notifications.length - unreadCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-2.5 lg:p-3 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[80px] lg:min-w-0">
                <p className="text-[8px] sm:text-[9px] text-white/80 mb-0.5">Archived</p>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-white">{archivedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Quick Filters - Mobile Optimized */}
        <div className="bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 flex-shrink-0">
          <div className="max-w-7xl mx-auto space-y-2 sm:space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle - Mobile */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[11px] sm:text-xs font-medium text-slate-700 transition-all active:scale-95"
              >
                <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
                {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </button>
              <button
                onClick={() => setShowArchived(!showArchived)}
                disabled={isLoadingNotifications}
                className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-medium transition-all active:scale-95 disabled:opacity-50 ${
                  showArchived
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {showArchived ? <ArchiveX className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1 sm:mr-1.5" /> : <Archive className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1 sm:mr-1.5" />}
                <span className="hidden sm:inline">{showArchived ? 'Hide' : 'Show'} Archived</span>
                <span className="sm:hidden">{showArchived ? 'Hide' : 'Show'}</span>
              </button>
            </div>

            {/* Expandable Filters */}
            {showFilters && (
              <div className="space-y-2 pt-2 border-t border-slate-200 animate-in slide-in-from-top-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === 'all'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('unread')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === 'unread'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setFilterType('read')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === 'read'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Read
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-3 sm:mx-4 mt-2 sm:mt-3 p-2.5 sm:p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] sm:text-xs font-medium text-red-700 whitespace-pre-line break-words">{error}</p>
              {error.includes('Firestore index required') && error.includes('https://') && (
                <a
                  href={error.match(/https:\/\/[^\s]+/)?.[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[11px] sm:text-xs font-semibold rounded-lg transition-colors active:scale-95"
                >
                  Create Index Now →
                </a>
              )}
            </div>
            <button
              onClick={() => setError('')}
              className="p-1 text-red-400 hover:text-red-600 flex-shrink-0 active:scale-95"
            >
              <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>
          </div>
        )}

        {/* Bulk Actions - Mobile Optimized */}
        {selectedNotifications.length > 0 && (
          <div className="bg-teal-50 border-b border-teal-200 px-3 sm:px-4 py-2 sm:py-2.5 flex-shrink-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
              <span className="text-[11px] sm:text-xs font-semibold text-teal-700 truncate">
                {selectedNotifications.length} selected
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                <button
                  onClick={handleArchiveSelected}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 transition-all text-[11px] sm:text-xs font-medium active:scale-95"
                >
                  <Archive className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Archive</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-all text-[11px] sm:text-xs font-medium active:scale-95"
                >
                  <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
                <button
                  onClick={() => setSelectedNotifications([])}
                  className="px-2 sm:px-2.5 py-1 sm:py-1.5 text-slate-600 hover:text-slate-900 text-[11px] sm:text-xs font-medium active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List - Mobile Optimized */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 lg:p-4 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-2 sm:space-y-3">
            {isLoadingNotifications ? (
              <div className="text-center py-10 sm:py-12 lg:py-16 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 shadow-sm">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-500 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-[11px] sm:text-xs text-slate-600">Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-10 sm:py-12 lg:py-16 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 shadow-sm">
                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 border border-teal-100">
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-teal-600" />
                </div>
                <h3 className="text-[11px] sm:text-xs lg:text-sm font-bold text-slate-900 mb-1 sm:mb-2">No notifications found</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-600">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <>
                {/* Select All - Mobile */}
                {filteredNotifications.length > 0 && (
                  <div className="flex items-center justify-between mb-2 px-1">
                    <button
                      onClick={selectAll}
                      className="text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 font-medium active:scale-95"
                    >
                      {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                )}

                {filteredNotifications.map((notification) => {
                  const TypeIcon = typeConfig[notification.type].icon;
                  const CategoryIcon = categoryIcons[notification.category];
                  const isSelected = selectedNotifications.includes(notification.id);
                  const isExpanded = expandedNotification === notification.id;

                  return (
                    <div
                      key={notification.id}
                      className={`bg-white border-2 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all ${
                        notification.is_read
                          ? typeConfig[notification.type].borderColor
                          : 'border-teal-300 bg-gradient-to-br from-teal-50/50 to-white'
                      } ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        {/* Checkbox - Mobile Optimized */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectNotification(notification.id);
                          }}
                          className={`mt-0.5 w-4 h-4 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? 'bg-teal-500 border-teal-500'
                              : 'border-slate-300 hover:border-teal-400'
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />}
                        </button>

                        {/* Icon - Smaller on Mobile */}
                        <div className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0 ${typeConfig[notification.type].bgColor}`}>
                          <TypeIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${typeConfig[notification.type].color}`} />
                        </div>

                        {/* Content - Mobile Optimized */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-[11px] sm:text-xs font-bold mb-0.5 line-clamp-1 ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                {notification.title}
                              </h3>
                              <p className={`text-[10px] sm:text-[11px] text-slate-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                {notification.message}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {!notification.is_read && (
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-teal-500 rounded-full"></div>
                              )}
                              <span className={`px-1.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] font-medium border ${priorityConfig[notification.priority].badge}`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>

                          {/* Expandable Details - Mobile */}
                          {isExpanded && (
                            <div className="mt-2 pt-2 border-t border-slate-200 space-y-2 animate-in slide-in-from-top-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                  <CategoryIcon className="h-3 w-3" />
                                  {notification.category}
                                </span>
                                <span className="text-[10px] sm:text-[11px] text-slate-400">•</span>
                                <span className="text-[10px] sm:text-[11px] text-slate-500">{getTimeAgo(notification.created_at)}</span>
                              </div>
                              {notification.action_url && (
                                <a
                                  href={notification.action_url}
                                  className="inline-flex items-center gap-1.5 text-[11px] text-teal-700 hover:text-teal-800 font-medium"
                                >
                                  <span>View Details</span>
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Footer Actions - Mobile Optimized */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1">
                                <CategoryIcon className="h-3 w-3" />
                                <span className="hidden sm:inline">{notification.category}</span>
                              </span>
                              <span className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:inline">•</span>
                              <span className="text-[10px] sm:text-[11px] text-slate-500">{getTimeAgo(notification.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-0.5 sm:gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedNotification(isExpanded ? null : notification.id);
                                }}
                                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors sm:hidden"
                                title={isExpanded ? 'Collapse' : 'Expand'}
                              >
                                {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                              </button>
                              {notification.action_url && (
                                <a
                                  href={notification.action_url}
                                  className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                  title="View"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </a>
                              )}
                              {notification.is_read ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsUnread(notification.id);
                                  }}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Mark as unread"
                                >
                                  <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMarkAsRead(notification.id);
                                  }}
                                  className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                              )}
                              {notification.is_archived ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnarchive(notification.id);
                                  }}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Unarchive"
                                >
                                  <ArchiveX className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleArchive(notification.id);
                                  }}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Archive"
                                >
                                  <Archive className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
