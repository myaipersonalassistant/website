'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Calendar,
  Bell,
  CheckSquare,
  TrendingUp,
  Clock,
  Sparkles,
  Check,
  X,
  ChevronRight,
  Eye,
  Filter,
  BarChart3,
  Zap,
  AlertCircle,
  CheckCircle2,
  Brain,
  Inbox,
  ArrowRight,
  MapPin,
  Tag,
  FileText,
  XCircle,
  RefreshCw,
  ChevronDown,
  Layers,
  Search,
  MoreVertical,
  Star,
  Archive,
  Trash2,
  User
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DashboardSidebar from '@/app/components/DashboardSidebar';

interface Email {
  id: string;
  from_email: string;
  from_name: string;
  subject: string;
  preview: string;
  content: string;
  received_at: string;
  processed: boolean;
  created_at: string;
}

interface ExtractedEvent {
  id: string;
  email_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location?: string;
  status: 'pending' | 'approved' | 'rejected' | 'created';
  confidence_score: number;
  created_at: string;
}

interface ExtractedReminder {
  id: string;
  email_id: string;
  title: string;
  description: string;
  remind_at: string;
  status: 'pending' | 'approved' | 'rejected' | 'created';
  confidence_score: number;
  created_at: string;
}

interface ExtractedTodo {
  id: string;
  email_id: string;
  title: string;
  description: string;
  due_date?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'created';
  confidence_score: number;
  created_at: string;
}

interface EmailWithExtractions extends Email {
  events: ExtractedEvent[];
  reminders: ExtractedReminder[];
  todos: ExtractedTodo[];
}

export default function EmailInsightsPage() {
  const { user, loading: authLoading } = useAuth();
  const [emails, setEmails] = useState<EmailWithExtractions[]>([]);
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'reminders' | 'todos'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      fetchUserData();
      fetchEmailData();
    }
  }, [user, authLoading]);

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

  const fetchEmailData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual Firebase queries later
      const mockEmails: EmailWithExtractions[] = [
        {
          id: '1',
          from_email: 'sarah.j@company.com',
          from_name: 'Sarah Johnson',
          subject: 'Team Meeting Tomorrow at 2 PM',
          preview: 'Hi team, just a reminder about our quarterly review meeting tomorrow at 2 PM in Conference Room B...',
          content: 'Hi team, just a reminder about our quarterly review meeting tomorrow at 2 PM in Conference Room B. Please bring your Q4 reports and be prepared to discuss your progress. Looking forward to seeing everyone there!',
          received_at: new Date().toISOString(),
          processed: true,
          created_at: new Date().toISOString(),
          events: [
            {
              id: 'e1',
              email_id: '1',
              title: 'Quarterly Review Meeting',
              description: 'Team meeting to discuss Q4 progress and reports',
              start_time: new Date(Date.now() + 86400000).toISOString(),
              end_time: new Date(Date.now() + 90000000).toISOString(),
              location: 'Conference Room B',
              status: 'pending',
              confidence_score: 0.95,
              created_at: new Date().toISOString(),
            }
          ],
          reminders: [
            {
              id: 'r1',
              email_id: '1',
              title: 'Bring Q4 Reports',
              description: 'Prepare and bring Q4 reports for the meeting',
              remind_at: new Date(Date.now() + 72000000).toISOString(),
              status: 'pending',
              confidence_score: 0.88,
              created_at: new Date().toISOString(),
            }
          ],
          todos: []
        },
        {
          id: '2',
          from_email: 'booking@airline.com',
          from_name: 'FlyHigh Airlines',
          subject: 'Flight Confirmation - NY to SF on Dec 30',
          preview: 'Your flight has been confirmed. Flight FH123 departing JFK at 8:00 AM, arriving SFO at 11:30 AM...',
          content: 'Your flight has been confirmed. Flight FH123 departing JFK at 8:00 AM, arriving SFO at 11:30 AM. Please arrive at least 2 hours before departure. Check-in opens 24 hours before your flight.',
          received_at: new Date(Date.now() - 3600000).toISOString(),
          processed: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          events: [
            {
              id: 'e2',
              email_id: '2',
              title: 'Flight to San Francisco',
              description: 'Flight FH123 - JFK to SFO',
              start_time: new Date(Date.now() + 172800000).toISOString(),
              end_time: new Date(Date.now() + 185400000).toISOString(),
              location: 'JFK Airport',
              status: 'pending',
              confidence_score: 0.98,
              created_at: new Date().toISOString(),
            }
          ],
          reminders: [
            {
              id: 'r2',
              email_id: '2',
              title: 'Check in for flight',
              description: 'Online check-in opens 24 hours before flight',
              remind_at: new Date(Date.now() + 86400000).toISOString(),
              status: 'pending',
              confidence_score: 0.92,
              created_at: new Date().toISOString(),
            }
          ],
          todos: [
            {
              id: 't1',
              email_id: '2',
              title: 'Arrive at airport 2 hours early',
              description: 'Be at JFK by 6:00 AM',
              due_date: new Date(Date.now() + 172800000).toISOString(),
              priority: 'high',
              status: 'pending',
              confidence_score: 0.85,
              created_at: new Date().toISOString(),
            }
          ]
        },
        {
          id: '3',
          from_email: 'michael.chen@startup.io',
          from_name: 'Michael Chen',
          subject: 'Action Items from Yesterday\'s Call',
          preview: 'Thanks for the great discussion yesterday. Here are the action items we agreed on...',
          content: 'Thanks for the great discussion yesterday. Here are the action items we agreed on: 1) Review the investment proposal by Friday, 2) Schedule a follow-up call next week, 3) Send over the financial projections. Let me know if I missed anything!',
          received_at: new Date(Date.now() - 7200000).toISOString(),
          processed: true,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          events: [],
          reminders: [],
          todos: [
            {
              id: 't2',
              email_id: '3',
              title: 'Review investment proposal',
              description: 'Review and provide feedback on the investment proposal',
              due_date: new Date(Date.now() + 259200000).toISOString(),
              priority: 'high',
              status: 'pending',
              confidence_score: 0.94,
              created_at: new Date().toISOString(),
            },
            {
              id: 't3',
              email_id: '3',
              title: 'Schedule follow-up call',
              description: 'Set up a follow-up call for next week',
              priority: 'normal',
              status: 'pending',
              confidence_score: 0.89,
              created_at: new Date().toISOString(),
            },
            {
              id: 't4',
              email_id: '3',
              title: 'Send financial projections',
              description: 'Send over the financial projections to Michael',
              priority: 'high',
              status: 'pending',
              confidence_score: 0.91,
              created_at: new Date().toISOString(),
            }
          ]
        }
      ];

      setEmails(mockEmails);
      // Auto-expand first email
      if (mockEmails.length > 0) {
        setExpandedEmails(new Set([mockEmails[0].id]));
      }
    } catch (error) {
      console.error('Error fetching email data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    totalEmails: emails.length,
    processedEmails: emails.filter(e => e.processed).length,
    pendingEvents: emails.flatMap(e => e.events).filter(e => e.status === 'pending').length,
    pendingReminders: emails.flatMap(e => e.reminders).filter(r => r.status === 'pending').length,
    pendingTodos: emails.flatMap(e => e.todos).filter(t => t.status === 'pending').length,
  };

  const handleApprove = async (type: 'event' | 'reminder' | 'todo', id: string) => {
    console.log(`Approving ${type} ${id}`);
    // TODO: Implement actual approval logic
  };

  const handleReject = async (type: 'event' | 'reminder' | 'todo', id: string) => {
    console.log(`Rejecting ${type} ${id}`);
    // TODO: Implement actual rejection logic
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (score >= 0.75) return 'text-cyan-700 bg-cyan-50 border-cyan-200';
    return 'text-slate-700 bg-slate-100 border-slate-300';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.9) return 'High';
    if (score >= 0.75) return 'Medium';
    return 'Low';
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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

  const filteredEmails = emails.filter(email => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(query) ||
        email.from_name.toLowerCase().includes(query) ||
        email.from_email.toLowerCase().includes(query) ||
        email.preview.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getFilteredItemsForEmail = (email: EmailWithExtractions) => {
    let items: Array<{ type: 'event' | 'reminder' | 'todo'; data: ExtractedEvent | ExtractedReminder | ExtractedTodo }> = [];

    if (activeTab === 'all' || activeTab === 'events') {
      email.events.forEach(event => {
        if (statusFilter === 'all' || event.status === statusFilter) {
          items.push({ type: 'event', data: event });
        }
      });
    }
    if (activeTab === 'all' || activeTab === 'reminders') {
      email.reminders.forEach(reminder => {
        if (statusFilter === 'all' || reminder.status === statusFilter) {
          items.push({ type: 'reminder', data: reminder });
        }
      });
    }
    if (activeTab === 'all' || activeTab === 'todos') {
      email.todos.forEach(todo => {
        if (statusFilter === 'all' || todo.status === statusFilter) {
          items.push({ type: 'todo', data: todo });
        }
      });
    }

    return items;
  };

  const toggleEmailExpansion = (emailId: string) => {
    const newExpanded = new Set(expandedEmails);
    if (newExpanded.has(emailId)) {
      newExpanded.delete(emailId);
    } else {
      newExpanded.add(emailId);
    }
    setExpandedEmails(newExpanded);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xs text-slate-600">Loading email insights...</p>
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
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Email Insights</h1>
                  <p className="text-xs sm:text-sm text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI-powered email intelligence
                  </p>
                </div>
              </div>
              <button
                onClick={fetchEmailData}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="text-xs sm:text-sm font-semibold">Refresh</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Mail className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Total</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalEmails}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Events</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.pendingEvents}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Reminders</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.pendingReminders}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckSquare className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Tasks</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.pendingTodos}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 hidden lg:block">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-white/80" />
                  <p className="text-[11px] text-white/80">Processed</p>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-white">{stats.processedEmails}</p>
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
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Tabs and Status Filters */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Type Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'all'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'events'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Events
                  </button>
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'reminders'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Reminders
                  </button>
                  <button
                    onClick={() => setActiveTab('todos')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeTab === 'todos'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tasks
                  </button>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'pending'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter('approved')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'approved'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === 'all'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8 min-h-0">
          <div className="max-w-7xl mx-auto space-y-4">
            {filteredEmails.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                  <Inbox className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">No emails found</h3>
                <p className="text-xs text-slate-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredEmails.map((email) => {
                const extractedItems = getFilteredItemsForEmail(email);
                const totalItems = email.events.length + email.reminders.length + email.todos.length;
                const isExpanded = expandedEmails.has(email.id);
                const hasFilteredItems = extractedItems.length > 0;

                if (!hasFilteredItems && statusFilter !== 'all') {
                  return null;
                }

                return (
                  <div
                    key={email.id}
                    className="bg-white border-2 border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Email Header */}
                    <button
                      onClick={() => toggleEmailExpansion(email.id)}
                      className="w-full text-left p-4 sm:p-6 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                                {email.subject}
                              </h3>
                              {totalItems > 0 && (
                                <div className="flex-shrink-0 px-2.5 py-1 bg-teal-100 text-teal-700 rounded-lg text-[11px] font-semibold">
                                  {totalItems}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                              <span className="font-medium">{email.from_name}</span>
                              <span className="text-slate-400">•</span>
                              <span className="truncate">{email.from_email}</span>
                              <span className="text-slate-400">•</span>
                              <span>
                                {new Date(email.received_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">{email.preview}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {email.processed && (
                            <span className="text-[11px] text-emerald-600 flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3" />
                              Processed
                            </span>
                          )}
                          <ChevronDown
                            className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </button>

                    {/* Extracted Items */}
                    {isExpanded && (
                      <div className="border-t border-slate-200 bg-slate-50/50">
                        {extractedItems.length === 0 ? (
                          <div className="p-6 text-center">
                            <p className="text-xs text-slate-500">No items match the current filters</p>
                          </div>
                        ) : (
                          <div className="p-4 sm:p-6 space-y-4">
                            {extractedItems.map((item) => {
                              const confidence = 'confidence_score' in item.data ? item.data.confidence_score : 0;
                              return (
                                <div
                                  key={`${item.type}-${item.data.id}`}
                                  className="bg-white border-2 border-slate-200 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all"
                                >
                                  <div className="flex items-start gap-3 mb-3">
                                    <div
                                      className={`p-2.5 rounded-xl flex-shrink-0 ${
                                        item.type === 'event'
                                          ? 'bg-blue-100'
                                          : item.type === 'reminder'
                                          ? 'bg-purple-100'
                                          : 'bg-emerald-100'
                                      }`}
                                    >
                                      {item.type === 'event' && <Calendar className="h-5 w-5 text-blue-600" />}
                                      {item.type === 'reminder' && <Bell className="h-5 w-5 text-purple-600" />}
                                      {item.type === 'todo' && <CheckSquare className="h-5 w-5 text-emerald-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                                          {'title' in item.data ? item.data.title : ''}
                                        </h4>
                                        <span
                                          className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border flex-shrink-0 ${getConfidenceColor(
                                            confidence
                                          )}`}
                                        >
                                          {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
                                        </span>
                                      </div>
                                      {'description' in item.data && (
                                        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
                                          {item.data.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {item.type === 'event' && 'start_time' in item.data && (
                                          <>
                                            <span className="text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                              <Clock className="h-3 w-3" />
                                              {formatDate(item.data.start_time)} at {formatTime(item.data.start_time)}
                                            </span>
                                            {'location' in item.data && item.data.location && (
                                              <span className="text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                                <MapPin className="h-3 w-3" />
                                                {item.data.location}
                                              </span>
                                            )}
                                          </>
                                        )}
                                        {item.type === 'reminder' && 'remind_at' in item.data && (
                                          <span className="text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(item.data.remind_at)} at {formatTime(item.data.remind_at)}
                                          </span>
                                        )}
                                        {item.type === 'todo' && 'due_date' in item.data && item.data.due_date && (
                                          <span className="text-[11px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                            <Clock className="h-3 w-3" />
                                            Due: {formatDate(item.data.due_date)}
                                          </span>
                                        )}
                                        {item.type === 'todo' && 'priority' in item.data && (
                                          <span
                                            className={`px-2 py-0.5 rounded-lg text-[11px] font-medium border ${getPriorityColor(
                                              item.data.priority
                                            )}`}
                                          >
                                            {item.data.priority}
                                          </span>
                                        )}
                                      </div>
                                      {item.data.status === 'pending' && (
                                        <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApprove(item.type, item.data.id);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                                          >
                                            <Check className="h-4 w-4" />
                                            Approve
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleReject(item.type, item.data.id);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-slate-200 hover:border-red-300 text-slate-700 hover:text-red-600 rounded-xl text-xs font-semibold transition-all active:scale-95"
                                          >
                                            <X className="h-4 w-4" />
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                      {item.data.status === 'approved' && (
                                        <div className="pt-3 border-t border-slate-200">
                                          <div className="flex items-center gap-2 text-emerald-600 text-xs">
                                            <CheckCircle2 className="h-4 w-4" />
                                            <span className="font-medium">Approved and added to your calendar/tasks</span>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
