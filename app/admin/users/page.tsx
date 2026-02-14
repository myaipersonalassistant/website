'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Search,
  Filter,
  Mail,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { collection, query, getDocs, orderBy, doc, updateDoc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import AdminSidebar from '@/app/components/AdminSidebar';
import Header from '@/app/components/Header';

interface User {
  id: string;
  email: string;
  fullName?: string;
  displayName?: string; // Fallback for compatibility
  createdAt?: any;
  lastLogin?: any;
  subscription?: {
    planId: string;
    status: string;
  };
  role?: string;
  disabled?: boolean;
}

export default function UsersPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '',
    email: '',
    role: 'user',
    disabled: false
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?view=login');
        return;
      }
      checkAdminAccess();
    }
  }, [authLoading, isAuthenticated, router, user]);

  const checkAdminAccess = async () => {
    if (!user) return;
    
    try {
      const db = getDb();
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      // User is admin, load users
      loadUsers();
    } catch (error) {
      console.error('Error checking admin access:', error);
      router.push('/dashboard');
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const db = getDb();
      let usersData: User[] = [];
      
      try {
        // Try with orderBy first (requires index)
        const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(usersQuery);
        
        snapshot.forEach((doc) => {
          usersData.push({
            id: doc.id,
            ...doc.data()
          } as User);
        });
      } catch (err: any) {
        // Fallback: fetch all and sort client-side if index is missing
        if (err.code === 'failed-precondition') {
          const allUsersQuery = query(collection(db, 'users'));
          const allUsersSnapshot = await getDocs(allUsersQuery);
          
          allUsersSnapshot.forEach((doc) => {
            usersData.push({
              id: doc.id,
              ...doc.data()
            } as User);
          });
          
          // Sort by createdAt descending (newest first)
          usersData.sort((a, b) => {
            const aCreatedAt = a.createdAt;
            const bCreatedAt = b.createdAt;
            
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
          
          // Show alert with index creation URL if it's an index error
          const indexUrl = err.message?.includes('index') 
            ? err.message.match(/https:\/\/[^\s]+/)?.[0]
            : null;
          if (indexUrl && typeof window !== 'undefined' && !sessionStorage.getItem('users_index_alert_shown')) {
            console.warn('Firestore index required for users. Create it at:', indexUrl);
            sessionStorage.setItem('users_index_alert_shown', 'true');
          }
        } else {
          throw err;
        }
      }
      
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const userName = user.fullName || user.displayName || '';
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    // Active = not disabled and has completed onboarding
    const isActive = !user.disabled && user.createdAt;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'inactive' && (!isActive || user.disabled));
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleViewUser = (userItem: User) => {
    setSelectedUser(userItem);
    setShowViewModal(true);
  };

  const handleEditUser = (userItem: User) => {
    setSelectedUser(userItem);
    setEditFormData({
      fullName: userItem.fullName || userItem.displayName || '',
      email: userItem.email || '',
      role: userItem.role || 'user',
      disabled: userItem.disabled || false
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser || saving) return;

    try {
      setSaving(true);
      const db = getDb();
      const userRef = doc(db, 'users', selectedUser.id);
      
      await updateDoc(userRef, {
        fullName: editFormData.fullName,
        role: editFormData.role,
        disabled: editFormData.disabled,
        updatedAt: serverTimestamp()
      });

      // Refresh users list
      await loadUsers();
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || deleting || !user) return;

    try {
      setDeleting(true);
      
      // Get Firebase Auth token
      const token = await user.getIdToken();
      
      // Get API base URL from environment or use default
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      
      // Call backend API to delete user (Firestore + Firebase Auth)
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      const result = await response.json();
      console.log('User deleted successfully:', result);

      // Refresh users list
      await loadUsers();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert(`Failed to delete user: ${error.message || 'Please try again.'}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Subscription', 'Status', 'Joined'];
    const rows = filteredUsers.map(user => {
      const userName = user.fullName || user.displayName || user.email?.split('@')[0] || 'Unknown';
      const subscription = user.subscription 
        ? `${user.subscription.planId} (${user.subscription.status})`
        : 'None';
      const isActive = !user.disabled && user.createdAt;
      const status = isActive ? 'Active' : 'Inactive';
      const createdAt = user.createdAt;
      let joined: string = 'N/A';
      
      if (createdAt) {
        let date: Date | null = null;
        
        if (createdAt instanceof Timestamp) {
          date = createdAt.toDate();
        } else if (createdAt?.toDate) {
          date = createdAt.toDate();
        } else if (createdAt instanceof Date) {
          date = createdAt;
        }
        
        if (date) {
          joined = date.toLocaleDateString();
        }
      }
      
      return [
        userName,
        user.email || '',
        user.role || 'user',
        subscription,
        status,
        joined
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
                  <p className="text-slate-600">Loading users...</p>
                </div>
              </div>
            ) : (
              <>
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">User Management</h1>
                  <p className="text-sm text-slate-600">View and manage all platform users</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Total Users</p>
                    <p className="text-xl font-bold text-slate-900">{users.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Active Subscriptions</p>
                    <p className="text-xl font-bold text-slate-900">
                      {users.filter(u => u.subscription?.status === 'active').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">New This Week</p>
                    <p className="text-xl font-bold text-slate-900">
                      {users.filter(u => {
                        const weekAgo = new Date();
                        weekAgo.setDate(weekAgo.getDate() - 7);
                        const createdAt = u.createdAt;
                        let userDate: Date;
                        
                        if (createdAt instanceof Timestamp) {
                          userDate = createdAt.toDate();
                        } else if (createdAt?.toDate) {
                          userDate = createdAt.toDate();
                        } else if (createdAt instanceof Date) {
                          userDate = createdAt;
                        } else {
                          userDate = new Date();
                        }
                        
                        return userDate >= weekAgo;
                      }).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Admins</p>
                    <p className="text-xl font-bold text-slate-900">
                      {users.filter(u => u.role === 'admin').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 p-4 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button 
                  onClick={handleExportCSV}
                  className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg border-2 border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-700 uppercase tracking-wider">User</th>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Subscription</th>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Joined</th>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                          <p className="text-xs text-slate-500">No users found</p>
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {(userItem.fullName || userItem.displayName || userItem.email || 'U')[0].toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-xs font-medium text-slate-900">
                                  {userItem.fullName || userItem.displayName || userItem.email?.split('@')[0] || 'Unknown'}
                                </div>
                                <div className="text-xs text-slate-500">{userItem.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                              userItem.role === 'admin' 
                                ? 'bg-purple-100 text-purple-700' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {userItem.role || 'user'}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {userItem.subscription ? (
                              <div>
                                <span className="text-xs font-medium text-slate-900 capitalize">
                                  {userItem.subscription.planId}
                                </span>
                                <div className="text-[10px] text-slate-500 capitalize">
                                  {userItem.subscription.status}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">No subscription</span>
                            )}
                            {userItem.disabled && (
                              <div className="mt-1">
                                <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">
                                  Disabled
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                            {(() => {
                              const createdAt = userItem.createdAt;
                              if (!createdAt) return 'N/A';
                              
                              let date: Date;
                              if (createdAt instanceof Timestamp) {
                                date = createdAt.toDate();
                              } else if (createdAt?.toDate) {
                                date = createdAt.toDate();
                              } else if (createdAt instanceof Date) {
                                date = createdAt;
                              } else {
                                return 'N/A';
                              }
                              
                              return date.toLocaleDateString();
                            })()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs">
                            <div className="flex items-center gap-1.5">
                              <button 
                                onClick={() => handleViewUser(userItem)}
                                className="text-amber-600 hover:text-amber-700 p-1.5 hover:bg-amber-50 rounded-lg transition-colors" 
                                title="View"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => handleEditUser(userItem)}
                                className="text-blue-600 hover:text-blue-700 p-1.5 hover:bg-blue-50 rounded-lg transition-colors" 
                                title="Edit"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowDeleteModal(true);
                                }}
                                className="text-red-600 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition-colors" 
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">User Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                  {(selectedUser.fullName || selectedUser.displayName || selectedUser.email || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedUser.fullName || selectedUser.displayName || selectedUser.email?.split('@')[0] || 'Unknown'}
                  </h3>
                  <p className="text-xs text-slate-600">{selectedUser.email}</p>
                  {selectedUser.disabled && (
                    <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded-full">
                      Account Disabled
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Role</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">{selectedUser.role || 'user'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Subscription</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">
                    {selectedUser.subscription?.planId || 'None'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Account Status</p>
                  <p className="text-sm font-semibold text-slate-900 capitalize">
                    {selectedUser.disabled ? 'Disabled' : (!selectedUser.createdAt ? 'Inactive' : 'Active')}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-xs text-slate-600 mb-1">Joined</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {(() => {
                      const createdAt = selectedUser.createdAt;
                      if (!createdAt) return 'N/A';
                      
                      let date: Date;
                      if (createdAt instanceof Timestamp) {
                        date = createdAt.toDate();
                      } else if (createdAt?.toDate) {
                        date = createdAt.toDate();
                      } else if (createdAt instanceof Date) {
                        date = createdAt;
                      } else {
                        return 'N/A';
                      }
                      
                      return date.toLocaleDateString();
                    })()}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditUser(selectedUser);
                }}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit User
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedUser(null);
                }}
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-50 text-slate-500 cursor-not-allowed"
                />
                <p className="text-[10px] text-slate-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="disabled"
                  checked={editFormData.disabled}
                  onChange={(e) => setEditFormData({ ...editFormData, disabled: e.target.checked })}
                  className="h-3.5 w-3.5 text-amber-600 focus:ring-amber-500 border-slate-300 rounded"
                />
                <label htmlFor="disabled" className="text-xs text-slate-700">
                  Disable account
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-5 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Delete User</h2>
              </div>
            </div>
            <div className="p-5">
              <p className="text-xs text-slate-700 mb-3">
                Are you sure you want to delete <span className="font-semibold">{selectedUser.fullName || selectedUser.displayName || selectedUser.email}</span>? This action cannot be undone.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                <p className="text-xs text-red-800 mb-2">
                  <strong>Warning:</strong> This will permanently delete the user account.
                </p>
                <p className="text-[10px] text-red-700">
                  This action will:
                </p>
                <ul className="text-[10px] text-red-700 list-disc list-inside mt-1 space-y-0.5">
                  <li>Delete the user from Firebase Authentication</li>
                  <li>Delete the user document from Firestore</li>
                  <li>Delete all user data (conversations, events, tasks, notifications, etc.)</li>
                </ul>
                <p className="text-[10px] text-red-600 mt-2 font-medium">
                  This action cannot be undone. The user will be completely removed from the system.
                </p>
              </div>
            </div>
            <div className="p-5 border-t border-slate-200 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleting}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

