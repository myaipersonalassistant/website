'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar, Menu, X, ChevronDown, Search, Bell, Plus,
  User, Settings, CreditCard, LogOut, HelpCircle, Zap,
  Download, LogIn, Briefcase, Users, BookOpen, TrendingUp,
  Shield, BarChart3, Database, Mail, GraduationCap, Sparkles, MessagesSquare
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { getDb } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from 'firebase/firestore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder' | 'activity' | 'system';
  category: 'meeting' | 'flight' | 'task' | 'briefing' | 'calendar' | 'email' | 'general' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  is_read: boolean;
  is_archived: boolean;
  action_url?: string;
  created_at: string;
}

interface DropdownItem {
  name: string;
  href: string;
  icon?: LucideIcon;
}

interface NavItem {
  name: string;
  href: string;
  dropdown?: DropdownItem[];
  badge?: number;
}

interface HeaderProps {
  userRole?: 'guest' | 'user' | 'admin';
  user?: FirebaseUser | null;
}

const Header = ({ userRole = 'guest', user }: HeaderProps) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSearchIndex, setSelectedSearchIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerNotifications, setHeaderNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [emailInsightsCount, setEmailInsightsCount] = useState(0);

  const pathname = usePathname();

  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

  // Compute authentication status early (before useEffects that use it)
  const isAuthenticated = userRole === 'user' || userRole === 'admin';
  const isAdmin = userRole === 'admin';
  const showAuthButtons = userRole === 'guest';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setShowQuickActions(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications for header directly from Firestore
  useEffect(() => {
    const fetchHeaderNotifications = async () => {
      if (!user || !isAuthenticated) {
        setHeaderNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        setLoadingNotifications(true);
        const db = getDb();
        
        // Fetch unread count
        try {
          const unreadQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', user.uid),
            where('is_read', '==', false),
            where('is_archived', '==', false)
          );
          const unreadSnapshot = await getDocs(unreadQuery);
          setUnreadCount(unreadSnapshot.size);
        } catch (error: any) {
          // Fallback: fetch all and filter client-side
          if (error.code === 'failed-precondition') {
            const allQuery = query(
              collection(db, 'notifications'),
              where('userId', '==', user.uid)
            );
            const allSnapshot = await getDocs(allQuery);
            const unreadCount = allSnapshot.docs.filter(
              doc => !doc.data().is_read && !doc.data().is_archived
            ).length;
            setUnreadCount(unreadCount);
          } else {
            console.error('Error fetching unread count:', error);
            setUnreadCount(0);
          }
        }

        // Fetch recent notifications (only if dropdown is open or we need the count)
        if (showNotifications || unreadCount > 0) {
          try {
            const recentQuery = query(
              collection(db, 'notifications'),
              where('userId', '==', user.uid),
              where('is_archived', '==', false),
              orderBy('created_at', 'desc'),
              limit(5)
            );
            const recentSnapshot = await getDocs(recentQuery);
            const notifications: Notification[] = recentSnapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                title: data.title || '',
                message: data.message || '',
                type: data.type || 'info',
                category: data.category || 'general',
                priority: data.priority || 'medium',
                is_read: data.is_read || false,
                is_archived: data.is_archived || false,
                action_url: data.action_url,
                created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString()
              };
            });
            setHeaderNotifications(notifications);
          } catch (error: any) {
            // Fallback: fetch all and filter/sort client-side
            if (error.code === 'failed-precondition') {
              const allQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', user.uid)
              );
              const allSnapshot = await getDocs(allQuery);
              let notifications: Notification[] = allSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  title: data.title || '',
                  message: data.message || '',
                  type: data.type || 'info',
                  category: data.category || 'general',
                  priority: data.priority || 'medium',
                  is_read: data.is_read || false,
                  is_archived: data.is_archived || false,
                  action_url: data.action_url,
                  created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString()
                };
              });
              
              // Filter and sort client-side
              notifications = notifications
                .filter(n => !n.is_archived)
                .sort((a, b) => {
                  const dateA = new Date(a.created_at).getTime();
                  const dateB = new Date(b.created_at).getTime();
                  return dateB - dateA;
                })
                .slice(0, 5);
              
              setHeaderNotifications(notifications);
            } else {
              console.error('Error fetching recent notifications:', error);
              setHeaderNotifications([]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching header notifications:', error);
        setHeaderNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchHeaderNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchHeaderNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated, showNotifications]);

  // Fetch email insights count (pending items)
  useEffect(() => {
    const fetchEmailInsightsCount = async () => {
      if (!user || !isAuthenticated) {
        setEmailInsightsCount(0);
        return;
      }

      try {
        // Ensure Firebase is initialized
        if (typeof window === 'undefined') {
          setEmailInsightsCount(0);
          return;
        }
        let db;
        try {
          db = getDb();
        } catch (dbError) {
          // Silently fail if Firestore is not initialized
          setEmailInsightsCount(0);
          return;
        }
        if (!db) {
          setEmailInsightsCount(0);
          return;
        }
        // Fetch pending extracted items for the user
        const itemsQuery = query(
          collection(db, 'extracted_items'),
          where('userId', '==', user.uid),
          where('status', '==', 'pending')
        );
        const itemsSnapshot = await getDocs(itemsQuery);
        setEmailInsightsCount(itemsSnapshot.size);
      } catch (error: any) {
        // Handle Firestore index errors gracefully
        if (error?.code === 'failed-precondition' || error?.code === 9 || error?.message?.includes('INTERNAL ASSERTION')) {
          // Index missing or internal error - fallback to fetching all user items and filtering client-side
          try {
            let db;
            try {
              db = getDb();
            } catch (dbError) {
              setEmailInsightsCount(0);
              return;
            }
            if (!db) {
              setEmailInsightsCount(0);
              return;
            }
            const fallbackQuery = query(
              collection(db, 'extracted_items'),
              where('userId', '==', user.uid)
            );
            const fallbackSnapshot = await getDocs(fallbackQuery);
            const pendingCount = fallbackSnapshot.docs.filter(
              doc => doc.data().status === 'pending'
            ).length;
            setEmailInsightsCount(pendingCount);
          } catch (fallbackError) {
            // Silently fail - don't spam console with errors
            setEmailInsightsCount(0);
          }
        } else {
          // Only log non-index errors
          if (!error?.message?.includes('INTERNAL ASSERTION')) {
            console.error('Error fetching email insights count:', error);
          }
          setEmailInsightsCount(0);
        }
      }
    };

    fetchEmailInsightsCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchEmailInsightsCount, 30000);
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  // Navigation configurations
  const marketingNav: NavItem[] = [
    {
      name: 'Product',
      href: '#',
      dropdown: [
        { name: 'Features Overview', href: '/#features-overview', icon: Zap },
        { name: 'AI Assistant', href: '/#ai-assistant', icon: Sparkles },
        { name: 'Smart Calendar', href: '/#smart-calendar', icon: Calendar },
        { name: 'Email Intelligence', href: '/#email-intelligence', icon: Mail },
      ]
    },
    {
      name: 'Solutions',
      href: '#',
      dropdown: [
        { name: 'For Students', href: '/pricing/student', icon: GraduationCap },
        { name: 'For Professionals', href: '/pricing/professional', icon: Briefcase },
        { name: 'For Executives', href: '/pricing/executive', icon: TrendingUp },
        { name: 'For Teams', href: '/pricing/team', icon: Users },
      ]
    },
    {
      name: 'Resources',
      href: '#',
      dropdown: [
        { name: 'Help Center', href: '/help_center', icon: HelpCircle },
        { name: 'FAQs', href: '/faq', icon: BookOpen },
        { name: 'Community', href: '/community', icon: Users },
      ]
    },
    { name: 'Pricing', href: '/pricing' },
  ];

  // Dashboard navigation with dynamic badge (computed with useMemo)
  const dashboardNav: NavItem[] = useMemo(() => [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Assistant', href: '/assistant' },
    { name: 'Email Insights', href: '/email-insights', badge: emailInsightsCount > 0 ? emailInsightsCount : undefined },
    { name: 'Calendar', href: '/calendar' },
  ], [emailInsightsCount]);

  const adminNav: NavItem[] = [
    { 
      name: 'Admin Dashboard', 
      href: '/admin',
    },
    { 
      name: 'Users', 
      href: '#',
      dropdown: [
        { name: 'All Users', href: '/admin/users', icon: Users },
        { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
        { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
      ]
    },
    { 
      name: 'Support', 
      href: '#',
      dropdown: [
        { name: 'Contact Submissions', href: '/admin/contact-submissions', icon: Mail },
        { name: 'Help Center', href: '/help_center', icon: HelpCircle },
      ]
    },
    { 
      name: 'System', 
      href: '#',
      dropdown: [
        { name: 'Platform Health', href: '/admin/health', icon: Shield },
        { name: 'Database', href: '/admin/database', icon: Database },
        { name: 'API Usage', href: '/admin/api', icon: BarChart3 },
      ]
    },
  ];

  const currentNav = isAdmin ? adminNav : isAuthenticated ? dashboardNav : marketingNav;

  const quickActions = [
    { name: 'New Activity', icon: Plus, href: '/calendar/new' },
    { name: 'Ask Assistant', icon: Sparkles, href: '/assistant' },
  ];

  const profileMenuItems = [
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Contact Us', href: '/contact', icon: MessagesSquare },
  ];

  // Searchable pages/routes
  interface SearchablePage {
    name: string;
    href: string;
    icon: LucideIcon;
    category: string;
    keywords: string[];
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
  }

  const searchablePages: SearchablePage[] = [
    // Main Dashboard Pages
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, category: 'Main', keywords: ['dashboard', 'home', 'overview', 'main'], requiresAuth: true },
    { name: 'Assistant', href: '/assistant', icon: Sparkles, category: 'Main', keywords: ['assistant', 'ai', 'chat', 'help', 'ask'], requiresAuth: true },
    { name: 'Calendar', href: '/calendar', icon: Calendar, category: 'Main', keywords: ['calendar', 'schedule', 'events', 'meetings'], requiresAuth: true },
    { name: 'New Activity', href: '/calendar/new', icon: Plus, category: 'Main', keywords: ['new activity', 'create event', 'add task', 'new event', 'new reminder'], requiresAuth: true },
    { name: 'Email Insights', href: '/email-insights', icon: Mail, category: 'Main', keywords: ['email', 'insights', 'emails', 'messages'], requiresAuth: true },
    { name: 'Notifications', href: '/notifications', icon: Bell, category: 'Main', keywords: ['notifications', 'alerts', 'notices'], requiresAuth: true },
    
    // Profile & Settings
    { name: 'Profile', href: '/profile', icon: User, category: 'Account', keywords: ['profile', 'user', 'account', 'me'], requiresAuth: true },
    { name: 'Settings', href: '/settings', icon: Settings, category: 'Account', keywords: ['settings', 'preferences', 'config', 'options'], requiresAuth: true },
    { name: 'Billing', href: '/billing', icon: CreditCard, category: 'Account', keywords: ['billing', 'payment', 'subscription', 'plan', 'invoice'], requiresAuth: true },
    
    // Public Pages
    { name: 'Pricing', href: '/pricing', icon: TrendingUp, category: 'Public', keywords: ['pricing', 'plans', 'subscribe', 'cost', 'price'] },
    { name: 'Contact', href: '/contact', icon: MessagesSquare, category: 'Public', keywords: ['contact', 'support', 'help', 'reach out'] },
    { name: 'Help Center', href: '/help_center', icon: HelpCircle, category: 'Public', keywords: ['help', 'support', 'faq', 'documentation'] },
    { name: 'FAQ', href: '/faq', icon: BookOpen, category: 'Public', keywords: ['faq', 'questions', 'answers', 'help'] },
    { name: 'Community', href: '/community', icon: Users, category: 'Public', keywords: ['community', 'forum', 'discuss'] },
    { name: 'Download', href: '/download', icon: Download, category: 'Public', keywords: ['download', 'app', 'install'] },
    
    // Admin Pages
    { name: 'Admin Dashboard', href: '/admin', icon: Shield, category: 'Admin', keywords: ['admin', 'dashboard', 'management'], requiresAuth: true, requiresAdmin: true },
    { name: 'All Users', href: '/admin/users', icon: Users, category: 'Admin', keywords: ['users', 'admin', 'manage users'], requiresAuth: true, requiresAdmin: true },
    { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard, category: 'Admin', keywords: ['subscriptions', 'admin', 'plans'], requiresAuth: true, requiresAdmin: true },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, category: 'Admin', keywords: ['analytics', 'stats', 'metrics', 'admin'], requiresAuth: true, requiresAdmin: true },
    { name: 'Contact Submissions', href: '/admin/contact-submissions', icon: Mail, category: 'Admin', keywords: ['contact', 'submissions', 'admin', 'inquiries'], requiresAuth: true, requiresAdmin: true },
    { name: 'Platform Health', href: '/admin/health', icon: Shield, category: 'Admin', keywords: ['health', 'status', 'admin', 'system'], requiresAuth: true, requiresAdmin: true },
    { name: 'Database', href: '/admin/database', icon: Database, category: 'Admin', keywords: ['database', 'admin', 'data'], requiresAuth: true, requiresAdmin: true },
    { name: 'API Usage', href: '/admin/api', icon: BarChart3, category: 'Admin', keywords: ['api', 'usage', 'admin'], requiresAuth: true, requiresAdmin: true },
  ];

  // Filter searchable pages based on query and permissions
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    return searchablePages
      .filter(page => {
        // Check authentication requirement
        if (page.requiresAuth && !isAuthenticated) return false;
        // Check admin requirement
        if (page.requiresAdmin && !isAdmin) return false;
        
        // Search in name, category, and keywords
        const matchesName = page.name.toLowerCase().includes(query);
        const matchesCategory = page.category.toLowerCase().includes(query);
        const matchesKeywords = page.keywords.some(keyword => keyword.includes(query));
        const matchesHref = page.href.toLowerCase().includes(query);
        
        return matchesName || matchesCategory || matchesKeywords || matchesHref;
      })
      .slice(0, 8); // Limit to 8 results
  }, [searchQuery, isAuthenticated, isAdmin]);

  // Handle keyboard navigation in search
  useEffect(() => {
    if (!showSearch) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSearchIndex(prev => 
          prev < filteredPages.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSearchIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && filteredPages.length > 0) {
        e.preventDefault();
        const selectedPage = filteredPages[selectedSearchIndex];
        if (selectedPage) {
          router.push(selectedPage.href);
          setShowSearch(false);
          setSearchQuery('');
          setSelectedSearchIndex(0);
        }
      } else if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchQuery('');
        setSelectedSearchIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearch, filteredPages, selectedSearchIndex, router]);

  // Reset selected index when search query changes
  useEffect(() => {
    setSelectedSearchIndex(0);
  }, [searchQuery]);

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
      setShowProfileMenu(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 lg:z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50'
          : 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Gradient Animation */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 group-hover:blur-md transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-teal-800 to-slate-900 bg-clip-text text-transparent">
                  Mai-PA
                </span>
                {isAdmin && (
                  <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white rounded-lg shadow-lg animate-pulse">
                    ADMIN
                  </span>
                )}
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {currentNav.map((item) => (
                <div
                  key={item.name}
                  className="relative"
                  onMouseEnter={() => item.dropdown && setActiveDropdown(item.name)}
                  onMouseLeave={() => item.dropdown && setActiveDropdown(null)}
                >
                  {item.dropdown ? (
                    <button
                      onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-all duration-150 flex items-center space-x-1"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-2 ${
                        isActive(item.href)
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200'
                          : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                      }`}
                    >
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="relative flex h-5 w-5">
                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse shadow-lg">
                            {item.badge}
                            </span>
                        </span>
                      )}
                    </Link>
                  )}

                  {/* Dropdown Menu with Glass Effect */}
                  {item.dropdown && activeDropdown === item.name && (
                    <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-xl shadow-xl border border-teal-100 py-2 z-50">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 mr-3 text-teal-500 group-hover:text-teal-700" />}
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {!isAuthenticated && showAuthButtons && (
                <>
                  <Link
                    href="/download"
                    className="hidden sm:flex items-center px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Link>
                  {/* Auth Buttons for Guests */}
                  {showAuthButtons && (
                    <div className="hidden lg:flex items-center space-x-3">
                      <Link
                        href="/auth?view=login"
                        className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          <LogIn className="h-4 w-4" />
                          <span>Sign In</span>
                        </div>
                      </Link>
                      <Link
                        href="/auth?view=signup"
                        className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        <div className="flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Get Started</span>
                        </div>
                      </Link>
                    </div>
                  )}
                </>
              )}

              {isAuthenticated && (
                <>
                  {/* Search with Quick Navigation */}
                  <div className="relative" ref={searchRef}>
                    {!showSearch ? (
                      <button
                        onClick={() => setShowSearch(true)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                        title="Search pages (Ctrl+K)"
                      >
                        <Search className="h-5 w-5" />
                      </button>
                    ) : (
                      <div className="absolute right-0 top-0 w-96 bg-white rounded-xl shadow-xl border border-teal-200 overflow-hidden z-50">
                        {/* Search Input */}
                        <div className="flex items-center space-x-2 p-3 border-b border-slate-100">
                          <Search className="h-5 w-5 text-teal-500 flex-shrink-0" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search pages, features, and more..."
                            autoFocus
                            className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400"
                          />
                          <button
                            onClick={() => {
                              setShowSearch(false);
                              setSearchQuery('');
                              setSelectedSearchIndex(0);
                            }}
                            className="p-1 hover:bg-slate-100 rounded transition-colors"
                            title="Close (Esc)"
                          >
                            <X className="h-4 w-4 text-slate-400" />
                          </button>
                        </div>

                        {/* Search Results */}
                        {searchQuery.trim() && (
                          <div className="max-h-96 overflow-y-auto">
                            {filteredPages.length === 0 ? (
                              <div className="p-6 text-center">
                                <Search className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">No results found</p>
                                <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                              </div>
                            ) : (
                              <div className="py-2">
                                {filteredPages.map((page, index) => {
                                  const Icon = page.icon;
                                  const isSelected = index === selectedSearchIndex;
                                  return (
                                    <Link
                                      key={page.href}
                                      href={page.href}
                                      onClick={() => {
                                        setShowSearch(false);
                                        setSearchQuery('');
                                        setSelectedSearchIndex(0);
                                      }}
                                      className={`flex items-center gap-3 px-4 py-3 hover:bg-teal-50 transition-colors cursor-pointer ${
                                        isSelected ? 'bg-teal-50' : ''
                                      }`}
                                    >
                                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                                        page.category === 'Main' ? 'bg-blue-100 text-blue-600' :
                                        page.category === 'Account' ? 'bg-purple-100 text-purple-600' :
                                        page.category === 'Admin' ? 'bg-red-100 text-red-600' :
                                        'bg-slate-100 text-slate-600'
                                      }`}>
                                        <Icon className="h-4 w-4" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <p className="text-sm font-medium text-slate-900 truncate">
                                            {page.name}
                                          </p>
                                          <span className="text-xs text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
                                            {page.category}
                                          </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">
                                          {page.href}
                                        </p>
                                      </div>
                                      {isSelected && (
                                        <div className="text-xs text-slate-400 flex-shrink-0">
                                          Enter ↵
                                        </div>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Search Tips */}
                        {!searchQuery.trim() && (
                          <div className="p-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 mb-2">Quick tips:</p>
                            <div className="flex flex-wrap gap-2">
                              {['dashboard', 'calendar', 'settings', 'profile'].map((tip) => (
                                <button
                                  key={tip}
                                  onClick={() => setSearchQuery(tip)}
                                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                                >
                                  {tip}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        // Refresh notifications when opening dropdown (handled by useEffect)
                      }}
                      className="p-2 rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors relative"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-4 w-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse shadow-lg flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                        </span>
                      )}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-teal-100 py-2 z-50 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                          {unreadCount > 0 && (
                            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-full">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                        {loadingNotifications ? (
                          <div className="px-4 py-8 text-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto"></div>
                            <p className="text-xs text-slate-500 mt-2">Loading...</p>
                          </div>
                        ) : headerNotifications.length === 0 ? (
                          <div className="px-4 py-8 text-center">
                            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No notifications</p>
                            <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
                          </div>
                        ) : (
                          <>
                            {headerNotifications.map((notif) => (
                              <Link
                                key={notif.id}
                                href={notif.action_url || '/notifications'}
                                onClick={() => setShowNotifications(false)}
                                className={`block px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${
                                  !notif.is_read ? 'bg-teal-50/50' : ''
                                }`}
                              >
                                <p className={`text-sm ${!notif.is_read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-1">{notif.message}</p>
                                <p className="text-xs text-teal-600 mt-1">{getTimeAgo(notif.created_at)}</p>
                              </Link>
                            ))}
                          </>
                        )}
                        <div className="px-4 py-2 text-center border-t border-slate-100">
                          <Link
                            href="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-sm font-medium text-teal-700 hover:text-teal-800"
                          >
                            View All Notifications
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="relative hidden md:block" ref={quickActionsRef}>
                    <button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className="p-2 rounded-lg bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl"
                    >
                      <Plus className="h-5 w-5" />
                    </button>

                    {showQuickActions && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-teal-100 py-2">
                        {quickActions.map((action) => (
                          <Link
                            key={action.name}
                            href={action.href}
                            onClick={() => setShowQuickActions(false)}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                          >
                            <action.icon className="h-4 w-4 mr-3 text-teal-500 group-hover:text-teal-700" />
                            {action.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Profile Menu */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="h-8 w-8 rounded-full object-cover ring-2 ring-teal-500 ring-offset-1 shadow-sm hover:shadow-md transition-shadow"
                    >
                      {user?.photoURL ? (
                        <Image
                          src={user.photoURL}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <Image
                          src={"/profile.jpg"}
                          alt="Profile"
                          width={32}
                          height={32}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-teal-200"
                        />
                      )}
                    </button>

                    {showProfileMenu && (
                     <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-teal-100 py-2">
                        <div className="px-4 py-3 border-b border-slate-100">
                          <p className="font-semibold text-sm text-slate-900">
                            {user?.displayName || user?.email?.split('@')[0] || 'User'}
                          </p>
                          <p className="text-xs text-teal-600">{user?.email || 'No email'}</p>
                        </div>
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setShowProfileMenu(false)}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                          >
                            <item.icon className="h-4 w-4 mr-3 text-teal-500 group-hover:text-teal-700" />
                            {item.name}
                          </Link>
                        ))}
                        <div className="border-t border-slate-100 mt-2 pt-2">
                          <button 
                            onClick={handleSignOut}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                          >
                            <LogOut className="h-4 w-4 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-teal-100 py-4">
              <nav className="flex flex-col space-y-1">
                {currentNav.map((item) => (
                  <div key={item.name}>
                    {item.dropdown ? (
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                        className="w-full px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between text-slate-700 hover:bg-teal-50"
                      >
                        <span>{item.name}</span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between ${
                          isActive(item.href)
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                          : 'text-slate-700 hover:bg-teal-50 hover:text-teal-700'
                        }`}
                      >
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )}
                    {item.dropdown && activeDropdown === item.name && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.dropdown.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            onClick={() => {
                              setIsMenuOpen(false);
                              setActiveDropdown(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700 rounded-lg"
                          >
                            {subItem.icon && (
                              <div className="mr-2 p-1 rounded-lg bg-teal-50">
                                <subItem.icon className="h-4 w-4 text-teal-600" />
                              </div>
                            )}
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {/* Mobile Auth Buttons */}
                {showAuthButtons && (
                  <div className="border-t border-slate-100 mt-2 pt-2 space-y-1">
                    <Link
                      href="/auth?view=login"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-lg transition-colors group"
                    >
                      <LogIn className="h-4 w-4 mr-3 text-teal-500 group-hover:text-teal-700 transition-colors" />
                      Sign In
                    </Link>
                    <Link
                      href="/auth?view=signup"
                      onClick={() => setIsMenuOpen(false)}
                      className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg shadow-md hover:shadow-lg transition-all group mt-2"
                    >
                      <Sparkles className="h-4 w-4 mr-3 text-white transition-colors" />
                      Get Started
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Header;