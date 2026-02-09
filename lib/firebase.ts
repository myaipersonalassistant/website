import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only on the client side
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function initializeFirebase(): void {
  // Only initialize on the client side
  if (typeof window === 'undefined') {
    return;
  }

  // Skip if already initialized
  if (app) {
    return;
  }

  // Check if config is valid - if not, skip initialization silently during build
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    return;
  }

  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
  } catch (error) {
    // Silently fail during build/SSR
    if (typeof window !== 'undefined') {
      console.error('Error initializing Firebase:', error);
    }
  }
}

// Initialize Firebase lazily when accessed
function getApp(): FirebaseApp {
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be initialized on the client side');
  }
  initializeFirebase();
  if (!app) {
    throw new Error('Firebase failed to initialize');
  }
  return app;
}

function getAuthInstance(): Auth | null {
  if (typeof window === 'undefined') {
    return null;
  }
  initializeFirebase();
  return authInstance;
}

function getDbInstance(): Firestore | null {
  if (typeof window === 'undefined') {
    return null;
  }
  initializeFirebase();
  return dbInstance;
}

// Create lazy exports that only initialize when accessed
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuthInstance();
    if (!instance) {
      // Return safe defaults for missing Firebase
      if (prop === 'onAuthStateChanged') {
        return () => () => {}; // Return unsubscribe function
      }
      if (prop === 'currentUser') {
        return null;
      }
      if (prop === 'app') {
        return null;
      }
      // For other properties, return undefined but don't crash
      if (typeof prop === 'string') {
        console.warn(`Firebase Auth property "${prop}" accessed but Firebase is not initialized. Please check your environment variables.`);
      }
      return undefined;
    }
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

// Create a Proxy that properly handles Firestore instance
// This Proxy ensures Firebase is initialized when db is accessed
const createDbProxy = (): Firestore => {
  const handler: ProxyHandler<Firestore> = {
    get(_target, prop) {
      const instance = getDbInstance();
      if (!instance) {
        // Return safe defaults for missing Firebase
        if (prop === 'app') {
          return null;
        }
        // For other properties, return undefined but don't crash
        if (typeof prop === 'string') {
          console.warn(`Firebase Firestore property "${prop}" accessed but Firebase is not initialized. Please check your environment variables.`);
        }
        return undefined;
      }
      const value = (instance as any)[prop];
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    },
    // Handle cases where the Proxy itself is used (e.g., instanceof checks)
    getPrototypeOf() {
      const instance = getDbInstance();
      return instance ? Object.getPrototypeOf(instance) : Object.getPrototypeOf({});
    },
    // Ensure the Proxy can be used with Firestore functions
    has(_target, prop) {
      const instance = getDbInstance();
      return instance ? prop in instance : false;
    },
    // When the Proxy is used as a value (e.g., passed to doc()), return the actual instance
    getOwnPropertyDescriptor(_target, prop) {
      const instance = getDbInstance();
      if (instance) {
        return Object.getOwnPropertyDescriptor(instance, prop);
      }
      return undefined;
    }
  };
  
  return new Proxy({} as Firestore, handler);
};

// Initialize Firebase early on client side
if (typeof window !== 'undefined') {
  initializeFirebase();
}

// Export db - when used with Firestore functions, getDb() should be used instead
// This Proxy is kept for backward compatibility but may not work with all Firestore functions
export const db = createDbProxy();

// Helper function to ensure db is initialized before use
export function getDb(): Firestore {
  const instance = getDbInstance();
  if (!instance) {
    throw new Error('Firebase Firestore is not initialized. Please check your environment variables.');
  }
  return instance;
}

export default getApp;

