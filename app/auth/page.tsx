'use client'

import { useState, useEffect, Suspense } from 'react';
import Lottie from 'lottie-react';
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle, User, Calendar, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { auth, db, getDb } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail, 
  updatePassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, collection, addDoc, Timestamp } from 'firebase/firestore';

type AuthView = 'login' | 'signup' | 'forgot-password' | 'verify-email' | 'reset-password';

// Helper function to check if user has completed onboarding
const checkOnboardingStatus = async (userId: string): Promise<boolean> => {
  try {
    const dbInstance = getDb();
    const userDoc = await getDoc(doc(dbInstance, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.onboardingCompleted === true;
    }
    return false;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

// Main auth page content component (uses useSearchParams, needs Suspense)
function AuthPageContent() {
  const navigate = useRouter();
  const searchParams = useSearchParams();
  const [currentView, setCurrentView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        // Check if user has completed onboarding
        const hasCompletedOnboarding = await checkOnboardingStatus(user.uid);
        if (hasCompletedOnboarding) {
          navigate.push('/dashboard');
        } else {
          navigate.push('/onboarding');
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Load your Lottie JSON file
    fetch('/auth.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation:', error));
  }, []);

  useEffect(() => {
    // Check URL parameters for view on mount and when URL changes
    const view = searchParams.get('view') as AuthView;
    if (view && ['login', 'signup', 'forgot-password', 'reset-password'].includes(view)) {
      setCurrentView(view);
    } else {
      // Default to login if no view parameter
      setCurrentView('login');
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle the redirect
    } catch (err: any) {
      let errorMessage = 'Failed to sign in. Please check your credentials.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const db = getDb();
      
      // Create user document in Firestore with initial data
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        fullName: fullName,
        createdAt: serverTimestamp(),
        onboardingCompleted: false,
        // Store additional metadata
        metadata: {
          signupMethod: 'email',
          signupDate: new Date().toISOString(),
        }
      });
      
      // Create welcome notification
      try {
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          title: 'Welcome to Mai-PA! 🎉',
          message: `Hi ${fullName || 'there'}! We're excited to have you on board. Complete your onboarding to get started with your AI assistant.`,
          type: 'success',
          category: 'system',
          priority: 'medium',
          is_read: false,
          is_archived: false,
          action_url: '/onboarding',
          created_at: serverTimestamp(),
        });
      } catch (notificationError) {
        // Don't fail signup if notification creation fails
        console.error('Error creating welcome notification:', notificationError);
      }
      
      // onAuthStateChanged will handle the redirect
    } catch (err: any) {
      let errorMessage = 'Failed to create account. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists. Please sign in instead.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const actionCodeSettings = {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth?view=reset-password`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setSuccess('Password reset instructions have been sent to your email. Please check your inbox.');
      setTimeout(() => setCurrentView('login'), 3000);
    } catch (err: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user is currently signed in. Please use the password reset link from your email.');
      }

      await updatePassword(user, password);
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        setCurrentView('login');
        navigate.push('/auth?view=login');
      }, 2000);
    } catch (err: any) {
      let errorMessage = 'Failed to reset password. Please try again.';
      if (err.code === 'auth/requires-recent-login') {
        errorMessage = 'For security, please sign out and use the password reset link from your email.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists, if not create it
      const dbInstance = getDb();
      const userDoc = await getDoc(doc(dbInstance, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(dbInstance, 'users', user.uid), {
          email: user.email,
          fullName: user.displayName || '',
          createdAt: serverTimestamp(),
          onboardingCompleted: false,
          metadata: {
            signupMethod: 'google',
            signupDate: new Date().toISOString(),
          }
        });
        
        // Create welcome notification for Google signup
        try {
          await addDoc(collection(dbInstance, 'notifications'), {
            userId: user.uid,
            title: 'Welcome to Mai-PA! 🎉',
            message: `Hi ${user.displayName || user.email?.split('@')[0] || 'there'}! We're excited to have you on board. Complete your onboarding to get started with your AI assistant.`,
            type: 'success',
            category: 'system',
            priority: 'medium',
            is_read: false,
            is_archived: false,
            action_url: '/onboarding',
            created_at: serverTimestamp(),
          });
        } catch (notificationError) {
          // Don't fail signup if notification creation fails
          console.error('Error creating welcome notification:', notificationError);
        }
      }
      // onAuthStateChanged will handle the redirect
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by your browser. Please allow popups and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new OAuthProvider('apple.com');
      // Apple Sign-In scopes - email is required, name is optional
      provider.addScope('email');
      provider.addScope('name');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Apple Sign-In may provide name in user.displayName (only on first sign-in)
      // Extract name from user object
      let fullName = user.displayName || '';

      // Check if user document exists, if not create it
      const dbInstance = getDb();
      const userDoc = await getDoc(doc(dbInstance, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // For new users, create document
        // Note: Apple may not provide email/name on subsequent sign-ins
        const userData: any = {
          createdAt: serverTimestamp(),
          onboardingCompleted: false,
          metadata: {
            signupMethod: 'apple',
            signupDate: new Date().toISOString(),
          }
        };
        
        // Only add email if provided (Apple may hide email)
        if (user.email) {
          userData.email = user.email;
        }
        
        // Only add fullName if provided
        if (fullName) {
          userData.fullName = fullName;
        } else if (user.email) {
          // Fallback: use email username part if no name
          userData.fullName = user.email.split('@')[0];
        }
        
        await setDoc(doc(dbInstance, 'users', user.uid), userData);
        
        // Create welcome notification for Apple signup
        try {
          const userName = fullName || user.email?.split('@')[0] || 'there';
          await addDoc(collection(dbInstance, 'notifications'), {
            userId: user.uid,
            title: 'Welcome to Mai-PA! 🎉',
            message: `Hi ${userName}! We're excited to have you on board. Complete your onboarding to get started with your AI assistant.`,
            type: 'success',
            category: 'system',
            priority: 'medium',
            is_read: false,
            is_archived: false,
            action_url: '/onboarding',
            created_at: serverTimestamp(),
          });
        } catch (notificationError) {
          // Don't fail signup if notification creation fails
          console.error('Error creating welcome notification:', notificationError);
        }
      } else {
        // For existing users, update email/name if missing and now provided
        const existingData = userDoc.data();
        const updates: any = {};
        
        if (user.email && !existingData.email) {
          updates.email = user.email;
        }
        
        if (fullName && !existingData.fullName) {
          updates.fullName = fullName;
        }
        
        if (Object.keys(updates).length > 0) {
          await setDoc(doc(dbInstance, 'users', user.uid), updates, { merge: true });
        }
      }
      // onAuthStateChanged will handle the redirect
    } catch (err: any) {
      let errorMessage = 'Failed to sign in with Apple. Please try again.';
      
      // Handle specific Apple Sign-In errors
      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in was cancelled. Please try again.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site and try again.';
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Apple Sign-In. Please contact support.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Apple Sign-In is not enabled. Please contact support.';
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        errorMessage = 'An account already exists with this email. Please sign in with your original method.';
      } else if (err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid Apple Sign-In credential. Please try again.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      console.error('Apple Sign-In Error:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderLoginView = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back</h2>
        <p className="text-slate-600">Sign in to connect with your AI companion</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 cursor-pointer">
              Remember me
            </label>
          </div>

          <button
            type="button"
            onClick={() => setCurrentView('forgot-password')}
            className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-slate-500 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-sm font-medium text-slate-700">Google</span>
        </button>
        <button
          type="button"
          onClick={handleAppleAuth}
          className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span className="text-sm font-medium text-slate-700">Apple</span>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={() => setCurrentView('signup')}
          className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          Sign up for free
        </button>
      </p>
    </div>
  );

  const renderSignupView = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create your account</h2>
        <p className="text-slate-600">Start your journey with your AI companion</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="John Doe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Must be at least 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-2 border-slate-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-3 bg-white text-slate-500 font-medium">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={handleGoogleAuth}
          className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="text-sm font-medium text-slate-700">Google</span>
        </button>
        <button
          type="button"
          onClick={handleAppleAuth}
          className="flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
          <span className="text-sm font-medium text-slate-700">Apple</span>
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => setCurrentView('login')}
          className="font-semibold text-teal-600 hover:text-teal-700 transition-colors"
        >
          Sign in
        </button>
      </p>
    </div>
  );

  const renderForgotPasswordView = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset your password</h2>
        <p className="text-slate-600">Enter your email and we'll send you reset instructions</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleForgotPassword} className="space-y-5">
        <div>
          <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-2">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              Send reset link
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => setCurrentView('login')}
          className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          Back to sign in
        </button>
      </div>
    </div>
  );

  const renderResetPasswordView = () => (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create new password</h2>
        <p className="text-slate-600">Enter your new password below</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-xl text-green-700">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-5">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="Enter new password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-500">Must be at least 8 characters</p>
        </div>

        <div>
          <label htmlFor="confirm-new-password" className="block text-sm font-medium text-slate-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="confirm-new-password"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 text-slate-900 placeholder-slate-400"
              placeholder="Confirm new password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-teal-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              Reset password
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );

  const getIllustrationContent = () => {
    switch (currentView) {
        case 'login':
        return {
            title: 'Your intelligent AI companion awaits',
            description: 'Experience natural conversations, morning briefing calls, and proactive assistance that learns your preferences over time.'
        };
        case 'signup':
        return {
            title: 'Join thousands of users',
            description: 'Create your account and get personalized AI assistance tailored to your unique needs and preferences.'
        };
        case 'forgot-password':
        return {
            title: 'Secure password recovery',
            description: "We'll send you a secure link to reset your password. Your account security is our top priority."
        };
        case 'reset-password':
        return {
            title: 'Almost there',
            description: 'Create a strong new password to secure your account and get back to using Mai-PA.'
        };
        default:
        return {
            title: 'Welcome to Mai-PA',
            description: 'Your personal AI assistant for a more organized and productive life.'
        };
    }
  };

  const illustration = getIllustrationContent();

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-8 bg-white flex-1">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-cyan-600 bg-clip-text text-transparent">Mai-PA</h1>
            </Link>
          </div>

          {currentView === 'login' && renderLoginView()}
          {currentView === 'signup' && renderSignupView()}
          {currentView === 'forgot-password' && renderForgotPasswordView()}
          {currentView === 'reset-password' && renderResetPasswordView()}
        </div>
      </div>

      {/* RIGHT SIDE - VIDEO SECTION */}
      <div className="w-full h-screen flex items-center justify-center rounded-2xl mb-6 relative overflow-hidden hidden lg:flex flex-1">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            className="w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center">
            <RefreshCw className="h-12 w-12 text-teal-500 animate-spin" />
          </div>
        )}
        <div className="absolute bottom-4 left-0 right-0 text-center z-10">
          <p className="text-sm font-medium text-teal-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
            Intelligent Assistance
          </p>
        </div>
      </div>
    </div>
  );
}

// Default export with Suspense boundary
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthPageContent />
    </Suspense>
  );
}