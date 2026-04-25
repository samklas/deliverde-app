import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("daily-reminder", {
      name: "Päivittäinen muistutus",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

// Gets the Expo push token and saves it to Firestore so the backend can send dynamic notifications.
export async function savePushToken(userId: string): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: "d5e813b3-5de7-4c04-a7a5-9b284370f1b7",
    });
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { expoPushToken: token.data });
  } catch {
    // Physical device required for push tokens; silently skip on simulator
  }
}
