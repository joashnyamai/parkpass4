import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyA_GXf4y2dZcntDyGvMW0I9saZwi4Ao4AQ',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'parkpass-93ca6.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'parkpass-93ca6',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'parkpass-93ca6.firebasestorage.app',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '201729055832',
  appId: process.env.FIREBASE_APP_ID || '1:201729055832:web:389bb92099680b14f2be2d',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
