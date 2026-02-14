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
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Billing', href: '/billing', icon: CreditCard },
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
    if (!user) return;
    
    try {
      setLoadingSubscription(true);
      const db = getDb();
      
      // Try to get subscription from users/{uid}/subscription subcollection first
      const subscriptionRef = doc(db, 'users', user.uid, 'subscription', 'current');
      const subscriptionDoc = await getDoc(subscriptionRef);
      
      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        setSubscription({
          planId: data.planId || data.plan_id || 'student',
          planName: data.planName || data.plan_name || 'Student',
          status: data.status || 'active',
          billingCycle: data.billingCycle || data.billing_cycle || 'monthly'
        });
        return;
      }
      
      // Fallback: Check if subscription is stored directly in user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.subscription) {
          const subData = userData.subscription;
          setSubscription({
            planId: subData.planId || subData.plan_id || 'student',
            planName: subData.planName || subData.plan_name || 'Student',
            status: subData.status || 'active',
            billingCycle: subData.billingCycle || subData.billing_cycle || 'monthly'
          });
          return;
        }
      }
      
      // If no subscription found, set to null (will show upgrade button)
      setSubscription(null);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
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
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white border border-slate-200 rounded-lg shadow-lg hover:bg-slate-50 transition-colors"
      >
        {sidebarOpen ? <PanelLeftClose className="h-5 w-5 text-slate-600" /> : <PanelLeft className="h-5 w-5 text-slate-600" />}
      </button>

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 z-[55] lg:z-auto`}>
        {/* Mobile Header Spacer - ensures content doesn't get covered by fixed header */}
        <div className="lg:hidden h-16 flex-shrink-0"></div>

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
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-teal-600' : 'text-slate-500 group-hover:text-teal-600'}`} />
                <span className="text-[11px] font-medium flex-1">{item.name}</span>
                {isActive && <ChevronRight className="h-3 w-3 text-teal-600 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <Link href="/profile" className="block group" tabIndex={0}>
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 transition-all duration-150 group-hover:bg-slate-50 rounded-lg p-1.5 -m-1.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium text-slate-800 truncate">{userName || 'User'}</p>
                {userEmail && (
                  <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
                )}
                {/* Subscription Status Badge */}
                {subscription && !loadingSubscription && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className={`px-1.5 py-0.5 rounded-lg text-[9px] font-medium border ${getStatusColor(subscription.status)}`}>
                      {subscription.planName}
                    </div>
                    {subscription.status === 'active' ? (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    ) : subscription.status === 'past_due' ? (
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                    ) : (
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[45]"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
}

