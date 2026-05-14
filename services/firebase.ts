// Firebase configuration for PawGuard AI
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCVjhnlldxbl9EISc7PtFPWf609tXeu2os",
    authDomain: "pawguardai-4ee35.firebaseapp.com",
    projectId: "pawguardai-4ee35",
    storageBucket: "pawguardai-4ee35.firebasestorage.app",
    messagingSenderId: "906596802029",
    appId: "1:906596802029:android:309a26d17b1a605659dbe4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
