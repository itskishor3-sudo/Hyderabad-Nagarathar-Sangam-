import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with YOUR Firebase configuration from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyC68LqJ_f0q0SYbazlTqB0YbKTiVJZuxug",
    authDomain: "hnnsc-association.firebaseapp.com",
    projectId: "hnnsc-association",
    storageBucket: "hnnsc-association.firebasestorage.app",
    messagingSenderId: "338469461638",
    appId: "1:338469461638:web:77f2f11f31f8f9ca35fb07",
    measurementId: "G-RY734RLZP8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db
export const auth = getAuth(app);
export const db = getFirestore(app);
