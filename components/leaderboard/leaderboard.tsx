import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { observer } from "mobx-react-lite";
import leaderboardStore from "@/stores/leaderboardStore";
import { auth } from "@/firebaseConfig";
import React from "react";

const LeaderboardTab = observer(() => {
  const { users } = leaderboardStore;
  const currentUserId = auth.currentUser?.uid;

  // Find current user's position
  const currentUserIndex = users.findIndex(
    (user) => user.uid === currentUserId
  );
  const isCurrentUserInTop10 = currentUserIndex < 10;

  if (!users.length || !users[0]?.username) {
    return (
      <View style={styles.overlay}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ladataan tulostaulua...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Kuukauden salaattisankarit</Text>

        {/* Highlight current user's position */}
        {currentUserIndex !== -1 && (
          <View style={styles.currentUserCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>#{currentUserIndex + 1}</Text>
            </View>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserLabel}>Oma sijoitus</Text>
              <Text style={styles.currentUserPoints}>
                {users[currentUserIndex]?.points} pistettä
              </Text>
            </View>
            <Ionicons name="trophy-outline" size={24} color="#37891C" />
          </View>
        )}

        <View style={styles.box}>
          {/* Map users by position between 1-10 */}
          {users.slice(0, 10).map((user, index) => (
            <View
              key={user.uid || index}
              style={[
                styles.leaderboardRow,
                user.uid === currentUserId && styles.currentUserHighlight,
              ]}
            >
              <Text style={styles.leaderboardPosition}>
                {index + 1}. {user.username}
              </Text>
              <Text style={styles.leaderboardScore}>
                {user.points} pistettä
              </Text>
            </View>
          ))}

          {/* Show current user's position if outside top 10 */}
          {!isCurrentUserInTop10 && currentUserIndex !== -1 && (
            <View>
              <View style={styles.divider} />
              <View style={[styles.leaderboardRow, styles.currentUserHighlight]}>
                <Text style={styles.leaderboardPosition}>
                  {currentUserIndex + 1}. {users[currentUserIndex].username}
                </Text>
                <Text style={styles.leaderboardScore}>
                  {users[currentUserIndex].points} pistettä
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
});

export default LeaderboardTab;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.medium,
  },
  title: {
    fontSize: theme.fonts.title.fontSize,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: theme.spacing.large,
  },
  box: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
    padding: theme.spacing.small,
  },
  leaderboardPosition: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.primary,
  },
  leaderboardScore: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  currentUserHighlight: {
    backgroundColor: "rgba(12, 76, 37, 0.1)",
    borderRadius: theme.borderRadius.medium,
  },
  currentUserCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(55, 137, 28, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: theme.spacing.medium,
    borderLeftWidth: 4,
    borderLeftColor: "#37891C",
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#37891C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rankNumber: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.bold,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserLabel: {
    fontSize: 13,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    marginBottom: 2,
  },
  currentUserPoints: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: theme.spacing.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
});
