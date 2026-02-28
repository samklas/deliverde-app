import React, { useCallback, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Text } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { auth } from "@/firebaseConfig";
import { getGroupLeaderboard, getGroupLeaderboardEntries } from "@/services";
import { GroupLeaderboard as GroupLeaderboardType, GroupLeaderboardEntry } from "@/types/groups";
import GroupLeaderboard from "@/components/groups/GroupLeaderboard";
import { theme } from "@/theme";

export default function GroupLeaderboardScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const currentUserId = auth.currentUser?.uid;

  const [leaderboard, setLeaderboard] = useState<GroupLeaderboardType | null>(null);
  const [entries, setEntries] = useState<GroupLeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = async () => {
    if (!groupId) return;
    try {
      setIsLoading(true);
      const lb = await getGroupLeaderboard(groupId);
      if (lb) {
        const lbEntries = await getGroupLeaderboardEntries(groupId, lb.id);
        setLeaderboard(lb);
        setEntries(lbEntries);
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLeaderboard();
    }, [groupId])
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#37891C" />
      </View>
    );
  }

  if (!leaderboard) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Tulostaulua ei löytynyt</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GroupLeaderboard
        leaderboard={leaderboard}
        entries={entries}
        currentUserId={currentUserId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  emptyText: {
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
  },
});
