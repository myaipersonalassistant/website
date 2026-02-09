import React, { useState } from 'react';
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
  Unplug
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [messageInput, setMessageInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversation, setActiveConversation] = useState('today-briefing');
  const [yourToolsExpanded, setYourToolsExpanded] = useState(true);
  const [toolsExpanded, setToolsExpanded] = useState(false);
  const [conversationsExpanded, setConversationsExpanded] = useState(true);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [pinnedTools, setPinnedTools] = useState<string[]>([
    'calendar',
    'tasks',
    'email',
    'briefing',
    'travel',
    'reminders'
  ]);

  const conversations = [
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

  const allTools = [
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

  const yourTools = allTools.filter(tool => pinnedTools.includes(tool.id));
  const availableTools = allTools.filter(tool => !pinnedTools.includes(tool.id));

  const toggleToolPin = (toolId: string) => {
    if (pinnedTools.includes(toolId)) {
      setPinnedTools(pinnedTools.filter(id => id !== toolId));
    } else {
      setPinnedTools([...pinnedTools, toolId]);
    }
  };

  const chatMessages = [
    {
      id: 1,
      sender: 'assistant',
      content: "Good morning, Alex! I've reviewed your schedule for today. You have 3 meetings and 4 priority tasks lined up. Your first meeting is Team Standup at 10:00 AM. Would you like me to give you a detailed briefing?",
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
    { text: 'What\'s on my calendar today?', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { text: 'Summarize my unread emails', icon: Mail, color: 'from-orange-500 to-red-500' },
    { text: 'Help me plan my day', icon: Sun, color: 'from-amber-500 to-yellow-500' },
    { text: 'Create a new task', icon: CheckSquare, color: 'from-emerald-500 to-teal-500' },
    { text: 'Schedule a meeting', icon: Calendar, color: 'from-blue-500 to-cyan-500' },
    { text: 'Set a reminder', icon: Bell, color: 'from-purple-500 to-pink-500' },
    { text: 'Show my weekly insights', icon: BarChart3, color: 'from-slate-600 to-gray-700' },
    { text: 'Help me with travel planning', icon: Plane, color: 'from-sky-500 to-blue-600' }
  ];

  const playAudio = (messageId: number) => {
    console.log(`Playing audio for message ${messageId}`);
  };

  const startNewConversation = () => {
    setActiveConversation('new');
  };

  return (
    <div className="flex h-screen bg-slate-50 relative">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-slate-900 text-white transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">MAI-PA</h2>
                <div className="flex items-center gap-1 text-xs text-green-400">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  Online
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={startNewConversation}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Plus className="h-5 w-5" />
            New Conversation
          </button>
        </div>

        {/* Your AI Tools Section */}
        <div className="border-b border-slate-800">
          <button
            onClick={() => setYourToolsExpanded(!yourToolsExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
          >
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Your AI Tools</h3>
            {yourToolsExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {yourToolsExpanded && (
            <div className="px-4 pb-4 space-y-2">
              {yourTools.map((tool) => (
                <div
                  key={tool.id}
                  className="group relative bg-slate-800 hover:bg-slate-700 rounded-lg p-3 transition-all duration-200 flex items-center justify-between overflow-hidden"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                      <tool.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{tool.name}</p>
                      <p className="text-xs text-slate-500">{tool.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleToolPin(tool.id)}
                    className="relative z-10 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Remove from Your AI Tools"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tools Section (Expandable) */}
        <div className="border-b border-slate-800">
          <button
            onClick={() => setToolsExpanded(!toolsExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
          >
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">All Tools</h3>
            {toolsExpanded ? (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-400" />
            )}
          </button>
          {toolsExpanded && (
            <div className="px-4 pb-4 space-y-2">
              {availableTools.length > 0 ? (
                availableTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="group relative bg-slate-800 hover:bg-slate-700 rounded-lg p-3 transition-all duration-200 flex items-center justify-between overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`}></div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} flex items-center justify-center flex-shrink-0`}>
                        <tool.icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{tool.name}</p>
                        <p className="text-xs text-slate-500">{tool.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleToolPin(tool.id)}
                      className="relative z-10 text-slate-500 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Add to Your AI Tools"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-4">All tools are in Your AI Tools</p>
              )}
            </div>
          )}
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto border-b border-slate-800">
          <button
            onClick={() => setConversationsExpanded(!conversationsExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-800 transition-colors sticky top-0 bg-slate-900 z-10"
          >
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recent Conversations</h3>
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
                  onClick={() => setActiveConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 group ${
                    activeConversation === conv.id
                      ? 'bg-slate-800 border border-teal-500/30'
                      : 'hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="text-sm font-medium text-slate-200 group-hover:text-white line-clamp-1">{conv.title}</h4>
                    {conv.unread && (
                      <div className="w-2 h-2 bg-teal-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-1">{conv.preview}</p>
                  <span className="text-xs text-slate-600">{conv.timestamp}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Alex Johnson</p>
                <p className="text-xs text-slate-400">Premium Plan</p>
              </div>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors">
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              {sidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900">
                {activeConversation === 'new' ? 'New Conversation' : "Today's Schedule & Briefing"}
              </h1>
              <p className="text-sm text-slate-500">
                {activeConversation === 'new' ? 'How can I assist you?' : 'Started at 9:30 AM'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="text-slate-600 hover:text-slate-900 transition-colors p-2 hover:bg-slate-100 rounded-lg"
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
                    <span className="text-sm font-medium">Rename Conversation</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Pin className="h-4 w-4" />
                    <span className="text-sm font-medium">Pin Conversation</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Share</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">Export Chat</span>
                  </button>
                  <div className="border-t border-slate-200 my-2"></div>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 text-slate-700">
                    <Archive className="h-4 w-4" />
                    <span className="text-sm font-medium">Archive</span>
                  </button>
                  <button className="w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors flex items-center gap-3 text-red-600">
                    <Trash2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Delete Conversation</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeConversation === 'new' ? (
            <div className="flex items-center justify-center h-full">
              <div className="max-w-4xl w-full text-center space-y-8 px-6">
                <div>
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Brain className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">How can I assist you today?</h2>
                  <p className="text-slate-600">I'm your AI personal assistant, ready to help with your schedule, tasks, emails, and more.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {suggestedPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      className="group p-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:scale-105"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <prompt.icon className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-sm font-medium text-slate-800 leading-snug">{prompt.text}</p>
                    </button>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-5 border border-teal-100 text-left">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-teal-900 mb-1">Pro Tip</h4>
                      <p className="text-sm text-teal-700 leading-relaxed">
                        Click a suggestion above to get started, or type your own question in the message box below. I can help with scheduling, task management, email summaries, and much more!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {chatMessages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-3xl ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${
                  message.sender === 'assistant'
                    ? 'bg-gradient-to-br from-teal-500 to-cyan-600'
                    : 'bg-slate-200'
                }`}>
                  {message.sender === 'assistant' ? (
                    <Brain className="h-5 w-5 text-white" />
                  ) : (
                    <User className="h-5 w-5 text-slate-600" />
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 ${message.sender === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`rounded-2xl p-4 ${
                    message.sender === 'assistant'
                      ? 'bg-white border border-slate-200 rounded-tl-none'
                      : 'bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-tr-none'
                  }`}>
                    <p className={`text-sm leading-relaxed whitespace-pre-line ${
                      message.sender === 'assistant' ? 'text-slate-800' : 'text-white'
                    }`}>
                      {message.content}
                    </p>
                  </div>

                  {/* Message Actions (for assistant messages) */}
                  {message.sender === 'assistant' && (
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => playAudio(message.id)}
                        className="text-slate-400 hover:text-teal-600 transition-colors p-1.5 hover:bg-teal-50 rounded-lg"
                        title="Play audio"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <button
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
                        title="Copy message"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
                        title="Regenerate"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        className="text-slate-400 hover:text-green-600 transition-colors p-1.5 hover:bg-green-50 rounded-lg"
                        title="Good response"
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </button>
                      <button
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
                          className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-300 rounded-lg text-sm font-medium text-slate-700 hover:text-teal-700 transition-all duration-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <span className="text-xs text-slate-500 mt-1">{message.timestamp}</span>
                </div>
              </div>
            </div>
          ))}</>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all duration-200">
              <div className="flex items-end gap-3">
                <div className="flex gap-2">
                  <button className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50">
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <button className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50">
                    <ImageIcon className="h-5 w-5" />
                  </button>
                </div>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Ask me anything or tell me what you need..."
                  className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 text-slate-800 placeholder-slate-400 py-2"
                  rows={1}
                />
                <div className="flex gap-2">
                  <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 p-3 rounded-xl transition-all duration-200">
                    <Mic className="h-5 w-5" />
                  </button>
                  <button className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">
              MAI-PA can make mistakes. Consider checking important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;