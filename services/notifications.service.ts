import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const REMINDER_NOTIFICATION_ID_KEY = "dailyReminderNotificationId";

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

async function isReminderScheduled(): Promise<boolean> {
  const id = await AsyncStorage.getItem(REMINDER_NOTIFICATION_ID_KEY);
  if (!id) return false;

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  return scheduled.some((n) => n.identifier === id);
}

// Schedules a daily repeating notification at 8 PM if not already scheduled.
// Call this when the daily goal is not yet met.
export async function scheduleDailyReminder(): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") return;

  if (await isReminderScheduled()) return;

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Muista päivän tavoitteesi! 🥦",
      body: "Avaa sovellus ja lisää tämän päivän kasvikset.",
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 10,
    },
  });

  await AsyncStorage.setItem(REMINDER_NOTIFICATION_ID_KEY, id);
}

// Cancels the daily reminder. Call this when the daily goal is achieved.
export async function cancelDailyReminder(): Promise<void> {
  const id = await AsyncStorage.getItem(REMINDER_NOTIFICATION_ID_KEY);
  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(REMINDER_NOTIFICATION_ID_KEY);
  }
}
