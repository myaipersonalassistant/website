'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  BarChart3,
  Mail,
  Shield,
  Database,
  Activity,
  Settings,
  HelpCircle,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  User,
  TrendingUp,
  Server,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Contact Submissions', href: '/admin/contact-submissions', icon: Mail },
  { name: 'Platform Health', href: '/admin/health', icon: Activity },
  { name: 'Database', href: '/admin/database', icon: Database },
  { name: 'API Usage', href: '/admin/api-usage', icon: Server },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
        {/* Mobile Header Spacer */}
        <div className="lg:hidden h-16 flex-shrink-0"></div>

        {/* Logo/Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">Admin Panel</h2>
              <div className="flex items-center gap-1 text-[10px] text-emerald-600">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                System Active
              </div>
            </div>
          </div>
          <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-[10px] text-amber-700 font-medium">Admin Access</p>
            <p className="text-[9px] text-amber-600 mt-0.5">Full system control</p>
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
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 text-amber-700 font-semibold shadow-sm'
                    : 'hover:bg-slate-50 border border-transparent hover:border-slate-200 text-slate-700'
                }`}
              >
                <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-amber-600' : 'text-slate-500 group-hover:text-amber-600'}`} />
                <span className="text-[11px] font-medium flex-1">{item.name}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="h-3 w-3 text-amber-600 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* Quick Links */}
        <div className="p-4 border-t border-slate-200 flex-shrink-0">
          <div className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>User Dashboard</span>
            </Link>
            <Link
              href="/help_center"
              className="flex items-center gap-2 px-3 py-2 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Help Center</span>
            </Link>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium text-slate-800 truncate">{user?.displayName || user?.email?.split('@')[0] || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@maipa.ai'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="px-1.5 py-0.5 rounded-lg text-[9px] font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  Admin
                </div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
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

