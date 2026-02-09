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

function getAuthInstance(): Auth {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Auth can only be accessed on the client side');
  }
  initializeFirebase();
  if (!authInstance) {
    throw new Error('Firebase Auth failed to initialize');
  }
  return authInstance;
}

function getDbInstance(): Firestore {
  if (typeof window === 'undefined') {
    throw new Error('Firebase Firestore can only be accessed on the client side');
  }
  initializeFirebase();
  if (!dbInstance) {
    throw new Error('Firebase Firestore failed to initialize');
  }
  return dbInstance;
}

// Create lazy exports that only initialize when accessed
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getAuthInstance();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getDbInstance();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default getApp;

