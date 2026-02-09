'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Mail,
  Calendar,
  Settings,
  Bell,
  User,
  ChevronRight,
  X,
  PanelLeftClose,
  PanelLeft,
  CreditCard,
  Crown,
  Briefcase,
  Users as UsersIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Assistant', href: '/assistant', icon: MessageSquare },
  { name: 'Email Insights', href: '/email-insights', icon: Mail },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface Subscription {
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  billingCycle: 'monthly' | 'annual';
}

const planIcons: Record<string, React.ReactNode> = {
  student: <User className="h-4 w-4" />,
  professional: <Briefcase className="h-4 w-4" />,
  executive: <Crown className="h-4 w-4" />,
  team: <UsersIcon className="h-4 w-4" />
};

const planColors: Record<string, string> = {
  student: 'from-teal-500 to-cyan-600',
  professional: 'from-cyan-500 to-blue-600',
  executive: 'from-teal-500 to-cyan-600',
  team: 'from-emerald-500 to-teal-600'
};

interface DashboardSidebarProps {
  userName?: string;
  userEmail?: string;
}

export default function DashboardSidebar({ userName, userEmail }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      setLoadingSubscription(true);
      // Mock data - replace with actual Firebase queries later
      const mockSubscription: Subscription = {
        planId: 'professional',
        planName: 'Professional',
        status: 'active',
        billingCycle: 'monthly'
      };
      setSubscription(mockSubscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'trialing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'past_due':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'canceled':
        return 'text-slate-600 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white border border-slate-200 rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
      >
        {sidebarOpen ? <PanelLeftClose className="h-5 w-5 text-slate-600" /> : <PanelLeft className="h-5 w-5 text-slate-600" />}
      </button>

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 z-40 lg:z-auto`}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-br from-teal-50 to-cyan-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">MAI-PA</h2>
                <p className="text-[11px] text-slate-500">Navigation</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 text-teal-700 font-semibold shadow-sm'
                    : 'hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-700'
                }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-500 group-hover:text-teal-600'}`} />
                <span className="text-xs font-medium flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-4 w-4 text-teal-600 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Subscription */}
        <div className="p-4 sm:p-6 border-t border-slate-200 bg-white flex-shrink-0 space-y-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-800 truncate">{userName || 'User'}</p>
              {userEmail && (
                <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
              )}
            </div>
          </div>

          {/* Subscription Info */}
          {subscription && !loadingSubscription ? (
            <div className="p-3 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 bg-gradient-to-br ${planColors[subscription.planId]} rounded-lg text-white`}>
                    {planIcons[subscription.planId]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{subscription.planName}</p>
                    <p className="text-[10px] text-slate-600 capitalize">
                      {subscription.billingCycle}
                    </p>
                  </div>
                </div>
                {subscription.status === 'active' ? (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                ) : subscription.status === 'past_due' ? (
                  <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                ) : (
                  <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                )}
              </div>
              <Link
                href="/billing"
                className="flex items-center gap-1.5 text-[11px] font-medium text-teal-700 hover:text-teal-800 transition-colors group"
              >
                <CreditCard className="h-3 w-3" />
                <span>Manage Billing</span>
                <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          ) : !loadingSubscription ? (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Crown className="h-4 w-4" />
              <span>Upgrade Plan</span>
            </Link>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl animate-pulse">
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

