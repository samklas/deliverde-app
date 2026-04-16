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
}

const recipeStore = new RecipeStore();
export default recipeStore;
