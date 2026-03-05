import React from "react";
import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { GroupLeaderboard as GroupLeaderboardType, GroupLeaderboardEntry } from "@/types/groups";

type Props = {
  leaderboard: GroupLeaderboardType;
  entries: GroupLeaderboardEntry[];
  currentUserId?: string;
};

const getAvatar = (avatarId: string) => {
  if (avatarId === "1") {
    return require("../../assets/images/avatar2.jpg");
  }
  if (avatarId === "2") {
    return require("../../assets/images/avatar3.jpg");
  }
  if (avatarId === "3") {
    return require("../../assets/images/avatar4.jpg");
  }
  if (avatarId === "4") {
    return require("../../assets/images/avatar5.png");
  }
  return require("../../assets/images/avatar2.jpg");
};

const GroupLeaderboard = ({
  leaderboard,
  entries,
  currentUserId,
}: Props) => {
  const currentUserIndex = entries.findIndex((e) => e.uid === currentUserId);
  const displayEntries = entries.slice(0, 10);
  const isCurrentUserInTop10 = currentUserIndex >= 0 && currentUserIndex < 10;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color="#37891C" />
        <Text style={styles.title}>{leaderboard.name}</Text>
      </View>

      {currentUserIndex !== -1 && (
        <View style={styles.currentUserCard}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankNumber}>#{currentUserIndex + 1}</Text>
          </View>
          <View style={styles.currentUserInfo}>
            <Text style={styles.currentUserLabel}>Oma sijoitus</Text>
            <Text style={styles.currentUserPoints}>
              {entries[currentUserIndex].points} pistettä
            </Text>
          </View>
        </View>
      )}

      <View style={styles.divider} />

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {displayEntries.map((entry, index) => (
          <View
            key={entry.uid}
            style={[
              styles.entryRow,
              entry.uid === currentUserId && styles.currentUserHighlight,
            ]}
          >
            <Text style={styles.position}>{index + 1}.</Text>
            <Image source={getAvatar(entry.avatarId)} style={styles.avatar} />
            <Text style={styles.username} numberOfLines={1}>
              {entry.username}
            </Text>
            <Text style={styles.points}>{entry.points} p</Text>
          </View>
        ))}

        {/* Show current user if outside top 10 */}
        {!isCurrentUserInTop10 && currentUserIndex !== -1 && (
          <>
            <View style={styles.divider} />
            <View style={[styles.entryRow, styles.currentUserHighlight]}>
              <Text style={styles.position}>{currentUserIndex + 1}.</Text>
              <Image
                source={getAvatar(entries[currentUserIndex].avatarId)}
                style={styles.avatar}
              />
              <Text style={styles.username} numberOfLines={1}>
                {entries[currentUserIndex].username}
              </Text>
              <Text style={styles.points}>
                {entries[currentUserIndex].points} p
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  currentUserCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(55, 137, 28, 0.08)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#37891C",
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#37891C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    color: "white",
    fontSize: 14,
    fontFamily: theme.fontFamily.bold,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserLabel: {
    fontSize: 12,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    marginBottom: 2,
  },
  currentUserPoints: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginBottom: 12,
  },
  list: {
    maxHeight: 350,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  currentUserHighlight: {
    backgroundColor: "rgba(55, 137, 28, 0.08)",
  },
  position: {
    width: 28,
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  username: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    color: "#2d3436",
  },
  points: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
});

export default GroupLeaderboard;
