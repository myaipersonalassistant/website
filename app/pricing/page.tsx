'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  User,
  Briefcase,
  Crown,
  Users,
  Zap,
  Shield,
  Clock,
  ArrowRight,
  Star,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react';


const PricingPage = () => {
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  useEffect(() => {
    const plan = searchParams.get('plan');
    if (plan) {
      setSelectedPlan(plan);
      setTimeout(() => {
        const element = document.getElementById(`plan-${plan}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [searchParams]);

  const plans = [
    {
      id: 'student',
      name: 'Student',
      icon: <User className="h-8 w-8" />,
      tagline: 'Perfect for students managing their academic life',
      monthlyPrice: 4.99,
      annualPrice: 49.99,
      color: 'from-teal-500 to-cyan-600',
      popular: false,
      features: [
        'Your AI companion - talk naturally',
        'Up to 50 events per month',
        'Tell your assistant to manage tasks',
        'Assistant monitors 1 email account',
        'Built-in calendar (assistant uses)',
        'Google Calendar (assistant uses)',
        'Basic usage insights',
        'Mobile app - talk to assistant anywhere',
        'Email support',
        '15-day free trial'
      ],
      limitations: [
        'No morning briefing calls',
        'Limited to 1 email account',
        'Basic conversations'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: <Briefcase className="h-8 w-8" />,
      tagline: 'Ideal for busy professionals',
      monthlyPrice: 14.99,
      annualPrice: 149.99,
      color: 'from-cyan-500 to-blue-600',
      popular: true,
      features: [
        'Everything in Student, plus:',
        'Unlimited events',
        'Morning briefings & phone reminders',
        'Assistant monitors 3 email accounts',
        'Deep, contextual conversations',
        'Priority sync for assistant\'s tools',
        'Advanced insights & analytics',
        'Natural reminder preferences',
        'Assistant schedules meetings for you',
        'Priority support',
        '15-day free trial'
      ],
      limitations: []
    },
    {
      id: 'executive',
      name: 'Executive',
      icon: <Crown className="h-8 w-8" />,
      tagline: 'For executives who demand the best',
      monthlyPrice: 29.99,
      annualPrice: 299.99,
      color: 'from-teal-500 to-cyan-600',
      popular: false,
      features: [
        'Everything in Professional, plus:',
        'Assistant monitors unlimited emails',
        'Assistant takes meeting notes',
        'Daily morning briefing calls',
        'Assistant suggests delegations',
        'VIP priority phone calls',
        'Assistant handles multiple timezones',
        'Assistant learns your unique style',
        'White-glove onboarding',
        '24/7 priority support',
        'API access',
        '15-day free trial'
      ],
      limitations: []
    },
    {
      id: 'team',
      name: 'Team',
      icon: <Users className="h-8 w-8" />,
      tagline: 'Built for teams that work together',
      monthlyPrice: 49.99,
      annualPrice: 499.99,
      color: 'from-emerald-500 to-teal-600',
      popular: false,
      features: [
        'Everything in Executive, plus:',
        'Up to 10 team members',
        'Assistants share team calendar',
        'Team collaboration via assistants',
        'Centralized admin dashboard',
        'Team analytics & insights',
        'Bulk calendar management',
        'Assistants coordinate team meetings',
        'Custom integrations',
        'Dedicated account manager',
        'Custom SLA',
        '15-day free trial'
      ],
      limitations: [],
      perUser: true
    }
  ];

  const getPrice = (plan: typeof plans[0]) => {
    const price = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
    return billingCycle === 'annual' ? (price / 12).toFixed(2) : price.toFixed(2);
  };

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyCost = plan.monthlyPrice * 12;
    const annualCost = plan.annualPrice;
    const savings = ((monthlyCost - annualCost) / monthlyCost * 100).toFixed(0);
    return savings;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-100 to-cyan-100 border border-teal-200 rounded-full text-sm font-medium mb-6 text-teal-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              Choose Your <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">AI Companion</span> Plan
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Get your personal AI companion that talks with you naturally and manages your life using calendar, tasks, emails, and more. All plans include a 15-day free trial.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-slate-900' : 'text-slate-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
                className="relative w-16 h-8 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full transition-all duration-300 shadow-lg"
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${billingCycle === 'annual' ? 'translate-x-8' : ''}`} />
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-slate-900' : 'text-slate-500'}`}>
                Annual
              </span>
              {billingCycle === 'annual' && (
                <span className="ml-2 inline-flex items-center px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs font-bold rounded-full animate-pulse">
                  <Star className="h-3 w-3 mr-1" />
                  Save up to 17%
                </span>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-teal-600" />
                <span className="font-medium">Secure Payment</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-teal-600" />
                <span className="font-medium">15-Day Free Trial</span>
              </div>
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-2 text-teal-600" />
                <span className="font-medium">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-20 left-10 opacity-10">
          <MessageSquare className="h-24 w-24 text-teal-600 animate-pulse" />
        </div>
        <div className="absolute bottom-20 right-10 opacity-10">
          <Calendar className="h-20 w-20 text-cyan-500 animate-bounce" />
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                id={`plan-${plan.id}`}
                className={`relative bg-white rounded-3xl border-2 transition-all duration-500 transform hover:-translate-y-2 ${
                  selectedPlan === plan.id
                    ? 'border-teal-500 shadow-2xl shadow-teal-200 scale-105'
                    : plan.popular
                    ? 'border-cyan-300 shadow-xl'
                    : 'border-slate-200 shadow-lg hover:shadow-2xl'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                      <Star className="h-4 w-4 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Selected Badge */}
                {selectedPlan === plan.id && (
                  <div className="absolute -top-4 right-4">
                    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white p-2 rounded-full shadow-lg animate-bounce">
                      <Check className="h-5 w-5" />
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`bg-gradient-to-br ${plan.color} text-white p-4 rounded-2xl w-fit mb-6 shadow-lg`}>
                    {plan.icon}
                  </div>

                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-600 mb-6 min-h-[40px]">{plan.tagline}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-slate-900">${getPrice(plan)}</span>
                      <span className="text-slate-600">
                        /mo{plan.perUser && '/user'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && (
                      <div className="mt-2">
                        <span className="text-sm text-slate-500 line-through">${plan.monthlyPrice}/mo</span>
                        <span className="ml-2 text-sm font-semibold text-green-600">
                          Save {getSavings(plan)}%
                        </span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">
                      {billingCycle === 'annual' ? `Billed annually at $${plan.annualPrice}` : 'Billed monthly'}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={`/pricing/${plan.id}`}
                    className={`block w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 transform hover:-translate-y-1 mb-6 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-xl hover:shadow-orange-300'
                        : 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white hover:shadow-xl hover:shadow-teal-300'
                    }`}
                  >
                    Start Free Trial
                  </Link>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`bg-gradient-to-br ${plan.color} p-1 rounded-full mt-0.5`}>
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className={`text-sm ${feature.includes('Everything in') ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Compare <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-slate-600">See what's included in each plan</p>
          </div>

          {/* Mobile-friendly comparison */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-3xl shadow-xl overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="px-6 py-4 text-center font-semibold">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {[
                  { name: 'Your AI Companion', values: [true, true, true, true] },
                  { name: 'Events per month', values: ['50', 'Unlimited', 'Unlimited', 'Unlimited'] },
                  { name: 'Email accounts monitored', values: ['1', '3', 'Unlimited', 'Unlimited'] },
                  { name: 'Morning briefings & calls', values: [false, true, true, true] },
                  { name: 'Advanced conversations', values: [false, true, true, true] },
                  { name: 'Team features', values: [false, false, false, true] },
                  { name: 'API access', values: [false, false, true, true] },
                  { name: 'Priority support', values: [false, true, true, true] },
                  { name: '24/7 support', values: [false, false, true, true] }
                ].map((feature, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{feature.name}</td>
                    {feature.values.map((value, vidx) => (
                      <td key={vidx} className="px-6 py-4 text-center">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <Check className="h-5 w-5 text-green-600 mx-auto" />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )
                        ) : (
                          <span className="text-slate-700 font-medium">{value}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;