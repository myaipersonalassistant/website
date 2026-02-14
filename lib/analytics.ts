'use client';

import { getAnalyticsInstance } from './firebase';
import { logEvent } from 'firebase/analytics';

// NOTE: This analytics system uses CLIENT-SIDE STORAGE (localStorage) instead of Firestore
// to avoid expensive read/write operations. Data is stored locally and can be viewed
// in the admin analytics page. No Firestore writes = No costs!

// Client-side analytics storage (no Firestore writes)
interface PageViewData {
  visitorId: string;
  sessionId: string;
  path: string;
  timestamp: number;
  device: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  country: string;
  source: string;
  referrer: string | null;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  language: string;
  duration: number;
  [key: string]: any;
}

// Track page view - CLIENT-SIDE ONLY (no Firestore writes)
export async function trackPageView(path: string, additionalData?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    const analytics = getAnalyticsInstance();
    
    // Get visitor information
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const device = getDeviceType();
    const browser = getBrowser();
    const referrer = document.referrer || 'Direct';
    const source = getTrafficSource(referrer);
    const startTime = performance.now();
    
    // Get country with timeout - don't block tracking if it fails
    let country = 'Unknown';
    try {
      const countryPromise = getCountryFromIP();
      const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('Unknown'), 2000); // 2 second timeout
      });
      country = await Promise.race([countryPromise, timeoutPromise]);
    } catch (error) {
      // Silently fail - use 'Unknown' as default
      country = 'Unknown';
    }
    
    // Track in Firebase Analytics (free, no Firestore writes)
    if (analytics) {
      logEvent(analytics, 'page_view', {
        page_path: path,
        page_title: document.title,
        ...additionalData
      });
    }

    // Store in client-side storage (localStorage) - NO Firestore writes
    const visitData: PageViewData = {
      visitorId,
      sessionId,
      path,
      timestamp: Date.now(),
      device,
      browser,
      country,
      source,
      referrer: referrer !== 'Direct' ? referrer : null,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      duration: 0, // Will be updated when user leaves page
      ...additionalData
    };

    // Store in localStorage (client-side only)
    const visitId = `visit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const visits = getStoredVisits();
    visits.push({ id: visitId, ...visitData });
    
    // Keep only last 1000 visits in localStorage to prevent storage bloat
    if (visits.length > 1000) {
      visits.splice(0, visits.length - 1000);
    }
    
    saveStoredVisits(visits);
    sessionStorage.setItem('current_visit_id', visitId);
    sessionStorage.setItem('current_visit_start', startTime.toString());
    
    // Track page exit to calculate duration (client-side only)
    const trackPageExit = () => {
      try {
        const duration = Math.round((performance.now() - startTime) / 1000); // in seconds
        if (visitId && duration > 0) {
          const visits = getStoredVisits();
          const visitIndex = visits.findIndex(v => v.id === visitId);
          if (visitIndex !== -1) {
            visits[visitIndex].duration = duration;
            saveStoredVisits(visits);
          }
        }
      } catch (error) {
        // Silently fail on page exit
      }
    };

    window.addEventListener('beforeunload', trackPageExit);
    window.addEventListener('pagehide', trackPageExit);

    // Also update previous visit duration if exists
    const previousVisitId = sessionStorage.getItem('previous_visit_id');
    const previousVisitStart = sessionStorage.getItem('previous_visit_start');
    if (previousVisitId && previousVisitStart) {
      const previousDuration = Math.round((startTime - parseFloat(previousVisitStart)) / 1000);
      if (previousDuration > 0) {
        try {
          const visits = getStoredVisits();
          const visitIndex = visits.findIndex(v => v.id === previousVisitId);
          if (visitIndex !== -1) {
            visits[visitIndex].duration = previousDuration;
            saveStoredVisits(visits);
          }
        } catch (error) {
          // Ignore errors for previous visits
        }
      }
    }

    sessionStorage.setItem('previous_visit_id', visitId);
    sessionStorage.setItem('previous_visit_start', startTime.toString());

    return visitId;
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
}

// Track custom events - CLIENT-SIDE ONLY
export async function trackEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    const analytics = getAnalyticsInstance();
    if (analytics) {
      logEvent(analytics, eventName, eventParams);
    }

    // Store in client-side storage (localStorage) - NO Firestore writes
    const visitorId = getOrCreateVisitorId();
    const sessionId = getOrCreateSessionId();
    const device = getDeviceType();
    const browser = getBrowser();
    const referrer = document.referrer || 'Direct';
    const source = getTrafficSource(referrer);
    
    // Get country with timeout - don't block tracking if it fails
    let country = 'Unknown';
    try {
      const countryPromise = getCountryFromIP();
      const timeoutPromise = new Promise<string>((resolve) => {
        setTimeout(() => resolve('Unknown'), 2000); // 2 second timeout
      });
      country = await Promise.race([countryPromise, timeoutPromise]);
    } catch (error) {
      // Silently fail - use 'Unknown' as default
      country = 'Unknown';
    }
    
    const eventData: PageViewData & { id: string; type?: string; eventName?: string; eventParams?: any } = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'event',
      eventName,
      eventParams,
      visitorId,
      sessionId,
      timestamp: Date.now(),
      path: window.location.pathname,
      device,
      browser,
      country,
      source,
      referrer: referrer !== 'Direct' ? referrer : null,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      duration: 0
    };

    const visits = getStoredVisits();
    visits.push(eventData);
    
    // Keep only last 1000 events in localStorage
    if (visits.length > 1000) {
      visits.splice(0, visits.length - 1000);
    }
    
    saveStoredVisits(visits);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Helper functions for client-side storage
function getStoredVisits(): Array<PageViewData & { id: string; type?: string; eventName?: string; eventParams?: any }> {
  try {
    const stored = localStorage.getItem('analytics_visits');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    return [];
  }
}

function saveStoredVisits(visits: Array<PageViewData & { id: string; type?: string; eventName?: string; eventParams?: any }>) {
  try {
    localStorage.setItem('analytics_visits', JSON.stringify(visits));
  } catch (error) {
    // If storage is full, try to clear old data
    try {
      const recentVisits = visits.slice(-500); // Keep only last 500
      localStorage.setItem('analytics_visits', JSON.stringify(recentVisits));
    } catch (e) {
      console.error('Failed to save analytics data:', e);
    }
  }
}

// Export function to get all stored visits (for admin analytics page)
export function getAllStoredVisits(): Array<PageViewData & { id: string; type?: string; eventName?: string; eventParams?: any }> {
  return getStoredVisits();
}

// Optional: Function to clear old analytics data (older than X days)
export function clearOldAnalyticsData(daysToKeep: number = 30) {
  try {
    const visits = getStoredVisits();
    const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    const filtered = visits.filter(v => v.timestamp >= cutoff);
    saveStoredVisits(filtered);
    return filtered.length;
  } catch (error) {
    console.error('Error clearing old analytics data:', error);
    return 0;
  }
}

// Helper functions
function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
}

function getOrCreateSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
    sessionStorage.setItem('session_start', Date.now().toString());
  }
  return sessionId;
}

function getDeviceType(): 'desktop' | 'mobile' | 'tablet' {
  const width = window.innerWidth;
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

function getBrowser(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
    return 'Chrome';
  }
  if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    return 'Safari';
  }
  if (userAgent.indexOf('Firefox') > -1) {
    return 'Firefox';
  }
  if (userAgent.indexOf('Edg') > -1) {
    return 'Edge';
  }
  if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
    return 'Opera';
  }
  return 'Unknown';
}

function getTrafficSource(referrer: string): string {
  if (!referrer || referrer === 'Direct') {
    return 'Direct';
  }
  
  try {
    const url = new URL(referrer);
    const hostname = url.hostname.toLowerCase();
    
    if (hostname.includes('google') || hostname.includes('bing') || hostname.includes('yahoo') || hostname.includes('duckduckgo')) {
      return 'Organic Search';
    }
    if (hostname.includes('facebook') || hostname.includes('twitter') || hostname.includes('linkedin') || hostname.includes('instagram')) {
      return 'Social Media';
    }
    return 'Referral';
  } catch {
    return 'Direct';
  }
}

async function getCountryFromIP(): Promise<string> {
  try {
    // Use a free IP geolocation service with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const response = await fetch('https://ipapi.co/json/', { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return 'Unknown';
    }
    
    const data = await response.json();
    return data.country_name || data.country_code || 'Unknown';
  } catch (error) {
    // Silently fail - don't block tracking if geolocation fails
    return 'Unknown';
  }
}

