'use client';

import { useAuth } from '@/lib/useAuth';
import { useEffect } from 'react';
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

  // Remove browser extension attributes that cause hydration mismatches
  useEffect(() => {
    // Remove attributes added by browser extensions (e.g., bis_skin_checked from Bitdefender)
    const removeExtensionAttributes = () => {
      if (typeof document !== 'undefined') {
        const allElements = document.querySelectorAll('[bis_skin_checked]');
        allElements.forEach((el) => {
          el.removeAttribute('bis_skin_checked');
        });
      }
    };

    // Use MutationObserver to remove attributes as they're added
    if (typeof window !== 'undefined' && typeof MutationObserver !== 'undefined') {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
            const target = mutation.target as Element;
            if (target.hasAttribute('bis_skin_checked')) {
              target.removeAttribute('bis_skin_checked');
            }
          }
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const element = node as Element;
              if (element.hasAttribute('bis_skin_checked')) {
                element.removeAttribute('bis_skin_checked');
              }
              // Also check children
              const children = element.querySelectorAll('[bis_skin_checked]');
              children.forEach((child) => {
                child.removeAttribute('bis_skin_checked');
              });
            }
          });
        });
      });

      // Start observing only if document.body exists
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['bis_skin_checked'],
        });
      } else {
        // Wait for body to be available
        const bodyObserver = new MutationObserver(() => {
          if (document.body) {
            observer.observe(document.body, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ['bis_skin_checked'],
            });
            bodyObserver.disconnect();
          }
        });
        bodyObserver.observe(document.documentElement, {
          childList: true,
        });
        return () => {
          observer.disconnect();
          bodyObserver.disconnect();
        };
      }

      // Remove existing attributes
      removeExtensionAttributes();

      return () => observer.disconnect();
    }

    // Fallback: remove attributes after a delay
    const timeoutId = setTimeout(removeExtensionAttributes, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <>
      <Header userRole={userRole} user={user} />
      {children}
      <Footer userRole={userRole} />
    </>
  );
}

