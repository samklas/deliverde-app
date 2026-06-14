import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { MonthlyPrize } from "@/types/prize";

export const getCurrentMonthId = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
};

export const getCurrentMonthPrize = async (): Promise<MonthlyPrize | null> => {
  const monthId = getCurrentMonthId();
  const snapshot = await getDoc(doc(db, "monthlyPrizes", monthId));

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  console.log("Fetched monthly prize data:", data);
  if (!data.active) return null;

  return {
    id: monthId,
    active: data.active,
    title: data.title,
    description: data.description,
    prizeName: data.prizeName,
  };
};
