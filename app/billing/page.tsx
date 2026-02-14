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
import { doc, getDoc, collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
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
  const [loading, setLoading] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'billing-history'>('overview');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      return;
    }
    if (user) {
      fetchUserData();
      fetchBillingData();
    }
  }, [user, authLoading]);

  // Fetch data when tab changes
  useEffect(() => {
    if (!user) return;
    
    if (activeTab === 'payment-methods' && paymentMethods.length === 0 && !loadingPaymentMethods) {
      fetchPaymentMethods();
    }
    if (activeTab === 'billing-history' && invoices.length === 0 && !loadingInvoices) {
      fetchInvoices();
    }
  }, [activeTab, user]);

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

  const getPlanDetails = (planId: string) => {
    const plans: Record<string, { name: string; monthlyPrice: number; annualPrice: number }> = {
      student: { name: 'Student', monthlyPrice: 4.99, annualPrice: 49.99 },
      professional: { name: 'Professional', monthlyPrice: 14.99, annualPrice: 149.99 },
      executive: { name: 'Executive', monthlyPrice: 29.99, annualPrice: 299.99 },
      team: { name: 'Team', monthlyPrice: 49.99, annualPrice: 499.99 }
    };
    return plans[planId] || { name: 'Unknown', monthlyPrice: 0, annualPrice: 0 };
  };

  const fetchBillingData = async () => {
    if (!user) return;
    
    try {
      setLoadingSubscription(true);
      const db = getDb();
      
      // Fetch subscription
      let subscriptionData: Subscription | null = null;
      
      // Try to get subscription from users/{uid}/subscription subcollection first
      const subscriptionRef = doc(db, 'users', user.uid, 'subscription', 'current');
      const subscriptionDoc = await getDoc(subscriptionRef);
      
      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        const planId = data.planId || data.plan_id || 'student';
        const planDetails = getPlanDetails(planId);
        const billingCycle = data.billingCycle || data.billing_cycle || 'monthly';
        const amount = billingCycle === 'monthly' ? planDetails.monthlyPrice : planDetails.annualPrice / 12;
        
        // Handle Timestamps
        let currentPeriodStart = '';
        let currentPeriodEnd = '';
        
        if (data.currentPeriodStart) {
          const start = data.currentPeriodStart instanceof Timestamp 
            ? data.currentPeriodStart.toDate() 
            : new Date(data.currentPeriodStart);
          currentPeriodStart = start.toISOString();
        } else {
          // Default to 30 days ago if not set
          currentPeriodStart = new Date(Date.now() - 30 * 86400000).toISOString();
        }
        
        if (data.currentPeriodEnd) {
          const end = data.currentPeriodEnd instanceof Timestamp 
            ? data.currentPeriodEnd.toDate() 
            : new Date(data.currentPeriodEnd);
          currentPeriodEnd = end.toISOString();
        } else {
          // Default to 30 days from now if not set
          currentPeriodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
        }
        
        subscriptionData = {
          planId,
          planName: planDetails.name,
          status: data.status || 'active',
          billingCycle,
          currentPeriodStart,
          currentPeriodEnd,
          cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
          amount,
          currency: data.currency || 'USD'
        };
      } else {
        // Fallback: Check if subscription is stored directly in user document
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.subscription) {
            const subData = userData.subscription;
            const planId = subData.planId || subData.plan_id || 'student';
            const planDetails = getPlanDetails(planId);
            const billingCycle = subData.billingCycle || subData.billing_cycle || 'monthly';
            const amount = billingCycle === 'monthly' ? planDetails.monthlyPrice : planDetails.annualPrice / 12;
            
            let currentPeriodStart = '';
            let currentPeriodEnd = '';
            
            if (subData.currentPeriodStart) {
              const start = subData.currentPeriodStart instanceof Timestamp 
                ? subData.currentPeriodStart.toDate() 
                : new Date(subData.currentPeriodStart);
              currentPeriodStart = start.toISOString();
            } else {
              currentPeriodStart = new Date(Date.now() - 30 * 86400000).toISOString();
            }
            
            if (subData.currentPeriodEnd) {
              const end = subData.currentPeriodEnd instanceof Timestamp 
                ? subData.currentPeriodEnd.toDate() 
                : new Date(subData.currentPeriodEnd);
              currentPeriodEnd = end.toISOString();
            } else {
              currentPeriodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
            }
            
            subscriptionData = {
              planId,
              planName: planDetails.name,
              status: subData.status || 'active',
              billingCycle,
              currentPeriodStart,
              currentPeriodEnd,
              cancelAtPeriodEnd: subData.cancelAtPeriodEnd || false,
              amount,
              currency: subData.currency || 'USD'
            };
          }
        }
      }
      
      setSubscription(subscriptionData);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscription(null);
    } finally {
      setLoadingSubscription(false);
    }
    
    // Fetch payment methods separately (only when needed)
    if (activeTab === 'payment-methods' || activeTab === 'overview') {
      fetchPaymentMethods();
    }
    
    // Fetch invoices separately (only when needed)
    if (activeTab === 'billing-history' || activeTab === 'overview') {
      fetchInvoices();
    }
  };

  const fetchPaymentMethods = async () => {
    if (!user) return;
    
    try {
      setLoadingPaymentMethods(true);
      const db = getDb();
      
      // Fetch payment methods from users/{uid}/payment_methods subcollection
      const paymentMethodsRef = collection(db, 'users', user.uid, 'payment_methods');
      // Use simple query (orderBy requires index, handle sorting client-side)
      const paymentMethodsQuery = query(paymentMethodsRef);
      
      const paymentMethodsSnapshot = await getDocs(paymentMethodsQuery);
      
      const methods: PaymentMethod[] = [];
      paymentMethodsSnapshot.forEach((doc) => {
        const data = doc.data();
        methods.push({
          id: doc.id,
          type: data.type || 'card',
          last4: data.last4 || '',
          brand: data.brand,
          expiryMonth: data.expiryMonth,
          expiryYear: data.expiryYear,
          isDefault: data.isDefault || false
        });
      });
      
      // Sort client-side if orderBy wasn't available
      methods.sort((a, b) => {
        if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
        return 0;
      });
      
      setPaymentMethods(methods);
    } catch (error: any) {
      console.error('Error fetching payment methods:', error);
      // If permission error, just set empty array
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setPaymentMethods([]);
      } else {
        setPaymentMethods([]);
      }
    } finally {
      setLoadingPaymentMethods(false);
    }
  };

  const fetchInvoices = async () => {
    if (!user) return;
    
    try {
      setLoadingInvoices(true);
      const db = getDb();
      
      // Fetch invoices from users/{uid}/invoices subcollection
      const invoicesRef = collection(db, 'users', user.uid, 'invoices');
      // Try with orderBy, fallback to simple query if index is missing
      let invoicesQuery;
      try {
        invoicesQuery = query(invoicesRef, orderBy('date', 'desc'));
      } catch {
        invoicesQuery = query(invoicesRef);
      }
      
      const invoicesSnapshot = await getDocs(invoicesQuery);
      
      const invoicesList: Invoice[] = [];
      invoicesSnapshot.forEach((doc) => {
        const data = doc.data();
        let date = '';
        
        if (data.date) {
          const dateObj = data.date instanceof Timestamp 
            ? data.date.toDate() 
            : new Date(data.date);
          date = dateObj.toISOString();
        } else {
          date = new Date().toISOString();
        }
        
        invoicesList.push({
          id: doc.id,
          date,
          amount: data.amount || 0,
          status: data.status || 'pending',
          planName: data.planName || subscription?.planName || 'Unknown',
          downloadUrl: data.downloadUrl
        });
      });
      
      // Sort client-side if orderBy wasn't available
      invoicesList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setInvoices(invoicesList);
    } catch (error: any) {
      console.error('Error fetching invoices:', error);
      // If permission error, just set empty array
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        setInvoices([]);
      } else {
        setInvoices([]);
      }
    } finally {
      setLoadingInvoices(false);
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
                  <h1 className="text-lg sm:text-xl font-bold text-white mb-1">Billing & Subscription</h1>
                  <p className="text-[11px] sm:text-xs text-teal-50 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Manage your subscription and payments
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={async () => {
                    setRefreshing(true);
                    await fetchBillingData();
                    if (activeTab === 'payment-methods') {
                      await fetchPaymentMethods();
                    }
                    if (activeTab === 'billing-history') {
                      await fetchInvoices();
                    }
                    setRefreshing(false);
                  }}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-[11px] sm:text-xs hidden sm:inline">Refresh</span>
                </button>
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-teal-50 text-teal-700 rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95 font-semibold"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span className="text-[11px] sm:text-xs">Change Plan</span>
                </Link>
              </div>
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
                {loadingSubscription ? (
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-3"></div>
                        <p className="text-[11px] text-slate-600">Loading subscription...</p>
                      </div>
                    </div>
                  </div>
                ) : subscription ? (
                  <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Current Subscription</h2>
                        <p className="text-[11px] text-slate-600">Your active plan and billing details</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[11px] font-semibold border capitalize ${getStatusColor(subscription.status)}`}>
                        {subscription.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="p-4 sm:p-5 bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${planColors[subscription.planId]} rounded-xl text-white flex-shrink-0`}>
                            {planIcons[subscription.planId]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-bold text-slate-900 truncate">{subscription.planName}</h3>
                            <p className="text-[11px] text-slate-600">
                              {subscription.billingCycle === 'monthly' ? 'Monthly billing' : 'Annual billing'}
                            </p>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="text-lg sm:text-xl font-bold text-slate-900 mb-1">
                            {formatCurrency(subscription.amount, subscription.currency)}
                            <span className="text-xs font-normal text-slate-600">/{subscription.billingCycle === 'monthly' ? 'month' : 'year'}</span>
                          </div>
                          {subscription.billingCycle === 'annual' && (
                            <p className="text-[11px] text-emerald-600 font-medium">
                              Save 17% compared to monthly billing
                            </p>
                          )}
                        </div>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-teal-300 text-teal-700 rounded-xl hover:bg-teal-50 transition-all text-[11px] font-semibold w-full sm:w-auto"
                        >
                          Change Plan
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>

                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-600">Current Period</span>
                            <Calendar className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-900 font-medium break-words">
                            {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                          </p>
                        </div>
                        <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-slate-600">Next Billing Date</span>
                            <Clock className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-900 font-medium">
                            {formatDate(subscription.currentPeriodEnd)}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {formatCurrency(subscription.amount, subscription.currency)} will be charged
                          </p>
                        </div>
                        {subscription.cancelAtPeriodEnd && (
                          <div className="p-3 sm:p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                              <span className="text-[11px] font-semibold text-orange-700">Subscription Canceling</span>
                            </div>
                            <p className="text-[11px] text-orange-600">
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
                    <h3 className="text-sm font-bold text-slate-900 mb-2">No Active Subscription</h3>
                    <p className="text-[11px] text-slate-600 mb-4">Get started with a plan that fits your needs</p>
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
                    <h2 className="text-base font-bold text-slate-900 mb-4">Upcoming Invoice</h2>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{subscription.planName} Plan</p>
                          <p className="text-[11px] text-slate-500">Due on {formatDate(subscription.currentPeriodEnd)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-slate-900">
                            {formatCurrency(subscription.amount, subscription.currency)}
                          </p>
                          <p className="text-[11px] text-slate-500">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Payment Methods</h2>
                    <p className="text-[11px] text-slate-600">Manage your payment methods</p>
                  </div>
                  <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto">
                    <Plus className="h-4 w-4" />
                    Add Payment Method
                  </button>
                </div>

                {loadingPaymentMethods ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-3"></div>
                      <p className="text-[11px] text-slate-600">Loading payment methods...</p>
                    </div>
                  </div>
                ) : paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="p-4 sm:p-5 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-teal-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 flex-shrink-0">
                              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                  {method.brand} •••• {method.last4}
                                </p>
                                {method.isDefault && (
                                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-lg text-[9px] sm:text-[10px] font-semibold border border-teal-200 whitespace-nowrap">
                                    Default
                                  </span>
                                )}
                              </div>
                              {method.expiryMonth && method.expiryYear && (
                                <p className="text-[11px] text-slate-500">
                                  Expires {method.expiryMonth}/{method.expiryYear}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 justify-end sm:justify-start">
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
                    <h3 className="text-sm font-bold text-slate-900 mb-2">No Payment Methods</h3>
                    <p className="text-[11px] text-slate-600 mb-4">Add a payment method to continue your subscription</p>
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
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-2">Billing History</h2>
                    <p className="text-[11px] text-slate-600">View and download your invoices</p>
                  </div>
                </div>

                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-3"></div>
                      <p className="text-[11px] text-slate-600">Loading invoices...</p>
                    </div>
                  </div>
                ) : invoices.length > 0 ? (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="p-4 sm:p-5 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-teal-300 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                            <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 flex-shrink-0">
                              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <p className="text-xs font-semibold text-slate-900 truncate">{invoice.planName} Plan</p>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-semibold border capitalize whitespace-nowrap ${getInvoiceStatusColor(invoice.status)}`}>
                                  {invoice.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500">{formatDate(invoice.date)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:gap-4 justify-between sm:justify-end">
                            <div className="text-left sm:text-right">
                              <p className="text-xs font-bold text-slate-900">{formatCurrency(invoice.amount)}</p>
                            </div>
                            {invoice.downloadUrl && (
                              <button
                                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors flex-shrink-0"
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
                    <h3 className="text-sm font-bold text-slate-900 mb-2">No Billing History</h3>
                    <p className="text-[11px] text-slate-600">Your invoices will appear here once you have an active subscription</p>
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

