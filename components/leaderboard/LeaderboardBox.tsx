import leaderboardStore from "@/stores/leaderboardStore";
import { theme } from "@/theme";
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
    <TouchableOpacity onPress={() => setIsVisible(true)}>
      <View style={[styles.box, styles.pressableBox]}>
        <Text style={styles.boxTitle}>Kuukauden salaattisankarit</Text>
        {sortedUsers.map((user, i) => (
          <Row
            key={user.uid || i}
            name={user.username}
            totalScore={user.points}
            position={i + 1}
          />
        ))}
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
const Row = ({ name, totalScore, position }: RowProps) => {
  return (
    <View style={styles.leaderboardRow}>
      <Text style={styles.leaderboardPosition}>
        {position}. {name}
      </Text>
      <Text style={styles.leaderboardScore}>{totalScore} pistettä</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
  boxTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  pressableBox: {
    opacity: 1,
    // Add active state styling when pressed
    //  android_ripple: { color: "rgba(0,0,0,0.1)" },
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  leaderboardPosition: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.medium,
  },
  leaderboardName: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  leaderboardScore: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
});

export default LeaderboardBox;
