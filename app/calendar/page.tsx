'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  CheckSquare,
  Bell,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Filter,
  RefreshCw,
  ArrowRight,
  Edit,
  Trash2,
  X,
  Brain
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DashboardSidebar from '@/app/components/DashboardSidebar';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  source: 'manual' | 'email';
  email_id?: string;
  created_at: string;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  remind_at: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  source: 'manual' | 'email';
  email_id?: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  source: 'manual' | 'email';
  email_id?: string;
  created_at: string;
}

interface EmailInsight {
  id: string;
  email_id: string;
  subject: string;
  from_name: string;
  from_email: string;
  received_at: string;
  items_count: number;
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emailInsights, setEmailInsights] = useState<EmailInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [activeFilter, setActiveFilter] = useState<'all' | 'events' | 'reminders' | 'tasks' | 'emails'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      fetchUserData();
      fetchCalendarData();
    }
  }, [user, authLoading, selectedDate]);

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

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual Firebase queries later
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      
      // Mock events
      const mockEvents: CalendarEvent[] = [
        {
          id: 'e1',
          title: 'Quarterly Review Meeting',
          description: 'Team meeting to discuss Q4 progress and reports',
          start_time: new Date(selectedDate.getTime() + 14 * 3600000).toISOString(), // 2 PM
          end_time: new Date(selectedDate.getTime() + 15 * 3600000).toISOString(), // 3 PM
          location: 'Conference Room B',
          status: 'approved',
          source: 'email',
          email_id: '1',
          created_at: new Date().toISOString(),
        },
        {
          id: 'e2',
          title: 'Flight to San Francisco',
          description: 'Flight FH123 - JFK to SFO',
          start_time: new Date(selectedDate.getTime() + 8 * 3600000).toISOString(), // 8 AM
          end_time: new Date(selectedDate.getTime() + 11.5 * 3600000).toISOString(), // 11:30 AM
          location: 'JFK Airport',
          status: 'approved',
          source: 'email',
          email_id: '2',
          created_at: new Date().toISOString(),
        },
      ];

      // Mock reminders
      const mockReminders: Reminder[] = [
        {
          id: 'r1',
          title: 'Bring Q4 Reports',
          description: 'Prepare and bring Q4 reports for the meeting',
          remind_at: new Date(selectedDate.getTime() + 12 * 3600000).toISOString(), // 12 PM
          status: 'approved',
          source: 'email',
          email_id: '1',
          created_at: new Date().toISOString(),
        },
        {
          id: 'r2',
          title: 'Check in for flight',
          description: 'Online check-in opens 24 hours before flight',
          remind_at: new Date(selectedDate.getTime() - 86400000).toISOString(),
          status: 'approved',
          source: 'email',
          email_id: '2',
          created_at: new Date().toISOString(),
        },
      ];

      // Mock tasks
      const mockTasks: Task[] = [
        {
          id: 't1',
          title: 'Review investment proposal',
          description: 'Review and provide feedback on the investment proposal',
          due_date: new Date(selectedDate.getTime() + 3 * 86400000).toISOString(),
          priority: 'high',
          status: 'pending',
          source: 'email',
          email_id: '3',
          created_at: new Date().toISOString(),
        },
        {
          id: 't2',
          title: 'Arrive at airport 2 hours early',
          description: 'Be at JFK by 6:00 AM',
          due_date: selectedDate.toISOString(),
          priority: 'high',
          status: 'pending',
          source: 'email',
          email_id: '2',
          created_at: new Date().toISOString(),
        },
      ];

      // Mock email insights
      const mockEmailInsights: EmailInsight[] = [
        {
          id: 'ei1',
          email_id: '1',
          subject: 'Team Meeting Tomorrow at 2 PM',
          from_name: 'Sarah Johnson',
          from_email: 'sarah.j@company.com',
          received_at: new Date(Date.now() - 86400000).toISOString(),
          items_count: 2,
        },
        {
          id: 'ei2',
          email_id: '2',
          subject: 'Flight Confirmation - NY to SF',
          from_name: 'FlyHigh Airlines',
          from_email: 'booking@airline.com',
          received_at: new Date(Date.now() - 3600000).toISOString(),
          items_count: 3,
        },
      ];

      setEvents(mockEvents);
      setReminders(mockReminders);
      setTasks(mockTasks);
      setEmailInsights(mockEmailInsights);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => {
    return isSameDate(date, new Date());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getActivitiesForDate = (date: Date | null) => {
    if (!date) return { events: 0, reminders: 0, tasks: 0 };
    const dateStr = date.toISOString().split('T')[0];
    
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
    
    const dayReminders = reminders.filter(r => {
      const reminderDate = new Date(r.remind_at).toISOString().split('T')[0];
      return reminderDate === dateStr;
    });
    
    const dayTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });

    return {
      events: dayEvents.length,
      reminders: dayReminders.length,
      tasks: dayTasks.length,
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 1 && days < 7) return `In ${days} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'normal':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getSelectedDateItems = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.start_time).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
    
    const dayReminders = reminders.filter(r => {
      const reminderDate = new Date(r.remind_at).toISOString().split('T')[0];
      return reminderDate === dateStr;
    });
    
    const dayTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      const taskDate = new Date(t.due_date).toISOString().split('T')[0];
      return taskDate === dateStr;
    });

    return { events: dayEvents, reminders: dayReminders, tasks: dayTasks };
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xs text-slate-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  const selectedDateItems = getSelectedDateItems();
  const totalItems = selectedDateItems.events.length + selectedDateItems.reminders.length + selectedDateItems.tasks.length;

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
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Calendar</h1>
                  <p className="text-xs sm:text-sm text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Your schedule at a glance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchCalendarData}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-xs sm:text-sm font-semibold hidden sm:inline">Refresh</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold">
                  <Plus className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">New Activity</span>
                </button>
              </div>
            </div>

            {/* Selected Date Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/80 mb-1">Selected Date</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/80 mb-1">Activities</p>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl sm:text-3xl font-bold text-white">{totalItems}</div>
                    <div className="flex flex-col gap-0.5">
                      {selectedDateItems.events.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      )}
                      {selectedDateItems.reminders.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      )}
                      {selectedDateItems.tasks.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Calendar Grid */}
          <div className="w-full lg:w-96 xl:w-[28rem] bg-white border-r border-slate-200 flex flex-col overflow-hidden flex-shrink-0">
            {/* Month Navigation */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600" />
                </button>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-[11px] font-semibold text-slate-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square"></div>;
                  }

                  const activities = getActivitiesForDate(date);
                  const isSelected = isSameDate(date, selectedDate);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`aspect-square p-1.5 sm:p-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold shadow-lg scale-105'
                          : isTodayDate
                          ? 'bg-teal-50 border-2 border-teal-500 text-teal-700 font-bold hover:bg-teal-100'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:border-teal-300 border border-transparent'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-xs sm:text-sm font-medium">{date.getDate()}</span>
                        {!isSelected && (activities.events > 0 || activities.reminders > 0 || activities.tasks > 0) && (
                          <div className="flex gap-0.5 mt-1">
                            {activities.events > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            )}
                            {activities.reminders > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            )}
                            {activities.tasks > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activities Panel */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Filter Tabs */}
            <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex-shrink-0">
              <div className="flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'all'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({totalItems})
                </button>
                <button
                  onClick={() => setActiveFilter('events')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'events'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CalendarIcon className="h-3.5 w-3.5 inline mr-1.5" />
                  Events ({selectedDateItems.events.length})
                </button>
                <button
                  onClick={() => setActiveFilter('reminders')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'reminders'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Bell className="h-3.5 w-3.5 inline mr-1.5" />
                  Reminders ({selectedDateItems.reminders.length})
                </button>
                <button
                  onClick={() => setActiveFilter('tasks')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'tasks'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckSquare className="h-3.5 w-3.5 inline mr-1.5" />
                  Tasks ({selectedDateItems.tasks.length})
                </button>
                <button
                  onClick={() => setActiveFilter('emails')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'emails'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Mail className="h-3.5 w-3.5 inline mr-1.5" />
                  Email Insights ({emailInsights.length})
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="max-w-4xl mx-auto space-y-4">
                {/* Events */}
                {(activeFilter === 'all' || activeFilter === 'events') &&
                  selectedDateItems.events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white border-2 border-blue-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">{event.title}</h3>
                            {event.source === 'email' && (
                              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[11px] font-medium border border-teal-200 flex items-center gap-1 flex-shrink-0">
                                <Mail className="h-3 w-3" />
                                From Email
                              </span>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-xs text-slate-600 mb-3">{event.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                              <Clock className="h-3 w-3" />
                              {formatTime(event.start_time)}
                              {event.end_time && ` - ${formatTime(event.end_time)}`}
                            </span>
                            {event.location && (
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Reminders */}
                {(activeFilter === 'all' || activeFilter === 'reminders') &&
                  selectedDateItems.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="bg-white border-2 border-purple-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
                          <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">{reminder.title}</h3>
                            {reminder.source === 'email' && (
                              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[11px] font-medium border border-teal-200 flex items-center gap-1 flex-shrink-0">
                                <Mail className="h-3 w-3" />
                                From Email
                              </span>
                            )}
                          </div>
                          {reminder.description && (
                            <p className="text-xs text-slate-600 mb-3">{reminder.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                              <Clock className="h-3 w-3" />
                              {formatTime(reminder.remind_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Tasks */}
                {(activeFilter === 'all' || activeFilter === 'tasks') &&
                  selectedDateItems.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border-2 border-emerald-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
                          <CheckSquare className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">{task.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {task.source === 'email' && (
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[11px] font-medium border border-teal-200 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  From Email
                                </span>
                              )}
                              {task.priority && (
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              )}
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-600 mb-3">{task.description}</p>
                          )}
                          {task.due_date && (
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                <Clock className="h-3 w-3" />
                                Due: {formatDate(task.due_date)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Email Insights */}
                {(activeFilter === 'all' || activeFilter === 'emails') &&
                  emailInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex-shrink-0 shadow-md">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">{insight.subject}</h3>
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-lg text-[11px] font-semibold border border-teal-200 flex items-center gap-1 flex-shrink-0">
                              <Brain className="h-3 w-3" />
                              {insight.items_count} items
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                            <span className="font-medium">{insight.from_name}</span>
                            <span className="text-slate-400">•</span>
                            <span>{insight.from_email}</span>
                          </div>
                          <button className="text-xs text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1">
                            View in Email Insights
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Empty State */}
                {totalItems === 0 && activeFilter === 'all' && (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                      <CalendarIcon className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">No activities for this date</h3>
                    <p className="text-xs text-slate-600 mb-4">Select another date or create a new event</p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
                      <Plus className="h-4 w-4" />
                      Create Event
                    </button>
                  </div>
                )}

                {activeFilter !== 'all' &&
                  ((activeFilter === 'events' && selectedDateItems.events.length === 0) ||
                    (activeFilter === 'reminders' && selectedDateItems.reminders.length === 0) ||
                    (activeFilter === 'tasks' && selectedDateItems.tasks.length === 0) ||
                    (activeFilter === 'emails' && emailInsights.length === 0)) && (
                    <div className="text-center py-12 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                      <p className="text-xs text-slate-500">No {activeFilter} for this date</p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

