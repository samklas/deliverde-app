import { Redirect } from "expo-router";
import { auth } from "@/firebaseConfig";

export default function Index() {
  // Auth state is already checked in _layout.tsx during splash
  // This is just a fallback redirect
  if (auth.currentUser) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/login" />;
}
