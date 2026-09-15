// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBn8i_3MgMxTRVo_xB_FxTNJ7btWtoBpyU",
  authDomain: "checklist-a3cbd.firebaseapp.com",
  projectId: "checklist-a3cbd",
  storageBucket: "checklist-a3cbd.firebasestorage.app",
  messagingSenderId: "69776132553",
  appId: "1:69776132553:web:4408cfa7d642db4d024018",
  measurementId: "G-D1T0Y0D3G5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
