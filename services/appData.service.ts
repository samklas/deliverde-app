import { fetchRecipes, getRecipeOfMonth } from "./recipes.service";
import { getUserDetails, getLeaderboardUsers } from "./users.service";
import recipeStore from "@/stores/recipeStore";
import userStore from "@/stores/userStore";
import leaderboardStore from "@/stores/leaderboardStore";

export const loadAppData = async (): Promise<void> => {
  const [recipes, userDetails, leaderboardUsers] = await Promise.all([
    fetchRecipes(),
    getUserDetails(),
    getLeaderboardUsers(),
  ]);

  // Populate recipe store
  recipeStore.setRecipes(recipes);
  const monthRecipe = getRecipeOfMonth(recipes);
  if (monthRecipe) {
    recipeStore.setRecipeOfMonth(monthRecipe);
  }

  // Populate user store
  if (userDetails) {
    userStore.setDailyTotal(userDetails.dailyTotal);
    userStore.setDailyTarget(userDetails.dailyTarget);
    userStore.setStreak(userDetails.streak);
    userStore.setAvatarId(userDetails.avatarId);
  }

  // Populate leaderboard store
  leaderboardStore.setUsers(leaderboardUsers);
};
