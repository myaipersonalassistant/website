'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Database,
  Search,
  Filter,
  RefreshCw,
  FileText,
  Users,
  Mail,
  CreditCard,
  Folder,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  Copy,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  HardDrive,
  Activity,
  Clock,
  Hash,
  Key,
  Layers,
  Zap,
  Calendar
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  orderBy,
  limit,
  where,
  startAfter,
  QueryDocumentSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import AdminSidebar from '@/app/components/AdminSidebar';
import Header from '@/app/components/Header';

interface CollectionInfo {
  name: string;
  documentCount: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface DocumentData {
  id: string;
  data: any;
  path: string;
}

export default function DatabaseAdminPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [collections, setCollections] = useState<CollectionInfo[]>([]);
  const [stats, setStats] = useState({
    totalCollections: 0,
    totalDocuments: 0,
    totalSize: '0 MB',
    lastBackup: 'Never'
  });
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [documentView, setDocumentView] = useState<'table' | 'json'>('table');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentData | null>(null);
  const [editDocumentData, setEditDocumentData] = useState<string>('{}');

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
      
      loadDatabaseInfo();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const loadDatabaseInfo = async () => {
    try {
      setLoading(true);
      const db = getDb();
      
      // Known collections (based on Firestore rules)
      const knownCollections: CollectionInfo[] = [
        { name: 'users', documentCount: 0, icon: Users, color: 'from-blue-500 to-indigo-600' },
        { name: 'contact_submissions', documentCount: 0, icon: Mail, color: 'from-teal-500 to-cyan-600' },
        { name: 'notifications', documentCount: 0, icon: Mail, color: 'from-purple-500 to-pink-600' },
        { name: 'events', documentCount: 0, icon: Calendar, color: 'from-emerald-500 to-teal-600' },
        { name: 'reminders', documentCount: 0, icon: Clock, color: 'from-amber-500 to-orange-600' },
        { name: 'tasks', documentCount: 0, icon: CheckCircle, color: 'from-green-500 to-emerald-600' },
        { name: 'admin_settings', documentCount: 0, icon: Database, color: 'from-slate-500 to-gray-600' },
        { name: 'api_usage', documentCount: 0, icon: Activity, color: 'from-indigo-500 to-purple-600' },
      ];

      // Count documents in each collection
      const collectionsWithCounts = await Promise.all(
        knownCollections.map(async (col) => {
          try {
            const snapshot = await getDocs(collection(db, col.name));
            return {
              ...col,
              documentCount: snapshot.size
            };
          } catch (error) {
            console.error(`Error counting ${col.name}:`, error);
            return { ...col, documentCount: 0 };
          }
        })
      );

      setCollections(collectionsWithCounts);

      // Calculate stats
      const totalDocs = collectionsWithCounts.reduce((sum, col) => sum + col.documentCount, 0);
      setStats({
        totalCollections: collectionsWithCounts.length,
        totalDocuments: totalDocs,
        totalSize: `${(totalDocs * 0.001).toFixed(2)} MB`, // Rough estimate
        lastBackup: 'Never'
      });

      // Load documents if a collection is selected
      if (selectedCollection) {
        await loadCollectionDocuments(selectedCollection);
      }
    } catch (error) {
      console.error('Error loading database info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCollectionDocuments = async (collectionName: string) => {
    try {
      const db = getDb();
      let docs: DocumentData[] = [];
      
      try {
        // Try with orderBy first (requires index)
        const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        
        snapshot.forEach((docSnapshot) => {
          docs.push({
            id: docSnapshot.id,
            data: docSnapshot.data(),
            path: `${collectionName}/${docSnapshot.id}`
          });
        });
      } catch (err: any) {
        // Fallback: fetch all and sort client-side if index is missing or createdAt doesn't exist
        if (err.code === 'failed-precondition' || err.message?.includes('createdAt')) {
          const allDocsQuery = query(collection(db, collectionName), limit(50));
          const allDocsSnapshot = await getDocs(allDocsQuery);
          
          allDocsSnapshot.forEach((docSnapshot) => {
            docs.push({
              id: docSnapshot.id,
              data: docSnapshot.data(),
              path: `${collectionName}/${docSnapshot.id}`
            });
          });
          
          // Try to sort by createdAt if it exists
          try {
            docs.sort((a, b) => {
              const aCreatedAt = a.data.createdAt;
              const bCreatedAt = b.data.createdAt;
              
              if (!aCreatedAt && !bCreatedAt) return 0;
              if (!aCreatedAt) return 1;
              if (!bCreatedAt) return -1;
              
              const aDate = aCreatedAt instanceof Timestamp 
                ? aCreatedAt.toMillis() 
                : aCreatedAt?.toDate?.()?.getTime() || new Date(aCreatedAt).getTime();
              const bDate = bCreatedAt instanceof Timestamp 
                ? bCreatedAt.toMillis() 
                : bCreatedAt?.toDate?.()?.getTime() || new Date(bCreatedAt).getTime();
              
              return bDate - aDate; // Descending (newest first)
            });
          } catch (sortErr) {
            // If sorting fails, just use the order from Firestore
            console.warn('Could not sort documents by createdAt:', sortErr);
          }
          
          // Show alert with index creation URL if it's an index error
          const indexUrl = err.message?.includes('index') 
            ? err.message.match(/https:\/\/[^\s]+/)?.[0]
            : null;
          if (indexUrl && typeof window !== 'undefined' && !sessionStorage.getItem(`${collectionName}_index_alert_shown`)) {
            console.warn(`Firestore index required for ${collectionName}. Create it at:`, indexUrl);
            sessionStorage.setItem(`${collectionName}_index_alert_shown`, 'true');
          }
        } else {
          throw err;
        }
      }

      setDocuments(docs);
    } catch (error) {
      console.error(`Error loading documents from ${collectionName}:`, error);
      setDocuments([]);
    }
  };

  const handleCollectionSelect = async (collectionName: string) => {
    setSelectedCollection(collectionName);
    setSelectedDocument(null);
    await loadCollectionDocuments(collectionName);
  };

  const handleDocumentSelect = (document: DocumentData) => {
    setSelectedDocument(document);
  };

  const handleDeleteDocument = async (documentId: string, collectionName: string) => {
    if (!confirm(`Are you sure you want to delete this document? This action cannot be undone.`)) {
      return;
    }

    try {
      const db = getDb();
      await deleteDoc(doc(db, collectionName, documentId));
      await loadCollectionDocuments(collectionName);
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleUpdateDocument = async () => {
    if (!selectedCollection || !editingDocument) return;

    try {
      const db = getDb();
      const data = JSON.parse(editDocumentData);
      
      // Preserve document ID and update timestamp
      data.updatedAt = serverTimestamp();
      
      await updateDoc(doc(db, selectedCollection, editingDocument.id), data);
      setShowEditModal(false);
      setEditingDocument(null);
      setEditDocumentData('{}');
      await loadCollectionDocuments(selectedCollection);
      
      // Update selected document if it's the one being edited
      if (selectedDocument?.id === editingDocument.id) {
        const updatedDoc = { ...selectedDocument, data };
        setSelectedDocument(updatedDoc);
      }
      
      alert('Document updated successfully');
    } catch (error: any) {
      console.error('Error updating document:', error);
      alert(`Failed to update document: ${error.message || 'Invalid JSON'}`);
    }
  };

  const openEditModal = (document: DocumentData) => {
    setEditingDocument(document);
    setEditDocumentData(JSON.stringify(document.data, null, 2));
    setShowEditModal(true);
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (value instanceof Timestamp) {
      return value.toDate().toLocaleString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const filteredDocuments = documents.filter(doc => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      doc.id.toLowerCase().includes(searchLower) ||
      JSON.stringify(doc.data).toLowerCase().includes(searchLower)
    );
  });

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
                  <p className="text-slate-600">Loading database...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Database Admin</h1>
                      <p className="text-sm text-slate-600">Manage Firestore collections and documents</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={loadDatabaseInfo}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <RefreshCw className="h-3.5 w-3.5 text-slate-600" />
                        <span className="font-medium text-slate-700">Refresh</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <Layers className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stats.totalCollections}</h3>
                    <p className="text-xs text-slate-600">Collections</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stats.totalDocuments}</h3>
                    <p className="text-xs text-slate-600">Documents</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                        <HardDrive className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">{stats.totalSize}</h3>
                    <p className="text-xs text-slate-600">Estimated Size</p>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">{stats.lastBackup}</h3>
                    <p className="text-xs text-slate-600">Last Backup</p>
                  </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Collections Sidebar */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-5">
                      <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Folder className="h-4 w-4 text-amber-600" />
                        Collections
                      </h2>
                      <div className="space-y-2">
                        {collections.map((col) => {
                          const Icon = col.icon;
                          const isSelected = selectedCollection === col.name;
                          return (
                            <button
                              key={col.name}
                              onClick={() => handleCollectionSelect(col.name)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300'
                                  : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 bg-gradient-to-br ${col.color} rounded-lg flex items-center justify-center`}>
                                  <Icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="text-left">
                                  <p className="text-xs font-semibold text-slate-900">{col.name}</p>
                                  <p className="text-[10px] text-slate-500">{col.documentCount} documents</p>
                                </div>
                              </div>
                              {isSelected && <ChevronRight className="h-3.5 w-3.5 text-amber-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Documents List */}
                  <div className="lg:col-span-2">
                    {selectedCollection ? (
                      <div className="space-y-6">
                        {/* Search and Filters */}
                        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setDocumentView(documentView === 'table' ? 'json' : 'table')}
                                className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-medium"
                              >
                                {documentView === 'table' ? 'JSON View' : 'Table View'}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-slate-600">
                              Showing {filteredDocuments.length} of {documents.length} documents
                            </p>
                            <button
                              onClick={() => loadCollectionDocuments(selectedCollection)}
                              className="flex items-center gap-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Refresh
                            </button>
                          </div>
                        </div>

                        {/* Documents */}
                        {filteredDocuments.length === 0 ? (
                          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-12 text-center">
                            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No documents found</h3>
                            <p className="text-sm text-slate-600">
                              {searchQuery ? 'Try adjusting your search query' : 'This collection is empty'}
                            </p>
                          </div>
                        ) : documentView === 'table' ? (
                          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 overflow-hidden">
                            <div className="max-h-[600px] overflow-y-auto">
                              <table className="w-full">
                                <thead className="bg-slate-50 sticky top-0">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">Preview</th>
                                    <th className="px-4 py-2 text-left text-[10px] font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                  {filteredDocuments.map((document) => (
                                    <tr
                                      key={document.id}
                                      onClick={() => handleDocumentSelect(document)}
                                      className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                                        selectedDocument?.id === document.id ? 'bg-amber-50' : ''
                                      }`}
                                    >
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                          <Key className="h-3.5 w-3.5 text-slate-400" />
                                          <span className="text-xs font-mono text-slate-900">{document.id}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="text-xs text-slate-600 max-w-md truncate">
                                          {JSON.stringify(document.data).substring(0, 100)}...
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDocumentSelect(document);
                                            }}
                                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="View"
                                          >
                                            <Eye className="h-3.5 w-3.5 text-slate-600" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openEditModal(document);
                                            }}
                                            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Edit"
                                          >
                                            <Edit className="h-3.5 w-3.5 text-amber-600" />
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteDocument(document.id, selectedCollection);
                                            }}
                                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                          >
                                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {filteredDocuments.map((document) => (
                              <div
                                key={document.id}
                                onClick={() => handleDocumentSelect(document)}
                                className={`bg-white rounded-xl border-2 p-4 cursor-pointer transition-all ${
                                  selectedDocument?.id === document.id
                                    ? 'border-amber-300 bg-amber-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <Hash className="h-3.5 w-3.5 text-slate-400" />
                                    <span className="font-mono text-xs font-semibold text-slate-900">{document.id}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openEditModal(document);
                                      }}
                                      className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                                      title="Edit"
                                    >
                                      <Edit className="h-3.5 w-3.5 text-amber-600" />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDocument(document.id, selectedCollection);
                                      }}
                                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-red-600" />
                                    </button>
                                  </div>
                                </div>
                                <pre className="text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded-lg overflow-x-auto max-h-32 overflow-y-auto">
                                  {JSON.stringify(document.data, null, 2)}
                                </pre>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-12 text-center">
                        <Database className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Select a collection</h3>
                        <p className="text-sm text-slate-600">Choose a collection from the sidebar to view and manage documents</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Document Detail Modal */}
                {selectedDocument && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDocument(null)}>
                    <div
                      className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">Document Details</h2>
                          <p className="text-xs text-slate-600 mt-1 font-mono">{selectedDocument.path}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(selectedDocument)}
                            className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-amber-600" />
                          </button>
                          <button
                            onClick={() => copyToClipboard(JSON.stringify(selectedDocument.data, null, 2))}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Copy JSON"
                          >
                            <Copy className="h-4 w-4 text-slate-600" />
                          </button>
                          <button
                            onClick={() => setSelectedDocument(null)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <XCircle className="h-4 w-4 text-slate-600" />
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5">
                        <div className="mb-3">
                          <h3 className="text-xs font-semibold text-slate-700 mb-1.5">Document ID</h3>
                          <div className="bg-slate-50 rounded-lg p-2.5 font-mono text-xs text-slate-900">{selectedDocument.id}</div>
                        </div>
                        <div>
                          <h3 className="text-xs font-semibold text-slate-700 mb-1.5">Data</h3>
                          <pre className="bg-slate-50 rounded-lg p-3 text-[10px] text-slate-700 overflow-x-auto">
                            {JSON.stringify(selectedDocument.data, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className="p-5 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDocument(null)}
                          className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => {
                            openEditModal(selectedDocument);
                            setSelectedDocument(null);
                          }}
                          className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                        >
                          Edit Document
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this document?')) {
                              handleDeleteDocument(selectedDocument.id, selectedCollection!);
                              setSelectedDocument(null);
                            }
                          }}
                          className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                          Delete Document
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Edit Document Modal */}
                {showEditModal && editingDocument && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowEditModal(false)}>
                    <div
                      className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900">Edit Document</h2>
                          <p className="text-xs text-slate-600 mt-1 font-mono">{editingDocument.path}</p>
                        </div>
                        <button
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingDocument(null);
                            setEditDocumentData('{}');
                          }}
                          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <XCircle className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-5">
                        <div className="mb-3">
                          <h3 className="text-xs font-semibold text-slate-700 mb-1.5">Document ID</h3>
                          <div className="bg-slate-50 rounded-lg p-2.5 font-mono text-xs text-slate-900">{editingDocument.id}</div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Document Data (JSON)
                          </label>
                          <textarea
                            value={editDocumentData}
                            onChange={(e) => setEditDocumentData(e.target.value)}
                            className="w-full h-64 font-mono text-xs border-2 border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
                          />
                          <p className="text-[10px] text-slate-500 mt-2">
                            Note: updatedAt will be automatically updated
                          </p>
                        </div>
                      </div>
                      <div className="p-5 border-t border-slate-200 flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setShowEditModal(false);
                            setEditingDocument(null);
                            setEditDocumentData('{}');
                          }}
                          className="px-3 py-1.5 text-xs bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateDocument}
                          className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                        >
                          Update Document
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

