import { useState, useEffect } from "react";
import { getUserDetails, getLeaderboardUsers, UserDetails } from "@/services";
import { LeaderboardUser } from "@/types/users";
import userStore from "@/stores/userStore";
import leaderboardStore from "@/stores/leaderboardStore";

export const useUserData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadUserData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userDetails, leaderboardUsers] = await Promise.all([
        getUserDetails(),
        getLeaderboardUsers(),
      ]);

      if (userDetails) {
        userStore.setDailyTotal(userDetails.dailyTotal);
        userStore.setDailyTarget(userDetails.dailyTarget);
        userStore.setStreak(userDetails.streak);
        userStore.setAvatarId(userDetails.avatarId);
      }

      leaderboardStore.setUsers(leaderboardUsers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load user data"));
      console.error("Error loading user data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return {
    isLoading,
    error,
    refetch: loadUserData,
  };
};
