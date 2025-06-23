import { storage } from "@/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

export const getImageUrl = async (url: string) => {
  const refrence = ref(storage, url);
  const imageUrl = await getDownloadURL(refrence);
  return imageUrl;
};

export const getCurrentYearMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // getMonth() antaa 0-11
  const formatted = `${year}-${month}`;

  return formatted;
};
