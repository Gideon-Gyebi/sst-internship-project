import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../firebase.js';

function requireAuth() {
  if (!auth) {
    throw new Error('Firebase is not configured. Add the required values to your local .env file.');
  }

  return auth;
}

export function watchAuthState(onChange, onError) {
  return onAuthStateChanged(requireAuth(), onChange, onError);
}

export async function registerWithEmail({ name, email, password }) {
  const credential = await createUserWithEmailAndPassword(requireAuth(), email, password);
  try {
    await updateProfile(credential.user, { displayName: name });
  } catch {
    // Account creation succeeded; the dashboard can fall back to the email name.
  }
  return credential.user;
}

export async function loginWithEmail({ email, password }) {
  const credential = await signInWithEmailAndPassword(requireAuth(), email, password);
  return credential.user;
}

export async function requestPasswordReset(email) {
  await sendPasswordResetEmail(requireAuth(), email.trim());
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(requireAuth(), provider);
  return credential.user;
}

export async function logout() {
  await signOut(requireAuth());
}
