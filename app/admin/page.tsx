'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Mail,
  CreditCard,
  BarChart3,
  Shield,
  Database,
  TrendingUp,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { useState } from 'react';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({
    newSubmissions: 0,
    unreadSubmissions: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/auth?view=login');
        return;
      }
      loadStats();
    }
  }, [authLoading, isAuthenticated, router]);

  const loadStats = async () => {
    try {
      // Load contact submission stats
      const submissionsQuery = query(collection(db, 'contact_submissions'));
      const submissionsSnapshot = await getDocs(submissionsQuery);
      
      let newCount = 0;
      let unreadCount = 0;
      submissionsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.status === 'new') newCount++;
        if (!data.read) unreadCount++;
      });

      // Load user stats
      const usersQuery = query(collection(db, 'users'));
      const usersSnapshot = await getDocs(usersQuery);

      setStats({
        newSubmissions: newCount,
        unreadSubmissions: unreadCount,
        totalUsers: usersSnapshot.size,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const adminCards = [
    {
      title: 'Contact Submissions',
      description: 'Manage customer inquiries',
      href: '/admin/contact-submissions',
      icon: Mail,
      color: 'from-teal-500 to-cyan-600',
      badge: stats.newSubmissions > 0 ? stats.newSubmissions : undefined,
      badgeColor: 'bg-red-500',
      stats: [
        { label: 'New', value: stats.newSubmissions },
        { label: 'Unread', value: stats.unreadSubmissions },
      ]
    },
    {
      title: 'Users',
      description: 'View and manage users',
      href: '/admin/users',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      stats: [
        { label: 'Total Users', value: stats.totalUsers },
      ]
    },
    {
      title: 'Analytics',
      description: 'Platform insights and metrics',
      href: '/admin/analytics',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-600',
    },
    {
      title: 'Subscriptions',
      description: 'Manage user subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage your platform and support your users</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6 hover:border-teal-300 hover:shadow-xl transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {card.badge && (
                    <span className={`${card.badgeColor} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                      {card.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-teal-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{card.description}</p>
                {card.stats && (
                  <div className="flex gap-4 pt-4 border-t border-slate-200">
                    {card.stats.map((stat, index) => (
                      <div key={index}>
                        <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              href="/admin/contact-submissions"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-teal-50 hover:border-teal-300 border-2 border-transparent transition-all group"
            >
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                <Mail className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 group-hover:text-teal-600">Review Submissions</div>
                <div className="text-sm text-slate-500">{stats.newSubmissions} new messages</div>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-blue-50 hover:border-blue-300 border-2 border-transparent transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 group-hover:text-blue-600">Manage Users</div>
                <div className="text-sm text-slate-500">{stats.totalUsers} total users</div>
              </div>
            </Link>
            <Link
              href="/admin/analytics"
              className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl hover:bg-purple-50 hover:border-purple-300 border-2 border-transparent transition-all group"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-900 group-hover:text-purple-600">View Analytics</div>
                <div className="text-sm text-slate-500">Platform insights</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

