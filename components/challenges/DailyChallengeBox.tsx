import userStore from "@/stores/userStore";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const DailyChallengeBox = observer(() => {
  const { dailyTotal, dailyTarget, streak } = userStore;
  return (
    <View style={styles.combinedBox}>
      {streak > 1 && (
        <View>
          <View style={styles.streakHeader}>
            <Ionicons name="leaf" size={24} color="#37891C" />
            <Text style={styles.streakCount}>{streak} päivän putki!</Text>
          </View>
          <Text style={styles.streakSubtext}>Jatka hyvää työtä!</Text>

          <View style={styles.goalsDivider} />
        </View>
      )}
      <Text style={styles.boxTitle}>Päivän tavoite</Text>
      <View style={styles.goalRow}>
        <Ionicons
          name={
            dailyTotal >= dailyTarget ? "checkmark-circle" : "radio-button-off"
          }
          size={24}
          color="#37891C"
        />
        <Text style={styles.goalText}>Syö {dailyTarget}g vihanneksia</Text>
      </View>
    </View>
  );
});

export default DailyChallengeBox;

const styles = StyleSheet.create({
  combinedBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: 20,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#37891C",
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  streakCount: {
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
    marginLeft: theme.spacing.small,
    color: theme.colors.primary,
  },
  streakSubtext: {
    color: "#666",
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    marginBottom: 4,
  },
  goalsDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: theme.spacing.medium,
  },
  boxTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
    paddingLeft: 4,
  },
  goalText: {
    marginLeft: theme.spacing.small,
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
});
