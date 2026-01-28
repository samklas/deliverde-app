import leaderboardStore from "@/stores/leaderboardStore";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LeaderboardModal from "./LeaderboardModal";
import React from "react";

const LeaderboardBox = observer(() => {
  const { setIsVisible, users } = leaderboardStore;
  const sortedUsers = users.slice(0, 3);

  // Only render if we have valid users with non-empty uids
  //if (!users.length || !users[0].uid) return null;

  return (
    <TouchableOpacity onPress={() => setIsVisible(true)} activeOpacity={0.8}>
      <View style={styles.box}>
        <View style={styles.headerRow}>
          <View style={styles.titleContainer}>
            
            <Text style={styles.boxTitle}>Kuukauden salaattisankarit</Text>
          </View>
        </View>
        <View style={styles.leaderboardList}>
          {sortedUsers.map((user, i) => (
            <Row
              key={user.uid || i}
              name={user.username}
              totalScore={user.points}
              position={i + 1}
            />
          ))}
        </View>
      </View>
      <LeaderboardModal />
    </TouchableOpacity>
  );
});

type RowProps = {
  name: string;
  totalScore: number;
  position: number;
};

const getMedalColor = (position: number) => {
  switch (position) {
    case 1: return "#37891C"; // Gold
    case 2: return "#37891C"; // Silver
    case 3: return "#37891C"; // Bronze
    default: return "#999";
  }
};

const Row = ({ name, totalScore, position }: RowProps) => {
  const medalColor = getMedalColor(position);

  return (
    <View style={[styles.leaderboardRow, position === 1 && styles.firstPlaceRow]}>
      <View style={styles.positionContainer}>
        <View style={[styles.positionBadge, { backgroundColor: medalColor }]}>
          <Text style={styles.positionNumber}>{position}</Text>
        </View>
        <Text style={[styles.leaderboardName, position === 1 && styles.firstPlaceName]}>
          {name}
        </Text>
      </View>
      <View style={styles.scoreContainer}>
        <Text style={styles.leaderboardScore}>{totalScore}</Text>
        <Text style={styles.scoreLabel}>pistettä</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
   
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.medium,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trophyIcon: {
    marginRight: 8,
  },
  boxTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  leaderboardList: {
    gap: 8,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(55, 137, 28, 0.04)",
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.small,
  },
  firstPlaceRow: {
    backgroundColor: "rgba(55, 137, 28, 0.04)",
  },
  positionContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  positionBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  positionNumber: {
    fontSize: 13,
    fontFamily: theme.fontFamily.bold,
    color: "white",
  },
  leaderboardName: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
  firstPlaceName: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
  scoreContainer: {
    alignItems: "flex-end",
  },
  leaderboardScore: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  scoreLabel: {
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: "#888",
  },
});

export default LeaderboardBox;
