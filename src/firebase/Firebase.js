import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
const firebaseConfig = {
    apiKey: "AIzaSyAoZmz0fkGS82GVhMg5iCVz7DRl6IfVjGU",
    authDomain: "vitify-be859.firebaseapp.com",
    projectId: "vitify-be859",
    storageBucket: "vitify-be859.appspot.com",
    messagingSenderId: "70352333540",
    appId: "1:70352333540:web:322e02071f8bec971a5af1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);
const analytics = getAnalytics(app);

