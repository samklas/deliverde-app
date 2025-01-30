// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC1-gAvRJp9voMBcUr5asHlEV0h2FXE7Uc",
  authDomain: "example-app-37bd0.firebaseapp.com",
  projectId: "example-app-37bd0",
  storageBucket: "example-app-37bd0.firebasestorage.app",
  messagingSenderId: "5301838832",
  appId: "1:5301838832:web:f13ae066dd67db2b373335",
  measurementId: "G-7J4FXBT6YR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);

export default app;
