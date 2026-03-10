import { getUserDetails } from "./users.service";
import userStore from "@/stores/userStore";

export const loadAppData = async (): Promise<void> => {
  const userDetails = await getUserDetails();
  if (userDetails) {
    userStore.setDailyTotal(userDetails.dailyTotal);
    userStore.setDailyTarget(userDetails.dailyTarget);
    userStore.setStreak(userDetails.streak);
    userStore.setAvatarId(userDetails.avatarId);
  }
};
