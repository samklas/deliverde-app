import { collection, getDocs, DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "@/firebaseConfig";
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

export const filterFavoriteRecipes = (
  recipes: Recipe[],
  favoriteRecipeIds: string[]
): Recipe[] => {
  return recipes.filter((recipe) => favoriteRecipeIds.includes(recipe.id));
};
