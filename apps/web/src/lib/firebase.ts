import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDBgwzNzxRqhg0Nzo0WDswqj2_Sv91a7_Q",
  authDomain: "talora-2bd7b.firebaseapp.com",
  projectId: "talora-2bd7b",
  storageBucket: "talora-2bd7b.firebasestorage.app",
  messagingSenderId: "725356446205",
  appId: "1:725356446205:web:c92acd7de8e60db1ea9994"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
