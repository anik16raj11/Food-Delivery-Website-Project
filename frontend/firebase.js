// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery-fefa0.firebaseapp.com",
  projectId: "vingo-food-delivery-fefa0",
  storageBucket: "vingo-food-delivery-fefa0.firebasestorage.app",
  messagingSenderId: "111107025833",
  appId: "1:111107025833:web:fde1750c3040f46eb6b2b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
export {app,auth}