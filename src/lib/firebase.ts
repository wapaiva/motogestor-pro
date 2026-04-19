import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  browserLocalPersistence,
  setPersistence,
  sendPasswordResetEmail,
  sendEmailVerification,
  confirmPasswordReset,
  verifyPasswordResetCode,
  applyActionCode,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLTIg4thT1qW-BxhyKUI8Z7EaBEzQBEGA",
  authDomain: "motogestor-pro.firebaseapp.com",
  projectId: "motogestor-pro",
  storageBucket: "motogestor-pro.firebasestorage.app",
  messagingSenderId: "695841834318",
  appId: "1:695841834318:web:a3b3f8484f3dbc7a530a1f",
  measurementId: "G-C2PLRVLYBT",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Persist session across reloads
setPersistence(auth, browserLocalPersistence).catch(() => {});

export function isFirebaseConfigured() {
  return true;
}

export function getFirebaseAuth() {
  return auth;
}

export function getFirebaseDb() {
  return db;
}

export async function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string, name: string) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (cred.user) {
    await updateProfile(cred.user, { displayName: name });
    // Send verification email automatically on signup
    try {
      await sendEmailVerification(cred.user, {
        url: window.location.origin + "/login",
        handleCodeInApp: false,
      });
    } catch (err) {
      console.warn("Could not send verification email:", err);
    }
  }
  return cred;
}

export async function sendPasswordReset(email: string) {
  return sendPasswordResetEmail(auth, email, {
    url: window.location.origin + "/login",
    handleCodeInApp: false,
  });
}

export async function resendVerificationEmail() {
  if (!auth.currentUser) throw new Error("No user signed in");
  return sendEmailVerification(auth.currentUser, {
    url: window.location.origin + "/login",
    handleCodeInApp: false,
  });
}

export async function confirmPasswordResetWithCode(oobCode: string, newPassword: string) {
  await verifyPasswordResetCode(auth, oobCode);
  return confirmPasswordReset(auth, oobCode, newPassword);
}

export async function applyEmailVerification(oobCode: string) {
  return applyActionCode(auth, oobCode);
}

export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (err: any) {
    const code = err?.code || "";
    // Popup blocked / iframe restrictions → fallback to redirect
    if (
      code === "auth/popup-blocked" ||
      code === "auth/cancelled-popup-request" ||
      code === "auth/operation-not-supported-in-this-environment" ||
      code === "auth/internal-error" ||
      code === "auth/web-storage-unsupported"
    ) {
      await signInWithRedirect(auth, googleProvider);
      // Redirect navigates away; keep caller in pending state
      return new Promise(() => {}) as never;
    }
    throw err;
  }
}

export async function consumeGoogleRedirect() {
  try {
    return await getRedirectResult(auth);
  } catch {
    return null;
  }
}

export async function logout() {
  return signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export { updateProfile };
export type { User };
