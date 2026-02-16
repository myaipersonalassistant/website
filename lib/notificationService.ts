/**
 * Browser Notification Service
 * Handles browser push notifications for calendar activities
 */

interface ActivityNotification {
  id: string;
  type: 'event' | 'reminder' | 'task';
  title: string;
  description?: string;
  scheduledTime: Date;
  location?: string;
  priority?: string;
}

class NotificationService {
  private checkInterval: NodeJS.Timeout | null = null;
  private notifiedIds: Set<string> = new Set();
  private readonly CHECK_INTERVAL = 60000; // Check every minute

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Request permission
    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  /**
   * Show a browser notification
   */
  showNotification(activity: ActivityNotification): void {
    if (!this.isEnabled()) {
      console.warn('Notifications are not enabled');
      return;
    }

    // Don't show duplicate notifications
    if (this.notifiedIds.has(activity.id)) {
      return;
    }

    const notificationId = `${activity.type}-${activity.id}`;
    
    // Mark as notified
    this.notifiedIds.add(notificationId);

    const body = activity.description 
      ? activity.description.substring(0, 100)
      : activity.location 
      ? `Location: ${activity.location}`
      : '';

    // Create notification
    // The tag already contains the activity type and ID, so we don't need the data property
    const notification = new Notification(activity.title, {
      body: body || 'Time for your activity!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notificationId, // Prevents duplicate notifications and contains activity info
      requireInteraction: activity.type === 'reminder', // Reminders stay until dismissed
    });

    // Handle click - navigate to calendar
    notification.onclick = () => {
      window.focus();
      window.location.href = '/calendar';
      notification.close();
    };

    // Auto-close after 5 seconds (except reminders)
    if (activity.type !== 'reminder') {
      setTimeout(() => {
        notification.close();
      }, 5000);
    }

    // Clean up notified IDs after 24 hours to allow re-notification
    setTimeout(() => {
      this.notifiedIds.delete(notificationId);
    }, 24 * 60 * 60 * 1000);
  }

  /**
   * Check for upcoming activities and show notifications
   * Only checks activities scheduled within the next 2 minutes to avoid unnecessary processing
   */
  async checkAndNotifyActivities(activities: ActivityNotification[]): Promise<void> {
    if (!this.isEnabled()) {
      return;
    }

    const now = new Date();
    const oneMinuteFromNow = new Date(now.getTime() + 60000); // 1 minute window
    const twoMinutesFromNow = new Date(now.getTime() + 120000); // 2 minutes for filtering

    // Filter activities to only those scheduled within the next 2 minutes
    // This reduces processing overhead
    const relevantActivities = activities.filter(activity => {
      const scheduledTime = new Date(activity.scheduledTime);
      return scheduledTime >= now && scheduledTime <= twoMinutesFromNow;
    });

    // Show notifications for activities due within the next minute
    relevantActivities.forEach(activity => {
      const scheduledTime = new Date(activity.scheduledTime);
      
      // Show notification if scheduled time is within the next minute
      if (scheduledTime >= now && scheduledTime <= oneMinuteFromNow) {
        this.showNotification(activity);
      }
    });
  }

  /**
   * Start monitoring activities for notifications
   * Uses in-memory data to avoid Firestore read costs
   */
  startMonitoring(
    fetchActivities: () => Promise<ActivityNotification[]>
  ): void {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    // Check immediately (uses in-memory data, no Firestore read)
    fetchActivities().then(activities => {
      this.checkAndNotifyActivities(activities);
    }).catch(error => {
      console.error('Error in notification check:', error);
    });

    // Then check periodically (uses in-memory data, no Firestore read)
    this.checkInterval = setInterval(async () => {
      try {
        const activities = await fetchActivities();
        await this.checkAndNotifyActivities(activities);
      } catch (error) {
        console.error('Error in periodic notification check:', error);
      }
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop monitoring activities
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Clear all notified IDs (useful for testing)
   */
  clearNotifiedIds(): void {
    this.notifiedIds.clear();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

