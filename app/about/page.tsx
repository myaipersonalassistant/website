'use client';


import Link from 'next/link';
import {
  Target, Heart, Users, Lightbulb, Award, TrendingUp,
  Globe, Shield, Zap, Code, Rocket, Star, MapPin,
  Mail, Linkedin, Twitter, CheckCircle
} from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Sarah Chen',
    role: 'CEO & Co-Founder',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    bio: 'Former VP at leading tech company with 15+ years in AI',
    social: { twitter: '#', linkedin: '#' }
  },
  {
    name: 'Marcus Rodriguez',
    role: 'CTO & Co-Founder',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    bio: 'AI researcher and engineer passionate about human-AI interaction',
    social: { twitter: '#', linkedin: '#' }
  },
  {
    name: 'Emily Watson',
    role: 'Head of Product',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    bio: 'Product leader with expertise in mobile experiences',
    social: { twitter: '#', linkedin: '#' }
  },
  {
    name: 'David Kim',
    role: 'Head of Engineering',
    image: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    bio: 'Full-stack engineer building scalable AI systems',
    social: { twitter: '#', linkedin: '#' }
  },
  {
    name: 'Priya Patel',
    role: 'Head of Design',
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    bio: 'Design strategist focused on delightful user experiences',
    social: { twitter: '#', linkedin: '#' }
  },
  {
    name: 'Alex Thompson',
    role: 'Head of AI Research',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
    bio: 'ML researcher advancing conversational AI capabilities',
    social: { twitter: '#', linkedin: '#' }
  }
];

const VALUES = [
  {
    icon: Heart,
    title: 'User-Centric',
    description: 'Every decision we make starts with understanding user needs and creating genuine value in their daily lives.'
  },
  {
    icon: Shield,
    title: 'Privacy & Trust',
    description: 'We believe privacy is fundamental. Your data is yours, always encrypted, and never sold to third parties.'
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We push boundaries in AI technology while maintaining simplicity and accessibility for everyone.'
  },
  {
    icon: Users,
    title: 'Inclusive',
    description: 'We build technology that works for everyone, regardless of background, ability, or tech expertise.'
  }
];

const MILESTONES = [
  { year: '2020', title: 'Company Founded', description: 'Started with a vision to make AI accessible to everyone' },
  { year: '2021', title: 'Beta Launch', description: 'Launched beta with 1,000 early adopters' },
  { year: '2022', title: 'Series A Funding', description: 'Raised $15M to scale product and team' },
  { year: '2023', title: 'Mobile Apps Launch', description: 'Released iOS and Android apps to 100K+ users' },
  { year: '2024', title: 'Global Expansion', description: 'Reached 500K+ users across 50 countries' },
  { year: '2025', title: 'AI Innovation', description: 'Launched next-gen conversational AI features' }
];

const STATS = [
  { icon: Users, value: '500K+', label: 'Active Users' },
  { icon: Globe, value: '50+', label: 'Countries' },
  { icon: Award, value: '4.8/5', label: 'User Rating' },
  { icon: TrendingUp, value: '98%', label: 'Satisfaction Rate' }
];

const OFFICES = [
  {
    city: 'Belfast',
    country: 'Northern Ireland',
    address: '15 Queen Street, Belfast BT1 6EA',
    type: 'Headquarters'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 pt-10 pb-12">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
              <Heart className="h-4 w-4" />
              About MAI-PA
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Building the Future of
              <span className="block bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Personal AI Assistance
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              We're on a mission to make AI technology accessible, helpful, and trustworthy for everyone.
              MAI-PA is more than an app—it's your intelligent companion designed to simplify life's complexities.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                    <Icon className="h-8 w-8 text-teal-600 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-medium mb-6">
                <Target className="h-4 w-4" />
                Our Mission
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Empowering Lives Through Intelligent Technology
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that AI should enhance human capability, not replace it. Our mission is to create
                technology that understands you, adapts to your needs, and helps you achieve more while
                respecting your privacy and autonomy.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From managing your schedule to facilitating meaningful conversations, MAI-PA is designed to be
                the personal assistant you've always wanted—intelligent, reliable, and always there when you need it.
              </p>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl p-6 text-white">
                    <Zap className="h-8 w-8 mb-3" />
                    <h3 className="font-semibold mb-2">Fast & Reliable</h3>
                    <p className="text-sm text-teal-50">Lightning-fast responses</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl p-6 text-white">
                    <Shield className="h-8 w-8 mb-3" />
                    <h3 className="font-semibold mb-2">Secure & Private</h3>
                    <p className="text-sm text-blue-50">Your data is always encrypted</p>
                  </div>
                </div>
                <div className="space-y-4 mt-8">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
                    <Code className="h-8 w-8 mb-3" />
                    <h3 className="font-semibold mb-2">Advanced AI</h3>
                    <p className="text-sm text-purple-50">Powered by cutting-edge technology</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white">
                    <Heart className="h-8 w-8 mb-3" />
                    <h3 className="font-semibold mb-2">User-Focused</h3>
                    <p className="text-sm text-orange-50">Designed around your needs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUES.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Journey</h2>
            <p className="text-xl text-gray-600">
              Key milestones in building the future of AI assistance
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-teal-500 to-cyan-500 hidden lg:block"></div>

            <div className="space-y-12">
              {MILESTONES.map((milestone, index) => (
                <div
                  key={index}
                  className={`relative grid lg:grid-cols-2 gap-8 items-center ${
                    index % 2 === 0 ? '' : 'lg:flex-row-reverse'
                  }`}
                >
                  {index % 2 === 0 ? (
                    <>
                      <div className="lg:text-right">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-bold mb-3">
                          <Rocket className="h-4 w-4" />
                          {milestone.year}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                      <div className="hidden lg:block"></div>
                    </>
                  ) : (
                    <>
                      <div className="hidden lg:block"></div>
                      <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-100 text-teal-700 rounded-full text-sm font-bold mb-3">
                          <Rocket className="h-4 w-4" />
                          {milestone.year}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </div>
                    </>
                  )}
                  {/* Timeline Dot */}
                  <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-teal-500 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-10 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">
              The people building the future of personal AI
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden bg-gray-200">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-teal-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  <div className="flex gap-3">
                    <a
                      href={member.social.twitter}
                      className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 transition-colors"
                    >
                      <Twitter className="h-4 w-4" />
                    </a>
                    <a
                      href={member.social.linkedin}
                      className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-teal-100 hover:text-teal-600 transition-colors"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Our Office</h2>
            <p className="text-xl text-gray-600">
              Where innovation meets Irish hospitality
            </p>
          </div>

          <div className="max-w-md mx-auto text-center">
            {OFFICES.map((office, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-8 border border-teal-100"
              >
                <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm text-teal-600 font-medium mb-2">{office.type}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{office.city}</h3>
                <p className="text-gray-600 mb-4">{office.country}</p>
                <p className="text-sm text-gray-500">{office.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-gradient-to-br from-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="h-16 w-16 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-4xl font-bold mb-6">Join Us on Our Mission</h2>
          <p className="text-xl text-teal-50 mb-10">
            Whether you're interested in our product, want to join our team, or simply want to learn more,
            we'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg"
            >
              <Mail className="h-5 w-5" />
              Get in Touch
            </Link>
            <Link
              href="/download"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal-700 text-white rounded-xl font-semibold hover:bg-teal-800 transition-all duration-200"
            >
              Try MAI-PA Today
              <Rocket className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
