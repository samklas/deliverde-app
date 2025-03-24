import { storage } from "@/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

export const getImageUrl = async (url: string) => {
  const refrence = ref(storage, url);
  const imageUrl = await getDownloadURL(refrence);
  return imageUrl;
};
