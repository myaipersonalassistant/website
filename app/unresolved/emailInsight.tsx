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
  Layers
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import Footer from '../components/Footer';

// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );

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

const EmailInsightsPage: React.FC = () => {
  const [emails, setEmails] = useState<EmailWithExtractions[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<EmailWithExtractions | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'events' | 'reminders' | 'todos'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('pending');
  const [loading, setLoading] = useState(true);
  const [processingEmail, setProcessingEmail] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  useEffect(() => {
    setEmails(mockEmails);
    setLoading(false);
  }, []);

  const stats = {
    totalEmails: emails.length,
    processedEmails: emails.filter(e => e.processed).length,
    pendingEvents: emails.flatMap(e => e.events).filter(e => e.status === 'pending').length,
    pendingReminders: emails.flatMap(e => e.reminders).filter(r => r.status === 'pending').length,
    pendingTodos: emails.flatMap(e => e.todos).filter(t => t.status === 'pending').length,
  };

  const handleApprove = async (type: 'event' | 'reminder' | 'todo', id: string) => {
    console.log(`Approving ${type} ${id}`);
  };

  const handleReject = async (type: 'event' | 'reminder' | 'todo', id: string) => {
    console.log(`Rejecting ${type} ${id}`);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (score >= 0.75) return 'text-cyan-700 bg-cyan-50 border-cyan-200';
    return 'text-slate-700 bg-slate-100 border-slate-300';
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.9) return 'High Confidence';
    if (score >= 0.75) return 'Medium Confidence';
    return 'Low Confidence';
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
    return new Date(dateString).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl h-[calc(100vh-104px)] sticky top-[104px]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-teal-500 to-cyan-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <Brain className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Email Insights</h1>
              </div>
            </div>
            <p className="text-teal-50 text-sm flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" />
              AI-powered email intelligence
            </p>
          </div>
        </div>

        {/* Overview Expandable */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-br from-slate-50 to-white">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-teal-300 transition-all shadow-sm hover:shadow-md group mb-3"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg shadow-teal-200">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overview</p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {stats.pendingEvents + stats.pendingReminders + stats.pendingTodos} total items
                </p>
              </div>
            </div>
            <ChevronDown className={`h-5 w-5 text-slate-400 group-hover:text-teal-600 transition-all duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="space-y-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                onClick={() => setActiveTab('all')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
                  activeTab === 'all'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'all' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    <Sparkles className={`h-4 w-4 ${activeTab === 'all' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <span className="text-sm font-medium">All Insights</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  activeTab === 'all' ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                }`}>
                  {stats.pendingEvents + stats.pendingReminders + stats.pendingTodos}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('events')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
                  activeTab === 'events'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'events' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    <Calendar className={`h-4 w-4 ${activeTab === 'events' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <span className="text-sm font-medium">Events</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  activeTab === 'events' ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                }`}>
                  {stats.pendingEvents}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('reminders')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
                  activeTab === 'reminders'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'reminders' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    <Bell className={`h-4 w-4 ${activeTab === 'reminders' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <span className="text-sm font-medium">Reminders</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  activeTab === 'reminders' ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                }`}>
                  {stats.pendingReminders}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('todos')}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all ${
                  activeTab === 'todos'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${activeTab === 'todos' ? 'bg-white/20' : 'bg-slate-100'}`}>
                    <CheckSquare className={`h-4 w-4 ${activeTab === 'todos' ? 'text-white' : 'text-slate-600'}`} />
                  </div>
                  <span className="text-sm font-medium">Action Items</span>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  activeTab === 'todos' ? 'bg-white/20' : 'bg-slate-200 text-slate-600'
                }`}>
                  {stats.pendingTodos}
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Analytics */}
        <div className="p-6 flex-1">
          <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-teal-50 rounded-xl p-4 border border-teal-100 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg shadow-teal-200">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">Analytics</h4>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Emails Processed</span>
                <span className="text-sm font-bold text-teal-700">{stats.processedEmails}</span>
              </div>
              <div className="w-full bg-white rounded-full h-1.5 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 h-full rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="px-8 py-6 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {activeTab === 'all' && 'All Insights'}
                {activeTab === 'events' && 'Extracted Events'}
                {activeTab === 'reminders' && 'Extracted Reminders'}
                {activeTab === 'todos' && 'Action Items'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Review and approve AI-extracted items from your emails
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl font-medium">
              <RefreshCw className="h-4 w-4" />
              Scan New Emails
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {emails.map((email) => {
              const hasEvents = email.events.length > 0 && (activeTab === 'all' || activeTab === 'events');
              const hasReminders = email.reminders.length > 0 && (activeTab === 'all' || activeTab === 'reminders');
              const hasTodos = email.todos.length > 0 && (activeTab === 'all' || activeTab === 'todos');

              if (!hasEvents && !hasReminders && !hasTodos) return null;

              return (
                <div key={email.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  {/* Email Header */}
                  <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200">
                          <Mail className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">{email.subject}</h3>
                        <div className="flex items-center gap-3 text-sm text-slate-600">
                          <span className="font-medium text-slate-700">{email.from_name}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-600">{email.from_email}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500">{formatDate(email.received_at)}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">{email.preview}</p>
                      </div>
                      <button
                        onClick={() => setSelectedEmail(email)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-50 rounded-lg transition-all border border-teal-200 hover:border-teal-300 hover:shadow-md"
                      >
                        <Eye className="h-4 w-4" />
                        View Email
                      </button>
                    </div>
                  </div>

                  {/* Extracted Items */}
                  <div className="p-6 space-y-4">
                    {/* Events */}
                    {hasEvents && email.events.map((event) => (
                      <div
                        key={event.id}
                        className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-teal-500 rounded-lg">
                              <Calendar className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h4>
                                <p className="text-sm text-slate-600">{event.description}</p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getConfidenceColor(event.confidence_score)}`}>
                                {getConfidenceLabel(event.confidence_score)}
                              </span>
                            </div>
                            <div className="flex items-center gap-6 text-sm text-slate-700 mb-4">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-teal-600" />
                                <span>{formatDate(event.start_time)} at {formatTime(event.start_time)}</span>
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-teal-600" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleApprove('event', event.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                              >
                                <Check className="h-4 w-4" />
                                Add to Calendar
                              </button>
                              <button
                                onClick={() => handleReject('event', event.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all font-medium text-sm"
                              >
                                <X className="h-4 w-4" />
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Reminders */}
                    {hasReminders && email.reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg shadow-teal-200">
                              <Bell className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="text-lg font-bold text-slate-900 mb-1">{reminder.title}</h4>
                                <p className="text-sm text-slate-600">{reminder.description}</p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getConfidenceColor(reminder.confidence_score)}`}>
                                {getConfidenceLabel(reminder.confidence_score)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-700 mb-4">
                              <Clock className="h-4 w-4 text-teal-600" />
                              <span>Remind me {formatDate(reminder.remind_at)} at {formatTime(reminder.remind_at)}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleApprove('reminder', reminder.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                              >
                                <Check className="h-4 w-4" />
                                Set Reminder
                              </button>
                              <button
                                onClick={() => handleReject('reminder', reminder.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all font-medium text-sm"
                              >
                                <X className="h-4 w-4" />
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Todos */}
                    {hasTodos && email.todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-200"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg shadow-lg shadow-teal-200">
                              <CheckSquare className="h-5 w-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-lg font-bold text-slate-900">{todo.title}</h4>
                                  {todo.priority === 'high' && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-orange-100 to-red-100 text-red-700 rounded-full border border-red-200">
                                      High Priority
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-slate-600">{todo.description}</p>
                              </div>
                              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getConfidenceColor(todo.confidence_score)}`}>
                                {getConfidenceLabel(todo.confidence_score)}
                              </span>
                            </div>
                            {todo.due_date && (
                              <div className="flex items-center gap-2 text-sm text-slate-700 mb-4">
                                <Clock className="h-4 w-4 text-teal-600" />
                                <span>Due {formatDate(todo.due_date)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleApprove('todo', todo.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg font-medium text-sm"
                              >
                                <Check className="h-4 w-4" />
                                Add to Tasks
                              </button>
                              <button
                                onClick={() => handleReject('todo', todo.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all font-medium text-sm"
                              >
                                <X className="h-4 w-4" />
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {emails.every(email => {
              const hasEvents = email.events.length > 0 && (activeTab === 'all' || activeTab === 'events');
              const hasReminders = email.reminders.length > 0 && (activeTab === 'all' || activeTab === 'reminders');
              const hasTodos = email.todos.length > 0 && (activeTab === 'all' || activeTab === 'todos');
              return !hasEvents && !hasReminders && !hasTodos;
            }) && (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                  <Inbox className="h-10 w-10 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No items found</h3>
                <p className="text-slate-600 mb-4">
                  {activeTab === 'all' && 'No insights extracted from your emails yet.'}
                  {activeTab === 'events' && 'No events found in your emails.'}
                  {activeTab === 'reminders' && 'No reminders found in your emails.'}
                  {activeTab === 'todos' && 'No action items found in your emails.'}
                </p>
                <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl font-medium">
                  Scan New Emails
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default EmailInsightsPage;
