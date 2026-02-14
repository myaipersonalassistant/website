'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Search,
  Filter,
  Clock,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  Star,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';
import { getDb } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, Timestamp, serverTimestamp, getDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/useAuth';
import { formatDistanceToNow } from 'date-fns';
import AdminSidebar from '@/app/components/AdminSidebar';
import Header from '@/app/components/Header';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
  read: boolean;
  priority: 'low' | 'normal' | 'high';
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  adminNotes?: Array<{
    note: string;
    adminId: string;
    adminName: string;
    createdAt: Timestamp | Date;
  }>;
}

export default function ContactSubmissionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [noteText, setNoteText] = useState('');

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const db = getDb();
      
      let submissionsData: ContactSubmission[] = [];
      
      try {
        // Try with orderBy first (requires index)
        const q = query(collection(db, 'contact_submissions'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
          submissionsData.push({
            id: doc.id,
            ...doc.data()
          } as ContactSubmission);
        });
      } catch (err: any) {
        // Fallback: fetch all and sort client-side if index is missing
        if (err.code === 'failed-precondition') {
          const allSubmissionsQuery = query(collection(db, 'contact_submissions'));
          const allSubmissionsSnapshot = await getDocs(allSubmissionsQuery);
          
          allSubmissionsSnapshot.forEach((doc) => {
            submissionsData.push({
              id: doc.id,
              ...doc.data()
            } as ContactSubmission);
          });
          
          // Sort by createdAt descending (newest first)
          submissionsData.sort((a, b) => {
            const aDate = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
            const bDate = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
            return bDate - aDate;
          });
          
          // Show alert with index creation URL
          const indexUrl = err.message?.includes('index') 
            ? err.message.match(/https:\/\/[^\s]+/)?.[0]
            : null;
          if (indexUrl) {
            console.warn('Firestore index required. Create it at:', indexUrl);
            // Optionally show a one-time alert to admin
            if (typeof window !== 'undefined' && !sessionStorage.getItem('contact_submissions_index_alert_shown')) {
              alert(`Firestore index required for contact submissions. Please create it:\n\n${indexUrl}\n\nThis alert will only show once.`);
              sessionStorage.setItem('contact_submissions_index_alert_shown', 'true');
            }
          }
        } else {
          throw err;
        }
      }

      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

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
      
      loadSubmissions();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const handleStatusChange = async (submissionId: string, newStatus: ContactSubmission['status']) => {
    try {
      const db = getDb();
      await updateDoc(doc(db, 'contact_submissions', submissionId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      loadSubmissions();
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleMarkAsRead = async (submissionId: string, read: boolean) => {
    try {
      const db = getDb();
      await updateDoc(doc(db, 'contact_submissions', submissionId), {
        read: read,
        updatedAt: serverTimestamp()
      });
      loadSubmissions();
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission({ ...selectedSubmission, read: read });
      }
    } catch (error) {
      console.error('Error updating read status:', error);
    }
  };

  const handleAddNote = async () => {
    if (!selectedSubmission || !noteText.trim() || !user) return;

    try {
      const currentNotes = selectedSubmission.adminNotes || [];
      const now = new Date();
      
      // Note for Firestore (uses serverTimestamp)
      const firestoreNote = {
        note: noteText,
        adminId: user.uid,
        adminName: user.displayName || user.email || 'Admin',
        createdAt: serverTimestamp()
      };

      // Note for local state (uses Date)
      const localNote = {
        note: noteText,
        adminId: user.uid,
        adminName: user.displayName || user.email || 'Admin',
        createdAt: now
      };

      const db = getDb();
      await updateDoc(doc(db, 'contact_submissions', selectedSubmission.id), {
        adminNotes: [...currentNotes, firestoreNote],
        updatedAt: serverTimestamp()
      });

      setNoteText('');
      loadSubmissions();
      if (selectedSubmission) {
        setSelectedSubmission({
          ...selectedSubmission,
          adminNotes: [...currentNotes, localNote]
        });
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDelete = async (submissionId: string) => {
    if (!confirm('Are you sure you want to delete this submission?')) return;

    try {
      const db = getDb();
      await deleteDoc(doc(db, 'contact_submissions', submissionId));
      loadSubmissions();
      if (selectedSubmission?.id === submissionId) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = 
      submission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || submission.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const unreadCount = submissions.filter(s => !s.read).length;
  const newCount = submissions.filter(s => s.status === 'new').length;

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
                  <p className="text-slate-600">Loading submissions...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Contact Submissions</h1>
                      <p className="text-sm text-slate-600">Manage and respond to customer inquiries</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-xl border-2 border-red-200">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span className="font-semibold text-xs">{unreadCount} Unread</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-xl border-2 border-teal-200">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="font-semibold text-xs">{newCount} New</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5" />
                  Filters
                </span>
                {showFilters ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showFilters && (
                <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="normal">Normal</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Submissions List */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 max-h-[calc(100vh-300px)] overflow-y-auto">
              {filteredSubmissions.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-xs text-slate-600">No submissions found</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {filteredSubmissions.map((submission) => {
                    const createdAt = submission.createdAt instanceof Timestamp 
                      ? submission.createdAt.toDate() 
                      : new Date(submission.createdAt);
                    const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });

                    return (
                      <button
                        key={submission.id}
                        onClick={() => {
                          setSelectedSubmission(submission);
                          if (!submission.read) {
                            handleMarkAsRead(submission.id, true);
                          }
                        }}
                        className={`w-full p-3 text-left hover:bg-slate-50 transition-colors ${
                          selectedSubmission?.id === submission.id ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                        } ${!submission.read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-1.5">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-xs font-semibold text-slate-900 truncate">{submission.name}</h3>
                              {!submission.read && (
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 truncate">{submission.email}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {submission.priority === 'high' && (
                              <Star className="h-3.5 w-3.5 text-orange-500 fill-orange-500" />
                            )}
                            {submission.status === 'new' && (
                              <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-medium rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-xs font-medium text-slate-900 mb-1 truncate">{submission.subject}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{submission.message}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 text-[10px] text-slate-500">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{timeAgo}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Submission Detail */}
          <div className="lg:col-span-2">
            {selectedSubmission ? (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200">
                {/* Header */}
                <div className="p-5 border-b border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-lg font-bold text-slate-900">{selectedSubmission.subject}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          selectedSubmission.priority === 'high' 
                            ? 'bg-orange-100 text-orange-700'
                            : selectedSubmission.priority === 'normal'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {selectedSubmission.priority}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          selectedSubmission.status === 'new'
                            ? 'bg-teal-100 text-teal-700'
                            : selectedSubmission.status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-700'
                            : selectedSubmission.status === 'resolved'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {selectedSubmission.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          {selectedSubmission.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5" />
                          {selectedSubmission.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDistanceToNow(
                            selectedSubmission.createdAt instanceof Timestamp 
                              ? selectedSubmission.createdAt.toDate() 
                              : new Date(selectedSubmission.createdAt),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleMarkAsRead(selectedSubmission.id, !selectedSubmission.read)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {selectedSubmission.read ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-teal-600" />
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value as ContactSubmission['status'])}
                      className="px-3 py-1.5 text-xs border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                    <a
                      href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Reply
                    </a>
                    <button
                      onClick={() => handleDelete(selectedSubmission.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-5 border-b border-slate-200">
                  <h3 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Message
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedSubmission.message}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Admin Notes
                    {selectedSubmission.adminNotes && (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-full">
                        {selectedSubmission.adminNotes.length}
                      </span>
                    )}
                  </h3>

                  {selectedSubmission.adminNotes && selectedSubmission.adminNotes.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {selectedSubmission.adminNotes.map((note, index) => {
                        const noteDate = note.createdAt instanceof Timestamp 
                          ? note.createdAt.toDate() 
                          : new Date(note.createdAt);
                        return (
                          <div key={index} className="bg-slate-50 rounded-xl p-3 border-l-4 border-teal-500">
                            <div className="flex items-start justify-between mb-1.5">
                              <div>
                                <p className="text-xs font-medium text-slate-900">{note.adminName}</p>
                                <p className="text-[10px] text-slate-500">
                                  {formatDistanceToNow(noteDate, { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-slate-700">{note.note}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add a note..."
                      className="flex-1 px-3 py-2 text-xs border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!noteText.trim()}
                      className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-12 text-center">
                <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Select a submission</h3>
                <p className="text-sm text-slate-600">Choose a submission from the list to view details and take action</p>
              </div>
            )}
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

