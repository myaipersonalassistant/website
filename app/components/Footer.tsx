'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Calendar, Mail, Shield, FileText, Scale, Globe, MapPin, 
  Linkedin, Twitter, Youtube, Instagram, Facebook,
  BookOpen, Users, Briefcase, Zap, HelpCircle, Activity,
  CheckCircle2, Sun, ExternalLink, ArrowRight
} from 'lucide-react';

interface FooterProps {
  userRole?: 'guest' | 'user' | 'admin';
}

const Footer: React.FC<FooterProps> = ({ userRole = 'guest' }) => {
  const currentYear = new Date().getFullYear();
  const isAuthenticated = userRole === 'user' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  // Marketing Footer (Unauthenticated)
  const MarketingFooter = () => (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-t border-teal-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Company Info - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-2.5 rounded-xl shadow-lg shadow-teal-500/50">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <h3 className="ml-3 text-xl font-bold">MAI-PA</h3>
            </div>
            <p className="text-slate-300 mb-6 leading-relaxed">
              Your intelligent AI-powered personal assistant for seamless productivity,
              smart scheduling, and life management. Experience the future of personal assistance.
            </p>
            <div className="space-y-3">
              <Link
                href="mailto:info@maipa.ai"
                className="flex items-center text-slate-300 hover:text-teal-400 transition-colors group"
              >
                <div className="bg-slate-800/80 p-2 rounded-lg group-hover:bg-teal-900/50 transition-colors border border-teal-500/20">
                  <Mail className="h-4 w-4 text-teal-400" />
                </div>
                <span className="text-sm ml-3">info@maipa.ai</span>
              </Link>
              <div className="flex items-center text-slate-300 group">
                <div className="bg-slate-800/80 p-2 rounded-lg border border-teal-500/20">
                  <MapPin className="h-4 w-4 text-teal-400" />
                </div>
                <span className="text-sm ml-3">Belfast, Northern Ireland</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8">
              <h4 className="text-sm font-semibold mb-3 text-teal-300">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 bg-slate-800/50 border border-teal-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                />
                <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg shadow-teal-500/30">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-teal-300 flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'My Dashboard', href: '/dashboard' },
                { name: 'Features', href: '/#features-overview' },
                { name: 'Pricing', href: '/pricing' },
                { name: 'Mobile Apps', href: '/download' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-teal-400 transition-colors duration-150 flex items-center text-sm group"
                  >
                    <span className="w-1 h-1 bg-teal-500 rounded-full mr-3 group-hover:w-2 transition-all"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-teal-300 flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              Solutions
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'For Students', href: '/pricing/student' },
                { name: 'For Professionals', href: '/pricing/professional' },
                { name: 'For Executives', href: '/pricing/executive' },
                { name: 'For Teams', href: '/pricing/team' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-teal-400 transition-colors duration-150 text-sm flex items-center group"
                  >
                    <span className="w-1 h-1 bg-teal-500 rounded-full mr-3 group-hover:w-2 transition-all"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-teal-300 flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                { name: 'Help Center', href: '/help_center', icon: HelpCircle },
                { name: 'FAQs', href: '/faq', icon: BookOpen },
                { name: 'Community', href: '/community', icon: Users },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-teal-400 transition-colors duration-150 flex items-center text-sm group"
                  >
                    <item.icon className="h-3.5 w-3.5 mr-3 text-teal-500 group-hover:text-teal-400" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal Combined */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-5 text-teal-300 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Company & Legal
            </h4>
            <ul className="space-y-3 mb-8">
              {[
                { name: 'About Us', href: '/about' },
                { name: 'Contact Us', href: '/contact' },
                { name: 'Privacy Policy', href: '/privacy' },
                { name: 'Terms of Service', href: '/terms' },
                { name: 'Legal', href: '/legal' },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-300 hover:text-teal-400 transition-colors duration-150 flex items-center text-sm group"
                  >
                    <span className="w-1 h-1 bg-teal-500 rounded-full mr-3 group-hover:w-2 transition-all"></span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-teal-900/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
            {/* Copyright */}
            <div className="text-slate-400 text-sm">
              © {currentYear} MAI-PA. All rights reserved.
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {[
                { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-400' },
                { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-sky-400' },
                { icon: Youtube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:text-red-400' },
                { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-400' },
                { icon: Facebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-500' },
              ].map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`p-2 rounded-lg bg-slate-800/50 border border-teal-700/30 ${social.color} transition-all hover:scale-110 hover:bg-slate-700/50`}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>

            {/* Language Selector */}
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-teal-700/30 rounded-lg text-slate-300 hover:text-teal-400 hover:bg-slate-700/50 transition-all text-sm">
                <Globe className="h-4 w-4 text-teal-400" />
                <span>English (US)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );

  // Dashboard Footer (Authenticated User)
  const DashboardFooter = () => (
    <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0 gap-4">
          {/* Left Side */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
            <span className="text-slate-400">© {currentYear} MAI-PA</span>
            <Link href="/privacy" className="text-slate-300 hover:text-teal-400 transition-colors flex items-center">
              <Shield className="h-3.5 w-3.5 mr-1.5 text-teal-400" />
              Privacy
            </Link>
            <Link href="/terms" className="text-slate-300 hover:text-teal-400 transition-colors flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1.5 text-teal-400" />
              Terms
            </Link>
            {isAdmin && (
              <Link href="/admin" className="text-slate-300 hover:text-teal-400 transition-colors flex items-center">
                <Activity className="h-3.5 w-3.5 mr-1.5 text-teal-400" />
                Admin
              </Link>
            )}
          </div>

          {/* Center */}
          <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-teal-900/30 border border-teal-700/50 rounded-lg hover:bg-teal-900/50 transition-colors cursor-pointer group">
            <Link href="/contact" className="flex flex-row text-xs sm:text-sm text-teal-300 group-hover:text-teal-200 transition-colors font-medium self-center">
              <HelpCircle className="h-3.5 w-4 sm:h-4 sm:w-4 mr-1.5 text-teal-400 self-center" />
              <span className="hidden sm:inline">Need Help? Chat with us</span>
              <span className="sm:hidden">Help</span>
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm">
            <span className="px-2 py-1 bg-teal-900/50 border border-teal-700/30 text-teal-300 rounded text-[10px] sm:text-xs font-medium">v1.0.0</span>
            {isAdmin && (
              <span className="px-2 py-1 bg-red-900/50 border border-red-700/30 text-red-300 rounded text-[10px] sm:text-xs font-medium">Admin</span>
            )}
            <button className="flex items-center space-x-2 text-slate-300 hover:text-teal-400 transition-colors">
              <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-teal-400" />
              <span className="hidden sm:inline">English</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );

  // Render appropriate footer based on userRole
  // MarketingFooter: For unauthenticated guests (public pages)
  // DashboardFooter: For authenticated users (both regular users and admins)
  if (isAuthenticated) {
    return <DashboardFooter />;
  } else {
    return <MarketingFooter />;
  }
};

export default Footer;