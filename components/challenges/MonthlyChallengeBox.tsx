import React from "react";
import { theme } from "@/theme";
import { View, Text, StyleSheet } from "react-native";

const MonthlyChallengeBox = () => {
  return (
    <View style={styles.box}>
      <Text style={styles.boxTitle}>Kuukauden haaste</Text>
      <Text style={styles.challengeText}>
        TODO: minkälaisia kuukauden haasteita?
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: "60%" }]} />
      </View>
      <Text style={styles.progressText}>3/5 suoritettu</Text>
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
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  challengeText: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.small,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
});

export default MonthlyChallengeBox;
