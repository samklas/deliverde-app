// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {
  initializeAuth,
  // @ts-ignore
  getReactNativePersistence,
} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";
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
export const app = initializeApp(firebaseConfig);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
// export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
