import { useState, useEffect } from "react";
import { Recipe } from "@/types/recipe";
import { fetchRecipes, getRecipeOfMonth } from "@/services";

export const useRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeOfMonth, setRecipeOfMonth] = useState<Recipe | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadRecipes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRecipes = await fetchRecipes();
      setRecipes(fetchedRecipes);
      setRecipeOfMonth(getRecipeOfMonth(fetchedRecipes));
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch recipes"));
      console.error("Error fetching recipes:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  return {
    recipes,
    recipeOfMonth,
    isLoading,
    error,
    refetch: loadRecipes,
  };
};
