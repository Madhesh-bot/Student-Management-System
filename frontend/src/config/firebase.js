import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Securely load credentials from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCDY3mwy9i-ziOoimOzwQHR4XJWqOWN6Hc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'student-managentsystem.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'student-managentsystem',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'student-managentsystem.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '301669162775',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:301669162775:web:b961cb41facaaed088a152'
};

// Initialize Firebase App instance safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log('🔥 Firebase initialized successfully for project:', firebaseConfig.projectId);

export { app, auth, db, storage };
