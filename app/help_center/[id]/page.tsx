'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  BookOpen,
  Share2,
  Bookmark,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Calendar,
  Mail,
  MessageSquare,
  TrendingUp,
  Star,
  ThumbsUp,
  User,
  Check,
  Copy
} from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  views: string;
  content: string;
  author: string;
  publishedDate: string;
  lastUpdated: string;
  relatedArticles: string[];
}

// Mock data - in production, fetch from API
const getArticleData = (id: string): Article | null => {
  const articles: Record<string, Article> = {
    '1': {
      id: '1',
      title: 'Talking to your AI assistant: Natural conversation tips',
      category: 'Getting Started',
      readTime: '5 min read',
      views: '12.5k',
      author: 'MAI-PA Team',
      publishedDate: '2024-01-15',
      lastUpdated: '2024-01-20',
      content: `# Talking to Your AI Assistant: Natural Conversation Tips

Your AI companion is designed to understand you naturally - just like talking to a human assistant. Here's how to get the most out of your conversations.

## Start with Natural Language

Instead of using specific commands, try talking to your assistant the way you would talk to a real person:

**Instead of:** "Create calendar event"
**Try:** "I have a meeting with Sarah tomorrow at 2pm, can you add that to my calendar?"

**Instead of:** "Show tasks"
**Try:** "What do I need to get done today?"

## Be Specific About Context

Your assistant understands context, but being specific helps:

- **Time references:** "Next Tuesday" is clearer than "Tuesday"
- **Priorities:** "This is urgent" helps your assistant prioritize
- **Details:** "Meeting with the design team about the new website" is better than just "meeting"

## Use Proactive Language

Let your assistant be proactive:

- "Watch my email for flight confirmations and add them automatically"
- "If you see any scheduling conflicts, let me know"
- "Remind me to prepare for important meetings the day before"

## Morning Briefings

Set up morning briefings by saying:

"Call me every morning at 8am with a briefing of my day"

Your assistant will then call you with:
- Your schedule for the day
- Weather updates
- Important reminders
- Any conflicts or issues

## Email Intelligence

Your assistant can monitor your emails and extract important information:

- Flight bookings
- Hotel reservations
- Meeting invitations
- Deadlines and important dates

Just say: "Monitor my email and let me know about important items"

## Tips for Better Conversations

1. **Be conversational** - No need for formal commands
2. **Provide context** - The more context you give, the better your assistant can help
3. **Ask follow-up questions** - Your assistant remembers the conversation
4. **Use natural pauses** - Take your time, your assistant will wait
5. **Correct mistakes** - If your assistant misunderstands, just correct it naturally

## Common Phrases That Work Well

- "What's on my schedule today?"
- "Do I have time for a workout between meetings?"
- "Remind me to call John next week"
- "What's the weather like for my trip to New York?"
- "Find a time next week when both Sarah and I are free"

## Advanced Tips

### Delegation
"Handle all my meeting scheduling for next week"

### Proactive Suggestions
"If you see any gaps in my schedule, suggest times for deep work"

### Pattern Recognition
Your assistant learns your patterns over time. The more you use it, the better it gets at anticipating your needs.

## Troubleshooting

**If your assistant doesn't understand:**
- Rephrase your request
- Be more specific
- Break complex requests into smaller parts

**If you want to change something:**
- Just say "Actually, make that 3pm instead"
- Or "Cancel that reminder"

## Next Steps

Now that you know how to talk to your assistant, try:
1. Setting up your first morning briefing
2. Connecting your calendar
3. Enabling email intelligence
4. Creating your first natural conversation

Remember: Your assistant is designed to understand you naturally. Just talk to it like you would talk to a helpful colleague!`,
      relatedArticles: ['2', '3']
    },
    '2': {
      id: '2',
      title: 'How your assistant uses Google Calendar to help you',
      category: 'Assistant Tools',
      readTime: '3 min read',
      views: '10.2k',
      author: 'MAI-PA Team',
      publishedDate: '2024-01-10',
      lastUpdated: '2024-01-18',
      content: `# How Your Assistant Uses Google Calendar

Your AI assistant seamlessly integrates with Google Calendar to help manage your schedule.

## Connecting Your Calendar

1. Go to Settings > Integrations
2. Click "Connect Google Calendar"
3. Authorize access
4. Your assistant can now read and create events

## What Your Assistant Can Do

### Read Your Schedule
- View all your events
- Check for conflicts
- Identify free time
- Understand your availability patterns

### Create Events
Just tell your assistant:
- "Schedule a meeting with John tomorrow at 2pm"
- "Add a reminder for my dentist appointment next Friday"
- "Block out 2 hours for deep work this afternoon"

### Manage Events
- Reschedule: "Move my 3pm meeting to 4pm"
- Cancel: "Cancel my meeting with Sarah"
- Update: "Change the location to the conference room"

## Smart Features

### Conflict Detection
Your assistant automatically detects scheduling conflicts and suggests alternatives.

### Time Suggestions
"Find a time when both Sarah and I are free" - Your assistant checks both calendars.

### Recurring Events
"Set up a weekly team meeting every Monday at 10am"

## Privacy & Security

- Your assistant only accesses calendars you explicitly connect
- All data is encrypted in transit and at rest
- You can revoke access at any time
- Your assistant never shares your calendar with third parties

## Best Practices

1. Keep your calendar up to date
2. Use clear event titles
3. Add location information when relevant
4. Set up recurring events for regular meetings

Your assistant makes calendar management effortless!`,
      relatedArticles: ['1', '3']
    },
    '3': {
      id: '3',
      title: 'Morning briefings: Getting daily updates from your assistant',
      category: 'Getting Started',
      readTime: '4 min read',
      views: '9.8k',
      author: 'MAI-PA Team',
      publishedDate: '2024-01-12',
      lastUpdated: '2024-01-19',
      content: `# Morning Briefings: Daily Updates from Your Assistant

Start each day with a personalized briefing call from your AI assistant.

## What Are Morning Briefings?

Morning briefings are personalized phone calls from your assistant that give you:
- Your schedule for the day
- Weather updates
- Important reminders
- Priority tasks
- Any conflicts or issues

## Setting Up Morning Briefings

### Step 1: Enable Phone Calls
1. Go to Settings > Preferences
2. Enable "Phone Calls"
3. Verify your phone number

### Step 2: Schedule Your Briefing
Tell your assistant:
"Call me every morning at 8am with a briefing"

Or set it up in Settings:
- Choose your preferred time
- Select days of the week
- Customize briefing content

## What's Included

### Your Schedule
- All meetings and appointments
- Travel time between locations
- Important deadlines

### Weather
- Current conditions
- Forecast for the day
- Weather alerts

### Reminders
- Tasks due today
- Follow-ups needed
- Important deadlines

### Proactive Insights
- Schedule conflicts
- Travel delays
- Meeting preparation needed

## Customizing Your Briefing

You can customize what's included:
- Focus areas (work, personal, both)
- Level of detail
- Priority items only
- Include/exclude specific calendars

## During the Call

Your assistant will:
1. Greet you and confirm it's a good time
2. Walk through your schedule
3. Highlight important items
4. Ask if you need anything else
5. End with a positive note

## Interacting During Briefings

You can:
- Ask questions: "What's my first meeting?"
- Request changes: "Move my 2pm meeting to 3pm"
- Get more details: "Tell me more about the client meeting"
- Add items: "Remind me to call John today"

## Tips for Best Results

1. **Be consistent** - Same time each day works best
2. **Be available** - Answer when your assistant calls
3. **Provide feedback** - Tell your assistant what's helpful
4. **Adjust timing** - Find what works for your schedule

## Troubleshooting

**Not receiving calls?**
- Check phone number is correct
- Verify phone calls are enabled
- Check your plan includes phone features

**Call quality issues?**
- Ensure good phone signal
- Check your phone's call settings
- Try a different time

## Advanced Features

### Custom Briefings
"Give me a briefing focused on work items only"

### On-Demand Briefings
"Call me now with a briefing" - Get a briefing anytime

### Briefing Preferences
- Length of briefing
- Level of detail
- Topics to include/exclude

Start your day right with personalized morning briefings!`,
      relatedArticles: ['1', '4']
    }
  };
  return articles[id] || null;
};

export default function HelpArticlePage() {
  const params = useParams();
  const router = useRouter();
  const [helpful, setHelpful] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const article = getArticleData(params.id as string);

  const handleShare = async () => {
    const url = window.location.href;
    const title = article?.title || 'Help Article';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Check out this article: ${title}`,
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
  const allArticles = ['1', '2', '3', '4', '5', '6'];
  const currentIndex = allArticles.indexOf(params.id as string);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Article not found</h1>
          <Link href="/help_center" className="text-teal-600 hover:text-teal-700">
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 mb-6 relative">
          {/* Top right Back to Help Center link */}
          <div className="absolute top-6 right-8">
            <Link
              href="/help_center"
              className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Help Center</span>
            </Link>
          </div>
          <div className="mb-6">
            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-full mb-4">
              {article.category}
            </span>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">{article.title}</h1>
            <div className="flex items-center gap-6 text-sm text-slate-600 mb-6">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                {article.views} views
              </span>
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {article.author}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
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
            <button
              onClick={() => setHelpful(!helpful)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ml-auto ${
                helpful
                  ? 'bg-green-50 text-green-600'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              <span>Helpful</span>
            </button>
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-8 mb-6">
          <div className="prose prose-slate max-w-none">
            <div className="text-slate-700 leading-relaxed whitespace-pre-line">
              {article.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="text-3xl font-bold text-slate-900 mt-8 mb-4">{line.substring(2)}</h1>;
                } else if (line.startsWith('## ')) {
                  return <h2 key={index} className="text-2xl font-bold text-slate-900 mt-6 mb-3">{line.substring(3)}</h2>;
                } else if (line.startsWith('### ')) {
                  return <h3 key={index} className="text-xl font-bold text-slate-900 mt-4 mb-2">{line.substring(4)}</h3>;
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={index} className="font-semibold text-slate-900 my-2">{line.replace(/\*\*/g, '')}</p>;
                } else if (line.startsWith('- ')) {
                  return <li key={index} className="ml-4 list-disc my-1">{line.substring(2)}</li>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="my-4">{line}</p>;
                }
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {prevArticle && (
            <Link
              href={`/help_center/${prevArticle}`}
              className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6 hover:border-teal-300 transition-all group"
            >
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                <ChevronLeft className="h-4 w-4" />
                <span>Previous Article</span>
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                {getArticleData(prevArticle)?.title}
              </h3>
            </Link>
          )}
          {nextArticle && (
            <Link
              href={`/help_center/${nextArticle}`}
              className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6 hover:border-teal-300 transition-all group text-right md:text-left md:ml-auto"
            >
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 justify-end md:justify-start">
                <span>Next Article</span>
                <ChevronRight className="h-4 w-4" />
              </div>
              <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                {getArticleData(nextArticle)?.title}
              </h3>
            </Link>
          )}
        </div>

        {/* Related Articles */}
        {article.relatedArticles.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border-2 border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              Related Articles
            </h2>
            <div className="space-y-3">
              {article.relatedArticles.map((relatedId) => {
                const related = getArticleData(relatedId);
                if (!related) return null;
                return (
                  <Link
                    key={relatedId}
                    href={`/help_center/${relatedId}`}
                    className="block p-4 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded-full mb-2">
                          {related.category}
                        </span>
                        <h3 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors mb-1">
                          {related.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span>{related.readTime}</span>
                          <span>•</span>
                          <span>{related.views} views</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-teal-600 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl border-2 border-teal-200 p-6 mt-6">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Still need help?</h3>
          <p className="text-slate-600 mb-4">
            If this article didn't answer your question, our support team is here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </Link>
            <Link
              href="/community"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200"
            >
              <MessageSquare className="h-4 w-4" />
              Ask Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

