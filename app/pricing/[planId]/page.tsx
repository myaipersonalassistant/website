'use client';

import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  X,
  Star,
  Zap,
  Shield,
  Clock,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  Sparkles,
  Crown,
  GraduationCap,
  Briefcase,
  Target,
  BarChart3,
  MessageSquare,
  BookOpen,
  Video,
  FileText,
  Globe,
  Headphones,
  Award,
  Rocket,
  Heart,
  Coffee
} from 'lucide-react';

interface PlanFeature {
  name: string;
  included: boolean;
  description?: string;
}

interface Testimonial {
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}

interface UseCase {
  title: string;
  description: string;
  icon: any;
}

interface PlanData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: any;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature[];
  useCases: UseCase[];
  testimonials: Testimonial[];
  idealFor: string[];
  highlight: string;
}

const PlanDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const planId = params.planId as string;
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeTab, setActiveTab] = useState<'features' | 'usecases' | 'testimonials'>('features');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [planId]);

  const plansData: Record<string, PlanData> = {
    student: {
      id: 'student',
      name: 'Student Plan',
      tagline: 'Master Your Academic Life',
      description: 'Your personal AI companion designed for students. Talk to it naturally about your classes, assignments, and deadlines. Your assistant uses calendar and task tools to keep you organized and help you succeed in your academic journey.',
      icon: GraduationCap,
      color: 'teal',
      gradientFrom: 'from-teal-500',
      gradientTo: 'to-cyan-600',
      monthlyPrice: 4.99,
      annualPrice: 49.99,
      features: [
        { name: 'Your AI companion', included: true, description: 'Talk naturally 24/7' },
        { name: 'Up to 50 events per month', included: true, description: 'Perfect for classes and assignments' },
        { name: 'Tell assistant to manage tasks', included: true, description: 'Never miss a deadline' },
        { name: 'Assistant monitors 1 email', included: true, description: 'Extracts important info' },
        { name: 'Built-in calendar', included: true, description: 'Assistant uses to schedule' },
        { name: 'Google Calendar', included: true, description: 'Assistant can use it' },
        { name: 'Basic usage insights', included: true, description: 'Track your progress' },
        { name: 'Mobile app access', included: true, description: 'Talk on the go' },
        { name: 'Email support', included: true, description: 'Quick response to queries' },
        { name: 'Morning briefing calls', included: false },
        { name: 'Multiple email accounts', included: false },
        { name: 'Advanced conversations', included: false },
      ],
      useCases: [
        {
          title: 'Assignment Tracking',
          description: 'Tell your assistant "Add my biology paper due next Friday" and it handles the rest. Get smart reminders before deadlines.',
          icon: BookOpen
        },
        {
          title: 'Class Schedule Management',
          description: 'Your assistant organizes your class schedule, office hours, and study sessions. Just talk to it naturally.',
          icon: Calendar
        },
        {
          title: 'Study Session Planning',
          description: 'Ask "When should I study for calculus?" Your assistant suggests optimal times based on your energy and course difficulty.',
          icon: Coffee
        },
        {
          title: 'Exam Preparation',
          description: 'Say "I have a midterm in two weeks" and your assistant creates a study plan with countdown reminders.',
          icon: Target
        }
      ],
      testimonials: [
        {
          name: 'Sarah Chen',
          role: 'Computer Science Student, MIT',
          image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: "Talking to my AI companion transformed how I manage coursework. I went from missing deadlines to staying ahead. It's like having a personal academic coach I can talk to anytime!",
          rating: 5
        },
        {
          name: 'Marcus Johnson',
          role: 'Business Student, NYU',
          image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'My assistant understands my schedule through our conversations and helps me balance studying with my part-time job. Best investment for my academic success.',
          rating: 5
        },
        {
          name: 'Emily Rodriguez',
          role: 'Medical Student, Stanford',
          image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'With a demanding schedule, my AI companion keeps me organized and reduces stress. I just talk to it naturally - it handles all the calendar details.',
          rating: 5
        }
      ],
      idealFor: [
        'High school and college students',
        'Graduate students managing research',
        'Students balancing work and study',
        'Anyone new to digital organization'
      ],
      highlight: 'Perfect for students on a budget who need powerful organization tools'
    },
    professional: {
      id: 'professional',
      name: 'Professional Plan',
      tagline: 'Supercharge Your Productivity',
      description: 'Your AI companion for busy professionals. Talk naturally about your work, meetings, and priorities. Your assistant uses advanced tools to manage everything, calls you with morning briefings, and proactively helps you stay on top of complex workflows.',
      icon: Briefcase,
      color: 'blue',
      gradientFrom: 'from-cyan-500',
      gradientTo: 'to-blue-600',
      monthlyPrice: 14.99,
      annualPrice: 149.99,
      features: [
        { name: 'Everything in Student Plan', included: true },
        { name: 'Unlimited events', included: true, description: 'No limits' },
        { name: 'Morning briefings & phone calls', included: true, description: 'Assistant calls you' },
        { name: 'Assistant monitors 3 emails', included: true, description: 'Personal + work emails' },
        { name: 'Deep contextual conversations', included: true, description: 'Understands nuance' },
        { name: 'Priority tool sync', included: true, description: 'Real-time updates' },
        { name: 'Advanced insights', included: true, description: 'Deep analytics' },
        { name: 'Natural preferences', included: true, description: 'Tell assistant what you want' },
        { name: 'Assistant schedules meetings', included: true, description: 'Finds optimal times' },
        { name: 'Priority support', included: true, description: 'Faster response times' },
        { name: 'Unlimited email accounts', included: false },
        { name: 'Executive features', included: false },
      ],
      useCases: [
        {
          title: 'Meeting Coordination',
          description: 'Tell your assistant "Schedule a meeting with the team next week" and it finds the best time, sends invites, everything.',
          icon: Users
        },
        {
          title: 'Multi-Project Management',
          description: 'Your assistant tracks multiple projects. Ask "What should I focus on today?" and get intelligent prioritization.',
          icon: Target
        },
        {
          title: 'Email Intelligence',
          description: 'Your assistant monitors emails and proactively suggests "I found a flight booking - shall I add it to your calendar?"',
          icon: Mail
        },
        {
          title: 'Work-Life Balance',
          description: 'Your assistant maintains boundaries. Say "No work events after 6pm" and it enforces your preferences.',
          icon: Heart
        }
      ],
      testimonials: [
        {
          name: 'David Park',
          role: 'Marketing Manager, Google',
          image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'Morning briefing calls are a game-changer. My assistant calls me each morning with my schedule and priorities. I never miss meetings and I\'m always prepared.',
          rating: 5
        },
        {
          name: 'Lisa Anderson',
          role: 'Sales Director, Salesforce',
          image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'My assistant monitors three email accounts and tells me what matters. I just talk to it - no manual organizing. My productivity has doubled.',
          rating: 5
        },
        {
          name: 'James Wilson',
          role: 'Product Manager, Microsoft',
          image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'Just saying "Schedule time with the client team" and having my assistant handle it is worth the price. Saves me hours every week.',
          rating: 5
        }
      ],
      idealFor: [
        'Mid-level professionals and managers',
        'Consultants managing multiple clients',
        'Sales professionals with busy schedules',
        'Anyone managing complex workflows'
      ],
      highlight: 'Most popular choice for working professionals seeking AI-powered productivity'
    },
    executive: {
      id: 'executive',
      name: 'Executive Plan',
      tagline: 'Lead with Intelligence',
      description: 'Your premium AI companion for executives. Daily morning briefing calls, unlimited monitoring, proactive delegation suggestions, and an assistant that learns your unique leadership style. White-glove service to help you lead with intelligence.',
      icon: Crown,
      color: 'teal',
      gradientFrom: 'from-teal-500',
      gradientTo: 'to-cyan-600',
      monthlyPrice: 29.99,
      annualPrice: 299.99,
      features: [
        { name: 'Everything in Professional Plan', included: true },
        { name: 'Assistant monitors unlimited emails', included: true, description: 'All accounts covered' },
        { name: 'Assistant takes meeting notes', included: true, description: 'Auto-generated summaries' },
        { name: 'Daily morning briefing calls', included: true, description: 'Assistant calls you' },
        { name: 'Delegation suggestions', included: true, description: 'Assistant helps delegate' },
        { name: 'VIP priority calls', included: true, description: 'Critical event calls' },
        { name: 'Multi-timezone handling', included: true, description: 'Assistant manages it' },
        { name: 'Assistant learns your style', included: true, description: 'Personalized over time' },
        { name: 'White-glove onboarding', included: true, description: 'Personal setup' },
        { name: '24/7 priority support', included: true, description: 'Always available' },
        { name: 'API access', included: true, description: 'Custom integrations' },
        { name: 'Custom SLA', included: true, description: 'Guaranteed uptime' },
      ],
      useCases: [
        {
          title: 'Morning Briefing Calls',
          description: 'Every morning, your assistant calls you with your schedule, priorities, weather, and key updates. No app checking required.',
          icon: FileText
        },
        {
          title: 'Strategic Planning',
          description: 'Your assistant analyzes patterns and suggests "You have 2 free hours Thursday morning - perfect for strategic planning."',
          icon: TrendingUp
        },
        {
          title: 'Global Team Management',
          description: 'Say "Schedule with the London and Tokyo teams" and your assistant handles all timezone complexity.',
          icon: Globe
        },
        {
          title: 'Decision Support',
          description: 'Your assistant provides context: "Your meeting with the CEO is in 30 minutes. Here\'s what you need to know..."',
          icon: Target
        }
      ],
      testimonials: [
        {
          name: 'Catherine Roberts',
          role: 'CEO, TechVentures',
          image: 'https://images.pexels.com/photos/1181424/pexels-photo-1181424.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'Morning briefing calls save me 2 hours daily. My assistant calls and tells me what matters while I\'m getting ready. It understands my priorities perfectly.',
          rating: 5
        },
        {
          name: 'Michael Chang',
          role: 'VP of Operations, Fortune 500',
          image: 'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'Managing a global team across 12 timezones is complex. My assistant handles it all. I just say who I need to meet, it figures out when. ROI is undeniable.',
          rating: 5
        },
        {
          name: 'Jennifer Martinez',
          role: 'Chief Strategy Officer, StartupHub',
          image: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'White-glove onboarding was exceptional. They trained my assistant to understand my unique style and preferences. It feels like a real executive assistant.',
          rating: 5
        }
      ],
      idealFor: [
        'C-level executives and senior leaders',
        'Entrepreneurs running multiple ventures',
        'VPs managing global teams',
        'High-net-worth individuals'
      ],
      highlight: 'Premium solution for executives who demand excellence and have complex needs'
    },
    team: {
      id: 'team',
      name: 'Team Plan',
      tagline: 'Collaborate with Intelligence',
      description: 'Team AI companions that work together seamlessly. Each team member gets their own assistant, and the assistants collaborate on shared calendars and team coordination. All executive features plus centralized management. Perfect for growing organizations.',
      icon: Users,
      color: 'emerald',
      gradientFrom: 'from-emerald-500',
      gradientTo: 'to-teal-600',
      monthlyPrice: 49.99,
      annualPrice: 499.99,
      features: [
        { name: 'Everything in Executive Plan', included: true },
        { name: 'Up to 10 team assistants', included: true, description: 'Each member gets one' },
        { name: 'Assistants share team calendar', included: true, description: 'Coordinated scheduling' },
        { name: 'Team collaboration via assistants', included: true, description: 'Work together seamlessly' },
        { name: 'Centralized admin dashboard', included: true, description: 'Manage all assistants' },
        { name: 'Team analytics & insights', included: true, description: 'Performance tracking' },
        { name: 'Bulk calendar management', included: true, description: 'Admin controls schedules' },
        { name: 'Assistants coordinate meetings', included: true, description: 'Find team availability' },
        { name: 'Custom integrations', included: true, description: 'Connect your tools' },
        { name: 'Dedicated account manager', included: true, description: 'Your success partner' },
        { name: 'Custom SLA', included: true, description: '99.9% uptime guarantee' },
        { name: 'Team training sessions', included: true, description: 'Train your team' },
      ],
      useCases: [
        {
          title: 'Team Coordination',
          description: 'Tell your assistant "Schedule a team standup" and the assistants coordinate to find time that works for all 10 members.',
          icon: Users
        },
        {
          title: 'Project Collaboration',
          description: 'Team members talk to their assistants about tasks. Assistants share information across the team automatically.',
          icon: Target
        },
        {
          title: 'Performance Analytics',
          description: 'Admin dashboard shows team productivity insights based on what assistants are managing for each member.',
          icon: BarChart3
        },
        {
          title: 'Resource Planning',
          description: 'Assistants optimize workload: "Sarah is overbooked Thursday. Should I suggest moving her meeting to Friday?"',
          icon: TrendingUp
        }
      ],
      testimonials: [
        {
          name: 'Robert Thompson',
          role: 'Director of Operations, AgencyPro',
          image: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'Our team of 8 is perfectly coordinated. Each person talks to their assistant, and the assistants handle all the team scheduling complexity. Game-changer.',
          rating: 5
        },
        {
          name: 'Amanda Foster',
          role: 'Head of Marketing, GrowthCo',
          image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'Our account manager trained all our assistants to work together perfectly. Team productivity is up 40% - everyone just talks naturally to their assistant.',
          rating: 5
        },
        {
          name: 'Carlos Mendoza',
          role: 'Founder, DesignStudio',
          image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
          content: 'Best investment for our growing team. Everyone has their own assistant. The assistants collaborate behind the scenes - we just talk naturally.',
          rating: 5
        }
      ],
      idealFor: [
        'Small to medium-sized teams (2-10 people)',
        'Startups with growing teams',
        'Departments within larger organizations',
        'Remote and hybrid teams'
      ],
      highlight: 'Complete team solution with collaboration tools and centralized management'
    }
  };

  const planData = planId ? plansData[planId] : null;

  if (!planData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Plan not found</h1>
          <Link
            href="/pricing"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            View all plans
          </Link>
        </div>
      </div>
    );
  }

  const Icon = planData.icon;
  const price = billingCycle === 'monthly' ? planData.monthlyPrice : (planData.annualPrice / 12).toFixed(2);
  const savings = ((planData.monthlyPrice * 12 - planData.annualPrice) / (planData.monthlyPrice * 12) * 100).toFixed(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className={`relative bg-gradient-to-br ${planData.gradientFrom} ${planData.gradientTo} text-white pt-12 pb-24 overflow-hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                  <Icon className="h-12 w-12 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-5xl lg:text-6xl font-bold mb-2">{planData.name}</h1>
                  <p className="text-2xl text-white/90">{planData.tagline}</p>
                </div>
              </div>

              <p className="text-xl text-white/90 leading-relaxed mb-8">
                {planData.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <div className="text-sm text-white/80">Starting at</div>
                  <div className="text-3xl font-bold">${price}/mo</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl">
                  <div className="text-sm text-white/80">Free trial</div>
                  <div className="text-2xl font-bold">15 Days</div>
                </div>
                {billingCycle === 'annual' && (
                  <div className="bg-white text-orange-600 px-4 py-2 rounded-full font-bold text-sm">
                    Save {savings}%
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="#signup"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-teal-600 rounded-xl font-bold text-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group"
                >
                  Start Free Trial
                  <Rocket className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Compare Plans
                </Link>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-6">What's Included</h3>
                  <div className="space-y-4">
                    {planData.features.slice(0, 6).map((feature, idx) => (
                      feature.included && (
                        <div key={idx} className="flex items-start">
                          <Check className="h-5 w-5 mr-3 mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-medium">{feature.name}</div>
                            {feature.description && (
                              <div className="text-sm text-white/70">{feature.description}</div>
                            )}
                          </div>
                        </div>
                      )
                    ))}
                    <div className="text-sm text-white/70 pt-4 border-t border-white/20">
                      + {planData.features.filter(f => f.included).length - 6} more features
                    </div>
                  </div>
                </div>
                <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-20 right-20 opacity-10">
          <Sparkles className="h-32 w-32 animate-pulse" />
        </div>
      </section>

      {/* Billing Toggle */}
      <section className="bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-16 h-8 bg-gradient-to-r ${planData.gradientFrom} ${planData.gradientTo} rounded-full transition-all duration-300 shadow-lg`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${billingCycle === 'annual' ? 'translate-x-8' : ''}`} />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <span className="ml-2 inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold rounded-full">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Save {savings}%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Ideal For */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Perfect For
            </h2>
            <p className="text-xl text-slate-600">{planData.highlight}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {planData.idealFor.map((item, idx) => (
              <div
                key={idx}
                className={`bg-gradient-to-br ${planData.gradientFrom} ${planData.gradientTo} text-white p-6 rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all duration-300`}
              >
                <Check className="h-6 w-6 mb-3" />
                <p className="font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-1 py-4">
            {[
              { id: 'features', label: 'All Features', icon: Zap },
              { id: 'usecases', label: 'Use Cases', icon: Target },
              { id: 'testimonials', label: 'Testimonials', icon: Star }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${planData.gradientFrom} ${planData.gradientTo} text-white shadow-lg`
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Features Tab */}
          {activeTab === 'features' && (
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
                Complete Feature List
              </h2>
              <p className="text-xl text-slate-600 text-center mb-12">
                Everything included in your {planData.name}
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {planData.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      feature.included
                        ? 'border-teal-200 bg-teal-50/50 hover:shadow-lg hover:border-teal-300'
                        : 'border-slate-200 bg-slate-50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-4 ${
                        feature.included
                          ? `bg-gradient-to-br ${planData.gradientFrom} ${planData.gradientTo}`
                          : 'bg-slate-300'
                      }`}>
                        {feature.included ? (
                          <Check className="h-5 w-5 text-white" />
                        ) : (
                          <X className="h-5 w-5 text-slate-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">{feature.name}</h3>
                        {feature.description && (
                          <p className="text-sm text-slate-600">{feature.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Use Cases Tab */}
          {activeTab === 'usecases' && (
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
                Real-World Use Cases
              </h2>
              <p className="text-xl text-slate-600 text-center mb-12">
                See how others use {planData.name}
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {planData.useCases.map((useCase, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-teal-200"
                  >
                    <div className={`bg-gradient-to-br ${planData.gradientFrom} ${planData.gradientTo} text-white p-4 rounded-2xl w-fit mb-6`}>
                      <useCase.icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">{useCase.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials Tab */}
          {activeTab === 'testimonials' && (
            <div>
              <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">
                What Our Users Say
              </h2>
              <p className="text-xl text-slate-600 text-center mb-12">
                Real stories from {planData.name} users
              </p>

              <div className="grid md:grid-cols-3 gap-8">
                {planData.testimonials.map((testimonial, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-8 border-2 border-slate-200 hover:border-teal-300 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-center mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center pt-6 border-t border-slate-200">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover mr-4"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{testimonial.name}</div>
                        <div className="text-sm text-slate-600">{testimonial.role}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className={`bg-gradient-to-br ${planData.gradientFrom} ${planData.gradientTo} text-white p-4 rounded-2xl w-fit mx-auto mb-4`}>
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Secure & Private</h3>
              <p className="text-sm text-slate-600">Enterprise-grade encryption</p>
            </div>
            <div>
              <div className={`bg-gradient-to-br ${planData.gradientFrom} ${planData.gradientTo} text-white p-4 rounded-2xl w-fit mx-auto mb-4`}>
                <Clock className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">15-Day Trial</h3>
              <p className="text-sm text-slate-600">Full access, no credit card</p>
            </div>
            <div>
              <div className={`bg-gradient-to-br ${planData.gradientFrom} ${planData.gradientTo} text-white p-4 rounded-2xl w-fit mx-auto mb-4`}>
                <Headphones className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">24/7 Support</h3>
              <p className="text-sm text-slate-600">Always here to help</p>
            </div>
            <div>
              <div className={`bg-gradient-to-br ${planData.gradientFrom} ${planData.gradientTo} text-white p-4 rounded-2xl w-fit mx-auto mb-4`}>
                <Award className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Cancel Anytime</h3>
              <p className="text-sm text-slate-600">No long-term commitment</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlanDetailsPage;
