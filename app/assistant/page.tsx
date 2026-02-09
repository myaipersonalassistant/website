'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Brain,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  Zap,
  Bell,
  MapPin,
  Plane,
  Sun,
  Cloud,
  TrendingUp,
  Target,
  ListTodo,
  Send,
  Mic,
  Phone,
  Mail,
  AlertCircle,
  Coffee,
  Briefcase,
  Home as HomeIcon,
  User,
  Plus,
  Search,
  Settings,
  History,
  MoreVertical,
  Menu,
  X,
  StickyNote,
  BarChart3,
  Lightbulb,
  Focus,
  Inbox,
  CheckSquare,
  Timer,
  PanelLeftClose,
  PanelLeft,
  Paperclip,
  Image as ImageIcon,
  SmilePlus,
  Volume2,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Trash2,
  Download,
  Share2,
  Archive,
  EyeOff,
  Pin,
  Unplug,
  ArrowRight,
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  unread: boolean;
}

interface Tool {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
}

interface Message {
  id: number;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
}

const AssistantPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messageInput, setMessageInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversation, setActiveConversation] = useState<string | null>('today-briefing');
  const [yourToolsExpanded, setYourToolsExpanded] = useState(false);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [conversationsExpanded, setConversationsExpanded] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [userName, setUserName] = useState('User');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [pinnedTools, setPinnedTools] = useState<string[]>([
    'calendar',
    'tasks',
    'email',
    'briefing',
    'travel',
    'reminders'
  ]);

  const conversations: Conversation[] = [
    {
      id: 'today-briefing',
      title: "Today's Schedule & Briefing",
      preview: 'You have 3 meetings and 4 priority tasks...',
      timestamp: '9:30 AM',
      unread: false
    },
    {
      id: 'travel-planning',
      title: 'NYC Trip Planning',
      preview: 'Creating travel checklist for your upcoming...',
      timestamp: 'Yesterday',
      unread: false
    },
    {
      id: 'project-review',
      title: 'Q1 Marketing Project',
      preview: 'I found 3 relevant documents for your...',
      timestamp: 'Dec 25',
      unread: false
    },
    {
      id: 'email-summary',
      title: 'Email Summary',
      preview: '15 new emails, 3 require urgent attention',
      timestamp: 'Dec 24',
      unread: true
    },
    {
      id: 'weekly-planning',
      title: 'Weekly Planning Session',
      preview: 'Let me help you plan next week...',
      timestamp: 'Dec 22',
      unread: false
    }
  ];

  const allTools: Tool[] = [
    {
      id: 'calendar',
      name: 'Smart Calendar',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      description: 'Manage events & scheduling'
    },
    {
      id: 'tasks',
      name: 'Task Manager',
      icon: CheckSquare,
      color: 'from-emerald-500 to-teal-500',
      description: 'Track tasks & priorities'
    },
    {
      id: 'email',
      name: 'Email Intelligence',
      icon: Mail,
      color: 'from-orange-500 to-red-500',
      description: 'Smart inbox management'
    },
    {
      id: 'briefing',
      name: 'Daily Briefing',
      icon: Sun,
      color: 'from-amber-500 to-yellow-500',
      description: 'Morning voice calls'
    },
    {
      id: 'travel',
      name: 'Travel Assistant',
      icon: Plane,
      color: 'from-sky-500 to-blue-600',
      description: 'Trip planning & checklists'
    },
    {
      id: 'reminders',
      name: 'Smart Reminders',
      icon: Bell,
      color: 'from-purple-500 to-pink-500',
      description: 'Context-aware alerts'
    },
    {
      id: 'notes',
      name: 'Quick Notes',
      icon: StickyNote,
      color: 'from-yellow-500 to-orange-500',
      description: 'Voice & text memos'
    },
    {
      id: 'insights',
      name: 'Time Insights',
      icon: BarChart3,
      color: 'from-indigo-500 to-purple-500',
      description: 'Productivity analytics'
    },
    {
      id: 'habits',
      name: 'Habit Tracker',
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      description: 'Monitor routines'
    },
    {
      id: 'focus',
      name: 'Focus Mode',
      icon: Focus,
      color: 'from-slate-500 to-gray-600',
      description: 'Do not disturb'
    },
    {
      id: 'timer',
      name: 'Time Tracker',
      icon: Timer,
      color: 'from-red-500 to-rose-600',
      description: 'Track time spent'
    },
    {
      id: 'ideas',
      name: 'Idea Box',
      icon: Lightbulb,
      color: 'from-yellow-400 to-amber-500',
      description: 'Capture inspiration'
    }
  ];

  const chatMessages: Message[] = [
    {
      id: 1,
      sender: 'assistant',
      content: "Good morning! I've reviewed your schedule for today. You have 3 meetings and 4 priority tasks lined up. Your first meeting is Team Standup at 10:00 AM. Would you like me to give you a detailed briefing?",
      timestamp: '9:30 AM',
      suggestions: ['Give me the full briefing', 'Just show my calendar', 'What are my priorities?']
    },
    {
      id: 2,
      sender: 'user',
      content: 'Yes, please give me the full briefing',
      timestamp: '9:31 AM'
    },
    {
      id: 3,
      sender: 'assistant',
      content: "Perfect! Here's your day at a glance:\n\n**Meetings:**\n• 10:00 AM - Team Standup (30 min)\n• 12:30 PM - Lunch with Sarah (1 hour)\n• 2:00 PM - Project Review (1 hour)\n\n**Priority Tasks:**\n• Review Q1 marketing proposal (45 min)\n• Prepare slides for Friday presentation (2 hours)\n• Follow up with John about budget (15 min) ✓ Completed\n• Review team feedback forms (30 min)\n\n**Important Notes:**\nYour NYC flight is in 3 days. Would you like me to create a comprehensive travel checklist?",
      timestamp: '9:31 AM',
      suggestions: ['Yes, create travel checklist', 'Show me my email summary', 'Add a new task']
    },
    {
      id: 4,
      sender: 'user',
      content: 'Yes, create the travel checklist please',
      timestamp: '9:32 AM'
    },
    {
      id: 5,
      sender: 'assistant',
      content: "I've created your NYC travel checklist! Here's what I've included:\n\n**Before Flight (3 days):**\n✓ Book parking at airport\n□ Complete online check-in (24h before)\n□ Print boarding pass\n□ Pack essentials\n□ Set out-of-office email\n\n**Day of Travel:**\n□ Uber to airport (leave by 6:30 AM)\n□ Security check\n□ Gate B12 - Boarding 8:00 AM\n\n**Accommodation:**\n□ Confirm hotel reservation\n□ Share itinerary with family\n\nWould you like me to set timed reminders for each item?",
      timestamp: '9:32 AM',
      suggestions: ['Yes, set all reminders', 'Let me customize it first', 'Show hotel details']
    }
  ];

  const suggestedPrompts = [
    { text: "What's on my calendar today?", icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { text: 'Summarize my unread emails', icon: Mail, color: 'from-orange-500 to-red-500' },
    { text: 'Help me plan my day', icon: Sun, color: 'from-amber-500 to-yellow-500' },
    { text: 'Create a new task', icon: CheckSquare, color: 'from-emerald-500 to-teal-500' },
    { text: 'Schedule a meeting', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { text: 'Set a reminder', icon: Bell, color: 'from-purple-500 to-pink-500' },
    { text: 'Show my weekly insights', icon: BarChart3, color: 'from-indigo-500 to-purple-500' },
    { text: 'Help me with travel planning', icon: Plane, color: 'from-sky-500 to-blue-600' }
  ];

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData.displayName || userData.name || user.displayName || 'User');
          } else {
            setUserName(user.displayName || 'User');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserName(user.displayName || 'User');
        }
      }
    };
    fetchUserData();
  }, [user]);

  useEffect(() => {
    // Only scroll if we're at the bottom or very close to it
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        if (isNearBottom) {
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      }
    }
  }, [chatMessages, isTyping]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const yourTools = allTools.filter(tool => pinnedTools.includes(tool.id));
  const availableTools = allTools.filter(tool => !pinnedTools.includes(tool.id));

  const toggleToolPin = (toolId: string) => {
    if (pinnedTools.includes(toolId)) {
      setPinnedTools(pinnedTools.filter(id => id !== toolId));
    } else {
      setPinnedTools([...pinnedTools, toolId]);
    }
  };

  const handleSendMessage = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!messageInput.trim()) return;
    // TODO: Implement actual message sending
    setMessageInput('');
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage(e);
    }
  };

  const startNewConversation = () => {
    setActiveConversation(null);
  };

  const activeConversationData = conversations.find(c => c.id === activeConversation);

  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'w-80' : 'w-0'
      } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col h-[90%] overflow-hidden shadow-lg lg:shadow-none flex-shrink-0 lg:relative fixed lg:z-auto z-50`}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-br from-teal-50 to-cyan-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">MAI-PA</h2>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>
          <div className="space-y-2">
            <button
              onClick={startNewConversation}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:inline">New Conversation</span>
              <span className="sm:hidden">New</span>
            </button>
            <Link
              href="/dashboard"
              className="w-full bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-300 text-slate-700 hover:text-teal-700 rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Home</span>
            </Link>
          </div>
        </div>

        {/* Your AI Tools Section */}
        <div className="border-b border-slate-200 flex-shrink-0">
          <button
            onClick={() => setYourToolsExpanded(!yourToolsExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your AI Tools</h3>
            {yourToolsExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {yourToolsExpanded && (
            <div className="px-4 pb-4 space-y-2">
              {yourTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 rounded-xl p-3 transition-all duration-200 flex items-center justify-between"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-xl`}></div>
                    <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-800 group-hover:text-teal-700 transition-colors truncate">{tool.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{tool.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleToolPin(tool.id)}
                      className="relative z-10 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1"
                      title="Remove from Your AI Tools"
                    >
                      <EyeOff className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tools Section (Expandable) */}
        <div className="border-b border-slate-200 flex-shrink-0">
          <button
            onClick={() => setToolsExpanded(!toolsExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
          >
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">All Tools</h3>
            {toolsExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {toolsExpanded && (
            <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
              {availableTools.length > 0 ? (
                availableTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <div
                      key={tool.id}
                      className="group relative bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 rounded-xl p-3 transition-all duration-200 flex items-center justify-between"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-200 rounded-xl`}></div>
                      <div className="flex items-center gap-3 relative z-10 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-slate-800 group-hover:text-teal-700 transition-colors truncate">{tool.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{tool.description}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => toggleToolPin(tool.id)}
                        className="relative z-10 text-slate-400 hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1"
                        title="Add to Your AI Tools"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">All tools are in Your AI Tools</p>
              )}
            </div>
          )}
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto border-b border-slate-200 min-h-0">
          <button
            onClick={() => setConversationsExpanded(!conversationsExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors sticky top-0 bg-white z-10 border-b border-slate-200"
          >
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Conversations</h3>
            {conversationsExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {conversationsExpanded && (
            <div className="px-4 pb-4 space-y-2">
              {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv.id);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 group ${
                      activeConversation === conv.id
                        ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 shadow-sm'
                        : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                    }`}
                  >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-xs font-medium text-slate-800 group-hover:text-teal-700 line-clamp-1">{conv.title}</h4>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mb-1">{conv.preview}</p>
                  <span className="text-[11px] text-slate-500">{conv.timestamp}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-2 sm:p-4 border-t border-slate-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-800 truncate">{userName}</p>
                <p className="text-[11px] text-slate-500">Premium Plan</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-lg flex-shrink-0">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[90%] overflow-hidden">
        {/* Top Bar */}
        <div className="bg-transparent border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shadow-none flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-lg flex-shrink-0"
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                {activeConversation === null ? 'New Conversation' : activeConversationData?.title || 'Conversation'}
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {activeConversation === null ? 'How can I assist you?' : `Started at ${activeConversationData?.timestamp || ''}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 relative flex-shrink-0">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="text-slate-600 hover:text-teal-600 transition-colors p-2 hover:bg-teal-50 rounded-lg"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {/* Options Menu Dropdown */}
            {showOptionsMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowOptionsMenu(false)}
                ></div>
                <div className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-20">
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Edit3 className="h-4 w-4" />
                    <span className="text-xs font-medium">Rename Conversation</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Pin className="h-4 w-4" />
                    <span className="text-xs font-medium">Pin Conversation</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Share2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Share</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Download className="h-4 w-4" />
                    <span className="text-xs font-medium">Export Chat</span>
                  </button>
                  <div className="border-t border-slate-200 my-2"></div>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Archive className="h-4 w-4" />
                    <span className="text-xs font-medium">Archive</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600">
                    <Trash2 className="h-4 w-4" />
                    <span className="text-xs font-medium">Delete Conversation</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0">
          {activeConversation === null ? (
            <div className="flex items-center justify-center h-full">
              <div className="max-w-4xl w-full text-center space-y-6 sm:space-y-8 px-4 sm:px-6">
                <div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                    <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">How can I assist you today?</h2>
                  <p className="text-xs sm:text-sm text-slate-600">I'm your AI personal assistant, ready to help with your schedule, tasks, emails, and more.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {suggestedPrompts.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        className="group p-3 sm:p-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium text-slate-800 leading-snug">{prompt.text}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4 sm:p-5 border border-teal-100 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-teal-900 mb-1 text-xs sm:text-sm">Pro Tip</h4>
                      <p className="text-[11px] sm:text-xs text-teal-700 leading-relaxed">
                        Click a suggestion above to get started, or type your own question in the message box below. I can help with scheduling, task management, email summaries, and much more!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => {
                const isUser = message.sender === 'user';
                return (
                  <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 sm:gap-4 max-w-full sm:max-w-3xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${
                        isUser
                          ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
                          : 'bg-gradient-to-br from-slate-200 to-slate-300'
                      }`}>
                        {isUser ? (
                          <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        ) : (
                          <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
                        )}
                      </div>

                      {/* Message Content */}
                      <div className={`flex-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                        <div className={`rounded-2xl p-3 sm:p-4 shadow-sm ${
                          isUser
                            ? 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 rounded-tl-none'
                        }`}>
                          <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                            isUser ? 'text-white' : 'text-slate-800'
                          }`}>
                            {message.content}
                          </p>
                        </div>

                        {/* Message Actions (for assistant messages) */}
                        {!isUser && (
                          <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="text-slate-400 hover:text-teal-600 transition-colors p-1.5 hover:bg-teal-50 rounded-lg"
                              title="Play audio"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
                              title="Copy message"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
                              title="Regenerate"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="text-slate-400 hover:text-green-600 transition-colors p-1.5 hover:bg-green-50 rounded-lg"
                              title="Good response"
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                              title="Bad response"
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </button>
                          </div>
                        )}

                        {/* Suggestions */}
                        {message.suggestions && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {message.suggestions.map((suggestion, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 rounded-lg text-[11px] sm:text-xs font-medium text-slate-700 hover:text-teal-700 transition-all duration-200 active:scale-95"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}

                        <span className="text-[11px] text-slate-500 mt-1">{message.timestamp}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-slate-700" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-3 sm:p-4 shadow-lg flex-shrink-0">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-2 sm:p-3 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all duration-200">
              <div className="flex items-end gap-2 sm:gap-3">
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <button className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50 active:scale-95">
                    <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50 active:scale-95">
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything or tell me what you need..."
                  className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 text-slate-800 placeholder-slate-400 py-2 text-xs sm:text-sm"
                  rows={1}
                />
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 sm:p-3 rounded-xl transition-all duration-200 active:scale-95">
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    onClick={(e) => handleSendMessage(e)}
                    disabled={!messageInput.trim()}
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white p-2 sm:p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2 sm:mt-3">
              MAI-PA can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AssistantPage;

