import { auth, db } from "@/firebaseConfig";
import { doc, updateDoc, getDoc, collection, getDocs, increment } from "firebase/firestore";
import { LEVEL_TARGETS } from "@/constants";

export const IMAGE_ANALYSIS_DAILY_LIMIT = 5;

const getTodayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const getImageAnalysisUsageToday = async (): Promise<number> => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User is not authenticated");

  const userDoc = await getDoc(doc(db, "users", uid));
  const data = userDoc.data();
  if (!data) return 0;

  const today = getTodayDateString();
  if (data.imageAnalysisDate !== today) return 0;

  return data.imageAnalysisCount ?? 0;
};

export const incrementImageAnalysisUsage = async (): Promise<void> => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("User is not authenticated");

  const userRef = doc(db, "users", uid);
  const today = getTodayDateString();

  const userDoc = await getDoc(userRef);
  const data = userDoc.data();

  if (data?.imageAnalysisDate === today) {
    await updateDoc(userRef, { imageAnalysisCount: increment(1) });
  } else {
    await updateDoc(userRef, { imageAnalysisDate: today, imageAnalysisCount: 1 });
  }
};
import { LeaderboardUser } from "@/types/users";

export const setDailyTotalForUser = async (
  uid: string,
  dailyTotal: number
): Promise<void> => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { dailyTotal });
};

export const setDailyTotalForCurrentUser = async (
  dailyTotal: number
): Promise<void> => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("User is not authenticated");
  }
  await setDailyTotalForUser(uid, dailyTotal);
};

export const getDailyTotalForCurrentUser = async (): Promise<number> => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("User is not authenticated");
  }

  const userRef = doc(db, "users", uid);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) {
    throw new Error("User document not found");
  }

  return userDoc.data().dailyTotal ?? 0;
};

export type UserDetails = {
  dailyTotal: number;
  dailyTarget: number;
  streak: number;
  avatarId: string;
};

export const getUserDetails = async (): Promise<UserDetails | null> => {
  const userId = auth.currentUser?.uid;
  if (!userId) return null;

  const userDoc = await getDoc(doc(db, "users", userId));
  const userData = userDoc.data();

  if (!userData) return null;

  return {
    dailyTotal: userData.dailyTotal ?? 0,
    dailyTarget: LEVEL_TARGETS[userData.level] ?? 800,
    streak: userData.streak ?? 0,
    avatarId: userData.avatarId ?? "",
  };
};

export const getLeaderboardUsers = async (): Promise<LeaderboardUser[]> => {
  const querySnapshot = await getDocs(collection(db, "leaderboard"));
  return querySnapshot.docs.map((doc) => ({
    uid: doc.data().uid,
    avatarId: doc.data().avatarId,
    username: doc.data().username,
    points: doc.data().points,
  }));
};

export const setLevelForCurrentUser = async (level: string): Promise<void> => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("User is not authenticated");
  }
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { level });
};

export const getInviteCodeForCurrentUser = async (): Promise<string | null> => {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return null;
  }

  const userDoc = await getDoc(doc(db, "users", uid));
  const userData = userDoc.data();

  if (!userData) return null;

  return userData.inviteCode ?? null;
};
