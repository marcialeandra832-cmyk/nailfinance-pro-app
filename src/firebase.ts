import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';
import firebaseConfig from '../firebase-applet-config.json';

// Suporta URL configurada no JSON, variável de ambiente VITE_FIREBASE_DATABASE_URL ou o Realtime Database fornecido
const databaseURL = (firebaseConfig as any).databaseURL || 
  (import.meta as any).env?.VITE_FIREBASE_DATABASE_URL || 
  "https://nail-finance-pro-default-rtdb.firebaseio.com";

const app = initializeApp({
  ...firebaseConfig,
  databaseURL
});

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const database = getDatabase(app);


