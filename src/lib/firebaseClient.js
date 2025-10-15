// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCI5sTOi6L0p5KmSznFMpFBq_1fYjTk7Qk",
  authDomain: "final-year-project-475109.firebaseapp.com",
  projectId: "final-year-project-475109",
  storageBucket: "final-year-project-475109.firebasestorage.app",
  messagingSenderId: "924270264441",
  appId: "1:924270264441:web:8833ccd749c241128d54a8",
  measurementId: "G-84KVL1ZXBQ"
};

// Initialize Firebase (SSR-safe, avoid re-initialization)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Export the app and database instances
export { app, db, auth };