/**
 * Web Push Notification Service
 * Handles browser push notifications that work even when website is closed
 */

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: PushSubscription | null = null;

  /**
   * Register service worker and request push notification permission
   */
  async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('This browser does not support push notifications');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission denied');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscriptionData | null> {
    if (!this.registration) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    try {
      // Check if already subscribed
      this.subscription = await this.registration!.pushManager.getSubscription();
      
      if (this.subscription) {
        return this.serializeSubscription(this.subscription);
      }

      // Create new subscription
      // VAPID public key should be set in environment variables
      // For Next.js, use NEXT_PUBLIC_VAPID_PUBLIC_KEY
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.warn('VAPID public key not configured. Set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your .env file');
        return null;
      }

      this.subscription = await this.registration!.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey)
      });

      return this.serializeSubscription(this.subscription);
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      this.subscription = await this.registration?.pushManager.getSubscription() || null;
    }

    if (this.subscription) {
      try {
        await this.subscription.unsubscribe();
        this.subscription = null;
        return true;
      } catch (error) {
        console.error('Error unsubscribing:', error);
        return false;
      }
    }

    return true;
  }

  /**
   * Check if user is subscribed
   */
  async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      const subscription = await this.registration!.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  /**
   * Serialize subscription for storage
   */
  private serializeSubscription(subscription: PushSubscription): PushSubscriptionData {
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: key ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(key)))) : '',
        auth: auth ? btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth)))) : ''
      }
    };
  }

  /**
   * Convert VAPID key from URL-safe base64 to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

