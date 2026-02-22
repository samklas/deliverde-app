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

export { analyzeVegetableImage } from "./vision.service";

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

export {
  createCompetition,
  joinCompetition,
  leaveCompetition,
  deleteCompetition,
  getCompetitionsForGroup,
  getCompetition,
  getCompetitionGroups,
  getCompetitionRankings,
} from "./competitions.service";
