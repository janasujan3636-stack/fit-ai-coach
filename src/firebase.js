// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA4Cv_P5DDknDCfaufCe1hlf4V0ORq3XDw",
  authDomain: "fitai-3da15.firebaseapp.com",
  projectId: "fitai-3da15",
  storageBucket: "fitai-3da15.firebasestorage.app",
  messagingSenderId: "641658209504",
  appId: "1:641658209504:web:5b72d69cd8b78abd6dbc85",
  measurementId: "G-M1CGSM3LW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);