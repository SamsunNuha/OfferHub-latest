import { initializeApp, getApps, getApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Standard Firebase Configuration Template
// Replace these placeholders with your actual Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyB4Yed21N-deGKdsPEr4yD-PwjCIy7SlP0",
  authDomain: "offer-hub-my-project.firebaseapp.com",
  projectId: "offer-hub-my-project",
  storageBucket: "offer-hub-my-project.firebasestorage.app",
  messagingSenderId: "513807501519",
  appId: "1:513807501519:web:d99e701f06539419fe0fba",
  measurementId: "G-RTE4ETERV9"
};

// Initialize Firebase App
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

import { getAuth, Auth } from 'firebase/auth';

let auth: Auth | any;
try {
  auth = getAuth(app);
} catch (e) {
  console.error("Firebase auth initialization error", e);
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
export default app;
