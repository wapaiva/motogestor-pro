import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";

// Firebase config - replace with your own Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const isConfigured = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

let app: ReturnType<typeof initializeApp> | null = null;
let auth: ReturnType<typeof getAuth> | null = null;

if (isConfigured) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();

export function isFirebaseConfigured() {
  return isConfigured;
}

export function getFirebaseAuth() {
  return auth;
}

export async function loginWithEmail(email: string, password: string) {
  if (!auth) throw new Error("Firebase não configurado");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string, name: string) {
  if (!auth) throw new Error("Firebase não configurado");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (cred.user) {
    await updateProfile(cred.user, { displayName: name });
  }
  return cred;
}

export async function loginWithGoogle() {
  if (!auth) throw new Error("Firebase não configurado");
  return signInWithPopup(auth, googleProvider);
}

export async function logout() {
  if (!auth) throw new Error("Firebase não configurado");
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export type { User };
