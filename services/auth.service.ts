import { auth, db } from "@/firebaseConfig";
import {
  signInWithCredential,
  OAuthProvider,
  GoogleAuthProvider,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";
import Constants from "expo-constants";

// Lazy load Google Sign-In to avoid crash in Expo Go
let GoogleSignin: any = null;
let googleSignInConfigured = false;

const getGoogleSignin = async () => {
  if (!GoogleSignin) {
    const module = await import("@react-native-google-signin/google-signin");
    GoogleSignin = module.GoogleSignin;
  }
  if (!googleSignInConfigured) {
    GoogleSignin.configure({
      webClientId: Constants.expoConfig?.extra?.googleWebClientId,
      iosClientId: Constants.expoConfig?.extra?.googleIosClientId,
    });
    googleSignInConfigured = true;
  }
  return GoogleSignin;
};

export type AuthResult = {
  uid: string;
  isNewUser: boolean;
  username?: string;
};

/**
 * Check if user document exists in Firestore
 */
export const checkUserExists = async (uid: string): Promise<boolean> => {
  const docRef = doc(db, "users", uid);
  const document = await getDoc(docRef);
  return document.exists();
};

/**
 * Get username from Firestore user document
 */
export const getUsername = async (uid: string): Promise<string | null> => {
  const docRef = doc(db, "users", uid);
  const document = await getDoc(docRef);
  if (document.exists()) {
    return document.data().username as string;
  }
  return null;
};

/**
 * Sign in with Apple
 */
export const signInWithApple = async (): Promise<AuthResult> => {
  // Generate nonce for security
  const nonce = Math.random().toString(36).substring(2, 10);
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    nonce
  );

  // Request Apple authentication
  const appleCredential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });

  // Create Firebase credential
  const provider = new OAuthProvider("apple.com");
  const credential = provider.credential({
    idToken: appleCredential.identityToken!,
    rawNonce: nonce,
  });

  // Sign in to Firebase
  const userCredential = await signInWithCredential(auth, credential);
  const uid = userCredential.user.uid;

  // Check if user exists in Firestore
  const userExists = await checkUserExists(uid);

  if (userExists) {
    const username = await getUsername(uid);
    return { uid, isNewUser: false, username: username || undefined };
  }

  return { uid, isNewUser: true };
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthResult> => {
  const googleSignin = await getGoogleSignin();

  // Check if device supports Google Play Services (Android)
  await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  // Sign in with Google
  const signInResult = await googleSignin.signIn();

  // Get ID token
  const idToken = signInResult.data?.idToken;
  if (!idToken) {
    throw new Error("No ID token received from Google");
  }

  // Create Firebase credential
  const credential = GoogleAuthProvider.credential(idToken);

  // Sign in to Firebase
  const userCredential = await signInWithCredential(auth, credential);
  const uid = userCredential.user.uid;

  // Check if user exists in Firestore
  const userExists = await checkUserExists(uid);

  if (userExists) {
    const username = await getUsername(uid);
    return { uid, isNewUser: false, username: username || undefined };
  }

  return { uid, isNewUser: true };
};
