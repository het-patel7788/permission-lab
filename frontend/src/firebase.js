import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  // PASTE YOUR CONFIG KEYS HERE FROM NOTEPAD
  apiKey: "AIzaSyBykMGLJYpwcy5oyaP69rDQAbvKazRR8pU",
  authDomain: "spylink-523ac.firebaseapp.com",
  projectId: "spylink-523ac",
  storageBucket: "spylink-523ac.firebasestorage.app",
  messagingSenderId: "78533810462",
  appId: "1:78533810462:web:b6f0b9500f30135702d10f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();