'use client'

import Link from 'next/link';
import Lottie from 'lottie-react';
import phonny from '@/public/phone.json';
import { useState } from 'react';
import {
  Download, Shield, RefreshCw, Star, ArrowRight, Zap, Check, QrCode, Apple, Calendar, PlayCircle, Bell, MessageSquare, Cloud, Lock 
} from 'lucide-react';

const features = [
    {
      icon: Calendar,
      title: 'Smart Calendar Sync',
      description: 'Seamlessly sync your schedule across all devices with real-time updates',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Bell,
      title: 'Intelligent Notifications',
      description: 'Get context-aware alerts that help you stay on top of your day',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: MessageSquare,
      title: 'AI Assistant Chat',
      description: 'Chat with your AI assistant anytime, anywhere on the go',
      color: 'from-teal-500 to-green-500'
    },
    {
      icon: Lock,
      title: 'Biometric Security',
      description: 'Secure your data with Face ID, Touch ID, or fingerprint authentication',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: Cloud,
      title: 'Cloud Sync',
      description: 'All your data automatically synced and backed up to the cloud',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      icon: Zap,
      title: 'Offline Mode',
      description: 'Access your essential information even without an internet connection',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

const STATS = [
  { value: '500K+', label: 'Active Users' },
  { value: '4.8', label: 'App Rating', icon: Star },
  { value: '50M+', label: 'Messages Sent' },
  { value: '99.9%', label: 'Uptime' }
];

const systemRequirements = {
  ios: {
    version: 'iOS 14.0 or later',
    size: '85 MB',
    devices: 'iPhone, iPad, iPod touch',
    languages: '20+ languages'
  },
  android: {
    version: 'Android 8.0 or later',
    size: '92 MB',
    devices: 'Phones and tablets',
    languages: '20+ languages'
  }
};

const REQUIREMENTS = {
  ios: ['iOS 14.0 or later', 'iPhone, iPad, and iPod touch', '150 MB available space'],
  android: ['Android 8.0 or later', 'Compatible with most devices', '120 MB available space']
};

export default function DownloadPage() {
  const [selectedPlatform, setSelectedPlatform] = useState<'ios' | 'android'>('ios');


  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 pt-10 pb-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
                <Download className="h-4 w-4" />
                Available Now
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your AI Assistant,
                <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Always in Your Pocket
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Download MAI-PA on iOS or Android and experience the future of personal assistance. Available for free with premium features.
              </p>

              {/* Download Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
                <a
                  href="https://apps.apple.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Apple className="h-7 w-7" />
                  <div className="text-left">
                    <div className="text-xs">Download on the</div>
                    <div className="text-lg font-semibold">App Store</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 px-8 py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="text-left">
                    <div className="text-xs">GET IT ON</div>
                    <div className="text-lg font-semibold">Google Play</div>
                  </div>
                </a>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
                {STATS.map((stat, index) => (
                  <div key={index} className="text-center lg:text-left">
                    <div className="flex items-center justify-center lg:justify-start gap-1 text-3xl font-bold text-gray-900 mb-1">
                      {stat.value}
                      {stat.icon && <stat.icon className="h-6 w-6 text-yellow-400 fill-yellow-400" />}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phone Mockup with Lottie Animation - Hidden on Mobile */}
            <div className="relative hidden lg:block">
              <div className="relative mx-auto max-w-sm">
                {/* Phone Frame */}
                <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] overflow-hidden">
                    <Lottie animationData={phonny} loop={true} className="w-full h-full drop-shadow-2xl" />
                  </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl p-4 animate-bounce">
                  <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4">
                  <Zap className="h-6 w-6 text-teal-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="pt-10 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Powerful Features on the Go
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Everything you need to stay productive, organized, and in control,
              right from your mobile device.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white border-2 border-slate-200 rounded-2xl p-8 hover:border-teal-300 hover:shadow-xl transition-all"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-slate-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Why Users Love Our Mobile App
            </h2>
            <p className="text-xl text-slate-600">
              Join millions of satisfied users worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your data is encrypted end-to-end and never shared with third parties',
                color: 'text-blue-600'
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Optimized performance ensures smooth experience even on older devices',
                color: 'text-yellow-600'
              },
              {
                icon: RefreshCw,
                title: 'Always Updated',
                description: 'Regular updates with new features and improvements based on user feedback',
                color: 'text-green-600'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-slate-200 rounded-2xl p-8 text-center hover:border-teal-300 hover:shadow-xl transition-all"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl mb-6">
                  <item.icon className={`h-8 w-8 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section id="download" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Download Now
            </h2>
            <p className="text-xl text-slate-600">
              Choose your platform and start your productivity journey today
            </p>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedPlatform('ios')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all ${
                selectedPlatform === 'ios'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Apple className="h-6 w-6" />
              iOS
            </button>
            <button
              onClick={() => setSelectedPlatform('android')}
              className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold transition-all ${
                selectedPlatform === 'android'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-200'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <PlayCircle className="h-6 w-6" />
              Android
            </button>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-slate-50 to-teal-50 border-2 border-teal-200 rounded-3xl p-12">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-48 h-48 bg-white rounded-2xl shadow-lg mb-6">
                    <QrCode className="h-32 w-32 text-slate-700" />
                  </div>
                  <p className="text-sm text-slate-600">
                    Scan QR code to download
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">
                      {selectedPlatform === 'ios' ? 'Download for iOS' : 'Download for Android'}
                    </h3>

                    <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Version:</span>
                        <span className="font-semibold text-slate-900">
                          {systemRequirements[selectedPlatform].version}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Size:</span>
                        <span className="font-semibold text-slate-900">
                          {systemRequirements[selectedPlatform].size}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Devices:</span>
                        <span className="font-semibold text-slate-900">
                          {systemRequirements[selectedPlatform].devices}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Languages:</span>
                        <span className="font-semibold text-slate-900">
                          {systemRequirements[selectedPlatform].languages}
                        </span>
                      </div>
                    </div>

                    <a
                      href={selectedPlatform === 'ios' ? '#ios-download' : '#android-download'}
                      className="group w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-bold text-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-lg shadow-teal-200"
                    >
                      <Download className="h-6 w-6" />
                      Download for {selectedPlatform === 'ios' ? 'iOS' : 'Android'}
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </a>

                    <div className="flex items-center justify-center gap-1 mt-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                      ))}
                      <span className="ml-2 text-slate-600 font-semibold">4.8/5 (50K+ reviews)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            System Requirements
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <Apple className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">iOS</h3>
                  <p className="text-sm text-gray-600">iPhone & iPad</p>
                </div>
              </div>
              <ul className="space-y-3">
                {REQUIREMENTS.ios.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Android</h3>
                  <p className="text-sm text-gray-600">Smartphones & Tablets</p>
                </div>
              </div>
              <ul className="space-y-3">
                {REQUIREMENTS.android.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Daily Routine?
          </h2>
          <p className="text-xl text-teal-50 mb-10">
            Join hundreds of thousands of users who trust MAI-PA as their daily companion
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Apple className="h-7 w-7" />
              <div className="text-left">
                <div className="text-xs">Download on the</div>
                <div className="text-lg font-semibold">App Store</div>
              </div>
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 rounded-xl font-medium hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="text-left">
                <div className="text-xs">GET IT ON</div>
                <div className="text-lg font-semibold">Google Play</div>
              </div>
            </a>
          </div>
          <div className="flex items-center justify-center gap-8 text-teal-50">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>Free to Download</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              <span>No Credit Card Required</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}