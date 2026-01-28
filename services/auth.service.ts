import { auth, db } from "@/firebaseConfig";
import {
  signInWithCredential,
  reauthenticateWithCredential,
  OAuthProvider,
  GoogleAuthProvider,
  deleteUser,
} from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
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
  console.log("[GoogleSignIn] Starting sign in process...");

  try {
    console.log("[GoogleSignIn] Loading Google Sign-In module...");
    const googleSignin = await getGoogleSignin();
    console.log("[GoogleSignIn] Module loaded successfully");

    console.log("[GoogleSignIn] Config:", {
      webClientId: Constants.expoConfig?.extra?.googleWebClientId ? "SET" : "NOT SET",
      iosClientId: Constants.expoConfig?.extra?.googleIosClientId ? "SET" : "NOT SET",
    });

    // Check if device supports Google Play Services (Android)
    console.log("[GoogleSignIn] Checking Play Services...");
    await googleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    console.log("[GoogleSignIn] Play Services available");

    // Sign in with Google
    console.log("[GoogleSignIn] Initiating Google sign in...");
    const signInResult = await googleSignin.signIn();
    console.log("[GoogleSignIn] Sign in result received:", {
      type: signInResult.type,
      hasData: !!signInResult.data,
      hasIdToken: !!signInResult.data?.idToken,
    });

    // Get ID token
    const idToken = signInResult.data?.idToken;
    if (!idToken) {
      console.error("[GoogleSignIn] No ID token in result:", JSON.stringify(signInResult, null, 2));
      throw new Error("No ID token received from Google");
    }
    console.log("[GoogleSignIn] ID token received");

    // Create Firebase credential
    console.log("[GoogleSignIn] Creating Firebase credential...");
    const credential = GoogleAuthProvider.credential(idToken);

    // Sign in to Firebase
    console.log("[GoogleSignIn] Signing in to Firebase...");
    const userCredential = await signInWithCredential(auth, credential);
    const uid = userCredential.user.uid;
    console.log("[GoogleSignIn] Firebase sign in successful, uid:", uid);

    // Check if user exists in Firestore
    console.log("[GoogleSignIn] Checking if user exists in Firestore...");
    const userExists = await checkUserExists(uid);
    console.log("[GoogleSignIn] User exists:", userExists);

    if (userExists) {
      const username = await getUsername(uid);
      console.log("[GoogleSignIn] Returning existing user");
      return { uid, isNewUser: false, username: username || undefined };
    }

    console.log("[GoogleSignIn] Returning new user");
    return { uid, isNewUser: true };
  } catch (error: any) {
    console.error("[GoogleSignIn] Error occurred:", {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Re-authenticate with Apple
 */
export const reauthenticateWithApple = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }

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

  // Re-authenticate
  await reauthenticateWithCredential(user, credential);
};

/**
 * Re-authenticate with Google
 */
export const reauthenticateWithGoogle = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }

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

  // Re-authenticate
  await reauthenticateWithCredential(user, credential);
};

/**
 * Delete user account and associated data
 */
export const deleteAccount = async (): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("No authenticated user");
  }

  // Delete user document from Firestore
  const userRef = doc(db, "users", user.uid);
  await deleteDoc(userRef);

  // Delete from leaderboard if exists
  const leaderboardRef = doc(db, "leaderboard", user.uid);
  await deleteDoc(leaderboardRef);

  // Delete Firebase Auth account
  await deleteUser(user);
};
