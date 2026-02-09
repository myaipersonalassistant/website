'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  X,
  Archive,
  Trash2,
  Filter,
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
  MoreVertical,
  RefreshCw,
  CheckCheck,
  ArchiveX,
  Inbox,
  Star,
  Sparkles,
  Brain
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DashboardSidebar from '@/app/components/DashboardSidebar';

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

export default function NotificationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      fetchUserData();
      fetchNotifications();
    }
  }, [user, authLoading, showArchived]);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchQuery, filterType, filterCategory, showArchived]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.fullName || userData.onboardingData?.userName || user.displayName || 'User');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual Firebase queries later
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New Email Insights Available',
          message: 'AI extracted 3 items from your recent emails: 2 events and 1 task',
          type: 'activity',
          category: 'email',
          priority: 'medium',
          is_read: false,
          is_archived: false,
          action_url: '/email-insights',
          created_at: new Date(Date.now() - 300000).toISOString(),
        },
        {
          id: '2',
          title: 'Meeting Reminder',
          message: 'Quarterly Review Meeting starts in 1 hour at Conference Room B',
          type: 'reminder',
          category: 'meeting',
          priority: 'high',
          is_read: false,
          is_archived: false,
          action_url: '/calendar',
          created_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '3',
          title: 'Task Completed',
          message: 'You completed "Review investment proposal"',
          type: 'success',
          category: 'task',
          priority: 'low',
          is_read: true,
          is_archived: false,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          read_at: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: '4',
          title: 'Flight Check-in Available',
          message: 'Online check-in for your flight to San Francisco is now open',
          type: 'info',
          category: 'flight',
          priority: 'urgent',
          is_read: false,
          is_archived: false,
          action_url: '/calendar',
          created_at: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: '5',
          title: 'System Update',
          message: 'New features have been added to your calendar. Check them out!',
          type: 'system',
          category: 'system',
          priority: 'low',
          is_read: true,
          is_archived: false,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          read_at: new Date(Date.now() - 86000000).toISOString(),
        },
        {
          id: '6',
          title: 'Upcoming Deadline',
          message: 'Task "Send financial projections" is due tomorrow',
          type: 'warning',
          category: 'task',
          priority: 'high',
          is_read: false,
          is_archived: false,
          action_url: '/calendar',
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ];

      let filtered = mockNotifications;
      if (!showArchived) {
        filtered = filtered.filter(n => !n.is_archived);
      }
      setNotifications(filtered);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const markAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
    );
    // TODO: Implement actual Firebase update
  };

  const markAsUnread = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: false, read_at: undefined } : n)
    );
    // TODO: Implement actual Firebase update
  };

  const archiveNotification = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_archived: true } : n)
    );
    // TODO: Implement actual Firebase update
  };

  const unarchiveNotification = async (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_archived: false } : n)
    );
    // TODO: Implement actual Firebase update
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true, read_at: n.read_at || new Date().toISOString() }))
    );
    // TODO: Implement actual Firebase update
  };

  const archiveSelected = async () => {
    setNotifications(prev =>
      prev.map(n => selectedNotifications.includes(n.id) ? { ...n, is_archived: true } : n)
    );
    setSelectedNotifications([]);
    // TODO: Implement actual Firebase update
  };

  const deleteSelected = async () => {
    setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    // TODO: Implement actual Firebase update
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xs text-slate-600">Loading notifications...</p>
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
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Notifications</h1>
                  <p className="text-xs sm:text-sm text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Stay updated with your activities
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchNotifications}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Refresh</span>
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold"
                  >
                    <CheckCheck className="h-4 w-4" />
                    <span className="text-xs sm:text-sm">Mark All Read</span>
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Inbox className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Total</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{notifications.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Unread</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{unreadCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Read</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{notifications.length - unreadCount}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Archive className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Archived</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{archivedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowArchived(!showArchived)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    showArchived
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {showArchived ? <ArchiveX className="h-3.5 w-3.5 inline mr-1.5" /> : <Archive className="h-3.5 w-3.5 inline mr-1.5" />}
                  {showArchived ? 'Hide Archived' : 'Show Archived'}
                </button>
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === 'all'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterType('unread')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === 'unread'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unread
                  </button>
                  <button
                    onClick={() => setFilterType('read')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterType === 'read'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Read
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-teal-50 border-b border-teal-200 px-4 sm:px-6 lg:px-8 py-3 flex-shrink-0">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <span className="text-xs font-semibold text-teal-700">
                {selectedNotifications.length} notification{selectedNotifications.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={archiveSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-teal-200 text-teal-700 rounded-lg hover:bg-teal-50 transition-all text-xs font-medium"
                >
                  <Archive className="h-3.5 w-3.5" />
                  Archive
                </button>
                <button
                  onClick={deleteSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-all text-xs font-medium"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedNotifications([])}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-900 text-xs font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                  <Bell className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">No notifications found</h3>
                <p className="text-xs text-slate-600">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <>
                {/* Select All */}
                <div className="flex items-center justify-between mb-2 px-2">
                  <button
                    onClick={selectAll}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    {selectedNotifications.length === filteredNotifications.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {filteredNotifications.map((notification) => {
                  const TypeIcon = typeConfig[notification.type].icon;
                  const CategoryIcon = categoryIcons[notification.category];
                  const isSelected = selectedNotifications.includes(notification.id);

                  return (
                    <div
                      key={notification.id}
                      className={`bg-white border-2 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all ${
                        notification.is_read
                          ? typeConfig[notification.type].borderColor
                          : 'border-teal-300 bg-gradient-to-br from-teal-50/50 to-white'
                      } ${isSelected ? 'ring-2 ring-teal-500' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <button
                          onClick={() => toggleSelectNotification(notification.id)}
                          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                            isSelected
                              ? 'bg-teal-500 border-teal-500'
                              : 'border-slate-300 hover:border-teal-400'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 text-white" />}
                        </button>

                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${typeConfig[notification.type].bgColor}`}>
                          <TypeIcon className={`h-5 w-5 ${typeConfig[notification.type].color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className={`text-sm sm:text-base font-bold mb-1 ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                                {notification.title}
                              </h3>
                              <p className="text-xs text-slate-600 line-clamp-2">{notification.message}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              )}
                              <span className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border ${priorityConfig[notification.priority].badge}`}>
                                {notification.priority}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <CategoryIcon className="h-3 w-3" />
                                {notification.category}
                              </span>
                              <span className="text-[11px] text-slate-400">•</span>
                              <span className="text-[11px] text-slate-500">{getTimeAgo(notification.created_at)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {notification.action_url && (
                                <a
                                  href={notification.action_url}
                                  className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                  title="View"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                              {notification.is_read ? (
                                <button
                                  onClick={() => markAsUnread(notification.id)}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Mark as unread"
                                >
                                  <Bell className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </button>
                              )}
                              {notification.is_archived ? (
                                <button
                                  onClick={() => unarchiveNotification(notification.id)}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Unarchive"
                                >
                                  <ArchiveX className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => archiveNotification(notification.id)}
                                  className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Archive"
                                >
                                  <Archive className="h-4 w-4" />
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

