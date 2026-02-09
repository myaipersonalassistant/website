'use client';

import { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Firebase is available
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    try {
      // Check if auth.onAuthStateChanged exists (Firebase initialized)
      if (typeof auth.onAuthStateChanged !== 'function') {
        console.warn('Firebase Auth is not initialized. Please check your environment variables.');
        setLoading(false);
        return;
      }

      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      }, (error) => {
        console.error('Firebase Auth error:', error);
        setLoading(false);
      });

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error setting up Firebase Auth:', error);
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}

