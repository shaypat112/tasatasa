import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import type { GameProgress } from "../types/game";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentUserId: string | null = null;

export const firebaseService = {
  app,
  db,
  auth,

  setUserId(userId: string) {
    currentUserId = userId;
  },

  async loadProgress(userId: string): Promise<GameProgress | null> {
    const ref = doc(db, "gameProgress", userId);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as GameProgress) : null;
  },

  async saveProgress(data: GameProgress): Promise<boolean> {
    if (!currentUserId) return false;

    const ref = doc(db, "gameProgress", currentUserId);
    await setDoc(ref, data, { merge: true });
    return true;
  },
};

export { db, auth};