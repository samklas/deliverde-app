import { auth, db } from "@/firebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";

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
