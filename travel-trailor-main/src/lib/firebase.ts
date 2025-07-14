
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBj7ncL_drZ3MGgJvAF95fWmXm1VZgUXLg",
  authDomain: "travel-tailor-c182f.firebaseapp.com",
  projectId: "travel-tailor-c182f",
  storageBucket: "travel-tailor-c182f.appspot.com",
  messagingSenderId: "731636746964",
  appId: "1:731636746964:web:9ec16f87d04aa8243f0941",
  measurementId: "G-DRJ9KXHX9F"
};


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
    } else {
        app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
}

// @ts-ignore
export { app, auth, db };
