'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Send,
  Mic,
  Paperclip,
  Image as ImageIcon,
  User,
  Plus,
  Search,
  Settings,
  MoreVertical,
  X,
  Copy,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  Trash2,
  Download,
  Share2,
  Archive,
  Pin,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Calendar,
  Mail,
  Sun,
  CheckSquare,
  Bell,
  BarChart3,
  Plane,
  Clock,
  MessageSquare,
  Loader2,
  Crown,
  Briefcase,
  Users as UsersIcon,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Volume2,
  VolumeX,
  MicOff
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb, getAuthToken } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  where
} from 'firebase/firestore';
import { VOICE_OPTIONS } from '@/app/onboarding/page';

interface Conversation {
  id: string;
  title: string;
  preview: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
  pinned?: boolean;
}

interface Attachment {
  type: 'file' | 'image' | 'audio';
  name: string;
  url?: string;
  data?: string; // base64 for images/audio
  size?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
  createdAt: Timestamp | Date;
  audioUrl?: string; // For AI response audio
}

const AssistantPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [messageInput, setMessageInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [userName, setUserName] = useState('User');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [micPermissionDenied, setMicPermissionDenied] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<{
    planId: string;
    planName: string;
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
    billingCycle: 'monthly' | 'annual';
  } | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Voice mode and audio states
  const [voiceMode, setVoiceMode] = useState(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [currentPlayingAudio, setCurrentPlayingAudio] = useState<HTMLAudioElement | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState<string | null>(null); // message ID
  const [userData, setUserData] = useState<any>(null); // Store user data for API calls
  const [userActivities, setUserActivities] = useState<{
    events: any[];
    reminders: any[];
    tasks: any[];
  }>({ events: [], reminders: [], tasks: [] });

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
    if (!authLoading && !user) {
      router.push('/auth');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
          if (userDoc.exists()) {
            const fetchedUserData = userDoc.data();
            
            // Store full user data for API calls
            setUserData(fetchedUserData);
            
            setUserName(fetchedUserData.displayName || fetchedUserData.name || user.displayName || 'User');
            
            // Get selected voice from settings or onboarding data
            // Priority: 1. settings.selectedVoice, 2. onboardingData.selectedVoice, 3. default to first voice
            const selectedVoice = (fetchedUserData.settings?.selectedVoice && fetchedUserData.settings.selectedVoice.trim() !== '') 
                                  ? fetchedUserData.settings.selectedVoice
                                  : (fetchedUserData.onboardingData?.selectedVoice && fetchedUserData.onboardingData.selectedVoice.trim() !== '')
                                    ? fetchedUserData.onboardingData.selectedVoice
                                    : (VOICE_OPTIONS.length > 0 ? VOICE_OPTIONS[0].id : '');
            
            setSelectedVoiceId(selectedVoice);
          } else {
            setUserData(null);
            setUserName(user.displayName || 'User');
            if (VOICE_OPTIONS.length > 0) {
              setSelectedVoiceId(VOICE_OPTIONS[0].id);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
          setUserName(user.displayName || 'User');
          if (VOICE_OPTIONS.length > 0) {
            setSelectedVoiceId(VOICE_OPTIONS[0].id);
          }
        }
      }
    };
    fetchUserData();
  }, [user]);

  // Fetch user activities (events, reminders, tasks)
  useEffect(() => {
    const fetchUserActivities = async () => {
      if (!user) return;
      
      try {
        const db = getDb();
        
        // Fetch all events
        let eventsData: any[] = [];
        try {
          const eventsQuery = query(
            collection(db, 'events'),
            where('userId', '==', user.uid),
            orderBy('start_time', 'desc'),
            limit(100) // Limit to recent 100 events
          );
          const eventsSnapshot = await getDocs(eventsQuery);
          eventsData = eventsSnapshot.docs.map(doc => {
            const data = doc.data();
            const startTime = data.start_time?.toDate?.() || new Date(data.start_time);
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              start_time: startTime.toISOString(),
              end_time: data.end_time?.toDate?.()?.toISOString() || data.end_time,
              location: data.location || '',
              status: data.status || 'pending',
              source: data.source || 'manual'
            };
          });
        } catch (err: any) {
          // Fallback: fetch all events without orderBy if index is missing
          if (err.code === 'failed-precondition') {
            const allEventsQuery = query(
              collection(db, 'events'),
              where('userId', '==', user.uid)
            );
            const allEventsSnapshot = await getDocs(allEventsQuery);
            eventsData = allEventsSnapshot.docs
              .map(doc => {
                const data = doc.data();
                const startTime = data.start_time?.toDate?.() || new Date(data.start_time);
                return {
                  id: doc.id,
                  title: data.title || '',
                  description: data.description || '',
                  start_time: startTime.toISOString(),
                  end_time: data.end_time?.toDate?.()?.toISOString() || data.end_time,
                  location: data.location || '',
                  status: data.status || 'pending',
                  source: data.source || 'manual'
                };
              })
              .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
              .slice(0, 100);
          } else {
            console.error('Error fetching events:', err);
          }
        }

        // Fetch all reminders
        let remindersData: any[] = [];
        try {
          const remindersQuery = query(
            collection(db, 'reminders'),
            where('userId', '==', user.uid),
            orderBy('remind_at', 'desc'),
            limit(100) // Limit to recent 100 reminders
          );
          const remindersSnapshot = await getDocs(remindersQuery);
          remindersData = remindersSnapshot.docs.map(doc => {
            const data = doc.data();
            const remindAt = data.remind_at?.toDate?.() || new Date(data.remind_at);
            return {
              id: doc.id,
              title: data.title || '',
              description: data.description || '',
              remind_at: remindAt.toISOString(),
              status: data.status || 'pending',
              source: data.source || 'manual'
            };
          });
        } catch (err: any) {
          // Fallback: fetch all reminders without orderBy if index is missing
          if (err.code === 'failed-precondition') {
            const allRemindersQuery = query(
              collection(db, 'reminders'),
              where('userId', '==', user.uid)
            );
            const allRemindersSnapshot = await getDocs(allRemindersQuery);
            remindersData = allRemindersSnapshot.docs
              .map(doc => {
                const data = doc.data();
                const remindAt = data.remind_at?.toDate?.() || new Date(data.remind_at);
                return {
                  id: doc.id,
                  title: data.title || '',
                  description: data.description || '',
                  remind_at: remindAt.toISOString(),
                  status: data.status || 'pending',
                  source: data.source || 'manual'
                };
              })
              .sort((a, b) => new Date(b.remind_at).getTime() - new Date(a.remind_at).getTime())
              .slice(0, 100);
          } else {
            console.error('Error fetching reminders:', err);
          }
        }

        // Fetch all tasks
        let tasksData: any[] = [];
        try {
          const tasksQuery = query(
            collection(db, 'tasks'),
            where('userId', '==', user.uid),
            orderBy('due_date', 'desc'),
            limit(100) // Limit to recent 100 tasks
          );
          const tasksSnapshot = await getDocs(tasksQuery);
          tasksData = tasksSnapshot.docs
            .map(doc => {
              const data = doc.data();
              const dueDate = data.due_date?.toDate?.() || (data.due_date ? new Date(data.due_date) : null);
              return {
                id: doc.id,
                title: data.title || '',
                description: data.description || '',
                due_date: dueDate?.toISOString() || data.due_date,
                priority: data.priority || 'normal',
                status: data.status || 'pending',
                source: data.source || 'manual'
              };
            })
            .filter(t => t.due_date); // Only tasks with due_date
        } catch (err: any) {
          // Fallback: fetch all tasks without orderBy if index is missing
          if (err.code === 'failed-precondition') {
            const allTasksQuery = query(
              collection(db, 'tasks'),
              where('userId', '==', user.uid)
            );
            const allTasksSnapshot = await getDocs(allTasksQuery);
            tasksData = allTasksSnapshot.docs
              .map(doc => {
                const data = doc.data();
                const dueDate = data.due_date?.toDate?.() || (data.due_date ? new Date(data.due_date) : null);
                return {
                  id: doc.id,
                  title: data.title || '',
                  description: data.description || '',
                  due_date: dueDate?.toISOString() || data.due_date,
                  priority: data.priority || 'normal',
                  status: data.status || 'pending',
                  source: data.source || 'manual'
                };
              })
              .filter(t => t.due_date)
              .sort((a, b) => {
                if (!a.due_date) return 1;
                if (!b.due_date) return -1;
                return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
              })
              .slice(0, 100);
          } else {
            console.error('Error fetching tasks:', err);
          }
        }

        setUserActivities({
          events: eventsData,
          reminders: remindersData,
          tasks: tasksData
        });
      } catch (error) {
        console.error('Error fetching user activities:', error);
        // Set empty activities on error
        setUserActivities({ events: [], reminders: [], tasks: [] });
      }
    };

    fetchUserActivities();
  }, [user]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessageInput(transcript);
        setIsListening(false);
        
        // If in voice mode, automatically send the message
        if (voiceMode) {
          setTimeout(() => {
            handleSendMessage();
          }, 100);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setMicError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setMicPermissionDenied(true);
          setMicError('Microphone permission denied. Please allow microphone access.');
        } else {
          setMicError('Speech recognition error. Please try again.');
        }
        setTimeout(() => setMicError(null), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, [voiceMode]);

  // Cleanup speech recognition
  useEffect(() => {
    return () => {
      if (speechRecognition) {
        try {
          speechRecognition.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [speechRecognition]);

  // Fetch subscription data
  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;
    
    try {
      setLoadingSubscription(true);
      const db = getDb();
      
      // Try to get subscription from users/{uid}/subscription subcollection first
      const subscriptionRef = doc(db, 'users', user.uid, 'subscription', 'current');
      const subscriptionDoc = await getDoc(subscriptionRef);
      
      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        setSubscription({
          planId: data.planId || data.plan_id || 'student',
          planName: data.planName || data.plan_name || 'Student',
          status: data.status || 'active',
          billingCycle: data.billingCycle || data.billing_cycle || 'monthly'
        });
        return;
      }
      
      // Fallback: Check if subscription is stored directly in user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.subscription) {
          const subData = userData.subscription;
          setSubscription({
            planId: subData.planId || subData.plan_id || 'student',
            planName: subData.planName || subData.plan_name || 'Student',
            status: subData.status || 'active',
            billingCycle: subData.billingCycle || subData.billing_cycle || 'monthly'
          });
          return;
        }
      }
      
      // If no subscription found, set to null
      setSubscription(null);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId.toLowerCase()) {
      case 'student':
        return <User className="h-3.5 w-3.5" />;
      case 'professional':
        return <Briefcase className="h-3.5 w-3.5" />;
      case 'executive':
        return <Crown className="h-3.5 w-3.5" />;
      case 'team':
        return <UsersIcon className="h-3.5 w-3.5" />;
      default:
        return <Crown className="h-3.5 w-3.5" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId.toLowerCase()) {
      case 'student':
        return 'from-teal-500 to-cyan-600';
      case 'professional':
        return 'from-cyan-500 to-blue-600';
      case 'executive':
        return 'from-amber-500 to-orange-600';
      case 'team':
        return 'from-emerald-500 to-teal-600';
      default:
        return 'from-slate-500 to-slate-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'trialing':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'past_due':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'canceled':
        return 'text-slate-600 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  // Fetch conversations from Firestore
  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      try {
        const conversationsRef = collection(getDb(), 'users', user.uid, 'conversations');
        const q = query(conversationsRef, orderBy('updatedAt', 'desc'), limit(50));
        const snapshot = await getDocs(q);
        
        const conversationsData: Conversation[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          conversationsData.push({
            id: doc.id,
            title: data.title || 'New Conversation',
            preview: data.preview || '',
            createdAt: data.createdAt || serverTimestamp(),
            updatedAt: data.updatedAt || serverTimestamp(),
            pinned: data.pinned || false
          });
        });
        
        // Sort: pinned first, then by updatedAt
        conversationsData.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : new Date(a.updatedAt).getTime();
          const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : new Date(b.updatedAt).getTime();
          return bTime - aTime;
        });
        
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setIsLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [user]);


  // Fetch messages for active conversation
  useEffect(() => {
    if (!user || !activeConversationId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const messagesRef = collection(
          getDb(), 
          'users', 
          user.uid, 
          'conversations', 
          activeConversationId, 
          'messages'
        );
        const q = query(messagesRef, orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);
        
        const messagesData: Message[] = [];
        snapshot.forEach((doc) => {
        const data = doc.data();
        messagesData.push({
          id: doc.id,
          role: data.role || 'user',
          content: data.content || '',
          attachments: data.attachments || [],
          audioUrl: data.audioUrl,
          createdAt: data.createdAt || serverTimestamp()
        });
        });
        
        setMessages(messagesData);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [user, activeConversationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 200;
      if (isNearBottom) {
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
    }
  }, [messages, isTyping]);

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

  const createNewConversation = async () => {
    if (!user) return;

    try {
      const conversationsRef = collection(getDb(), 'users', user.uid, 'conversations');
      const newConv = await addDoc(conversationsRef, {
        title: 'New Conversation',
        preview: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        pinned: false
      });
      
      setActiveConversationId(newConv.id);
      setMessages([]);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const handleSendMessage = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if ((!messageInput.trim() && attachments.length === 0) || !user) return;

    const userMessage = messageInput.trim() || (attachments.length > 0 ? 'See attached files' : '');
    const messageAttachments = [...attachments];
    setMessageInput('');
    setAttachments([]);
    setAudioBlob(null);

    // Create conversation if none exists
    let conversationId = activeConversationId;
    if (!conversationId) {
      try {
        const conversationsRef = collection(getDb(), 'users', user.uid, 'conversations');
        const newConv = await addDoc(conversationsRef, {
          title: userMessage.substring(0, 50) || 'New Conversation',
          preview: userMessage.substring(0, 100),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          pinned: false
        });
        conversationId = newConv.id;
        setActiveConversationId(conversationId);
      } catch (error) {
        console.error('Error creating conversation:', error);
        return;
      }
    }

      // Add user message to Firestore
      try {
        const messagesRef = collection(
          getDb(), 
          'users', 
          user.uid, 
          'conversations', 
          conversationId, 
          'messages'
        );
        
        // Build message data, only including attachments if they exist
        const userMessageData: any = {
          role: 'user',
          content: userMessage,
          createdAt: serverTimestamp()
        };
        
        // Only add attachments if there are any
        if (messageAttachments.length > 0) {
          userMessageData.attachments = messageAttachments;
        }
        
        await addDoc(messagesRef, userMessageData);

      // Update conversation preview and timestamp
      const convRef = doc(getDb(), 'users', user.uid, 'conversations', conversationId);
      await updateDoc(convRef, {
        preview: userMessage.substring(0, 100),
        updatedAt: serverTimestamp()
      });

      setIsTyping(true);

      // Get all messages for context
      const allMessages = [...messages, { 
        id: 'temp', 
        role: 'user' as const, 
        content: userMessage, 
        attachments: messageAttachments,
        createdAt: new Date() 
      }];
      
      // Build message content with attachments info
      let messageContent = userMessage;
      if (messageAttachments.length > 0) {
        const attachmentInfo = messageAttachments.map(att => {
          if (att.type === 'image') return `[Image: ${att.name}]`;
          if (att.type === 'audio') return `[Audio recording: ${att.name}]`;
          return `[File: ${att.name}]`;
        }).join('\n');
        messageContent = messageContent ? `${messageContent}\n\n${attachmentInfo}` : attachmentInfo;
      }
      
      const messagesForAPI = allMessages.map(msg => ({
        role: msg.role,
        content: msg.content + (msg.attachments && msg.attachments.length > 0 
          ? '\n\n' + msg.attachments.map(att => {
              if (att.type === 'image') return `[Image: ${att.name}]`;
              if (att.type === 'audio') return `[Audio recording: ${att.name}]`;
              return `[File: ${att.name}]`;
            }).join('\n')
          : '')
      }));

      // Call Deepseek API directly
      const deepseekApiKey = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
      if (!deepseekApiKey) {
        console.error('Deepseek API key is missing. Make sure NEXT_PUBLIC_DEEPSEEK_API_KEY is set in your environment variables.');
        throw new Error('Deepseek API key not configured. Please set NEXT_PUBLIC_DEEPSEEK_API_KEY in your environment variables.');
      }

      // Build system context from user data and activities
      const currentDate = new Date();
      const currentDateString = currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const currentTimeString = currentDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      
      let systemContext = 'You are MAI-PA, a helpful AI personal assistant.';
      systemContext += ` Today is ${currentDateString}. The current time is ${currentTimeString}.`;
      systemContext += '\n\nIMPORTANT RULES:\n';
      systemContext += '1. NEVER use markdown formatting like **bold** or *italic* in your responses. Use plain text only.\n';
      systemContext += '2. NEVER make up or invent calendar events, tasks, or reminders. Only use the actual activities provided in the User Activities section below.\n';
      systemContext += '3. If the user asks about their calendar and there are no activities listed, tell them they have no events/reminders/tasks scheduled, do NOT invent any.\n';
      systemContext += '4. Always be truthful and only reference real data that has been provided to you.\n';
      
      if (userData) {
        const userName = userData.fullName || userData.onboardingData?.userName || 'User';
        const aiName = userData.onboardingData?.aiName || 'MAI';
        systemContext += `\nThe user's name is ${userName}. The AI assistant is called ${aiName}.`;
        
        if (userData.onboardingData?.personality) {
          systemContext += ` The assistant's personality: ${userData.onboardingData.personality}.`;
        }
      }

      // Add activities context if available
      // Include actual activity data so AI can reference specific events, tasks, and reminders
      if (userActivities) {
        const events = userActivities.events || [];
        const reminders = userActivities.reminders || [];
        const tasks = userActivities.tasks || [];
        
        // Filter to only upcoming/recent activities (last 30 days and future)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        const upcomingEvents = events
          .filter(e => {
            const eventDate = new Date(e.start_time);
            return eventDate >= thirtyDaysAgo && e.status !== 'cancelled';
          })
          .slice(0, 20) // Limit to 20 most relevant events
          .map(e => ({
            title: e.title,
            description: e.description || '',
            start_time: e.start_time,
            location: e.location || ''
          }));
        
        const upcomingReminders = reminders
          .filter(r => {
            const remindDate = new Date(r.remind_at);
            return remindDate >= thirtyDaysAgo && r.status !== 'cancelled';
          })
          .slice(0, 20) // Limit to 20 most relevant reminders
          .map(r => ({
            title: r.title,
            description: r.description || '',
            remind_at: r.remind_at
          }));
        
        const upcomingTasks = tasks
          .filter(t => {
            if (!t.due_date) return false;
            const taskDate = new Date(t.due_date);
            return taskDate >= thirtyDaysAgo && t.status !== 'cancelled' && t.status !== 'completed';
          })
          .slice(0, 20) // Limit to 20 most relevant tasks
          .map(t => ({
            title: t.title,
            description: t.description || '',
            due_date: t.due_date,
            priority: t.priority || 'normal'
          }));
        
        if (upcomingEvents.length > 0 || upcomingReminders.length > 0 || upcomingTasks.length > 0) {
          systemContext += '\n\nUser Activities:\n';
          
          if (upcomingEvents.length > 0) {
            systemContext += `Events (${upcomingEvents.length}):\n`;
            upcomingEvents.forEach((e, i) => {
              const eventDate = e.start_time ? new Date(e.start_time) : null;
              const dateStr = eventDate ? eventDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: eventDate.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined
              }) : '';
              const timeStr = eventDate ? eventDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              }) : '';
              systemContext += `${i + 1}. ${e.title}${dateStr ? ` on ${dateStr}${timeStr ? ` at ${timeStr}` : ''}` : ''}${e.location ? ` at ${e.location}` : ''}${e.description ? ` - ${e.description.substring(0, 100)}` : ''}\n`;
            });
          }
          
          if (upcomingReminders.length > 0) {
            systemContext += `\nReminders (${upcomingReminders.length}):\n`;
            upcomingReminders.forEach((r, i) => {
              const remindDate = r.remind_at ? new Date(r.remind_at) : null;
              const dateStr = remindDate ? remindDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: remindDate.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined
              }) : '';
              const timeStr = remindDate ? remindDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit' 
              }) : '';
              systemContext += `${i + 1}. ${r.title}${dateStr ? ` on ${dateStr}${timeStr ? ` at ${timeStr}` : ''}` : ''}${r.description ? ` - ${r.description.substring(0, 100)}` : ''}\n`;
            });
          }
          
          if (upcomingTasks.length > 0) {
            systemContext += `\nTasks (${upcomingTasks.length}):\n`;
            upcomingTasks.forEach((t, i) => {
              const taskDate = t.due_date ? new Date(t.due_date) : null;
              const dateStr = taskDate ? taskDate.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric',
                year: taskDate.getFullYear() !== currentDate.getFullYear() ? 'numeric' : undefined
              }) : '';
              systemContext += `${i + 1}. ${t.title}${dateStr ? ` (due ${dateStr})` : ''}${t.priority !== 'normal' ? ` [${t.priority} priority]` : ''}${t.description ? ` - ${t.description.substring(0, 100)}` : ''}\n`;
            });
          }
        }
      }

      // Prepare messages for Deepseek API
      const apiMessages = [
        {
          role: 'system',
          content: systemContext
        },
        ...messagesForAPI
      ];

      console.log('Calling Deepseek API with', apiMessages.length, 'messages');

      // Call Deepseek API directly
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekApiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      console.log('Deepseek API response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: await response.text() || 'Unknown error' };
        }
        
        const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Deepseek API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          fullError: errorData
        });
        throw new Error(`Deepseek API error: ${errorMessage}`);
      }

      const data = await response.json();
      let assistantMessage = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';
      
      // Remove markdown formatting (**bold**, *italic*, etc.) for better UI display
      assistantMessage = assistantMessage
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
        .replace(/\*(.*?)\*/g, '$1') // Remove *italic*
        .replace(/__(.*?)__/g, '$1') // Remove __bold__
        .replace(/_(.*?)_/g, '$1') // Remove _italic_
        .replace(/~~(.*?)~~/g, '$1') // Remove ~~strikethrough~~
        .replace(/`(.*?)`/g, '$1') // Remove `code`
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .trim();

      // Add assistant message to Firestore first
      const assistantMessageRef = await addDoc(messagesRef, {
        role: 'assistant',
        content: assistantMessage,
        createdAt: serverTimestamp()
      });

      // Add to local messages state immediately
      const newAssistantMessage: Message = {
        id: assistantMessageRef.id,
        role: 'assistant',
        content: assistantMessage,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, newAssistantMessage]);

      // Generate audio for AI response if voice mode is enabled or voice is selected
      if ((voiceMode || selectedVoiceId) && assistantMessage) {
        try {
          setGeneratingAudio(assistantMessageRef.id);
          
          // Call ElevenLabs API directly
          const elevenlabsApiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
          if (!elevenlabsApiKey) {
            throw new Error('ElevenLabs API key not configured');
          }

          const voiceId = selectedVoiceId || VOICE_OPTIONS[0].id;
          const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': elevenlabsApiKey
            },
            body: JSON.stringify({
              text: assistantMessage,
              model_id: 'eleven_multilingual_v2',
              voice_settings: {
                stability: 0.5,
                similarity_boost: 0.75
              }
            })
          });

          if (ttsResponse.ok) {
            // Get audio as blob and convert to data URL
            const audioBlob = await ttsResponse.blob();
            const reader = new FileReader();
            const audioUrl = await new Promise<string>((resolve, reject) => {
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(audioBlob);
            });
            
            // Update message with audio URL
            await updateDoc(assistantMessageRef, {
              audioUrl: audioUrl
            });
            
            // Update local state
            setMessages(prev => prev.map(msg => 
              msg.id === assistantMessageRef.id 
                ? { ...msg, audioUrl: audioUrl }
                : msg
            ));

            // Auto-play audio if in voice mode
            if (voiceMode) {
              setTimeout(async () => {
                await playAudio(audioUrl, assistantMessageRef.id);
                
                // After audio finishes, restart listening for next input
                if (currentPlayingAudio) {
                  const audio = currentPlayingAudio;
                  // Override the onended handler to also restart listening
                  audio.onended = () => {
                    // Clear the playing state (original behavior)
                    setCurrentPlayingAudio(null);
                    setPlayingMessageId(null);
                    // Restart listening after a short delay
                    setTimeout(() => {
                      if (voiceMode && !isListening) {
                        startSpeechRecognition();
                      }
                    }, 500);
                  };
                }
              }, 100);
            }
          }
        } catch (error) {
          console.error('Error generating audio:', error);
          // Continue without audio if generation fails
        } finally {
          setGeneratingAudio(null);
        }
      } else if (voiceMode) {
        // If no audio generation but in voice mode, restart listening after a delay
        setTimeout(() => {
          if (voiceMode && !isListening) {
            startSpeechRecognition();
          }
        }, 1000);
      }

      // Update conversation preview and timestamp
      await updateDoc(convRef, {
        preview: assistantMessage.substring(0, 100),
        updatedAt: serverTimestamp()
      });

      // Refresh conversations list
      const conversationsRef = collection(getDb(), 'users', user.uid, 'conversations');
      const q = query(conversationsRef, orderBy('updatedAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      
      const conversationsData: Conversation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        conversationsData.push({
          id: doc.id,
          title: data.title || 'New Conversation',
          preview: data.preview || '',
          createdAt: data.createdAt || serverTimestamp(),
          updatedAt: data.updatedAt || serverTimestamp(),
          pinned: data.pinned || false
        });
      });
      
      conversationsData.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        const aTime = a.updatedAt instanceof Timestamp ? a.updatedAt.toMillis() : new Date(a.updatedAt).getTime();
        const bTime = b.updatedAt instanceof Timestamp ? b.updatedAt.toMillis() : new Date(b.updatedAt).getTime();
        return bTime - aTime;
      });
      
      setConversations(conversationsData);

    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Show more specific error message
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.message) {
        if (error.message.includes('API key not configured')) {
          errorMessage = 'API key not configured. Please set NEXT_PUBLIC_DEEPSEEK_API_KEY in your environment variables.';
        } else if (error.message.includes('Failed to get AI response')) {
          errorMessage = 'Failed to get AI response. Please check your API key and try again.';
        } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage(e);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment: Attachment = {
          type: 'file',
          name: file.name,
          data: event.target?.result as string,
          size: file.size
        };
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const attachment: Attachment = {
          type: 'image',
          name: file.name,
          data: event.target?.result as string,
          size: file.size
        };
        setAttachments(prev => [...prev, attachment]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Audio playback functions
  const playAudio = async (audioUrl: string, messageId: string) => {
    // Stop any currently playing audio
    if (currentPlayingAudio) {
      currentPlayingAudio.pause();
      currentPlayingAudio.currentTime = 0;
      setCurrentPlayingAudio(null);
      setPlayingMessageId(null);
    }

    // Create new audio element
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      setCurrentPlayingAudio(null);
      setPlayingMessageId(null);
    };

    audio.onerror = () => {
      console.error('Error playing audio');
      setCurrentPlayingAudio(null);
      setPlayingMessageId(null);
    };

    try {
      await audio.play();
      setCurrentPlayingAudio(audio);
      setPlayingMessageId(messageId);
    } catch (error) {
      console.error('Error playing audio:', error);
      setCurrentPlayingAudio(null);
      setPlayingMessageId(null);
    }
  };

  const stopAudio = () => {
    if (currentPlayingAudio) {
      currentPlayingAudio.pause();
      currentPlayingAudio.currentTime = 0;
      setCurrentPlayingAudio(null);
      setPlayingMessageId(null);
    }
  };

  // Start speech recognition
  const startSpeechRecognition = () => {
    if (!speechRecognition) {
      setMicError('Speech recognition not available in this browser.');
      setTimeout(() => setMicError(null), 5000);
      return;
    }

    try {
      setIsListening(true);
      setMicError(null);
      speechRecognition.start();
    } catch (error: any) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
      if (error.message?.includes('already started')) {
        speechRecognition.stop();
        setTimeout(() => {
          try {
            speechRecognition.start();
            setIsListening(true);
          } catch (e) {
            setMicError('Failed to start speech recognition.');
            setTimeout(() => setMicError(null), 5000);
          }
        }, 100);
      } else {
        setMicError('Failed to start speech recognition.');
        setTimeout(() => setMicError(null), 5000);
      }
    }
  };

  // Stop speech recognition
  const stopSpeechRecognition = () => {
    if (speechRecognition && isListening) {
      try {
        speechRecognition.stop();
        setIsListening(false);
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
    }
  };

  // Toggle voice mode
  const toggleVoiceMode = () => {
    const newVoiceMode = !voiceMode;
    setVoiceMode(newVoiceMode);
    
    // Stop any playing audio when toggling modes
    stopAudio();
    
    if (newVoiceMode) {
      // If enabling voice mode, start listening
      if (!isListening && speechRecognition) {
        startSpeechRecognition();
      }
    } else {
      // If disabling voice mode, stop listening
      stopSpeechRecognition();
    }
  };

  const startRecording = async () => {
    // Prevent multiple simultaneous calls
    if (isRecording) {
      return;
    }

    // Check if mediaDevices is available
    if (typeof window === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Microphone access is not supported in this browser.');
      setMicPermissionDenied(true);
      setTimeout(() => setMicError(null), 5000);
      return;
    }

    try {
      // Clear any previous error states
      setMicError(null);
      setMicPermissionDenied(false);

      // Suppress console errors for permission issues
      const originalConsoleError = console.error;
      console.error = (...args: any[]) => {
        // Don't log NotAllowedError to console as it's expected user behavior
        if (args[0]?.name === 'NotAllowedError' || 
            args[0]?.message?.includes('Permission dismissed') ||
            args[0]?.message?.includes('Permission denied')) {
          return; // Silently handle permission errors
        }
        originalConsoleError.apply(console, args);
      };

      let stream: MediaStream | null = null;
      
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (getUserMediaError: any) {
        // Restore console.error
        console.error = originalConsoleError;
        throw getUserMediaError;
      }

      // Restore console.error after successful getUserMedia
      console.error = originalConsoleError;

      if (!stream) {
        throw new Error('Failed to get media stream');
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const attachment: Attachment = {
            type: 'audio',
            name: `recording-${Date.now()}.webm`,
            data: event.target?.result as string,
            size: audioBlob.size
          };
          setAttachments(prev => [...prev, attachment]);
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.onerror = (event: any) => {
        setIsRecording(false);
        setMicError('An error occurred while recording. Please try again.');
        setTimeout(() => setMicError(null), 5000);
        // Stop tracks if stream exists
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error: any) {
      // Only log non-permission errors
      if (error.name !== 'NotAllowedError' && 
          error.name !== 'PermissionDeniedError' &&
          !error.message?.includes('Permission dismissed') &&
          !error.message?.includes('Permission denied')) {
        console.warn('Microphone access error:', error.name || error.message);
      }
      
      setIsRecording(false);
      
      // Handle different error types
      if (error.name === 'NotAllowedError' || 
          error.name === 'PermissionDeniedError' ||
          error.message?.includes('Permission dismissed') ||
          error.message?.includes('Permission denied')) {
        setMicPermissionDenied(true);
        setMicError('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setMicError('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setMicError('Microphone is already in use by another application.');
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        setMicError('Microphone settings are not supported.');
      } else {
        setMicError('Could not access microphone. Please check your browser settings.');
      }
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setMicError(null);
      }, 5000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
      } catch (error) {
        // Silently handle stop errors
        setIsRecording(false);
      }
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!user) return;
    
    try {
      // First, delete all messages in the conversation
      const messagesRef = collection(
        getDb(), 
        'users', 
        user.uid, 
        'conversations', 
        conversationId, 
        'messages'
      );
      const messagesSnapshot = await getDocs(messagesRef);
      const deleteMessagePromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteMessagePromises);
      
      // Then delete the conversation document
      const convRef = doc(getDb(), 'users', user.uid, 'conversations', conversationId);
      await deleteDoc(convRef);
      
      // Remove from local state
      setConversations(conversations.filter(c => c.id !== conversationId));
      
      if (activeConversationId === conversationId) {
        // Clear active conversation and show new conversation page
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  const formatTimestamp = (timestamp: Timestamp | Date) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
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
        sidebarOpen ? 'w-64' : 'w-0'
      } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col h-[90%] overflow-hidden shadow-lg lg:shadow-none flex-shrink-0 lg:relative fixed lg:z-auto z-50`}>
        {/* Sidebar Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-br from-teal-50 to-cyan-50 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-slate-900">MAI-PA</h2>
                <div className="flex items-center gap-1 text-[10px] text-emerald-600">
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
          <button
            onClick={createNewConversation}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoadingConversations ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500">No conversations yet</p>
              <p className="text-[10px] text-slate-400 mt-1">Start a new conversation to begin</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    activeConversationId === conv.id
                      ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-300 shadow-sm'
                      : 'hover:bg-slate-50 border border-transparent hover:border-slate-200'
                  }`}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    if (window.innerWidth < 1024) {
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {conv.pinned && (
                          <Pin className="h-3 w-3 text-teal-500 flex-shrink-0" />
                        )}
                        <h4 className="text-[11px] font-medium text-slate-800 line-clamp-1">{conv.title}</h4>
                      </div>
                      <p className="text-[10px] text-slate-600 line-clamp-1">{conv.preview || 'No messages yet'}</p>
                      <span className="text-[9px] text-slate-500">
                        {formatTimestamp(conv.updatedAt)}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 rounded hover:bg-red-50"
                      title="Delete conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Profile & Subscription Footer */}
        <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white flex-shrink-0">
          {/* Subscription Card */}
          {loadingSubscription ? (
            <div className="p-3 flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-teal-500 animate-spin" />
            </div>
          ) : subscription ? (
            <div className="p-3 border-b border-slate-200">
              <div className={`bg-gradient-to-br ${getPlanColor(subscription.planId)} rounded-lg p-3 shadow-sm`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                      {getPlanIcon(subscription.planId)}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-white">{subscription.planName}</p>
                      <p className="text-[9px] text-white/80 capitalize">{subscription.billingCycle}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full border text-[9px] font-medium ${getStatusColor(subscription.status)}`}>
                    {subscription.status === 'active' && <CheckCircle2 className="h-2.5 w-2.5 inline mr-0.5" />}
                    {subscription.status === 'past_due' && <AlertCircle className="h-2.5 w-2.5 inline mr-0.5" />}
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
                  </div>
                </div>
                {subscription.status === 'past_due' && (
                  <Link
                    href="/billing"
                    className="flex items-center gap-1 text-[10px] text-white/90 hover:text-white mt-2 group"
                  >
                    <span>Update payment</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
                {subscription.status === 'canceled' && (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-1 text-[10px] text-white/90 hover:text-white mt-2 group"
                  >
                    <span>Upgrade plan</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 border-b border-slate-200">
              <Link
                href="/pricing"
                className="block bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 rounded-lg p-3 text-center transition-all duration-200 shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center justify-center gap-2">
                  <Crown className="h-4 w-4 text-white" />
                  <span className="text-[11px] font-semibold text-white">Upgrade Plan</span>
                  <ArrowRight className="h-3 w-3 text-white group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>
          )}
          
          {/* User Profile */}
          <div className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white">
                  <User className="h-4.5 w-4.5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-800 truncate">{userName}</p>
                  <p className="text-[9px] text-slate-500 truncate">{user?.email?.split('@')[0] || 'User'}</p>
                </div>
              </div>
              <Link
                href="/settings"
                className="text-slate-400 hover:text-teal-600 transition-colors p-1.5 hover:bg-teal-50 rounded-lg flex-shrink-0"
                title="Settings"
              >
                <Settings className="h-4.5 w-4.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[90%] overflow-hidden">
        {/* Top Bar - Compact version to avoid double header */}
        <div className="bg-slate-50/50 border-b border-slate-200 px-3 sm:px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-600 hover:text-teal-600 transition-colors p-1.5 hover:bg-teal-50 rounded-lg flex-shrink-0"
            >
              {sidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </button>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                {activeConversationId 
                  ? conversations.find(c => c.id === activeConversationId)?.title || 'Conversation'
                  : 'New Conversation'}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                {activeConversationId 
                  ? `Started ${formatTimestamp(conversations.find(c => c.id === activeConversationId)?.createdAt || new Date())}`
                  : 'Start a conversation with your AI assistant'}
              </p>
            </div>
          </div>
          {/* Voice Mode Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={toggleVoiceMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all text-xs font-medium ${
                voiceMode
                  ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
              title={voiceMode ? 'Disable voice mode' : 'Enable voice mode'}
            >
              {voiceMode ? (
                <>
                  <Mic className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Voice Mode</span>
                  {isListening && (
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  )}
                </>
              ) : (
                <>
                  <MicOff className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Text Mode</span>
                </>
              )}
            </button>
            {activeConversationId && (
            <div className="flex items-center gap-1.5 sm:gap-2 relative flex-shrink-0">
              <button
                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                className="text-slate-600 hover:text-teal-600 transition-colors p-1.5 hover:bg-teal-50 rounded-lg"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {/* Options Menu Dropdown */}
              {showOptionsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowOptionsMenu(false)}
                  ></div>
                  <div className="absolute right-0 top-10 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-20">
                    <button className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-700">
                      <Edit3 className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">Rename</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-700">
                      <Pin className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">Pin</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-700">
                      <Share2 className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">Share</span>
                    </button>
                    <button className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-700">
                      <Download className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">Export</span>
                    </button>
                    <div className="border-t border-slate-200 my-1"></div>
                    <button className="w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors flex items-center gap-2.5 text-slate-700">
                      <Archive className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">Archive</span>
                    </button>
                    <button 
                      onClick={() => {
                        if (activeConversationId) {
                          handleDeleteConversation(activeConversationId);
                          setShowOptionsMenu(false);
                        }
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-red-50 transition-colors flex items-center gap-2.5 text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="text-[11px] font-medium">Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Chat Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 min-h-0"
        >
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 text-teal-500 animate-spin" />
            </div>
          ) : !activeConversationId ? (
            <div className="flex items-center justify-center h-full mt-20">
              <div className="max-w-4xl w-full text-center space-y-6 sm:space-y-8 px-4 sm:px-6">
                <div>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                    <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2 sm:mb-3">How can I assist you today?</h2>
                  <p className="text-[11px] sm:text-xs text-slate-600">I'm your AI personal assistant, ready to help with your schedule, tasks, emails, and more.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {suggestedPrompts.map((prompt, idx) => {
                    const Icon = prompt.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setMessageInput(prompt.text);
                          inputRef.current?.focus();
                        }}
                        className="group p-3 sm:p-4 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-teal-300 rounded-xl text-left transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
                      >
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${prompt.color} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform shadow-md`}>
                          <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        <p className="text-[10px] sm:text-[11px] font-medium text-slate-800 leading-snug">{prompt.text}</p>
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
                      <h4 className="font-semibold text-teal-900 mb-1 text-[11px] sm:text-xs">Pro Tip</h4>
                      <p className="text-[10px] sm:text-[11px] text-teal-700 leading-relaxed">
                        Click a suggestion above to get started, or type your own question in the message box below. I can help with scheduling, task management, email summaries, and much more!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => {
                const isUser = message.role === 'user';
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
                          <p className={`text-[11px] sm:text-xs leading-relaxed whitespace-pre-line ${
                            isUser ? 'text-white' : 'text-slate-800'
                          }`}>
                            {message.content}
                          </p>
                          
                          {/* Display Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map((attachment, idx) => (
                                <div
                                  key={idx}
                                  className={`rounded-lg overflow-hidden ${
                                    isUser ? 'bg-white/20' : 'bg-slate-50'
                                  }`}
                                >
                                  {attachment.type === 'image' && attachment.data ? (
                                    <img
                                      src={attachment.data}
                                      alt={attachment.name}
                                      className="max-w-full max-h-64 object-contain rounded-lg"
                                    />
                                  ) : attachment.type === 'audio' && attachment.data ? (
                                    <div className="p-3 flex items-center gap-3">
                                      <Mic className={`h-5 w-5 ${isUser ? 'text-white' : 'text-teal-600'}`} />
                                      <audio
                                        controls
                                        src={attachment.data}
                                        className="flex-1 h-8"
                                      />
                                    </div>
                                  ) : (
                                    <div className={`p-3 flex items-center gap-3 ${
                                      isUser ? 'text-white' : 'text-slate-700'
                                    }`}>
                                      <Paperclip className="h-5 w-5" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-medium truncate">{attachment.name}</p>
                                        {attachment.size && (
                                          <p className="text-[10px] opacity-75">
                                            {(attachment.size / 1024).toFixed(1)} KB
                                          </p>
                                        )}
                                      </div>
                                      {attachment.data && (
                                        <a
                                          href={attachment.data}
                                          download={attachment.name}
                                          className={`px-2 py-1 rounded text-[10px] font-medium ${
                                            isUser 
                                              ? 'bg-white/20 hover:bg-white/30 text-white' 
                                              : 'bg-teal-100 hover:bg-teal-200 text-teal-700'
                                          }`}
                                        >
                                          Download
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Message Actions */}
                        {!isUser && (
                          <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                            {message.audioUrl && (
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (playingMessageId === message.id) {
                                    stopAudio();
                                  } else {
                                    playAudio(message.audioUrl!, message.id);
                                  }
                                }}
                                className={`transition-colors p-1.5 rounded-lg ${
                                  playingMessageId === message.id
                                    ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                                    : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
                                }`}
                                title={playingMessageId === message.id ? 'Stop audio' : 'Play audio'}
                              >
                                {playingMessageId === message.id ? (
                                  <VolumeX className="h-4 w-4" />
                                ) : (
                                  <Volume2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                            {generatingAudio && generatingAudio === message.id && (
                              <div className="flex items-center gap-1 text-teal-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-[10px]">Generating audio...</span>
                              </div>
                            )}
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(message.content);
                              }}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-lg"
                              title="Copy message"
                            >
                              <Copy className="h-4 w-4" />
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

                        <span className="text-[10px] text-slate-500 mt-1">
                          {formatTimestamp(message.createdAt)}
                        </span>
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
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    className="hidden"
                    accept="*/*"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50 active:scale-95"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageSelect}
                    multiple
                    className="hidden"
                    accept="image/*"
                  />
                  <button 
                    onClick={() => imageInputRef.current?.click()}
                    className="text-slate-400 hover:text-teal-600 transition-colors p-2 rounded-lg hover:bg-teal-50 active:scale-95"
                    title="Attach image"
                  >
                    <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
                <textarea
                  ref={inputRef}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything or tell me what you need..."
                  className="flex-1 bg-transparent border-none focus:outline-none resize-none max-h-32 text-slate-800 placeholder-slate-400 py-2 text-[11px] sm:text-xs"
                  rows={1}
                />
                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                  {voiceMode ? (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isListening) {
                          stopSpeechRecognition();
                        } else {
                          startSpeechRecognition();
                        }
                      }}
                      className={`${
                        isListening 
                          ? 'bg-teal-500 hover:bg-teal-600 text-white animate-pulse' 
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      } p-2 sm:p-3 rounded-xl transition-all duration-200 active:scale-95`}
                      title={isListening ? 'Stop listening' : 'Start listening'}
                    >
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (isRecording) {
                          stopRecording();
                        } else {
                          startRecording().catch(() => {
                            // Error already handled in startRecording
                          });
                        }
                      }}
                      className={`${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      } p-2 sm:p-3 rounded-xl transition-all duration-200 active:scale-95`}
                      title={isRecording ? 'Stop recording' : 'Start recording'}
                    >
                      <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleSendMessage(e)}
                    disabled={(!messageInput.trim() && attachments.length === 0) || isTyping}
                    className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed text-white p-2 sm:p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                  >
                    {isTyping ? (
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Microphone Error Message */}
            {micError && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 flex items-start gap-2">
                <div className="flex-1">
                  <p className="text-[10px] sm:text-[11px] text-red-700 font-medium">Microphone Error</p>
                  <p className="text-[10px] text-red-600 mt-0.5">{micError}</p>
                  {micPermissionDenied && (
                    <p className="text-[9px] text-red-500 mt-1">
                      Tip: Check your browser's address bar for the microphone icon to grant permission.
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setMicError(null);
                    setMicPermissionDenied(false);
                  }}
                  className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            
            {/* Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-slate-100 rounded-lg px-2 py-1.5 text-[10px] sm:text-[11px]"
                  >
                    {attachment.type === 'image' && attachment.data ? (
                      <img 
                        src={attachment.data} 
                        alt={attachment.name}
                        className="h-8 w-8 object-cover rounded"
                      />
                    ) : attachment.type === 'audio' ? (
                      <Mic className="h-4 w-4 text-teal-600" />
                    ) : (
                      <Paperclip className="h-4 w-4 text-slate-600" />
                    )}
                    <span className="text-slate-700 truncate max-w-[120px] sm:max-w-[200px]">
                      {attachment.name}
                    </span>
                    <button
                      onClick={() => removeAttachment(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-[10px] text-slate-500 text-center mt-2 sm:mt-3">
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
