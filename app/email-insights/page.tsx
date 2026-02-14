'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  User,
  Loader2,
  TrendingDown
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import DashboardSidebar from '@/app/components/DashboardSidebar';

interface Email {
  id: string;
  userId: string;
  from_email: string;
  from_name: string;
  subject: string;
  preview: string;
  content: string;
  received_at: string | Timestamp;
  processed: boolean;
  created_at: string | Timestamp;
}

interface ExtractedItem {
  id: string;
  email_id: string;
  userId: string;
  type: 'event' | 'reminder' | 'todo';
  title: string;
  description: string;
  // Event fields
  start_time?: string | Timestamp;
  end_time?: string | Timestamp;
  location?: string;
  // Reminder fields
  remind_at?: string | Timestamp;
  // Todo fields
  due_date?: string | Timestamp;
  priority?: 'low' | 'normal' | 'high';
  // Common fields
  status: 'pending' | 'approved' | 'rejected' | 'created';
  confidence_score: number;
  created_at: string | Timestamp;
}

interface ExtractedEvent extends ExtractedItem {
  type: 'event';
  start_time: string | Timestamp;
  end_time?: string | Timestamp;
  location?: string;
}

interface ExtractedReminder extends ExtractedItem {
  type: 'reminder';
  remind_at: string | Timestamp;
}

interface ExtractedTodo extends ExtractedItem {
  type: 'todo';
  due_date?: string | Timestamp;
  priority: 'low' | 'normal' | 'high';
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
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userName, setUserName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }
    if (!user) {
      return;
    }
    
    // Set userName from auth user object
    setUserName(user.displayName || user.email?.split('@')[0] || 'User');
    
    // Load emails (will show loading in list area, not full page)
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      fetchEmailData();
    }
  }, [user, authLoading]);

  // Reload when filters change
  useEffect(() => {
    if (user && hasLoadedRef.current) {
      fetchEmailData();
    }
  }, [statusFilter, activeTab, user]);

  const fetchEmailData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoadingEmails(true);
      setError('');
      const db = getDb();
      
      let emailsData: Email[] = [];
      
      // Try to fetch emails with orderBy first
      try {
        const emailsQuery = query(
          collection(db, 'emails'),
          where('userId', '==', user.uid),
          orderBy('received_at', 'desc')
        );
        const emailsSnapshot = await getDocs(emailsQuery);
        
        emailsSnapshot.forEach((doc) => {
          emailsData.push({
            id: doc.id,
            ...doc.data()
          } as Email);
        });
      } catch (err: any) {
        // Check if it's an index error
        if (err.code === 'failed-precondition' && (err.message?.includes('index') || err.message?.includes('requires an index'))) {
          // Try to extract index URL from error message
          let indexUrl = '';
          
          // Check various formats of index URL in error message
          const urlPatterns = [
            /https:\/\/console\.firebase\.google\.com[^\s\)]+/,
            /https:\/\/[^\s\)]+indexes[^\s\)]+/,
            /create_composite=[^\s\)]+/
          ];
          
          for (const pattern of urlPatterns) {
            const match = err.message?.match(pattern);
            if (match) {
              if (match[0].startsWith('create_composite=')) {
                indexUrl = `https://console.firebase.google.com/v1/r/project/aipersonalassistant-8q4k9a/firestore/indexes?${match[0]}`;
              } else {
                indexUrl = match[0];
              }
              break;
            }
          }
          
          // Fallback to the URL provided by the user
          if (!indexUrl) {
            indexUrl = 'https://console.firebase.google.com/v1/r/project/aipersonalassistant-8q4k9a/firestore/indexes?create_composite=Cllwcm9qZWN0cy9haXBlcnNvbmFsYXNzaXN0YW50LThxNGs5YS9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvZW1haWxzL2luZGV4ZXMvXxABGgoKBnVzZXJJZBABGg8KC3JlY2VpdmVkX2F0EAIaDAoIX19uYW1lX18QAg';
          }
          
          // Fallback: fetch without orderBy and sort client-side
          const emailsQueryFallback = query(
            collection(db, 'emails'),
            where('userId', '==', user.uid)
          );
          const emailsSnapshotFallback = await getDocs(emailsQueryFallback);
          
          emailsSnapshotFallback.forEach((doc) => {
            emailsData.push({
              id: doc.id,
              ...doc.data()
            } as Email);
          });
          
          // Sort client-side by received_at
          emailsData.sort((a, b) => {
            const dateA = a.received_at instanceof Timestamp 
              ? a.received_at.toDate().getTime() 
              : new Date(a.received_at as string).getTime();
            const dateB = b.received_at instanceof Timestamp 
              ? b.received_at.toDate().getTime() 
              : new Date(b.received_at as string).getTime();
            return dateB - dateA; // Descending order
          });
          
          // Set error with index URL
          setError(
            `This query requires a Firestore index.\n\n` +
            `Click here to create it: ${indexUrl}\n\n` +
            `After creating the index, wait 2-5 minutes for it to build, then refresh the page.\n` +
            `For now, emails are sorted client-side.`
          );
        } else {
          throw err;
        }
      }

      // Fetch all extracted items for the user
      const itemsQuery = query(
        collection(db, 'extracted_items'),
        where('userId', '==', user.uid)
      );
      const itemsSnapshot = await getDocs(itemsQuery);
      
      const extractedItems: ExtractedItem[] = [];
      itemsSnapshot.forEach((doc) => {
        extractedItems.push({
          id: doc.id,
          ...doc.data()
        } as ExtractedItem);
      });

      // Group extracted items by email_id and type
      const emailsWithExtractions: EmailWithExtractions[] = emailsData.map(email => {
        const emailItems = extractedItems.filter(item => item.email_id === email.id);
        
        return {
          ...email,
          events: emailItems.filter(item => item.type === 'event') as ExtractedEvent[],
          reminders: emailItems.filter(item => item.type === 'reminder') as ExtractedReminder[],
          todos: emailItems.filter(item => item.type === 'todo') as ExtractedTodo[],
        };
      });

      // Convert Timestamps to ISO strings for display
      const processedEmails = emailsWithExtractions.map(email => ({
        ...email,
        received_at: email.received_at instanceof Timestamp 
          ? email.received_at.toDate().toISOString() 
          : email.received_at,
        created_at: email.created_at instanceof Timestamp 
          ? email.created_at.toDate().toISOString() 
          : email.created_at,
        events: email.events.map(event => ({
          ...event,
          start_time: event.start_time instanceof Timestamp 
            ? event.start_time.toDate().toISOString() 
            : event.start_time,
          end_time: event.end_time instanceof Timestamp 
            ? event.end_time?.toDate().toISOString() 
            : event.end_time,
          created_at: event.created_at instanceof Timestamp 
            ? event.created_at.toDate().toISOString() 
            : event.created_at,
        })),
        reminders: email.reminders.map(reminder => ({
          ...reminder,
          remind_at: reminder.remind_at instanceof Timestamp 
            ? reminder.remind_at.toDate().toISOString() 
            : reminder.remind_at,
          created_at: reminder.created_at instanceof Timestamp 
            ? reminder.created_at.toDate().toISOString() 
            : reminder.created_at,
        })),
        todos: email.todos.map(todo => ({
          ...todo,
          due_date: todo.due_date instanceof Timestamp 
            ? todo.due_date.toDate().toISOString() 
            : todo.due_date,
          created_at: todo.created_at instanceof Timestamp 
            ? todo.created_at.toDate().toISOString() 
            : todo.created_at,
        })),
      }));

      setEmails(processedEmails);
      
      // Auto-expand first email if available
      if (processedEmails.length > 0 && expandedEmails.size === 0) {
        setExpandedEmails(new Set([processedEmails[0].id]));
      }
    } catch (err: any) {
      console.error('Error fetching email data:', err);
      setError(err.message || 'Failed to load email insights. Please try again.');
    } finally {
      setIsLoadingEmails(false);
      setIsRefreshing(false);
    }
  }, [user, expandedEmails]);

  const stats = {
    totalEmails: emails.length,
    processedEmails: emails.filter(e => e.processed).length,
    pendingEvents: emails.flatMap(e => e.events).filter(e => e.status === 'pending').length,
    pendingReminders: emails.flatMap(e => e.reminders).filter(r => r.status === 'pending').length,
    pendingTodos: emails.flatMap(e => e.todos).filter(t => t.status === 'pending').length,
  };

  const handleApprove = async (type: 'event' | 'reminder' | 'todo', id: string) => {
    if (!user) return;
    
    try {
      const db = getDb();
      const itemRef = doc(db, 'extracted_items', id);
      
      // Update status in Firestore
      await updateDoc(itemRef, {
        status: 'approved',
        updated_at: new Date().toISOString()
      });

      // Update local state
      setEmails(prevEmails =>
        prevEmails.map(email => {
          const updatedEmail = { ...email };
          if (type === 'event') {
            updatedEmail.events = email.events.map(e => 
              e.id === id ? { ...e, status: 'approved' as const } : e
            );
          } else if (type === 'reminder') {
            updatedEmail.reminders = email.reminders.map(r => 
              r.id === id ? { ...r, status: 'approved' as const } : r
            );
          } else if (type === 'todo') {
            updatedEmail.todos = email.todos.map(t => 
              t.id === id ? { ...t, status: 'approved' as const } : t
            );
          }
          return updatedEmail;
        })
      );
    } catch (err: any) {
      console.error('Error approving item:', err);
      setError(err.message || 'Failed to approve item');
    }
  };

  const handleReject = async (type: 'event' | 'reminder' | 'todo', id: string) => {
    if (!user) return;
    
    try {
      const db = getDb();
      const itemRef = doc(db, 'extracted_items', id);
      
      // Update status in Firestore
      await updateDoc(itemRef, {
        status: 'rejected',
        updated_at: new Date().toISOString()
      });

      // Update local state
      setEmails(prevEmails =>
        prevEmails.map(email => {
          const updatedEmail = { ...email };
          if (type === 'event') {
            updatedEmail.events = email.events.map(e => 
              e.id === id ? { ...e, status: 'rejected' as const } : e
            );
          } else if (type === 'reminder') {
            updatedEmail.reminders = email.reminders.map(r => 
              r.id === id ? { ...r, status: 'rejected' as const } : r
            );
          } else if (type === 'todo') {
            updatedEmail.todos = email.todos.map(t => 
              t.id === id ? { ...t, status: 'rejected' as const } : t
            );
          }
          return updatedEmail;
        })
      );
    } catch (err: any) {
      console.error('Error rejecting item:', err);
      setError(err.message || 'Failed to reject item');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEmailData();
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 1 && days < 7) return `In ${days} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
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
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-3 sm:px-4 lg:px-8 py-4 sm:py-5 lg:py-6 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg flex-shrink-0">
                  <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-0.5 sm:mb-1 truncate">Email Insights</h1>
                  <p className="text-[9px] sm:text-[10px] lg:text-xs text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
                    <span className="truncate">AI-powered email intelligence</span>
                  </p>
                </div>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoadingEmails}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 flex-shrink-0"
                >
                  <RefreshCw className={`h-4 w-4 sm:h-5 sm:w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] sm:text-[11px] lg:text-xs font-semibold hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Stats Cards - Mobile Optimized */}
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-1.5 sm:gap-2 pb-1 sm:pb-2 lg:pb-0">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[90px] lg:min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/80 flex-shrink-0" />
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-white/80">Total</p>
                </div>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">{stats.totalEmails}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[90px] lg:min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/80 flex-shrink-0" />
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-white/80">Events</p>
                </div>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">{stats.pendingEvents}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[90px] lg:min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/80 flex-shrink-0" />
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-white/80">Reminders</p>
                </div>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">{stats.pendingReminders}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[90px] lg:min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <CheckSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/80 flex-shrink-0" />
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-white/80">Tasks</p>
                </div>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">{stats.pendingTodos}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-white/20 flex-shrink-0 min-w-[70px] sm:min-w-[90px] lg:min-w-0 hidden lg:block">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                  <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/80 flex-shrink-0" />
                  <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-white/80">Processed</p>
                </div>
                <p className="text-sm sm:text-lg lg:text-xl font-bold text-white">{stats.processedEmails}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-3 sm:mx-4 mt-2 sm:mt-3 p-2.5 sm:p-3 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-2">
            <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-[11px] font-medium text-red-700 break-words whitespace-pre-line">{error}</p>
              {error.includes('Firestore index required') && error.includes('https://') && (
                <a
                  href={error.match(/https:\/\/[^\s]+/)?.[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] sm:text-[11px] font-semibold rounded-lg transition-colors active:scale-95"
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

        {/* Filters and Search */}
        <div className="bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] sm:text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Tabs and Status Filters */}
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap w-full sm:w-auto">
                {/* Type Tabs */}
                <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 rounded-xl p-0.5 sm:p-1 flex-1 sm:flex-initial">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 flex-1 sm:flex-initial ${
                      activeTab === 'all'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('events')}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 flex-1 sm:flex-initial ${
                      activeTab === 'events'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Events
                  </button>
                  <button
                    onClick={() => setActiveTab('reminders')}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 flex-1 sm:flex-initial ${
                      activeTab === 'reminders'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Reminders
                  </button>
                  <button
                    onClick={() => setActiveTab('todos')}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 flex-1 sm:flex-initial ${
                      activeTab === 'todos'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Tasks
                  </button>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-100 rounded-xl p-0.5 sm:p-1">
                  <button
                    onClick={() => setStatusFilter('pending')}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 ${
                      statusFilter === 'pending'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => setStatusFilter('approved')}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 ${
                      statusFilter === 'approved'
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Approved
                  </button>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-medium transition-all active:scale-95 ${
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 lg:px-8 min-h-0">
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
            {isLoadingEmails ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 shadow-sm">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-500 mx-auto mb-3 sm:mb-4"></div>
                <p className="text-[10px] sm:text-[11px] text-slate-600">Loading email insights...</p>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 shadow-sm">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-3 sm:mb-4 border border-teal-100">
                  <Inbox className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-1 sm:mb-2">No emails found</h3>
                <p className="text-[10px] sm:text-[11px] text-slate-600">Try adjusting your search or filters</p>
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
                    className="bg-white border-2 border-slate-200 rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden"
                  >
                    {/* Email Header */}
                    <button
                      onClick={() => toggleEmailExpansion(email.id)}
                      className="w-full text-left p-3 sm:p-4 lg:p-6 hover:bg-slate-50 transition-colors active:bg-slate-100"
                    >
                      <div className="flex items-start justify-between gap-2 sm:gap-4">
                        <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                            <User className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-[11px] sm:text-xs lg:text-sm font-bold text-slate-900 line-clamp-2 sm:line-clamp-1">
                                {email.subject}
                              </h3>
                              {totalItems > 0 && (
                                <div className="flex-shrink-0 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-teal-100 text-teal-700 rounded-lg text-[9px] sm:text-[10px] font-semibold">
                                  {totalItems}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] text-slate-600 mb-1.5 sm:mb-2 flex-wrap">
                              <span className="font-medium truncate max-w-[120px] sm:max-w-none">{email.from_name}</span>
                              <span className="text-slate-400 hidden sm:inline">•</span>
                              <span className="truncate max-w-[100px] sm:max-w-none text-[9px] sm:text-[10px]">{email.from_email}</span>
                              <span className="text-slate-400 hidden sm:inline">•</span>
                              <span className="text-[9px] sm:text-[10px]">
                                {new Date(email.received_at as string).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-slate-600 line-clamp-2">{email.preview}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                          {email.processed && (
                            <span className="text-[9px] sm:text-[10px] text-emerald-600 flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                              <CheckCircle2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              <span className="hidden sm:inline">Processed</span>
                            </span>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-transform duration-300 flex-shrink-0 ${
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
                          <div className="p-4 sm:p-6 text-center">
                            <p className="text-[10px] sm:text-[11px] text-slate-500">No items match the current filters</p>
                          </div>
                        ) : (
                          <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
                            {extractedItems.map((item) => {
                              const confidence = 'confidence_score' in item.data ? item.data.confidence_score : 0;
                              return (
                                <div
                                  key={`${item.type}-${item.data.id}`}
                                  className="bg-white border-2 border-slate-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-md transition-all"
                                >
                                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                                    <div
                                      className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl flex-shrink-0 ${
                                        item.type === 'event'
                                          ? 'bg-blue-100'
                                          : item.type === 'reminder'
                                          ? 'bg-purple-100'
                                          : 'bg-emerald-100'
                                      }`}
                                    >
                                      {item.type === 'event' && <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />}
                                      {item.type === 'reminder' && <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />}
                                      {item.type === 'todo' && <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1.5 sm:mb-2">
                                        <h4 className="text-[11px] sm:text-xs lg:text-sm font-bold text-slate-900 line-clamp-2 sm:line-clamp-1">
                                          {'title' in item.data ? item.data.title : ''}
                                        </h4>
                                        <span
                                          className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-medium border flex-shrink-0 ${getConfidenceColor(
                                            confidence
                                          )}`}
                                        >
                                          {getConfidenceLabel(confidence)} ({Math.round(confidence * 100)}%)
                                        </span>
                                      </div>
                                      {'description' in item.data && (
                                        <p className="text-[10px] sm:text-[11px] text-slate-600 mb-2 sm:mb-3 line-clamp-2">
                                          {item.data.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {item.type === 'event' && 'start_time' in item.data && item.data.start_time && (
                                          <>
                                            <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                              <Clock className="h-3 w-3" />
                                              {formatDate(item.data.start_time as string)} at {formatTime(item.data.start_time as string)}
                                            </span>
                                            {'location' in item.data && item.data.location && (
                                              <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                                <MapPin className="h-3 w-3" />
                                                {item.data.location}
                                              </span>
                                            )}
                                          </>
                                        )}
                                        {item.type === 'reminder' && 'remind_at' in item.data && item.data.remind_at && (
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                            <Clock className="h-3 w-3" />
                                            {formatDate(item.data.remind_at as string)} at {formatTime(item.data.remind_at as string)}
                                          </span>
                                        )}
                                        {item.type === 'todo' && 'due_date' in item.data && item.data.due_date && (
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                            <Clock className="h-3 w-3" />
                                            Due: {formatDate(item.data.due_date as string)}
                                          </span>
                                        )}
                                        {item.type === 'todo' && 'priority' in item.data && item.data.priority && (
                                          <span
                                            className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getPriorityColor(
                                              item.data.priority
                                            )}`}
                                          >
                                            {item.data.priority}
                                          </span>
                                        )}
                                      </div>
                                      {item.data.status === 'pending' && (
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 sm:pt-3 border-t border-slate-200">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleApprove(item.type, item.data.id);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                                          >
                                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            Approve
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleReject(item.type, item.data.id);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-slate-200 hover:border-red-300 text-slate-700 hover:text-red-600 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95"
                                          >
                                            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                            Reject
                                          </button>
                                        </div>
                                      )}
                                      {item.data.status === 'approved' && (
                                        <div className="pt-2 sm:pt-3 border-t border-slate-200">
                                          <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-600 text-[10px] sm:text-[11px]">
                                            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
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
