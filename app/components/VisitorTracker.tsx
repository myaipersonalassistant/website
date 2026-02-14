'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';
import { useAuth } from '@/lib/useAuth';

export default function VisitorTracker() {
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    // Track page view when pathname changes
    if (pathname) {
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        trackPageView(pathname, {
          userId: user?.uid || null,
          isAuthenticated: !!user
        }).catch((error) => {
          // Silently fail - don't break the app if tracking fails
          console.error('Failed to track page view:', error);
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [pathname, user]);

  return null; // This component doesn't render anything
}

