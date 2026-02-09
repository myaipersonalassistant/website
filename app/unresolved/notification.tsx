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
  Star
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import Footer from '../components/Footer';

// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Notification {
  id: string;
  user_id: string;
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
  success: { icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
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
  low: { color: 'text-slate-500', badge: 'bg-slate-100 text-slate-700' },
  medium: { color: 'text-blue-500', badge: 'bg-blue-100 text-blue-700' },
  high: { color: 'text-orange-500', badge: 'bg-orange-100 text-orange-700' },
  urgent: { color: 'text-red-500', badge: 'bg-red-100 text-red-700 animate-pulse' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

//   useEffect(() => {
//     fetchNotifications();
//   }, [showArchived]);

  useEffect(() => {
    applyFilters();
  }, [notifications, searchQuery, filterType, filterCategory, showArchived]);

//   const fetchNotifications = async () => {
//     setIsLoading(true);
//     try {
//       const { data: { user } } = await supabase.auth.getUser();

//       if (!user) {
//         setNotifications([]);
//         setIsLoading(false);
//         return;
//       }

//       let query = supabase
//         .from('notifications')
//         .select('*')
//         .eq('user_id', user.id)
//         .order('created_at', { ascending: false });

//       if (!showArchived) {
//         query = query.eq('is_archived', false);
//       }

//       const { data, error } = await query;

//       if (error) throw error;
//       setNotifications(data || []);
//     } catch (error) {
//       console.error('Error fetching notifications:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

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

//   const markAsRead = async (id: string) => {
//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .update({ is_read: true, read_at: new Date().toISOString() })
//         .eq('id', id);

//       if (error) throw error;
//       await fetchNotifications();
//     } catch (error) {
//       console.error('Error marking notification as read:', error);
//     }
//   };

//   const markAsUnread = async (id: string) => {
//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .update({ is_read: false, read_at: null })
//         .eq('id', id);

//       if (error) throw error;
//       await fetchNotifications();
//     } catch (error) {
//       console.error('Error marking notification as unread:', error);
//     }
//   };

//   const archiveNotification = async (id: string) => {
//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .update({ is_archived: true })
//         .eq('id', id);

//       if (error) throw error;
//       await fetchNotifications();
//     } catch (error) {
//       console.error('Error archiving notification:', error);
//     }
//   };

//   const unarchiveNotification = async (id: string) => {
//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .update({ is_archived: false })
//         .eq('id', id);

//       if (error) throw error;
//       await fetchNotifications();
//     } catch (error) {
//       console.error('Error unarchiving notification:', error);
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) return;

//       const { error } = await supabase
//         .from('notifications')
//         .update({ is_read: true, read_at: new Date().toISOString() })
//         .eq('user_id', user.id)
//         .eq('is_read', false);

//       if (error) throw error;
//       await fetchNotifications();
//     } catch (error) {
//       console.error('Error marking all as read:', error);
//     }
//   };

//   const archiveSelected = async () => {
//     try {
//       const { error } = await supabase
//         .from('notifications')
//         .update({ is_archived: true })
//         .in('id', selectedNotifications);

//       if (error) throw error;
//       setSelectedNotifications([]);
//       await fetchNotifications();
//     } catch (error) {
//       console.error('Error archiving selected:', error);
//     }
//   };

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      <Header />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                <Bell className="h-8 w-8 text-teal-600" />
                Notifications
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                Stay updated with your latest activities and alerts
              </p>
            </div>
            <button
            //   onClick={fetchNotifications}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-all font-semibold"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 lg:col-span-3 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Inbox className="h-4 w-4 text-teal-600" />
                  Overview
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-teal-600" />
                      <span className="text-sm font-medium text-slate-700">Total</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600">{notifications.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">Unread</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{unreadCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-700">Archived</span>
                    </div>
                    <span className="text-lg font-bold text-slate-600">{archivedCount}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <Filter className="h-4 w-4 text-teal-600" />
                  Filters
                </h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">Status</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                    >
                      <option value="all">All Notifications</option>
                      <option value="unread">Unread Only</option>
                      <option value="read">Read Only</option>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                      <option value="reminder">Reminder</option>
                      <option value="activity">Activity</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 mb-2 block">Category</label>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                    >
                      <option value="all">All Categories</option>
                      <option value="meeting">Meeting</option>
                      <option value="task">Task</option>
                      <option value="calendar">Calendar</option>
                      <option value="email">Email</option>
                      <option value="briefing">Briefing</option>
                      <option value="general">General</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                      showArchived
                        ? 'bg-teal-50 border-2 border-teal-500 text-teal-700'
                        : 'bg-slate-50 border-2 border-transparent hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      <span className="text-sm font-medium">Show Archived</span>
                    </div>
                    {showArchived && <Check className="h-4 w-4" />}
                  </button>

                  {(filterType !== 'all' || filterCategory !== 'all' || searchQuery) && (
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setFilterCategory('all');
                        setSearchQuery('');
                      }}
                      className="w-full text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h2 className="font-bold text-slate-900 text-sm mb-3">Quick Actions</h2>
                <div className="space-y-2">
                  <button
                    // onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCheck className="h-4 w-4 text-teal-600" />
                    Mark all as read
                  </button>
                  {selectedNotifications.length > 0 && (
                    <button
                    //   onClick={archiveSelected}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                    >
                      <Archive className="h-4 w-4 text-orange-600" />
                      Archive selected ({selectedNotifications.length})
                    </button>
                  )}
                </div>
              </div>
            </aside>

            <div className="col-span-12 lg:col-span-9">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search notifications..."
                        className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none text-sm"
                      />
                    </div>
                    {filteredNotifications.length > 0 && (
                      <button
                        onClick={selectAll}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        {selectedNotifications.length === filteredNotifications.length ? (
                          <>
                            <X className="h-4 w-4" />
                            Deselect All
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Select All
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {isLoading ? (
                    <div className="p-12 text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
                      <p className="text-slate-600 mt-3">Loading notifications...</p>
                    </div>
                  ) : filteredNotifications.length === 0 ? (
                    <div className="p-16 text-center">
                      <Bell className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600 font-medium text-lg">No notifications found</p>
                      <p className="text-sm text-slate-500 mt-2">
                        {searchQuery || filterType !== 'all' || filterCategory !== 'all'
                          ? 'Try adjusting your filters'
                          : "You're all caught up!"}
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((notification) => {
                      const TypeIcon = typeConfig[notification.type].icon;
                      const CategoryIcon = categoryIcons[notification.category];
                      const isSelected = selectedNotifications.includes(notification.id);

                      return (
                        <div
                          key={notification.id}
                          className={`relative group hover:bg-slate-50 transition-colors ${
                            !notification.is_read ? 'bg-teal-50/30' : ''
                          } ${isSelected ? 'bg-teal-100' : ''}`}
                        >
                          <div className="flex items-start gap-4 p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectNotification(notification.id)}
                              className="mt-1 w-4 h-4 text-teal-500 border-slate-300 rounded focus:ring-teal-500"
                            />

                            <div
                              className={`p-3 rounded-lg ${typeConfig[notification.type].bgColor} flex-shrink-0`}
                            >
                              <TypeIcon className={`h-5 w-5 ${typeConfig[notification.type].color}`} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3 mb-1">
                                <h3
                                  className={`font-semibold text-slate-900 ${
                                    !notification.is_read ? 'font-bold' : ''
                                  }`}
                                >
                                  {notification.title}
                                </h3>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${
                                      priorityConfig[notification.priority].badge
                                    }`}
                                  >
                                    {notification.priority}
                                  </span>
                                  <div className="relative">
                                    <button
                                      onClick={() =>
                                        setOpenActionMenu(
                                          openActionMenu === notification.id ? null : notification.id
                                        )
                                      }
                                      className="p-1 hover:bg-slate-200 rounded transition-colors"
                                    >
                                      <MoreVertical className="h-4 w-4 text-slate-400" />
                                    </button>

                                    {openActionMenu === notification.id && (
                                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-10">
                                        {!notification.is_read ? (
                                          <button
                                            // onClick={() => {
                                            //   markAsRead(notification.id);
                                            //   setOpenActionMenu(null);
                                            // }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                          >
                                            <Check className="h-4 w-4 text-green-600" />
                                            Mark as read
                                          </button>
                                        ) : (
                                          <button
                                            // onClick={() => {
                                            //   markAsUnread(notification.id);
                                            //   setOpenActionMenu(null);
                                            // }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                          >
                                            <Mail className="h-4 w-4 text-blue-600" />
                                            Mark as unread
                                          </button>
                                        )}
                                        {!notification.is_archived ? (
                                          <button
                                            // onClick={() => {
                                            //   archiveNotification(notification.id);
                                            //   setOpenActionMenu(null);
                                            // }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                          >
                                            <Archive className="h-4 w-4 text-orange-600" />
                                            Archive
                                          </button>
                                        ) : (
                                          <button
                                            // onClick={() => {
                                            //   unarchiveNotification(notification.id);
                                            //   setOpenActionMenu(null);
                                            // }}
                                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                          >
                                            <ArchiveX className="h-4 w-4 text-teal-600" />
                                            Unarchive
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <p className="text-slate-600 text-sm mb-2">{notification.message}</p>

                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <CategoryIcon className="h-3 w-3" />
                                  <span className="capitalize">{notification.category}</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{getTimeAgo(notification.created_at)}</span>
                                </div>
                                {notification.action_url && (
                                  <>
                                    <span>•</span>
                                    <a
                                      href={notification.action_url}
                                      className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                      View details
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>

                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}