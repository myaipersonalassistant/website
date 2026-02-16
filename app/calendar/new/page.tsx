'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Bell,
  CheckSquare,
  ListTodo,
  X,
  Plus,
  Clock,
  MapPin,
  FileText,
  Sparkles,
  ArrowLeft,
  Save,
  AlertCircle,
  CalendarDays,
  Repeat,
  Tag,
  User,
  Building2,
  Home,
  Plane,
  Coffee,
  Briefcase,
  GraduationCap,
  Heart,
  Zap
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import { getDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, Timestamp, doc, setDoc } from 'firebase/firestore';
import { notificationService } from '@/lib/notificationService';
import { pushNotificationService } from '@/lib/pushNotificationService';

type ActivityType = 'event' | 'reminder' | 'task' | 'todo';

interface ActivityFormData {
  type: ActivityType;
  title: string;
  description: string;
  // Event fields
  start_time?: string;
  end_time?: string;
  location?: string;
  // Reminder fields
  remind_at?: string;
  // Task fields
  due_date?: string;
  priority?: 'low' | 'normal' | 'high';
  // Todo list fields
  todos?: Array<{ id: string; text: string; completed: boolean }>;
  // Common fields
  category?: string;
  tags?: string[];
}

const activityTypes = [
  {
    id: 'event' as ActivityType,
    name: 'Event',
    icon: CalendarIcon,
    color: 'from-blue-500 to-cyan-600',
    description: 'Schedule meetings, appointments, and activities'
  },
  {
    id: 'reminder' as ActivityType,
    name: 'Reminder',
    icon: Bell,
    color: 'from-purple-500 to-pink-600',
    description: 'Set reminders for important moments'
  },
  {
    id: 'task' as ActivityType,
    name: 'Task',
    icon: CheckSquare,
    color: 'from-emerald-500 to-teal-600',
    description: 'Create tasks with due dates and priorities'
  },
  {
    id: 'todo' as ActivityType,
    name: 'Todo List',
    icon: ListTodo,
    color: 'from-orange-500 to-amber-600',
    description: 'Create a list of items to complete'
  }
];

const categories = [
  { id: 'work', name: 'Work', icon: Briefcase, color: 'bg-blue-100 text-blue-700' },
  { id: 'personal', name: 'Personal', icon: Heart, color: 'bg-pink-100 text-pink-700' },
  { id: 'meeting', name: 'Meeting', icon: Building2, color: 'bg-purple-100 text-purple-700' },
  { id: 'travel', name: 'Travel', icon: Plane, color: 'bg-cyan-100 text-cyan-700' },
  { id: 'home', name: 'Home', icon: Home, color: 'bg-emerald-100 text-emerald-700' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'bg-indigo-100 text-indigo-700' },
  { id: 'health', name: 'Health', icon: Heart, color: 'bg-red-100 text-red-700' },
  { id: 'social', name: 'Social', icon: Coffee, color: 'bg-amber-100 text-amber-700' },
];

function NewActivityPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [activeType, setActiveType] = useState<ActivityType>('event');
  const [userName, setUserName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState<ActivityFormData>({
    type: 'event',
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    remind_at: '',
    due_date: '',
    priority: 'normal',
    category: '',
    tags: [],
    todos: [{ id: '1', text: '', completed: false }]
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth?view=login');
      return;
    }
    if (user) {
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      
      // Request notification permission when user visits the page
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          // Request permission silently - will request again when creating activity
          notificationService.requestPermission().catch(console.error);
        }
      }
      
      // Check if type is specified in URL
      const typeParam = searchParams.get('type');
      if (typeParam && ['event', 'reminder', 'task', 'todo'].includes(typeParam)) {
        setActiveType(typeParam as ActivityType);
        setFormData(prev => ({ ...prev, type: typeParam as ActivityType }));
      }
    }
  }, [user, authLoading, searchParams, router]);

  const handleInputChange = (field: keyof ActivityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTodoItem = () => {
    setFormData(prev => ({
      ...prev,
      todos: [...(prev.todos || []), { id: Date.now().toString(), text: '', completed: false }]
    }));
  };

  const removeTodoItem = (id: string) => {
    setFormData(prev => ({
      ...prev,
      todos: prev.todos?.filter(todo => todo.id !== id) || []
    }));
  };

  const updateTodoItem = (id: string, text: string) => {
    setFormData(prev => ({
      ...prev,
      todos: prev.todos?.map(todo => todo.id === id ? { ...todo, text } : todo) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Prevent double submission using ref (more reliable than state)
    if (isSubmittingRef.current) {
      console.warn('Form submission already in progress, ignoring duplicate submit');
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      setError('');
      const db = getDb();

      // Request notification permission and subscribe to push notifications
      if (typeof window !== 'undefined') {
        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
          await notificationService.requestPermission();
        }
        
        // Subscribe to push notifications (works even when website is closed)
        try {
          const subscription = await pushNotificationService.subscribe();
          if (subscription) {
            // Save subscription to Firestore for server-side push notifications
            const db = getDb();
            await setDoc(
              doc(db, 'users', user.uid, 'push_subscriptions', subscription.endpoint.split('/').pop() || 'default'),
              {
                endpoint: subscription.endpoint,
                keys: subscription.keys,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              },
              { merge: true }
            );
          }
        } catch (error) {
          console.error('Error subscribing to push notifications:', error);
          // Don't fail activity creation if push subscription fails
        }
      }

      switch (formData.type) {
        case 'event':
          if (!formData.start_time || !formData.title) {
            setError('Please fill in all required fields');
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            return;
          }
          await addDoc(collection(db, 'events'), {
            userId: user.uid,
            title: formData.title,
            description: formData.description || '',
            start_time: Timestamp.fromDate(new Date(formData.start_time)),
            end_time: formData.end_time ? Timestamp.fromDate(new Date(formData.end_time)) : null,
            location: formData.location || '',
            status: 'pending',
            source: 'manual',
            created_at: serverTimestamp()
          });
          break;

        case 'reminder':
          if (!formData.remind_at || !formData.title) {
            setError('Please fill in all required fields');
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            return;
          }
          await addDoc(collection(db, 'reminders'), {
            userId: user.uid,
            title: formData.title,
            description: formData.description || '',
            remind_at: Timestamp.fromDate(new Date(formData.remind_at)),
            status: 'pending',
            source: 'manual',
            created_at: serverTimestamp()
          });
          break;

        case 'task':
          if (!formData.due_date || !formData.title) {
            setError('Please fill in all required fields');
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            return;
          }
          await addDoc(collection(db, 'tasks'), {
            userId: user.uid,
            title: formData.title,
            description: formData.description || '',
            due_date: Timestamp.fromDate(new Date(formData.due_date)),
            priority: formData.priority || 'normal',
            status: 'pending',
            source: 'manual',
            created_at: serverTimestamp()
          });
          break;

        case 'todo':
          // For todo lists, create multiple tasks
          if (!formData.title || !formData.todos || formData.todos.length === 0) {
            setError('Please add at least one todo item');
            isSubmittingRef.current = false;
            setIsSubmitting(false);
            return;
          }
          // Create tasks for each todo item
          const todoPromises = formData.todos
            .filter(todo => todo.text.trim())
            .map(todo =>
              addDoc(collection(db, 'tasks'), {
                userId: user.uid,
                title: todo.text,
                description: `Part of: ${formData.title}`,
                due_date: formData.due_date ? Timestamp.fromDate(new Date(formData.due_date)) : null,
                priority: formData.priority || 'normal',
                status: 'pending',
                source: 'manual',
                created_at: serverTimestamp()
              })
            );
          
          await Promise.all(todoPromises);
          break;

        default:
          throw new Error('Invalid activity type');
      }

      // Redirect back to calendar
      router.push('/calendar');
    } catch (err: any) {
      console.error('Error creating activity:', err);
      setError(err.message || 'Failed to create activity. Please try again.');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const getDefaultDateTime = (hours: number = 0) => {
    const date = new Date();
    date.setHours(date.getHours() + hours, 0, 0, 0);
    return date.toISOString().slice(0, 16);
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

  const ActiveIcon = activityTypes.find(t => t.id === activeType)?.icon || CalendarIcon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex">
      {/* Dashboard Sidebar */}
      <DashboardSidebar userName={userName} userEmail={user?.email || undefined} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-3 sm:px-4 lg:px-8 py-4 sm:py-6 flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={() => router.push('/calendar')}
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl text-white transition-all active:scale-95"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 sm:p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg flex-shrink-0">
                  <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white truncate">Create New Activity</h1>
                  <p className="text-[9px] sm:text-[10px] lg:text-xs text-teal-50 hidden sm:block">Add events, reminders, tasks, and more</p>
                </div>
              </div>
            </div>

            {/* Activity Type Tabs */}
            <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {activityTypes.map((type) => {
                const Icon = type.icon;
                const isActive = activeType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setActiveType(type.id);
                      setFormData(prev => ({ ...prev, type: type.id }));
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? `bg-white text-slate-900 shadow-lg scale-105`
                        : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm active:scale-95'
                    }`}
                  >
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isActive ? 'text-slate-900' : 'text-white'}`} />
                    <span className="text-[10px] sm:text-[11px] font-semibold">{type.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-red-700">{error}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="p-1 text-red-400 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Main Form Card */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200 p-4 sm:p-6 lg:p-8">
                {/* Title */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={`Enter ${activeType} title...`}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Add details, notes, or context..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Event-Specific Fields */}
                {activeType === 'event' && (
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.start_time}
                          onChange={(e) => handleInputChange('start_time', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                          End Time
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.end_time}
                          onChange={(e) => handleInputChange('end_time', e.target.value)}
                          min={formData.start_time}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          placeholder="e.g., Conference Room A, Virtual, 123 Main St"
                          className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Reminder-Specific Fields */}
                {activeType === 'reminder' && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                      Remind At <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.remind_at}
                      onChange={(e) => handleInputChange('remind_at', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                )}

                {/* Task-Specific Fields */}
                {activeType === 'task' && (
                  <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                        Due Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.due_date}
                        onChange={(e) => handleInputChange('due_date', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                        Priority
                      </label>
                      <div className="flex gap-2">
                        {(['low', 'normal', 'high'] as const).map((priority) => (
                          <button
                            key={priority}
                            type="button"
                            onClick={() => handleInputChange('priority', priority)}
                            className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all active:scale-95 ${
                              formData.priority === priority
                                ? priority === 'low'
                                  ? 'bg-slate-200 text-slate-900 border-2 border-slate-400'
                                  : priority === 'normal'
                                  ? 'bg-blue-200 text-blue-900 border-2 border-blue-400'
                                  : 'bg-red-200 text-red-900 border-2 border-red-400'
                                : 'bg-slate-100 text-slate-600 border-2 border-transparent hover:border-slate-300'
                            }`}
                          >
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Todo List Fields */}
                {activeType === 'todo' && (
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-[11px] sm:text-xs font-semibold text-slate-700">
                        Todo Items <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={addTodoItem}
                        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg text-[10px] sm:text-[11px] font-semibold hover:bg-teal-100 transition-colors active:scale-95"
                      >
                        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="hidden sm:inline">Add Item</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.todos?.map((todo, index) => (
                        <div key={todo.id} className="flex items-center gap-2">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={todo.text}
                              onChange={(e) => updateTodoItem(todo.id, e.target.value)}
                              placeholder={`Todo item ${index + 1}...`}
                              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                            />
                          </div>
                          {formData.todos && formData.todos.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTodoItem(todo.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors active:scale-95 flex-shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {formData.todos && formData.todos.length > 0 && (
                      <div className="mt-4">
                        <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2">
                          Due Date (for all items)
                        </label>
                        <input
                          type="datetime-local"
                          value={formData.due_date}
                          onChange={(e) => handleInputChange('due_date', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Category Selection */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-700 mb-2 sm:mb-3">
                    Category (Optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => handleInputChange('category', category.id)}
                          className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl border-2 transition-all active:scale-95 ${
                            formData.category === category.id
                              ? `${category.color} border-slate-400 shadow-md scale-105`
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="text-[9px] sm:text-[10px] font-medium">{category.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Create {activityTypes.find(t => t.id === activeType)?.name}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/calendar')}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewActivityPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <NewActivityPageContent />
    </Suspense>
  );
}

