import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { Recipe } from "@/types/recipe";
import { filterFavoriteRecipes } from "@/services";

export const useFavorites = (recipes: Recipe[]) => {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const usersRef = collection(db, `users/${userId}`, "favoriteRecipes");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      const ids = snapshot.docs.map((doc) => doc.id);
      setFavoriteIds(ids);
      setFavoriteRecipes(filterFavoriteRecipes(recipes, ids));
    });

    return () => unsubscribe();
  }, [recipes]);

  return { favoriteIds, favoriteRecipes };
};
