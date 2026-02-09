'use client';

import { useAuth } from '@/lib/useAuth';
import Header from './Header';
import Footer from './Footer';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const { user, loading, isAuthenticated } = useAuth();

  // Determine user role based on auth state
  // You can extend this to check for admin role from Firestore
  const userRole = loading ? 'guest' : (isAuthenticated ? 'user' : 'guest');

  return (
    <>
      <Header userRole={userRole} user={user} />
      {children}
      <Footer userRole={userRole} />
    </>
  );
}

