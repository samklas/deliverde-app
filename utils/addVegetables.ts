import { db } from "@/firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { vegetables } from "@/data/vegetables";

export const addVegetablesToFirestore = async () => {
  try {
    const vegetablesCollection = collection(db, "vegetables");

    // Add each vegetable to the collection
    for (const vegetable of vegetables) {
      await addDoc(vegetablesCollection, {
        name: vegetable.name,
        averageWeight: vegetable.averageWeight,
        createdAt: new Date(),
      });
    }

    console.log("Successfully added vegetables to Firestore");
    return true;
  } catch (error) {
    console.error("Error adding vegetables to Firestore:", error);
    return false;
  }
};
