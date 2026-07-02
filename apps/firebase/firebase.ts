import { initializeApp, getApps, getApp } from 'firebase/app';

import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { firebaseConfig } from './firebaseConfig';

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
