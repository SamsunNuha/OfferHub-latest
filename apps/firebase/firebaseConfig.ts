import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with your own Firebase config values
export const firebaseConfig = {
  apiKey: "AIzaSyDtYGThfsZ_w4cTtnJhsGosH9bQTneIKF0",
  authDomain: "offer-hub-f89e9.firebaseapp.com",
  projectId: "offer-hub-f89e9",
  storageBucket: "offer-hub-f89e9.firebasestorage.app",
  messagingSenderId: "366280180563",
  appId: "1:366280180563:web:46f7085fabd58443a2d7a6",
  measurementId: "G-2FQQZPCMMS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { serverTimestamp };
