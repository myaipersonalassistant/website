'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import {
  Mail, MapPin, Phone, Clock, Send, CheckCircle,
  MessageSquare, HelpCircle, Building, Globe, Linkedin,
  Twitter, Facebook, Instagram, AlertCircle
} from 'lucide-react';
import { getDb } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Our team typically responds within 24 hours',
    contact: 'info@maipa.ai',
    link: 'mailto:info@maipa.ai'
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon-Fri from 9am to 6pm PST',
    contact: '+44 74 5741 0471',
    link: 'tel:+447457410471'
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Get instant help from our support team',
    contact: 'Start a conversation',
    link: '#'
  },
  {
    icon: HelpCircle,
    title: 'Help Center',
    description: 'Browse our knowledge base and FAQs',
    contact: 'Visit Help Center',
    link: '/help_center'
  }
];

const OFFICES = [
  {
    name: 'Headquarters',
    city: 'Belfast, Northern Ireland',
    address: '15 Queen Street',
    postal: 'BT1 6EA, United Kingdom',
    phone: '+44 74 5741 0471',
    email: 'hello@mai-pa.com'
  }
];

const SUPPORT_TOPICS = [
  'General Inquiry',
  'Technical Support',
  'Billing & Payments',
  'Feature Request',
  'Partnership Opportunity',
  'Press & Media',
  'Other'
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: SUPPORT_TOPICS[0],
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Save to Firestore - submissions go to admin panel
      const db = getDb();
      await addDoc(collection(db, 'contact_submissions'), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'new', // new, in_progress, resolved, archived
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminNotes: [],
        priority: formData.subject === 'Technical Support' || formData.subject === 'Billing & Payments' ? 'high' : 'normal'
      });

      setStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: SUPPORT_TOPICS[0],
        message: ''
      });

      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatus('error');
      setErrorMessage('Failed to submit form. Please try again or email us directly.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 pt-10 pb-22">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              <Mail className="h-4 w-4" />
              Get in Touch
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              We'd Love to
              <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Hear From You
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Have a question, feedback, or just want to say hello? Our team is here to help.
              We typically respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="py-10 bg-white -mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CONTACT_METHODS.map((method, index) => {
              const Icon = method.icon;

              return (
                <Link
                  href={method.link}
                  key={index}
                  className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-transparent hover:border-teal-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{method.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{method.description}</p>
                  <p className="text-teal-600 font-medium text-sm">{method.contact}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Contact Form */}
      <section className="py-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>

              {status === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Message sent successfully!</p>
                    <p className="text-sm text-green-700">We'll get back to you within 24 hours.</p>
                  </div>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-900">Something went wrong</p>
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <select
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    {SUPPORT_TOPICS.map((topic) => (
                      <option key={topic} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-sm text-gray-500 text-center">
                By submitting this form, you agree to our{' '}
                <Link href="/privacy" className="text-teal-600 hover:text-teal-700">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Prefer to reach out directly? Here are all the ways you can connect with us.
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                      <p className="text-sm text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM PST</p>
                      <p className="text-sm text-gray-600">Saturday - Sunday: Closed</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-white rounded-xl shadow-sm">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Follow Us</h3>
                      <div className="flex gap-3 mt-2">
                        <a
                          href="#"
                          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 transition-colors"
                        >
                          <Twitter className="h-4 w-4" />
                        </a>
                        <a
                          href="#"
                          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 transition-colors"
                        >
                          <Linkedin className="h-4 w-4" />
                        </a>
                        <a
                          href="#"
                          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 transition-colors"
                        >
                          <Facebook className="h-4 w-4" />
                        </a>
                        <a
                          href="#"
                          className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 transition-colors"
                        >
                          <Instagram className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Locations */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Office</h3>
                <div className="space-y-4">
                  {OFFICES.map((office, index) => (
                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-xs text-teal-600 font-medium mb-1">{office.name}</div>
                          <h4 className="font-semibold text-gray-900 mb-2">{office.city}</h4>
                          <p className="text-sm text-gray-600 mb-1">{office.address}</p>
                          <p className="text-sm text-gray-600 mb-3">{office.postal}</p>
                          <div className="space-y-1">
                            <a href={`tel:${office.phone}`} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-2">
                              <Phone className="h-3 w-3" />
                              {office.phone}
                            </a>
                            <a href={`mailto:${office.email}`} className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {office.email}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-12 text-center">
            <HelpCircle className="h-16 w-16 text-teal-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Looking for Quick Answers?
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Check out our Help Center and FAQs for instant answers to common questions.
              You might find what you're looking for without waiting for a response.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/help_center"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Building className="h-5 w-5" />
                Visit Help Center
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 border-2 border-teal-200"
              >
                <MessageSquare className="h-5 w-5" />
                Browse FAQs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
