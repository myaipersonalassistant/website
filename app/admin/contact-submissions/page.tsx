'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Mail,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Archive,
  Trash2,
  Eye,
  EyeOff,
  MessageSquare,
  Star,
  AlertCircle,
  ArrowLeft,
  User,
  Calendar,
  Tag,
  FileText,
  Send,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
  Plus
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, where, Timestamp, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/lib/useAuth';
import { formatDistanceToNow } from 'date-fns';

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
      const q = query(collection(db, 'contact_submissions'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const submissionsData: ContactSubmission[] = [];
      
      querySnapshot.forEach((doc) => {
        submissionsData.push({
          id: doc.id,
          ...doc.data()
        } as ContactSubmission);
      });

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
      // In production, check if user is admin
      loadSubmissions();
    }
  }, [authLoading, isAuthenticated, router, loadSubmissions]);

  const handleStatusChange = async (submissionId: string, newStatus: ContactSubmission['status']) => {
    try {
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

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Admin</span>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Contact Submissions</h1>
                <p className="text-sm text-slate-600">Manage and respond to customer inquiries</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">{unreadCount} Unread</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-xl">
                <Mail className="h-4 w-4" />
                <span className="font-semibold">{newCount} New</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Submissions List */}
          <div className="lg:col-span-1 space-y-4">
            {/* Search and Filters */}
            <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search submissions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between px-4 py-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </span>
                {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showFilters && (
                <div className="mt-4 space-y-3 pt-4 border-t border-slate-200">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
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
                  <Mail className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No submissions found</p>
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
                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${
                          selectedSubmission?.id === submission.id ? 'bg-teal-50 border-l-4 border-teal-500' : ''
                        } ${!submission.read ? 'bg-blue-50/50' : ''}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900 truncate">{submission.name}</h3>
                              {!submission.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 truncate">{submission.email}</p>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {submission.priority === 'high' && (
                              <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                            )}
                            {submission.status === 'new' && (
                              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                                New
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-1 truncate">{submission.subject}</p>
                        <p className="text-xs text-slate-500 line-clamp-2">{submission.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                          <Clock className="h-3 w-3" />
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
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold text-slate-900">{selectedSubmission.subject}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          selectedSubmission.priority === 'high' 
                            ? 'bg-orange-100 text-orange-700'
                            : selectedSubmission.priority === 'normal'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {selectedSubmission.priority}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
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
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {selectedSubmission.name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {selectedSubmission.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
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
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      {selectedSubmission.read ? (
                        <EyeOff className="h-5 w-5 text-slate-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-teal-600" />
                      )}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={selectedSubmission.status}
                      onChange={(e) => handleStatusChange(selectedSubmission.id, e.target.value as ContactSubmission['status'])}
                      className="px-4 py-2 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="archived">Archived</option>
                    </select>
                    <a
                      href={`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`}
                      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm"
                    >
                      <Send className="h-4 w-4" />
                      Reply
                    </a>
                    <button
                      onClick={() => handleDelete(selectedSubmission.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="p-6 border-b border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Message
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4 text-slate-700 whitespace-pre-wrap leading-relaxed">
                    {selectedSubmission.message}
                  </div>
                </div>

                {/* Admin Notes */}
                <div className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Admin Notes
                    {selectedSubmission.adminNotes && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                        {selectedSubmission.adminNotes.length}
                      </span>
                    )}
                  </h3>

                  {selectedSubmission.adminNotes && selectedSubmission.adminNotes.length > 0 && (
                    <div className="space-y-3 mb-4">
                      {selectedSubmission.adminNotes.map((note, index) => {
                        const noteDate = note.createdAt instanceof Timestamp 
                          ? note.createdAt.toDate() 
                          : new Date(note.createdAt);
                        return (
                          <div key={index} className="bg-slate-50 rounded-xl p-4 border-l-4 border-teal-500">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-medium text-slate-900">{note.adminName}</p>
                                <p className="text-xs text-slate-500">
                                  {formatDistanceToNow(noteDate, { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                            <p className="text-slate-700">{note.note}</p>
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
                      className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                      rows={3}
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!noteText.trim()}
                      className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-12 text-center">
                <Mail className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">Select a submission</h3>
                <p className="text-slate-600">Choose a submission from the list to view details and take action</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

