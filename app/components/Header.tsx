'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar, Menu, X, ChevronDown, Search, Bell, Plus,
  User, Settings, CreditCard, LogOut, HelpCircle, Zap,
  Download, LogIn, Briefcase, Users, BookOpen, TrendingUp,
  Shield, BarChart3, Database, Mail, GraduationCap, Sparkles
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

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
  const [isScrolled, setIsScrolled] = useState(false);

  const pathname = usePathname();

  const notificationsRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => pathname === path;

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

  const dashboardNav: NavItem[] = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Assistant', href: '/assistant' },
    { name: 'Email Insights', href: '/email-insights', badge: 3 },
    { name: 'Calendar', href: '/calendar' },
  ];

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
    { name: 'Analytics', href: '/admin/analytics' },
  ];

  const isAuthenticated = userRole === 'user' || userRole === 'admin';
  const isAdmin = userRole === 'admin';
  const showAuthButtons = userRole === 'guest';
  const currentNav = isAdmin ? adminNav : isAuthenticated ? dashboardNav : marketingNav;

  const quickActions = [
    { name: 'New Activity', icon: Plus },
    { name: 'Ask Assistant', icon: Sparkles },
  ];

  const profileMenuItems = [
    { name: 'My Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    { name: 'Billing', href: '/billing', icon: CreditCard },
    { name: 'Help & Support', href: '/help', icon: HelpCircle },
  ];

  const notifications = [
    { text: 'Meeting in 15 minutes', time: '5m ago' },
    { text: 'Flight booking detected', time: '1h ago' },
    { text: 'Daily briefing ready', time: '2h ago' },
  ];

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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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
                  {/* Search with Glass Effect */}
                  <div className="relative" ref={searchRef}>
                    {!showSearch ? (
                      <button
                        onClick={() => setShowSearch(true)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors"
                      >
                        <Search className="h-5 w-5" />
                      </button>
                    ) : (
                      <div className="absolute right-0 top-0 w-80 bg-white rounded-lg shadow-lg border border-teal-200 p-2">
                        <div className="flex items-center space-x-2">
                          <Search className="h-5 w-5 text-teal-500" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            autoFocus
                            className="flex-1 outline-none text-sm text-slate-700 placeholder-slate-400"
                          />
                          <button
                            onClick={() => {
                              setShowSearch(false);
                              setSearchQuery('');
                            }}
                            className="p-1 hover:bg-slate-100 rounded"
                          >
                            <X className="h-4 w-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="relative" ref={notificationsRef}>
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700 transition-colors relative"
                    >
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-1 right-1 h-2 w-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse shadow-lg"></span>
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-teal-100 py-2">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <h3 className="font-semibold text-sm text-slate-900">Notifications</h3>
                        </div>
                        {notifications.map((notif, idx) => (
                          <div key={idx} className="px-4 py-3 hover:bg-teal-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                            <p className="text-sm text-slate-900">{notif.text}</p>
                            <p className="text-xs text-teal-600 mt-1">{notif.time}</p>
                          </div>
                        ))}
                        <div className="px-4 py-2 text-center border-t border-slate-100">
                          <Link
                            href="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-sm font-medium text-teal-700 hover:text-teal-800"
                          >
                            View All
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
                          <button
                            key={action.name}
                            className="w-full flex items-center px-4 py-2.5 text-sm text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition-colors group"
                          >
                            <action.icon className="h-4 w-4 mr-3 text-teal-500 group-hover:text-teal-700" />
                            {action.name}
                          </button>
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