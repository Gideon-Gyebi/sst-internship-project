import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const requiredKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
];

const missingKeys = requiredKeys.filter((key) => !import.meta.env[key]);

export const firebaseReady = missingKeys.length === 0;
export const firebaseSetupMessage = firebaseReady
  ? ''
  : `Firebase setup required: add ${missingKeys.join(', ')} to your local .env file.`;

let auth = null;
let db = null;
let firebaseApp = null;

if (firebaseReady) {
  firebaseApp = initializeApp({
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  });

  auth = getAuth(firebaseApp);
}

export async function getDb() {
  if (!firebaseReady) return null;
  if (!db) {
    const { getFirestore } = await import('firebase/firestore');
    db = getFirestore(firebaseApp);
  }
  return db;
}

export { auth };
