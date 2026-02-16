'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Clock,
  MapPin,
  CheckSquare,
  Bell,
  Mail,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Filter,
  RefreshCw,
  ArrowRight,
  Edit,
  Trash2,
  X,
  Brain,
  CalendarDays
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import { useRouter } from 'next/navigation';
import { getDb } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc,
  updateDoc,
  Timestamp,
  orderBy 
} from 'firebase/firestore';
import { notificationService } from '@/lib/notificationService';
import { pushNotificationService } from '@/lib/pushNotificationService';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time?: string;
  location?: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  source: 'manual' | 'email';
  email_id?: string;
  created_at: string;
}

interface Reminder {
  id: string;
  title: string;
  description?: string;
  remind_at: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  source: 'manual' | 'email';
  email_id?: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  source: 'manual' | 'email';
  email_id?: string;
  created_at: string;
}

interface EmailInsight {
  id: string;
  email_id: string;
  subject: string;
  from_name: string;
  from_email: string;
  received_at: string;
  items_count: number;
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emailInsights, setEmailInsights] = useState<EmailInsight[]>([]);
  // Store all activities for calendar dots (not filtered by date)
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [allReminders, setAllReminders] = useState<Reminder[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [showMobileCalendar, setShowMobileCalendar] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'events' | 'reminders' | 'tasks' | 'emails'>('all');
  const [indexWarnings, setIndexWarnings] = useState<Array<{ collection: string; indexUrl: string }>>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Refs to store latest activities for notification monitoring (avoids closure issues)
  const activitiesRef = useRef<{
    events: CalendarEvent[];
    reminders: Reminder[];
    tasks: Task[];
  }>({ events: [], reminders: [], tasks: [] });
  
  // Update refs when activities change
  useEffect(() => {
    activitiesRef.current = {
      events: allEvents,
      reminders: allReminders,
      tasks: allTasks
    };
  }, [allEvents, allReminders, allTasks]);

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      // Set userName from auth user object
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      fetchAllActivities();
    }
  }, [user, authLoading]);

  // Separate effect for notification monitoring (uses in-memory data, no Firestore reads)
  // This effect only runs once when user is available, then uses closure to access latest state
  useEffect(() => {
    if (!user) return;
    
    // Request notification permission and initialize push notifications
    if (typeof window !== 'undefined') {
      // Request browser notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        notificationService.requestPermission().catch(console.error);
      }
      
      // Initialize and subscribe to push notifications (works even when website is closed)
      pushNotificationService.initialize().then(async (initialized) => {
        if (initialized && user) {
          try {
            const subscription = await pushNotificationService.subscribe();
            if (subscription) {
              // Save subscription to backend
              const token = await user.getIdToken();
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
              await fetch(`${backendUrl}/api/push/subscribe`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ subscription })
              }).catch(error => {
                console.error('Error saving push subscription:', error);
              });
            }
          } catch (error) {
            console.error('Error subscribing to push notifications:', error);
          }
        }
      }).catch(console.error);
      
      // Use in-memory data from refs (already loaded, no Firestore read)
      // Refs ensure we always get the latest data without restarting the interval
      const getActivitiesFromMemory = async () => {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const activities: Array<{
          id: string;
          type: 'event' | 'reminder' | 'task';
          title: string;
          description?: string;
          scheduledTime: Date;
          location?: string;
          priority?: string;
        }> = [];
        
        // Use activities from refs (latest data, no Firestore read)
        const { events, reminders, tasks } = activitiesRef.current;
        
        events.forEach(event => {
          if (event.status === 'cancelled') return;
          const eventTime = new Date(event.start_time);
          if (eventTime >= now && eventTime <= tomorrow) {
            activities.push({
              id: event.id,
              type: 'event',
              title: event.title,
              description: event.description,
              scheduledTime: eventTime,
              location: event.location
            });
          }
        });
        
        reminders.forEach(reminder => {
          if (reminder.status === 'cancelled') return;
          const remindTime = new Date(reminder.remind_at);
          if (remindTime >= now && remindTime <= tomorrow) {
            activities.push({
              id: reminder.id,
              type: 'reminder',
              title: reminder.title,
              description: reminder.description,
              scheduledTime: remindTime
            });
          }
        });
        
        tasks.forEach(task => {
          if (task.status === 'cancelled' || !task.due_date) return;
          const dueTime = new Date(task.due_date);
          if (dueTime >= now && dueTime <= tomorrow) {
            activities.push({
              id: task.id,
              type: 'task',
              title: task.title,
              description: task.description,
              scheduledTime: dueTime,
              priority: task.priority
            });
          }
        });
        
        return activities;
      };
      
      // Start monitoring with in-memory data (no Firestore reads)
      notificationService.startMonitoring(getActivitiesFromMemory);
      
      // Cleanup on unmount
      return () => {
        notificationService.stopMonitoring();
      };
    }
  }, [user]); // Only run once when user is available - closure captures latest state

  // Fetch data when selected date changes (only filter, don't re-fetch all)
  useEffect(() => {
    if (!user) return;
    
    // Check if selected date is in the currently loaded month
    const selectedYear = selectedDate.getFullYear();
    const selectedMonth = selectedDate.getMonth();
    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();
    
    // If selected date is in a different month, update currentMonth to trigger fetch
    if (selectedYear !== currentYear || selectedMonth !== currentMonthIndex) {
      setCurrentMonth(new Date(selectedYear, selectedMonth, 1));
      return; // Don't filter yet, wait for activities to load
    }
    
    // Selected date is in current month - filter activities
    if (allEvents.length > 0 || allReminders.length > 0 || allTasks.length > 0) {
      filterActivitiesForSelectedDate();
    } else {
      // If no activities loaded yet, just filter empty arrays
      filterActivitiesForSelectedDate([], [], []);
    }
  }, [selectedDate, allEvents, allReminders, allTasks, user, currentMonth]);

  // Fetch all activities when month changes
  useEffect(() => {
    if (user) {
      fetchAllActivities();
    }
  }, [currentMonth, user]);

  // Fetch all activities for the current month (for calendar dots)
  // IMPORTANT: We fetch based on ACTIVITY DATES (start_time, remind_at, due_date), NOT creation dates
  const fetchAllActivities = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const db = getDb();
      
      // Get date range for current month (based on ACTIVITY dates, not creation dates)
      // We need to account for timezone differences when querying Firestore
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      // Create dates in local timezone for comparison
      const firstDay = new Date(year, month, 1, 0, 0, 0, 0);
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59, 999);
      
      // For Firestore query, we need to expand the range to account for timezone differences
      // Activities created in different timezones might be stored with UTC times that fall outside
      // the local month range. So we expand by 1 day on each side to be safe.
      const queryStart = new Date(year, month, 1);
      queryStart.setDate(queryStart.getDate() - 1); // Start 1 day earlier
      queryStart.setHours(0, 0, 0, 0);
      
      const queryEnd = new Date(year, month + 1, 0);
      queryEnd.setDate(queryEnd.getDate() + 1); // End 1 day later
      queryEnd.setHours(23, 59, 59, 999);
      
      const firstTimestamp = Timestamp.fromDate(queryStart);
      const lastTimestamp = Timestamp.fromDate(queryEnd);

      // Fetch all events for the month
      // CRITICAL: Filter by start_time (activity date), NOT created_at (creation date)
      let allEventsData: CalendarEvent[] = [];
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', user.uid),
          where('start_time', '>=', firstTimestamp),
          where('start_time', '<=', lastTimestamp),
          orderBy('start_time')
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        allEventsData = eventsSnapshot.docs.map(doc => {
          const data = doc.data();
          // Use start_time (activity date), NOT created_at
          const startTime = data.start_time?.toDate?.() || new Date(data.start_time);
          return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            start_time: startTime.toISOString(), // This is the date that appears on calendar
            end_time: data.end_time?.toDate?.()?.toISOString() || data.end_time,
            location: data.location || '',
            status: data.status || 'pending',
            source: data.source || 'manual',
            email_id: data.email_id || '',
            created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString()
          };
        });
      } catch (err: any) {
        // Fallback: fetch all events and filter client-side by start_time (activity date)
        const allEventsQuery = query(
          collection(db, 'events'),
          where('userId', '==', user.uid)
        );
        const allEventsSnapshot = await getDocs(allEventsQuery);
        allEventsData = allEventsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Use start_time (activity date), NOT created_at
            const startTime = data.start_time?.toDate?.() || new Date(data.start_time);
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              start_time: startTime.toISOString(), // This is the date that appears on calendar
              end_time: data.end_time?.toDate?.()?.toISOString() || data.end_time,
              location: data.location || '',
              status: data.status || 'pending',
              source: data.source || 'manual',
              email_id: data.email_id || '',
              created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString()
            };
          })
          .filter(e => {
            // Filter by local date string to match calendar view
            const eventDate = new Date(e.start_time);
            const eventDateStr = getLocalDateString(eventDate);
            const firstDayStr = getLocalDateString(firstDay);
            const lastDayStr = getLocalDateString(lastDay);
            return eventDateStr >= firstDayStr && eventDateStr <= lastDayStr;
          });
      }

      // Fetch all reminders for the month
      // CRITICAL: Filter by remind_at (activity date), NOT created_at (creation date)
      let allRemindersData: Reminder[] = [];
      try {
        const remindersQuery = query(
          collection(db, 'reminders'),
          where('userId', '==', user.uid),
          where('remind_at', '>=', firstTimestamp),
          where('remind_at', '<=', lastTimestamp),
          orderBy('remind_at')
        );
        const remindersSnapshot = await getDocs(remindersQuery);
        allRemindersData = remindersSnapshot.docs.map(doc => {
          const data = doc.data();
          // Use remind_at (activity date), NOT created_at
          const remindAt = data.remind_at?.toDate?.() || new Date(data.remind_at);
          return {
            id: doc.id,
            title: data.title || '',
            description: data.description || '',
            remind_at: remindAt.toISOString(), // This is the date that appears on calendar
            status: data.status || 'pending',
            source: data.source || 'manual',
            email_id: data.email_id || '',
            created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString()
          };
        });
      } catch (err: any) {
        // Fallback: fetch all reminders and filter client-side by remind_at (activity date)
        const allRemindersQuery = query(
          collection(db, 'reminders'),
          where('userId', '==', user.uid)
        );
        const allRemindersSnapshot = await getDocs(allRemindersQuery);
        allRemindersData = allRemindersSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Use remind_at (activity date), NOT created_at
            const remindAt = data.remind_at?.toDate?.() || new Date(data.remind_at);
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              remind_at: remindAt.toISOString(), // This is the date that appears on calendar
              status: data.status || 'pending',
              source: data.source || 'manual',
              email_id: data.email_id || '',
              created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString()
            };
          })
          .filter(r => {
            // Filter by local date string to match calendar view
            const reminderDate = new Date(r.remind_at);
            const reminderDateStr = getLocalDateString(reminderDate);
            const firstDayStr = getLocalDateString(firstDay);
            const lastDayStr = getLocalDateString(lastDay);
            return reminderDateStr >= firstDayStr && reminderDateStr <= lastDayStr;
          });
      }

      // Fetch all tasks for the month
      // CRITICAL: Filter by due_date (activity date), NOT created_at (creation date)
      let allTasksData: Task[] = [];
      try {
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid),
          where('due_date', '>=', firstTimestamp),
          where('due_date', '<=', lastTimestamp),
          orderBy('due_date')
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        allTasksData = tasksSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Use due_date (activity date), NOT created_at
            const dueDate = data.due_date?.toDate?.() || (data.due_date ? new Date(data.due_date) : null);
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              due_date: dueDate?.toISOString() || data.due_date, // This is the date that appears on calendar
              priority: data.priority || 'normal',
              status: data.status || 'pending',
              source: data.source || 'manual',
              email_id: data.email_id || '',
              created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString()
            };
          })
          .filter(t => t.due_date); // Only tasks with due_date
      } catch (err: any) {
        // Fallback: fetch all tasks and filter client-side by due_date (activity date)
        const allTasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', user.uid)
        );
        const allTasksSnapshot = await getDocs(allTasksQuery);
        allTasksData = allTasksSnapshot.docs
          .map(doc => {
            const data = doc.data();
            // Use due_date (activity date), NOT created_at
            const dueDate = data.due_date?.toDate?.() || (data.due_date ? new Date(data.due_date) : null);
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              due_date: dueDate?.toISOString() || data.due_date, // This is the date that appears on calendar
              priority: data.priority || 'normal',
              status: data.status || 'pending',
              source: data.source || 'manual',
              email_id: data.email_id || '',
              created_at: data.created_at?.toDate?.()?.toISOString() || data.created_at || new Date().toISOString()
            };
          })
          .filter(t => {
            if (!t.due_date) return false;
            // Filter by local date string to match calendar view
            const taskDate = new Date(t.due_date);
            const taskDateStr = getLocalDateString(taskDate);
            const firstDayStr = getLocalDateString(firstDay);
            const lastDayStr = getLocalDateString(lastDay);
            return taskDateStr >= firstDayStr && taskDateStr <= lastDayStr;
          });
      }

      setAllEvents(allEventsData);
      setAllReminders(allRemindersData);
      setAllTasks(allTasksData);
      
      // Also filter for selected date
      filterActivitiesForSelectedDate(allEventsData, allRemindersData, allTasksData);
    } catch (error) {
      console.error('Error fetching all activities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter activities for the selected date
  const filterActivitiesForSelectedDate = (
    eventsToFilter: CalendarEvent[] | null = null,
    remindersToFilter: Reminder[] | null = null,
    tasksToFilter: Task[] | null = null
  ) => {
    if (!user) return;
    
    try {
      setLoadingActivities(true);
      // Use local date string to avoid timezone conversion issues
      const selectedDateStr = getLocalDateString(selectedDate);
      // Create date objects in local timezone for the selected date
      const targetDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      const nextDate = new Date(targetDate);
      nextDate.setDate(nextDate.getDate() + 1);

      // Use provided arrays or fall back to state
      const eventsArray = eventsToFilter !== null ? eventsToFilter : allEvents;
      const remindersArray = remindersToFilter !== null ? remindersToFilter : allReminders;
      const tasksArray = tasksToFilter !== null ? tasksToFilter : allTasks;

      // Filter events for selected date by ACTIVITY DATE (start_time), NOT creation date
      // Use LOCAL date strings for comparison to avoid timezone issues
      const eventsData = eventsArray.filter(e => {
        // Use start_time (activity date), NOT created_at
        // Convert to local date string for comparison
        const eventDate = getLocalDateString(new Date(e.start_time));
        return eventDate === selectedDateStr;
      });

      // Filter reminders for selected date by ACTIVITY DATE (remind_at), NOT creation date
      // Use LOCAL date strings for comparison to avoid timezone issues
      // Also deduplicate by ID to prevent duplicates
      const seenReminderIds = new Set<string>();
      const remindersData = remindersArray.filter(r => {
        // Deduplicate: skip if we've already seen this reminder ID
        if (seenReminderIds.has(r.id)) {
          return false;
        }
        seenReminderIds.add(r.id);
        
        // Use remind_at (activity date), NOT created_at
        // Convert to local date string for comparison
        const reminderDate = getLocalDateString(new Date(r.remind_at));
        return reminderDate === selectedDateStr;
      });

      // Filter tasks for selected date by ACTIVITY DATE (due_date), NOT creation date
      // Use LOCAL date strings for comparison to avoid timezone issues
      const tasksData = tasksArray.filter(t => {
        if (!t.due_date) return false;
        // Use due_date (activity date), NOT created_at
        // Convert to local date string for comparison
        const taskDate = getLocalDateString(new Date(t.due_date));
        return taskDate === selectedDateStr;
      });

      // Fetch email insights for the selected date
      fetchEmailInsightsForDate(targetDate, nextDate);

      // Deduplicate events, reminders, and tasks by ID before setting state
      const uniqueEvents = eventsData.filter((event, index, self) => 
        index === self.findIndex(e => e.id === event.id)
      );
      const uniqueReminders = remindersData.filter((reminder, index, self) => 
        index === self.findIndex(r => r.id === reminder.id)
      );
      const uniqueTasks = tasksData.filter((task, index, self) => 
        index === self.findIndex(t => t.id === task.id)
      );

      setEvents(uniqueEvents);
      setReminders(uniqueReminders);
      setTasks(uniqueTasks);
    } catch (error) {
      console.error('Error filtering activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Fetch email insights for a specific date
  const fetchEmailInsightsForDate = async (targetDate: Date, nextDate: Date) => {
    if (!user) return;
    
    try {
      const db = getDb();
      const targetTimestamp = Timestamp.fromDate(targetDate);
      const nextTimestamp = Timestamp.fromDate(nextDate);

      let emailInsightsData: EmailInsight[] = [];
      try {
        const emailsQuery = query(
          collection(db, 'emails'),
          where('userId', '==', user.uid),
          where('received_at', '>=', targetTimestamp),
          where('received_at', '<', nextTimestamp)
        );
        const emailsSnapshot = await getDocs(emailsQuery);
        const emailIds = emailsSnapshot.docs.map(doc => doc.id);
        
        // Get extracted items count for each email
        const itemsCounts: Record<string, number> = {};
        if (emailIds.length > 0) {
          for (let i = 0; i < emailIds.length; i += 10) {
            const batch = emailIds.slice(i, i + 10);
            const itemsQuery = query(
              collection(db, 'extracted_items'),
              where('userId', '==', user.uid),
              where('email_id', 'in', batch)
            );
            const itemsSnapshot = await getDocs(itemsQuery);
            itemsSnapshot.docs.forEach(doc => {
              const emailId = doc.data().email_id;
              if (!itemsCounts[emailId]) itemsCounts[emailId] = 0;
              itemsCounts[emailId]++;
            });
          }
        }
        
        emailInsightsData = emailsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            email_id: doc.id,
            subject: data.subject || '',
            from_name: data.from_name || '',
            from_email: data.from_email || '',
            received_at: data.received_at?.toDate?.()?.toISOString() || data.received_at,
            items_count: itemsCounts[doc.id] || 0
          };
        });
      } catch (err: any) {
        // Fallback: fetch all and filter client-side
        const allEmailsQuery = query(
          collection(db, 'emails'),
          where('userId', '==', user.uid)
        );
        const allEmailsSnapshot = await getDocs(allEmailsQuery);
        const emailIds = allEmailsSnapshot.docs.map(doc => doc.id);
        const itemsCounts: Record<string, number> = {};
        
        if (emailIds.length > 0) {
          for (let i = 0; i < emailIds.length; i += 10) {
            const batch = emailIds.slice(i, i + 10);
            const itemsQuery = query(
              collection(db, 'extracted_items'),
              where('userId', '==', user.uid),
              where('email_id', 'in', batch)
            );
            const itemsSnapshot = await getDocs(itemsQuery);
            itemsSnapshot.docs.forEach(doc => {
              const emailId = doc.data().email_id;
              if (!itemsCounts[emailId]) itemsCounts[emailId] = 0;
              itemsCounts[emailId]++;
            });
          }
        }
        
        emailInsightsData = allEmailsSnapshot.docs
          .map(doc => {
            const data = doc.data();
            const receivedAt = data.received_at?.toDate?.() || new Date(data.received_at);
            return {
              id: doc.id,
              email_id: doc.id,
              subject: data.subject || '',
              from_name: data.from_name || '',
              from_email: data.from_email || '',
              received_at: receivedAt.toISOString(),
              items_count: itemsCounts[doc.id] || 0
            };
          })
          .filter(e => {
            const emailDate = new Date(e.received_at);
            return emailDate >= targetDate && emailDate < nextDate;
          });
      }

      setEmailInsights(emailInsightsData);
    } catch (error) {
      console.error('Error fetching email insights:', error);
    }
  };

  const isSameDate = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isToday = (date: Date) => {
    return isSameDate(date, new Date());
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // Get activities for a specific date
  // CRITICAL: Uses ACTIVITY DATES (start_time, remind_at, due_date), NOT creation dates (created_at)
  // Uses LOCAL timezone for date comparison to avoid timezone conversion issues
  const getActivitiesForDate = (date: Date | null) => {
    if (!date) return { events: 0, reminders: 0, tasks: 0 };
    const dateStr = getLocalDateString(date);
    
    // Use allEvents, allReminders, allTasks for calendar dots (not filtered arrays)
    // Filter by ACTIVITY DATES, not creation dates
    // Compare using LOCAL date strings to avoid timezone issues
    const dayEvents = allEvents.filter(e => {
      // Use start_time (activity date), NOT created_at
      // Convert to local date string for comparison
      const eventDate = getLocalDateString(new Date(e.start_time));
      return eventDate === dateStr;
    });
    
    const dayReminders = allReminders.filter(r => {
      // Use remind_at (activity date), NOT created_at
      // Convert to local date string for comparison
      const reminderDate = getLocalDateString(new Date(r.remind_at));
      return reminderDate === dateStr;
    });
    
    const dayTasks = allTasks.filter(t => {
      if (!t.due_date) return false;
      // Use due_date (activity date), NOT created_at
      // Convert to local date string for comparison
      const taskDate = getLocalDateString(new Date(t.due_date));
      return taskDate === dateStr;
    });

    return {
      events: dayEvents.length,
      reminders: dayReminders.length,
      tasks: dayTasks.length,
    };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    // Ensure activities are loaded for the month of the selected date
    // If the selected date is in a different month than currentMonth, fetch that month's activities
    const selectedYear = date.getFullYear();
    const selectedMonth = date.getMonth();
    const currentYear = currentMonth.getFullYear();
    const currentMonthIndex = currentMonth.getMonth();
    
    if (selectedYear !== currentYear || selectedMonth !== currentMonthIndex) {
      // Selected date is in a different month, update currentMonth to trigger fetch
      setCurrentMonth(new Date(selectedYear, selectedMonth, 1));
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.floor(diff / 86400000);

    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days === -1) return 'Yesterday';
    if (days > 1 && days < 7) return `In ${days} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Helper function to get local date string (YYYY-MM-DD) from a date
  // This avoids timezone conversion issues when comparing dates
  const getLocalDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'normal':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'completed':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'cancelled':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  const updateEventStatus = async (eventId: string, newStatus: 'pending' | 'approved' | 'completed' | 'cancelled') => {
    if (!user) return;
    try {
      const db = getDb();
      await updateDoc(doc(db, 'events', eventId), {
        status: newStatus
      });
      // Update local state
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
      setAllEvents(prev => prev.map(e => e.id === eventId ? { ...e, status: newStatus } : e));
    } catch (error) {
      console.error('Error updating event status:', error);
    }
  };

  const updateReminderStatus = async (reminderId: string, newStatus: 'pending' | 'approved' | 'completed' | 'cancelled') => {
    if (!user) return;
    try {
      const db = getDb();
      await updateDoc(doc(db, 'reminders', reminderId), {
        status: newStatus
      });
      // Update local state
      setReminders(prev => prev.map(r => r.id === reminderId ? { ...r, status: newStatus } : r));
      setAllReminders(prev => prev.map(r => r.id === reminderId ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Error updating reminder status:', error);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'approved' | 'completed' | 'cancelled') => {
    if (!user) return;
    try {
      const db = getDb();
      await updateDoc(doc(db, 'tasks', taskId), {
        status: newStatus
      });
      // Update local state
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getSelectedDateItems = () => {
    // Use local date string to avoid timezone conversion issues
    const dateStr = getLocalDateString(selectedDate);
    
    const dayEvents = events.filter(e => {
      // Use local date string for comparison
      const eventDate = getLocalDateString(new Date(e.start_time));
      return eventDate === dateStr;
    });
    
    // Filter reminders and deduplicate by ID
    const seenReminderIds = new Set<string>();
    const dayReminders = reminders.filter(r => {
      // Deduplicate: skip if we've already seen this reminder ID
      if (seenReminderIds.has(r.id)) {
        return false;
      }
      seenReminderIds.add(r.id);
      
      // Use local date string for comparison
      const reminderDate = getLocalDateString(new Date(r.remind_at));
      return reminderDate === dateStr;
    });
    
    // Filter tasks and deduplicate by ID
    const seenTaskIds = new Set<string>();
    const dayTasks = tasks.filter(t => {
      if (!t.due_date) return false;
      
      // Deduplicate: skip if we've already seen this task ID
      if (seenTaskIds.has(t.id)) {
        return false;
      }
      seenTaskIds.add(t.id);
      
      // Use local date string for comparison
      const taskDate = getLocalDateString(new Date(t.due_date));
      return taskDate === dateStr;
    });

    return { events: dayEvents, reminders: dayReminders, tasks: dayTasks };
  };

  // Get all activities based on active filter for pagination
  const getAllFilteredActivities = () => {
    const selectedDateItems = getSelectedDateItems();
    const allActivities: Array<{ id: string; type: 'event' | 'reminder' | 'task' | 'email'; data: any }> = [];
    const seenIds = new Set<string>(); // Track IDs to prevent duplicates
    
    if (activeFilter === 'all' || activeFilter === 'events') {
      selectedDateItems.events.forEach(event => {
        if (!seenIds.has(event.id)) {
          seenIds.add(event.id);
          allActivities.push({ id: event.id, type: 'event', data: event });
        }
      });
    }
    
    if (activeFilter === 'all' || activeFilter === 'reminders') {
      selectedDateItems.reminders.forEach(reminder => {
        if (!seenIds.has(reminder.id)) {
          seenIds.add(reminder.id);
          allActivities.push({ id: reminder.id, type: 'reminder', data: reminder });
        }
      });
    }
    
    if (activeFilter === 'all' || activeFilter === 'tasks') {
      selectedDateItems.tasks.forEach(task => {
        if (!seenIds.has(task.id)) {
          seenIds.add(task.id);
          allActivities.push({ id: task.id, type: 'task', data: task });
        }
      });
    }
    
    if (activeFilter === 'all' || activeFilter === 'emails') {
      emailInsights.forEach(insight => {
        if (!seenIds.has(insight.id)) {
          seenIds.add(insight.id);
          allActivities.push({ id: insight.id, type: 'email', data: insight });
        }
      });
    }
    
    return allActivities;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xs text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const selectedDateItems = getSelectedDateItems();
  const totalItems = selectedDateItems.events.length + selectedDateItems.reminders.length + selectedDateItems.tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex">
      {/* Dashboard Sidebar */}
      <DashboardSidebar userName={userName} userEmail={user?.email || undefined} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <CalendarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-white mb-1">Calendar</h1>
                  <p className="text-[11px] sm:text-xs text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Your schedule at a glance
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => fetchAllActivities()}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] sm:text-xs font-semibold hidden sm:inline">Refresh</span>
                </button>
                <button 
                  onClick={() => router.push('/calendar/new')}
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-[11px] sm:text-xs">New Activity</span>
                </button>
              </div>
            </div>

            {/* Selected Date Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-white/80 mb-1">Selected Date</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-white/80 mb-1">Activities</p>
                  <div className="flex items-center gap-2">
                    <div className="text-xl sm:text-2xl font-bold text-white">{totalItems}</div>
                    <div className="flex flex-col gap-0.5">
                      {selectedDateItems.events.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      )}
                      {selectedDateItems.reminders.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                      )}
                      {selectedDateItems.tasks.length > 0 && (
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Calendar Grid - Hidden on mobile, shown on desktop */}
          <div className="hidden lg:flex w-full lg:w-96 xl:w-[28rem] bg-white border-r border-slate-200 flex-col overflow-hidden flex-shrink-0">
            {/* Month Navigation */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600" />
                </button>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-[10px] font-semibold text-slate-500 py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square"></div>;
                  }

                  const activities = getActivitiesForDate(date);
                  const isSelected = isSameDate(date, selectedDate);
                  const isTodayDate = isToday(date);

                  return (
                    <button
                      key={index}
                      onClick={() => handleDateSelect(date)}
                      className={`aspect-square p-1.5 sm:p-2 rounded-lg transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold shadow-lg scale-105'
                          : isTodayDate
                          ? 'bg-teal-50 border-2 border-teal-500 text-teal-700 font-bold hover:bg-teal-100'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:border-teal-300 border border-transparent'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="text-[11px] sm:text-xs font-medium">{date.getDate()}</span>
                        {!isSelected && (activities.events > 0 || activities.reminders > 0 || activities.tasks > 0) && (
                          <div className="flex gap-0.5 mt-1">
                            {activities.events > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            )}
                            {activities.reminders > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                            )}
                            {activities.tasks > 0 && (
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Mobile Calendar Toggle - Show on mobile only */}
          <div className="lg:hidden bg-white border-b border-slate-200 p-3 sm:p-4">
            <button
              onClick={() => setShowMobileCalendar(!showMobileCalendar)}
              className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-slate-600" />
                <span className="text-xs font-semibold text-slate-900">
                  {selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              {showMobileCalendar ? (
                <ChevronUp className="h-5 w-5 text-slate-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-600" />
              )}
            </button>
          </div>

          {/* Mobile Calendar Grid - Collapsible */}
          {showMobileCalendar && (
            <div className="lg:hidden bg-white border-b border-slate-200 p-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-600" />
                </button>
                <h2 className="text-sm font-bold text-slate-900">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-slate-600" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-[10px] font-semibold text-slate-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square"></div>;
                  }
                  const activities = getActivitiesForDate(date);
                  const isSelected = isSameDate(date, selectedDate);
                  const isTodayDate = isToday(date);
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        handleDateSelect(date);
                        setShowMobileCalendar(false);
                      }}
                      className={`aspect-square p-1 rounded-lg transition-all text-[11px] ${
                        isSelected
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold shadow-lg'
                          : isTodayDate
                          ? 'bg-teal-50 border-2 border-teal-500 text-teal-700 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-transparent'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <span className="font-medium">{date.getDate()}</span>
                        {!isSelected && (activities.events > 0 || activities.reminders > 0 || activities.tasks > 0) && (
                          <div className="flex gap-0.5 mt-0.5">
                            {activities.events > 0 && <div className="w-1 h-1 rounded-full bg-blue-500"></div>}
                            {activities.reminders > 0 && <div className="w-1 h-1 rounded-full bg-purple-500"></div>}
                            {activities.tasks > 0 && <div className="w-1 h-1 rounded-full bg-emerald-500"></div>}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Activities Panel */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Filter Tabs */}
            <div className="bg-white border-b border-slate-200 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex-shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'all'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All ({totalItems})
                </button>
                <button
                  onClick={() => {
                    setActiveFilter('events');
                    setCurrentPage(1); // Reset to first page when changing filter
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'events'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CalendarIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Events </span>
                  <span className="sm:hidden">E</span>
                  ({selectedDateItems.events.length})
                </button>
                <button
                  onClick={() => {
                    setActiveFilter('reminders');
                    setCurrentPage(1); // Reset to first page when changing filter
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'reminders'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Bell className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Reminders </span>
                  <span className="sm:hidden">R</span>
                  ({selectedDateItems.reminders.length})
                </button>
                <button
                  onClick={() => {
                    setActiveFilter('tasks');
                    setCurrentPage(1); // Reset to first page when changing filter
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'tasks'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <CheckSquare className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Tasks </span>
                  <span className="sm:hidden">T</span>
                  ({selectedDateItems.tasks.length})
                </button>
                <button
                  onClick={() => {
                    setActiveFilter('emails');
                    setCurrentPage(1); // Reset to first page when changing filter
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all whitespace-nowrap ${
                    activeFilter === 'emails'
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 inline mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Emails </span>
                  <span className="sm:hidden">M</span>
                  ({emailInsights.length})
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
              <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
                {/* Index Warnings */}
                {indexWarnings.length > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 sm:p-5 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <h3 className="text-xs font-bold text-amber-900 mb-1">Firestore Indexes Required</h3>
                        <p className="text-[11px] text-amber-700 mb-3">
                          Some queries are using client-side filtering. Create these indexes for better performance:
                        </p>
                        <div className="space-y-2">
                          {indexWarnings.map((warning, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <span className="text-[11px] font-medium text-amber-800 capitalize">
                                {warning.collection}:
                              </span>
                              <a
                                href={warning.indexUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
                              >
                                Create Index Now
                                <ArrowRight className="h-3 w-3" />
                              </a>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-amber-600 mt-3">
                          After creating indexes, wait 2-5 minutes for them to build, then refresh the page.
                        </p>
                      </div>
                      <button
                        onClick={() => setIndexWarnings([])}
                        className="p-1 text-amber-600 hover:text-amber-800 flex-shrink-0"
                        title="Dismiss"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {loading || loadingActivities ? (
                  <div className="text-center py-12 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-4"></div>
                    <p className="text-[11px] text-slate-600">Loading activities...</p>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const allFilteredActivities = getAllFilteredActivities();
                      // Final deduplication pass - remove any duplicates by type and ID
                      const uniqueActivities = allFilteredActivities.filter((activity, index, self) => 
                        index === self.findIndex(a => a.type === activity.type && a.id === activity.id)
                      );
                      const startIndex = (currentPage - 1) * itemsPerPage;
                      const endIndex = startIndex + itemsPerPage;
                      const paginatedActivities = uniqueActivities.slice(startIndex, endIndex);
                      const totalPages = Math.ceil(uniqueActivities.length / itemsPerPage);

                      return (
                        <>
                          {/* Paginated Activities */}
                          {paginatedActivities.map((activity) => {
                            if (activity.type === 'event') {
                              const event = activity.data as CalendarEvent;
                              return (
                                <div
                                  key={`${activity.type}-${activity.id}`}
                                  className="bg-white border-2 border-blue-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                                      <CalendarIcon className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{event.title}</h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {event.source === 'email' && (
                                            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-medium border border-teal-200 flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              From Email
                                            </span>
                                          )}
                                          <select
                                            value={event.status}
                                            onChange={(e) => updateEventStatus(event.id, e.target.value as 'pending' | 'approved' | 'completed' | 'cancelled')}
                                            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${getStatusColor(event.status)} cursor-pointer hover:opacity-80`}
                                          >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                          </select>
                                        </div>
                                      </div>
                                      {event.description && (
                                        <p className="text-[11px] text-slate-600 mb-3">{event.description}</p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                          <Clock className="h-3 w-3" />
                                          {formatTime(event.start_time)}
                                          {event.end_time && ` - ${formatTime(event.end_time)}`}
                                        </span>
                                        {event.location && (
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                            <MapPin className="h-3 w-3" />
                                            {event.location}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (activity.type === 'reminder') {
                              const reminder = activity.data as Reminder;
                              return (
                                <div
                                  key={`${activity.type}-${activity.id}`}
                                  className="bg-white border-2 border-purple-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
                                      <Bell className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{reminder.title}</h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {reminder.source === 'email' && (
                                            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-medium border border-teal-200 flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              From Email
                                            </span>
                                          )}
                                          <select
                                            value={reminder.status}
                                            onChange={(e) => updateReminderStatus(reminder.id, e.target.value as 'pending' | 'approved' | 'completed' | 'cancelled')}
                                            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${getStatusColor(reminder.status)} cursor-pointer hover:opacity-80`}
                                          >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                          </select>
                                        </div>
                                      </div>
                                      {reminder.description && (
                                        <p className="text-[11px] text-slate-600 mb-3">{reminder.description}</p>
                                      )}
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-lg border border-purple-200">
                                          <CalendarDays className="h-3 w-3" />
                                          {new Date(reminder.remind_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                          <Clock className="h-3 w-3" />
                                          {formatTime(reminder.remind_at)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (activity.type === 'task') {
                              const task = activity.data as Task;
                              return (
                                <div
                                  key={`${activity.type}-${activity.id}`}
                                  className="bg-white border-2 border-emerald-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
                                      <CheckSquare className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{task.title}</h3>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          {task.source === 'email' && (
                                            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-medium border border-teal-200 flex items-center gap-1">
                                              <Mail className="h-3 w-3" />
                                              From Email
                                            </span>
                                          )}
                                          {task.priority && (
                                            <span
                                              className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getPriorityColor(
                                                task.priority
                                              )}`}
                                            >
                                              {task.priority}
                                            </span>
                                          )}
                                          <select
                                            value={task.status}
                                            onChange={(e) => updateTaskStatus(task.id, e.target.value as 'pending' | 'approved' | 'completed' | 'cancelled')}
                                            className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${getStatusColor(task.status)} cursor-pointer hover:opacity-80`}
                                          >
                                            <option value="pending">Pending</option>
                                            <option value="approved">Approved</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                          </select>
                                        </div>
                                      </div>
                                      {task.description && (
                                        <p className="text-[11px] text-slate-600 mb-3">{task.description}</p>
                                      )}
                                      {task.due_date && (
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                                            <CalendarDays className="h-3 w-3" />
                                            Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                          </span>
                                          <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                            <Clock className="h-3 w-3" />
                                            {formatTime(task.due_date)}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            } else if (activity.type === 'email') {
                              const insight = activity.data as EmailInsight;
                              return (
                                <div
                                  key={`${activity.type}-${activity.id}`}
                                  className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all"
                                >
                                  <div className="flex items-start gap-4">
                                    <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex-shrink-0 shadow-md">
                                      <Mail className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900">{insight.subject}</h3>
                                        <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-semibold border border-teal-200 flex items-center gap-1 flex-shrink-0">
                                          <Brain className="h-3 w-3" />
                                          {insight.items_count} items
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-3">
                                        <span className="font-medium">{insight.from_name}</span>
                                        <span className="text-slate-400">•</span>
                                        <span>{insight.from_email}</span>
                                      </div>
                                      <button className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1">
                                        View in Email Insights
                                        <ArrowRight className="h-3 w-3" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="flex items-center justify-between bg-white border-2 border-slate-200 rounded-xl p-4 shadow-sm">
                              <div className="text-[11px] text-slate-600">
                                Showing {startIndex + 1} - {Math.min(endIndex, uniqueActivities.length)} of {uniqueActivities.length} activities
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                                >
                                  Previous
                                </button>
                                <div className="flex items-center gap-1">
                                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                      pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                      pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                      pageNum = totalPages - 4 + i;
                                    } else {
                                      pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                      <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-[11px] font-semibold transition-all ${
                                          currentPage === pageNum
                                            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                        }`}
                                      >
                                        {pageNum}
                                      </button>
                                    );
                                  })}
                                </div>
                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={currentPage === totalPages}
                                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}

                    {/* Legacy code - keeping for reference but will be replaced by pagination above */}
                    {/* Events */}
                    {false && (activeFilter === 'all' || activeFilter === 'events') &&
                      selectedDateItems.events.map((event) => (
                    <div
                      key={event.id}
                      className="bg-white border-2 border-blue-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                          <CalendarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">{event.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {event.source === 'email' && (
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-medium border border-teal-200 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  From Email
                                </span>
                              )}
                              <select
                                value={event.status}
                                onChange={(e) => updateEventStatus(event.id, e.target.value as 'pending' | 'approved' | 'completed' | 'cancelled')}
                                className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${getStatusColor(event.status)} cursor-pointer hover:opacity-80`}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                          {event.description && (
                            <p className="text-[11px] text-slate-600 mb-3">{event.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                              <Clock className="h-3 w-3" />
                              {formatTime(event.start_time)}
                              {event.end_time && ` - ${formatTime(event.end_time)}`}
                            </span>
                            {event.location && (
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Reminders - Legacy code disabled, using pagination above */}
                {false && (activeFilter === 'all' || activeFilter === 'reminders') &&
                  selectedDateItems.reminders.map((reminder) => (
                    <div
                      key={reminder.id}
                      className="bg-white border-2 border-purple-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl flex-shrink-0">
                          <Bell className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">{reminder.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {reminder.source === 'email' && (
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-medium border border-teal-200 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  From Email
                                </span>
                              )}
                              <select
                                value={reminder.status}
                                onChange={(e) => updateReminderStatus(reminder.id, e.target.value as 'pending' | 'approved' | 'completed' | 'cancelled')}
                                className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${getStatusColor(reminder.status)} cursor-pointer hover:opacity-80`}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                          {reminder.description && (
                            <p className="text-[11px] text-slate-600 mb-3">{reminder.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-purple-50 rounded-lg border border-purple-200">
                              <CalendarDays className="h-3 w-3" />
                              {new Date(reminder.remind_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                              <Clock className="h-3 w-3" />
                              {formatTime(reminder.remind_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Tasks - Legacy code disabled, using pagination above */}
                {false && (activeFilter === 'all' || activeFilter === 'tasks') &&
                  selectedDateItems.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border-2 border-emerald-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-emerald-100 rounded-xl flex-shrink-0">
                          <CheckSquare className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">{task.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {task.source === 'email' && (
                                <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] font-medium border border-teal-200 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  From Email
                                </span>
                              )}
                              {task.priority && (
                                <span
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              )}
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value as 'pending' | 'approved' | 'completed' | 'cancelled')}
                                className={`text-[10px] font-semibold px-2 py-1 rounded-lg border transition-all ${getStatusColor(task.status)} cursor-pointer hover:opacity-80`}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </div>
                          </div>
                          {task.description && (
                            <p className="text-[11px] text-slate-600 mb-3">{task.description}</p>
                          )}
                          {task.due_date && (
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-200">
                                <CalendarDays className="h-3 w-3" />
                                Due: {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                              <span className="text-[10px] text-slate-500 flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg">
                                <Clock className="h-3 w-3" />
                                {formatTime(task.due_date)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Email Insights - Legacy code disabled, using pagination above */}
                {false && (activeFilter === 'all' || activeFilter === 'emails') &&
                  emailInsights.map((insight) => (
                    <div
                      key={insight.id}
                      className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl p-3 sm:p-4 lg:p-5 shadow-sm hover:shadow-lg transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex-shrink-0 shadow-md">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-xs sm:text-sm font-bold text-slate-900">{insight.subject}</h3>
                            <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-lg text-[10px] font-semibold border border-teal-200 flex items-center gap-1 flex-shrink-0">
                              <Brain className="h-3 w-3" />
                              {insight.items_count} items
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 mb-3">
                            <span className="font-medium">{insight.from_name}</span>
                            <span className="text-slate-400">•</span>
                            <span>{insight.from_email}</span>
                          </div>
                          <button className="text-[11px] text-teal-700 hover:text-teal-800 font-semibold flex items-center gap-1">
                            View in Email Insights
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {/* Empty State */}
                {totalItems === 0 && activeFilter === 'all' && (
                  <div className="text-center py-16 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                      <CalendarIcon className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mb-2">No activities for this date</h3>
                    <p className="text-[11px] text-slate-600 mb-4">Select another date or create a new event</p>
                    <button 
                      onClick={() => router.push('/calendar/new?type=event')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-[11px] font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      Create Event
                    </button>
                  </div>
                )}

                    {activeFilter !== 'all' &&
                      ((activeFilter === 'events' && selectedDateItems.events.length === 0) ||
                        (activeFilter === 'reminders' && selectedDateItems.reminders.length === 0) ||
                        (activeFilter === 'tasks' && selectedDateItems.tasks.length === 0) ||
                        (activeFilter === 'emails' && emailInsights.length === 0)) && (
                        <div className="text-center py-12 bg-white rounded-2xl border-2 border-slate-200 shadow-sm">
                          <p className="text-[11px] text-slate-500">No {activeFilter} for this date</p>
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

