import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Replace with YOUR Firebase config from Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyCsFzeT63mCcif6VPoBNQygcevgeHrSnaA",
    authDomain: "hnnsc-project.firebaseapp.com",
    projectId: "hnnsc-project",
    storageBucket: "hnnsc-project.firebasestorage.app",
    messagingSenderId: "259537668070",
    appId: "1:259537668070:web:85a286ca1408023002b827",
    measurementId: "G-VTJSRB3VPS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export services
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
