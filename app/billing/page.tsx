'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Calendar,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  User,
  Briefcase,
  Crown,
  Users,
  RefreshCw,
  X,
  Check,
  Shield,
  FileText
} from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DashboardSidebar from '@/app/components/DashboardSidebar';

interface Subscription {
  planId: string;
  planName: string;
  status: 'active' | 'trialing' | 'past_due' | 'canceled';
  billingCycle: 'monthly' | 'annual';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  currency: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  planName: string;
  downloadUrl?: string;
}

const planIcons: Record<string, React.ReactNode> = {
  student: <User className="h-5 w-5" />,
  professional: <Briefcase className="h-5 w-5" />,
  executive: <Crown className="h-5 w-5" />,
  team: <Users className="h-5 w-5" />
};

const planColors: Record<string, string> = {
  student: 'from-teal-500 to-cyan-600',
  professional: 'from-cyan-500 to-blue-600',
  executive: 'from-teal-500 to-cyan-600',
  team: 'from-emerald-500 to-teal-600'
};

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'billing-history'>('overview');

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      fetchUserData();
      fetchBillingData();
    }
  }, [user, authLoading]);

  const fetchUserData = async () => {
    if (!user) return;
    try {
      const userDoc = await getDoc(doc(getDb(), 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.fullName || userData.onboardingData?.userName || user.displayName || 'User');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual Firebase queries later
      const mockSubscription: Subscription = {
        planId: 'professional',
        planName: 'Professional',
        status: 'active',
        billingCycle: 'monthly',
        currentPeriodStart: new Date(Date.now() - 15 * 86400000).toISOString(),
        currentPeriodEnd: new Date(Date.now() + 15 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
        amount: 14.99,
        currency: 'USD'
      };

      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'pm1',
          type: 'card',
          last4: '4242',
          brand: 'Visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        }
      ];

      const mockInvoices: Invoice[] = [
        {
          id: 'inv1',
          date: new Date(Date.now() - 15 * 86400000).toISOString(),
          amount: 14.99,
          status: 'paid',
          planName: 'Professional',
          downloadUrl: '#'
        },
        {
          id: 'inv2',
          date: new Date(Date.now() - 45 * 86400000).toISOString(),
          amount: 14.99,
          status: 'paid',
          planName: 'Professional',
          downloadUrl: '#'
        },
        {
          id: 'inv3',
          date: new Date(Date.now() - 75 * 86400000).toISOString(),
          amount: 14.99,
          status: 'paid',
          planName: 'Professional',
          downloadUrl: '#'
        }
      ];

      setSubscription(mockSubscription);
      setPaymentMethods(mockPaymentMethods);
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
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

  const getInvoiceStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'pending':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-xs text-slate-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex">
      {/* Dashboard Sidebar */}
      <DashboardSidebar userName={userName} userEmail={user?.email || undefined} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-cyan-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Billing & Subscription</h1>
                  <p className="text-xs sm:text-sm text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Manage your subscription and payments
                  </p>
                </div>
              </div>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="text-xs sm:text-sm">Change Plan</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('payment-methods')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'payment-methods'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Payment Methods
              </button>
              <button
                onClick={() => setActiveTab('billing-history')}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === 'billing-history'
                    ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Billing History
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Current Subscription */}
                {subscription ? (
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Current Subscription</h2>
                        <p className="text-xs text-slate-600">Your active plan and billing details</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border capitalize ${getStatusColor(subscription.status)}`}>
                        {subscription.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="p-5 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2.5 bg-gradient-to-br ${planColors[subscription.planId]} rounded-xl text-white`}>
                            {planIcons[subscription.planId]}
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{subscription.planName}</h3>
                            <p className="text-xs text-slate-600">
                              {subscription.billingCycle === 'monthly' ? 'Monthly billing' : 'Annual billing'}
                            </p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-slate-900 mb-1">
                            {formatCurrency(subscription.amount, subscription.currency)}
                            <span className="text-sm font-normal text-slate-600">/{subscription.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                          </div>
                          {subscription.billingCycle === 'annual' && (
                            <p className="text-xs text-emerald-600 font-medium">
                              Save 17% compared to monthly billing
                            </p>
                          )}
                        </div>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-teal-300 text-teal-700 rounded-xl hover:bg-teal-50 transition-all text-xs font-semibold"
                        >
                          Change Plan
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-600">Current Period</span>
                            <Calendar className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-900 font-medium">
                            {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-600">Next Billing Date</span>
                            <Clock className="h-4 w-4 text-slate-400" />
                          </div>
                          <p className="text-sm text-slate-900 font-medium">
                            {formatDate(subscription.currentPeriodEnd)}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatCurrency(subscription.amount, subscription.currency)} will be charged
                          </p>
                        </div>
                        {subscription.cancelAtPeriodEnd && (
                          <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <span className="text-xs font-semibold text-orange-700">Subscription Canceling</span>
                            </div>
                            <p className="text-xs text-orange-600">
                              Your subscription will end on {formatDate(subscription.currentPeriodEnd)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center shadow-sm">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                      <CreditCard className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">No Active Subscription</h3>
                    <p className="text-xs text-slate-600 mb-4">Get started with a plan that fits your needs</p>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      View Plans
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}

                {/* Upcoming Invoice */}
                {subscription && (
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Upcoming Invoice</h2>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{subscription.planName} Plan</p>
                          <p className="text-xs text-slate-500">Due on {formatDate(subscription.currentPeriodEnd)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-slate-900">
                            {formatCurrency(subscription.amount, subscription.currency)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {subscription.billingCycle === 'monthly' ? 'Per month' : 'Per year'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Payment Methods Tab */}
            {activeTab === 'payment-methods' && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Payment Methods</h2>
                    <p className="text-xs text-slate-600">Manage your payment methods</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </button>
                </div>

                {paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-teal-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl border border-slate-200">
                              <CreditCard className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-slate-900">
                                  {method.brand} •••• {method.last4}
                                </p>
                                {method.isDefault && (
                                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-lg text-[11px] font-semibold border border-teal-200">
                                    Default
                                  </span>
                                )}
                              </div>
                              {method.expiryMonth && method.expiryYear && (
                                <p className="text-xs text-slate-500">
                                  Expires {method.expiryMonth}/{method.expiryYear}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!method.isDefault && (
                              <button
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Set as default"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                      <CreditCard className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">No Payment Methods</h3>
                    <p className="text-xs text-slate-600 mb-4">Add a payment method to continue your subscription</p>
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg active:scale-95">
                      <Plus className="h-4 w-4" />
                      Add Payment Method
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Billing History Tab */}
            {activeTab === 'billing-history' && (
              <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Billing History</h2>
                    <p className="text-xs text-slate-600">View and download your invoices</p>
                  </div>
                </div>

                {invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-teal-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white rounded-xl border border-slate-200">
                              <FileText className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-slate-900">{invoice.planName} Plan</p>
                                <span className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold border capitalize ${getInvoiceStatusColor(invoice.status)}`}>
                                  {invoice.status}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500">{formatDate(invoice.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-bold text-slate-900">{formatCurrency(invoice.amount)}</p>
                            </div>
                            {invoice.downloadUrl && (
                              <button
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                                title="Download invoice"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-teal-100">
                      <FileText className="h-8 w-8 text-teal-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">No Billing History</h3>
                    <p className="text-xs text-slate-600">Your invoices will appear here once you have an active subscription</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

