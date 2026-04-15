export {
  mapRecipes,
  fetchRecipes,
  getRecipeOfMonth,
  filterFavoriteRecipes,
} from "./recipes.service";

export {
  setDailyTotalForUser,
  setDailyTotalForCurrentUser,
  getDailyTotalForCurrentUser,
  getUserDetails,
  getLeaderboardUsers,
  setLevelForCurrentUser,
  getInviteCodeForCurrentUser,
  type UserDetails,
} from "./users.service";

export { storage } from "./storage.service";

export { loadAppData } from "./appData.service";

export {
  signInWithApple,
  signInWithGoogle,
  signInAnonymous,
  isAnonymousUser,
  reauthenticateWithApple,
  reauthenticateWithGoogle,
  checkUserExists,
  getUsername,
  deleteAccount,
  type AuthResult,
} from "./auth.service";

export {
  analyzeVegetableImage,
  getAnalysisUsage,
  incrementAnalysisCount,
  getRemainingAnalyses,
} from "./vision.service";

export {
  requestNotificationPermissions,
  scheduleDailyReminder,
  cancelDailyReminder,
} from "./notifications.service";

export {
  createGroup,
  joinGroup,
  leaveGroup,
  deleteGroup,
  getUserGroups,
  getGroup,
  getGroupMembers,
  getGroupLeaderboard,
  getGroupLeaderboardEntries,
} from "./groups.service";
