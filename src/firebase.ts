import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: "agentforge-2d5ff.firebaseapp.com",
    projectId: "agentforge-2d5ff",
    storageBucket: "agentforge-2d5ff.firebasestorage.app",
    messagingSenderId: "776133058052",
    appId: "1:776133058052:web:758a570da5aaa218ce9f51"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()