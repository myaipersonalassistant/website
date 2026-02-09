import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  X,
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  Circle,
  Save,
  Filter,
  TrendingUp,
  ListTodo,
  ArrowLeft,
  Edit,
  AlertCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import Header from '../components/Header';
import Footer from '../components/Footer';



interface Activity {
  id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date?: string;
  all_day: boolean;
  category: string;
  location?: string;
  color: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ActivityFormData {
  title: string;
  description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  all_day: boolean;
  category: string;
  location: string;
  color: string;
  status: string;
}

const categories = [
  { value: 'meeting', label: 'Meeting', color: '#3b82f6' },
  { value: 'task', label: 'Task', color: '#8b5cf6' },
  { value: 'reminder', label: 'Reminder', color: '#f59e0b' },
  { value: 'personal', label: 'Personal', color: '#10b981' },
  { value: 'work', label: 'Work', color: '#ef4444' },
  { value: 'event', label: 'Event', color: '#ec4899' },
];

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<ActivityFormData>({
    title: '',
    description: '',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    end_time: '10:00',
    all_day: false,
    category: 'personal',
    location: '',
    color: '#10b981',
    status: 'pending',
  });

//   useEffect(() => {
//     fetchActivities();
//   }, []);

//   const fetchActivities = async () => {
//     setIsLoading(true);
//     try {
//       const { data, error } = await supabase
//         .from('calendar_activities')
//         .select('*')
//         .order('start_date', { ascending: true });

//       if (error) throw error;
//       setActivities(data || []);
//     } catch (error) {
//       console.error('Error fetching activities:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCreateActivity = async () => {
//     try {
//       const startDateTime = formData.all_day
//         ? new Date(formData.start_date).toISOString()
//         : new Date(`${formData.start_date}T${formData.start_time}`).toISOString();

//       const endDateTime = formData.end_date
//         ? formData.all_day
//           ? new Date(formData.end_date).toISOString()
//           : new Date(`${formData.end_date}T${formData.end_time}`).toISOString()
//         : null;

//       const { data: { user } } = await supabase.auth.getUser();

//       if (!user) {
//         alert('You must be logged in to create activities');
//         return;
//       }

//       const { error } = await supabase
//         .from('calendar_activities')
//         .insert([
//           {
//             user_id: user.id,
//             title: formData.title,
//             description: formData.description || null,
//             start_date: startDateTime,
//             end_date: endDateTime,
//             all_day: formData.all_day,
//             category: formData.category,
//             location: formData.location || null,
//             color: formData.color,
//             status: formData.status,
//           },
//         ]);

//       if (error) throw error;

//       await fetchActivities();
//       resetForm();
//     } catch (error) {
//       console.error('Error creating activity:', error);
//       alert('Failed to create activity. Please try again.');
//     }
//   };

//   const handleUpdateActivity = async () => {
//     if (!editingActivity) return;

//     try {
//       const startDateTime = formData.all_day
//         ? new Date(formData.start_date).toISOString()
//         : new Date(`${formData.start_date}T${formData.start_time}`).toISOString();

//       const endDateTime = formData.end_date
//         ? formData.all_day
//           ? new Date(formData.end_date).toISOString()
//           : new Date(`${formData.end_date}T${formData.end_time}`).toISOString()
//         : null;

//       const { error } = await supabase
//         .from('calendar_activities')
//         .update({
//           title: formData.title,
//           description: formData.description || null,
//           start_date: startDateTime,
//           end_date: endDateTime,
//           all_day: formData.all_day,
//           category: formData.category,
//           location: formData.location || null,
//           color: formData.color,
//           status: formData.status,
//         })
//         .eq('id', editingActivity.id);

//       if (error) throw error;

//       await fetchActivities();
//       resetForm();
//     } catch (error) {
//       console.error('Error updating activity:', error);
//       alert('Failed to update activity. Please try again.');
//     }
//   };

//   const handleDeleteActivity = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this activity?')) return;

//     try {
//       const { error } = await supabase
//         .from('calendar_activities')
//         .delete()
//         .eq('id', id);

//       if (error) throw error;

//       await fetchActivities();
//       resetForm();
//     } catch (error) {
//       console.error('Error deleting activity:', error);
//       alert('Failed to delete activity. Please try again.');
//     }
//   };

  const openFormForNew = () => {
    setEditingActivity(null);
    const dateStr = selectedDate.toISOString().split('T')[0];
    setFormData({
      title: '',
      description: '',
      start_date: dateStr,
      start_time: '09:00',
      end_date: dateStr,
      end_time: '10:00',
      all_day: false,
      category: 'personal',
      location: '',
      color: '#10b981',
      status: 'pending',
    });
    setShowForm(true);
  };

  const openFormForEdit = (activity: Activity) => {
    setEditingActivity(activity);
    const startDate = new Date(activity.start_date);
    const endDate = activity.end_date ? new Date(activity.end_date) : null;

    setFormData({
      title: activity.title,
      description: activity.description || '',
      start_date: startDate.toISOString().split('T')[0],
      start_time: activity.all_day ? '09:00' : startDate.toTimeString().slice(0, 5),
      end_date: endDate ? endDate.toISOString().split('T')[0] : '',
      end_time: activity.all_day ? '10:00' : (endDate?.toTimeString().slice(0, 5) || '10:00'),
      all_day: activity.all_day,
      category: activity.category,
      location: activity.location || '',
      color: activity.color,
      status: activity.status,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingActivity(null);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getActivitiesForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return filteredActivities.filter((activity) => {
      const activityDate = new Date(activity.start_date).toISOString().split('T')[0];
      return activityDate === dateStr;
    });
  };

  const changeCalendarMonth = (offset: number) => {
    const newDate = new Date(currentCalendarMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentCalendarMonth(newDate);
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSameDate = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const filteredActivities = selectedCategories.length > 0
    ? activities.filter((activity) => selectedCategories.includes(activity.category))
    : activities;

  const selectedDateActivities = getActivitiesForDate(selectedDate);

  const todayActivities = activities.filter((activity) => {
    const activityDate = new Date(activity.start_date).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    return activityDate === today;
  });

  const stats = {
    total: activities.length,
    pending: activities.filter((a) => a.status === 'pending').length,
    completed: activities.filter((a) => a.status === 'completed').length,
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setIsCalendarModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex flex-col">
      <Header />

      <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Activities</h1>
              <p className="text-slate-600 text-sm mt-1">Manage your schedule efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCalendarModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-teal-500 text-teal-600 rounded-lg hover:bg-teal-50 transition-all font-semibold"
              >
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </button>
              <button
                onClick={openFormForNew}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-semibold"
              >
                <Plus className="h-4 w-4" />
                New Activity
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <aside className="col-span-12 lg:col-span-3 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-4 w-4 text-teal-600" />
                  <h2 className="font-bold text-slate-900 text-sm">Overview</h2>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-teal-600" />
                      <span className="text-sm font-medium text-slate-700">Total</span>
                    </div>
                    <span className="text-lg font-bold text-teal-600">{stats.total}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Circle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-slate-700">Pending</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">{stats.pending}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-slate-700">Completed</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">{stats.completed}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-teal-600" />
                  <h2 className="font-bold text-slate-900 text-sm">Today</h2>
                </div>
                {todayActivities.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No activities today</p>
                ) : (
                  <div className="space-y-2">
                    {todayActivities.slice(0, 4).map((activity) => (
                      <div
                        key={activity.id}
                        onClick={() => openFormForEdit(activity)}
                        className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className="w-1 h-full rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: activity.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {activity.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {activity.all_day ? 'All day' : formatTime(activity.start_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-teal-600" />
                  <h2 className="font-bold text-slate-900 text-sm">Filters</h2>
                </div>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => toggleCategoryFilter(category.value)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                        selectedCategories.includes(category.value)
                          ? 'bg-teal-50 border-2 border-teal-500'
                          : 'bg-slate-50 border-2 border-transparent hover:border-slate-300'
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm font-medium text-slate-700">{category.label}</span>
                      {selectedCategories.includes(category.value) && (
                        <CheckCircle2 className="h-4 w-4 text-teal-600 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="w-full mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </aside>

            <div className="col-span-12 lg:col-span-9">
              {showForm ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={resetForm}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="h-5 w-5 text-white" />
                      </button>
                      <h2 className="text-xl font-bold text-white">
                        {editingActivity ? 'Edit Activity' : 'New Activity'}
                      </h2>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                        placeholder="Enter activity title"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors resize-none"
                        rows={3}
                        placeholder="Add details about this activity"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="all_day"
                        checked={formData.all_day}
                        onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                        className="w-5 h-5 text-teal-500 border-slate-300 rounded focus:ring-teal-500"
                      />
                      <label htmlFor="all_day" className="text-sm font-semibold text-slate-700">
                        All-day event
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          value={formData.start_date}
                          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                      {!formData.all_day && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={formData.start_time}
                            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={formData.end_date}
                          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                        />
                      </div>
                      {!formData.all_day && (
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={formData.end_time}
                            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Category *
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {categories.map((category) => (
                          <button
                            key={category.value}
                            onClick={() =>
                              setFormData({ ...formData, category: category.value, color: category.color })
                            }
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${
                              formData.category === category.value
                                ? 'border-teal-500 bg-teal-50 shadow-md'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm font-medium text-slate-700">{category.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
                        placeholder="Add location"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors bg-white"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                      {editingActivity && (
                        <button
                        //   onClick={() => handleDeleteActivity(editingActivity.id)}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      )}
                      <div className="flex-1" />
                      <button
                        onClick={resetForm}
                        className="px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        // onClick={}
                        disabled={!formData.title || !formData.start_date}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                      >
                        <Save className="h-4 w-4" />
                        {editingActivity ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-slate-900">
                        {formatDate(selectedDate)}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarIcon className="h-4 w-4" />
                        {selectedDateActivities.length} {selectedDateActivities.length === 1 ? 'activity' : 'activities'}
                      </div>
                    </div>

                    {isLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent"></div>
                        <p className="text-slate-600 mt-3">Loading activities...</p>
                      </div>
                    ) : selectedDateActivities.length === 0 ? (
                      <div className="text-center py-16">
                        <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">No activities scheduled</p>
                        <p className="text-sm text-slate-500 mt-1">Click "New Activity" to add one</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedDateActivities.map((activity) => (
                          <div
                            key={activity.id}
                            onClick={() => openFormForEdit(activity)}
                            className="group p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border-2 border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className="w-1.5 h-full rounded-full flex-shrink-0"
                                style={{ backgroundColor: activity.color }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <h4 className="font-bold text-slate-900 text-lg group-hover:text-teal-600 transition-colors">
                                    {activity.title}
                                  </h4>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        activity.status === 'completed'
                                          ? 'bg-green-100 text-green-700'
                                          : activity.status === 'cancelled'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-blue-100 text-blue-700'
                                      }`}
                                    >
                                      {activity.status}
                                    </span>
                                    <Edit className="h-4 w-4 text-slate-400 group-hover:text-teal-600 transition-colors" />
                                  </div>
                                </div>

                                {activity.description && (
                                  <p className="text-slate-600 mb-3 line-clamp-2">
                                    {activity.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4 text-sm">
                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Clock className="h-4 w-4" />
                                    {activity.all_day ? (
                                      'All day'
                                    ) : (
                                      <>
                                        {formatTime(activity.start_date)}
                                        {activity.end_date && ` - ${formatTime(activity.end_date)}`}
                                      </>
                                    )}
                                  </div>

                                  {activity.location && (
                                    <div className="flex items-center gap-2 text-slate-600">
                                      <MapPin className="h-4 w-4" />
                                      {activity.location}
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 text-slate-600">
                                    <Tag className="h-4 w-4" />
                                    {categories.find((c) => c.value === activity.category)?.label}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {isCalendarModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-white">Select Date</h2>
              <button
                onClick={() => setIsCalendarModalOpen(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => changeCalendarMonth(-1)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-slate-700" />
                </button>
                <h3 className="font-bold text-slate-900">
                  {monthNames[currentCalendarMonth.getMonth()]} {currentCalendarMonth.getFullYear()}
                </h3>
                <button
                  onClick={() => changeCalendarMonth(1)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-slate-700" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="text-center font-semibold text-slate-600 text-xs py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentCalendarMonth).map((date, index) => {
                  const dayActivities = getActivitiesForDate(date);
                  const isSelected = isSameDate(date, selectedDate);
                  return (
                    <button
                      key={index}
                      onClick={() => date && handleDateSelect(date)}
                      disabled={!date}
                      className={`aspect-square p-2 rounded-lg transition-all ${
                        date
                          ? isSelected
                            ? 'bg-teal-500 text-white font-bold shadow-lg scale-110'
                            : isToday(date)
                            ? 'bg-teal-50 border-2 border-teal-500 text-teal-700 font-bold hover:bg-teal-100'
                            : 'bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50 text-slate-700'
                          : 'bg-transparent cursor-default'
                      }`}
                    >
                      {date && (
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-sm">{date.getDate()}</span>
                          {dayActivities.length > 0 && !isSelected && (
                            <div className="flex gap-0.5 mt-1">
                              {dayActivities.slice(0, 3).map((activity, i) => (
                                <div
                                  key={i}
                                  className="w-1 h-1 rounded-full"
                                  style={{ backgroundColor: activity.color }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}