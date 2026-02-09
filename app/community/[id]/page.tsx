'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Flag,
  CheckCircle,
  Clock,
  Eye,
  User,
  Award,
  Heart,
  Reply,
  Send,
  MoreVertical,
  TrendingUp,
  Calendar,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    badge: string;
    role: string;
  };
  title: string;
  content: string;
  category: string;
  tags: string[];
  stats: {
    views: number;
    likes: number;
  };
  timeAgo: string;
  solved: boolean;
}

// All posts data from community page (matching the structure from community/page.tsx)
const allPosts: Array<Omit<Post, 'content'> & { content?: string }> = [
  {
    id: '1',
    author: {
      name: 'Sarah Mitchell',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      badge: 'Expert',
      role: 'Community Champion'
    },
    title: 'How I talk to my assistant to plan my entire week',
    category: 'Tips & Tricks',
    tags: ['automation', 'productivity', 'workflow'],
    stats: { views: 2847, likes: 156 },
    timeAgo: '2 hours ago',
    solved: false,
  },
  {
    id: '2',
    author: {
      name: 'Marcus Chen',
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100',
      badge: 'Pro',
      role: 'Professional Plan'
    },
    title: 'Morning briefing calls not working with international numbers?',
    category: 'Help & Support',
    tags: ['phone-reminders', 'technical', 'international'],
    stats: { views: 421, likes: 8 },
    timeAgo: '4 hours ago',
    solved: true,
  },
  {
    id: '3',
    author: {
      name: 'Emily Rodriguez',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
      badge: 'Rising Star',
      role: 'Student Plan'
    },
    title: 'Just hit 500 completed tasks! My assistant journey',
    category: 'Success Stories',
    tags: ['milestone', 'student', 'productivity'],
    stats: { views: 1532, likes: 94 },
    timeAgo: '6 hours ago',
    solved: false,
  },
  {
    id: '4',
    author: {
      name: 'David Park',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      badge: 'Expert',
      role: 'Executive Plan'
    },
    title: 'Request: Tell my assistant to color-code events by priority',
    category: 'Feature Requests',
    tags: ['feature-request', 'calendar', 'ui'],
    stats: { views: 892, likes: 127 },
    timeAgo: '1 day ago',
    solved: false,
  },
  {
    id: '5',
    author: {
      name: 'Lisa Anderson',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      badge: 'Pro',
      role: 'Team Plan'
    },
    title: 'Best practices for team calendar management',
    category: 'General Discussion',
    tags: ['team', 'collaboration', 'best-practices'],
    stats: { views: 634, likes: 42 },
    timeAgo: '1 day ago',
    solved: false,
  },
  {
    id: '6',
    author: {
      name: 'James Wilson',
      avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100',
      badge: 'Veteran',
      role: 'Professional Plan'
    },
    title: 'Natural ways to talk to your assistant that actually work',
    category: 'Tips & Tricks',
    tags: ['ai', 'prompts', 'advanced'],
    stats: { views: 3241, likes: 203 },
    timeAgo: '2 days ago',
    solved: false,
  }
];

// Mock data - in production, fetch from API
const getPostData = (id: string): Post | null => {
  const posts: Record<string, Post> = {
    '1': {
      id: '1',
      author: {
        name: 'Sarah Mitchell',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
        badge: 'Expert',
        role: 'Community Champion'
      },
      title: 'How I talk to my assistant to plan my entire week',
      content: `After 3 months with my AI companion, I've learned the best ways to have natural conversations that save me 10+ hours per week. Here's what I say to my assistant:

**Monday Morning Routine:**
I start each week by saying: "Hey [AI Name], let's plan my week. What do I have coming up, and what should I prioritize?"

My assistant then walks me through:
- All scheduled meetings and appointments
- Deadlines and important tasks
- Any conflicts or scheduling issues
- Weather updates for outdoor plans
- Travel arrangements if any

**Daily Check-ins:**
Instead of asking "What's on my calendar today?" I've learned to be more specific:
- "What's my day looking like? Any conflicts I should know about?"
- "Do I have time for a workout between meetings?"
- "Remind me to prep for tomorrow's presentation"

**Proactive Planning:**
The real game-changer is letting my assistant be proactive:
- "If you see any gaps in my schedule, suggest times for deep work"
- "Watch my email for flight confirmations and add them to my calendar automatically"
- "If I have back-to-back meetings, remind me to take a break"

**Natural Language Works Best:**
I've found that talking to my assistant like I would talk to a human assistant gets the best results. No need for specific commands - just natural conversation!

**Results:**
- 10+ hours saved per week
- Never miss a deadline
- Better work-life balance
- Less mental load managing my schedule

What tips do you have for talking to your assistant? Share your experiences below!`,
      category: 'Tips & Tricks',
      tags: ['automation', 'productivity', 'workflow'],
      stats: { views: 2847, likes: 156 },
      timeAgo: '2 hours ago',
      solved: false,
    },
    '2': {
      id: '2',
      author: {
        name: 'Marcus Chen',
        avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=100',
        badge: 'Pro',
        role: 'Professional Plan'
      },
      title: 'Morning briefing calls not working with international numbers?',
      content: `Has anyone successfully set up morning briefings and phone calls from their assistant with a non-US number? 

I'm based in Singapore (+65) and I've been trying to configure my assistant to call me with morning briefings, but I keep getting errors about the phone number format.

**What I've tried:**
- Entering the number with country code: +65 9123 4567
- Entering without country code: 9123 4567
- Different formats with spaces, dashes, etc.

**Error message:**
"Phone number format not supported for international numbers"

**My plan:** Professional Plan (which should support phone calls)

Is this a known limitation, or am I missing something in the configuration? Any help would be greatly appreciated!`,
      category: 'Help & Support',
      tags: ['phone-reminders', 'technical', 'international'],
      stats: { views: 421, likes: 8 },
      timeAgo: '4 hours ago',
      solved: true,
    }
  };
  return posts[id] || null;
};

export default function CommunityPostPage() {
  const params = useParams();
  const router = useRouter();
  const [replyText, setReplyText] = useState('');
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const post = getPostData(params.id as string);

  // Get related posts (random selection excluding current post)
  const getRelatedPosts = (): Array<Omit<Post, 'content'> & { content?: string }> => {
    const related = allPosts
      .filter(p => p.id !== params.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    return related;
  };

  const relatedPosts = getRelatedPosts();

  const handleShare = async () => {
    const url = window.location.href;
    const title = post?.title || 'Community Discussion';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this discussion: ${title}`,
          url: url,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Post not found</h1>
          <Link href="/community" className="text-teal-600 hover:text-teal-700">
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const handleReply = () => {
    if (replyText.trim()) {
      // In production, this would send to API
      console.log('Reply:', replyText);
      setReplyText('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Card */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 mb-6">
          {/* Author Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Image
                  src={post.author.avatar}
                  alt={post.author.name}
                  width={56}
                  height={56}
                  className="rounded-full"
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900">{post.author.name}</h3>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold rounded-full">
                      {post.author.badge}
                    </span>
                    {post.solved && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle className="h-3 w-3" />
                        Solved
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{post.author.role}</p>
                </div>
              </div>
              <Link
                href="/community"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Community</span>
              </Link>
            </div>
          </div>

          {/* Post Content */}
          <div className="p-6">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full mb-4">
                {post.category}
              </span>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{post.title}</h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-6">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {post.timeAgo}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.stats.views.toLocaleString()} views
                </span>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-6">
              <div className="text-slate-700 leading-relaxed whitespace-pre-line">
                {post.content}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  liked
                    ? 'bg-red-50 text-red-600'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ThumbsUp className="h-5 w-5" />
                <span className="font-medium">{post.stats.likes + (liked ? 1 : 0)}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all ml-auto"
              >
                {shareCopied ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Related Discussions</h2>
            <div className="space-y-4">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/community/${relatedPost.id}`}
                  className="block p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors flex-1">
                      {relatedPost.title}
                    </h3>
                    {relatedPost.solved && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full flex-shrink-0 ml-2">
                        <CheckCircle className="h-3 w-3" />
                        Solved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {relatedPost.stats.views.toLocaleString()} views
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      {relatedPost.stats.likes} likes
                    </span>
                    <span>•</span>
                    <span>{relatedPost.timeAgo}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full">
                      {relatedPost.category}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

