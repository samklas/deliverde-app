import { Recipe } from "@/types/recipe";
import { makeAutoObservable } from "mobx";

const initRecipe: Recipe = {
  id: "",
  created: "",
  imageUrl: "",
  title: "",
  ingredients: [],
  instructions: "",
  recipeOfMonth: false,
  ratingSum: 0,
  ratingCount: 0,
};

class RecipeStore {
  constructor() {
    makeAutoObservable(this);
  }

  _recipes = {
    recipes: [initRecipe],
    favoriteRecipes: [initRecipe],
    recipeOfMonth: initRecipe,
  };

  get recipes() {
    return this._recipes.recipes;
  }

  setRecipes = (recipes: Recipe[]) => {
    this._recipes.recipes = recipes;
  };

  get favoriteRecipes() {
    return this._recipes.favoriteRecipes;
  }

  setFavoriteRecipes = (recipes: Recipe[]) => {
    this._recipes.favoriteRecipes = recipes;
  };

  get recipeOfMonth() {
    return this._recipes.recipeOfMonth;
  }

  setRecipeOfMonth = (recipe: Recipe) => {
    this._recipes.recipeOfMonth = recipe;
  };

  updateRecipeRating = (recipeId: string, ratingSum: number, ratingCount: number) => {
    const applyRating = (recipe: Recipe): Recipe =>
      recipe.id === recipeId ? { ...recipe, ratingSum, ratingCount } : recipe;

    this._recipes.recipes = this._recipes.recipes.map(applyRating);
    this._recipes.favoriteRecipes = this._recipes.favoriteRecipes.map(applyRating);

    if (this._recipes.recipeOfMonth.id === recipeId) {
      this._recipes.recipeOfMonth = applyRating(this._recipes.recipeOfMonth);
    }
  };
}

const recipeStore = new RecipeStore();
export default recipeStore;
