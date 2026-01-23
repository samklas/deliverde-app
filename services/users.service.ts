import { auth, db } from "@/firebaseConfig";
import { doc, updateDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { LEVEL_TARGETS } from "@/constants";
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
