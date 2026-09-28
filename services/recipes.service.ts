import { collection, getDocs, query, where, DocumentData, QuerySnapshot, doc, runTransaction } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { Recipe } from "@/types/recipe";
import { getImageUrl } from "@/utils/utils";

export const mapRecipes = async (
  querySnapshot: QuerySnapshot<DocumentData, DocumentData>
): Promise<Recipe[]> => {
  const recipes: Recipe[] = [];
  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const recipe: Recipe = {
      id: doc.id,
      created: data.created,
      imageUrl: await getImageUrl(data.imageUrl),
      title: data.title,
      ingredients: data.ingredients,
      instructions: data.instructions,
      recipeOfMonth: data.recipeOfMonth,
      ratingSum: data.ratingSum ?? 0,
      ratingCount: data.ratingCount ?? 0,
    };
    recipes.push(recipe);
  }
  return recipes;
};

export const fetchRecipes = async (): Promise<Recipe[]> => {
  const querySnapshot = await getDocs(collection(db, "recipes"));
  return mapRecipes(querySnapshot);
};

export const getRecipeOfMonth = (recipes: Recipe[]): Recipe | undefined => {
  return recipes.find((recipe) => recipe.recipeOfMonth);
};

export const fetchRecipeOfMonth = async (): Promise<Recipe | undefined> => {
  const q = query(collection(db, "recipes"), where("recipeOfMonth", "==", true));
  const querySnapshot = await getDocs(q);
  const results = await mapRecipes(querySnapshot);
  return results[0];
};

export const filterFavoriteRecipes = (
  recipes: Recipe[],
  favoriteRecipeIds: string[]
): Recipe[] => {
  return recipes.filter((recipe) => favoriteRecipeIds.includes(recipe.id));
};

export const getAverageRating = (recipe: Recipe): number => {
  if (!recipe.ratingCount) return 0;
  return recipe.ratingSum / recipe.ratingCount;
};

export const rateRecipe = async (recipeId: string, value: number): Promise<void> => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    throw new Error("User must be signed in to rate a recipe");
  }

  const recipeRef = doc(db, "recipes", recipeId);
  const userRatingRef = doc(db, `users/${userId}/recipeRatings/${recipeId}`);

  await runTransaction(db, async (transaction) => {
    const recipeSnap = await transaction.get(recipeRef);
    const userRatingSnap = await transaction.get(userRatingRef);

    const previousValue = userRatingSnap.exists() ? userRatingSnap.data().value : 0;
    const currentSum = recipeSnap.data()?.ratingSum ?? 0;
    const currentCount = recipeSnap.data()?.ratingCount ?? 0;

    const newSum = currentSum - previousValue + value;
    const newCount = userRatingSnap.exists() ? currentCount : currentCount + 1;

    transaction.set(userRatingRef, { value, ratedAt: new Date() });
    transaction.update(recipeRef, { ratingSum: newSum, ratingCount: newCount });
  });
};
