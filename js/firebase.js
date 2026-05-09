// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBF1wM4iG8gdKjpTxYKFuKOjK4I2lbMUzQ",
  authDomain: "sun-africa-loans.firebaseapp.com",
  projectId: "sun-africa-loans",
  storageBucket: "sun-africa-loans.firebasestorage.app",
  messagingSenderId: "21690997002",
  appId: "1:21690997002:web:f6f2c7ac8e0272d8b042f3",
  measurementId: "G-ZTP1JXG67B"  // (optional, not used but kept)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };