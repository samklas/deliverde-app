import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { theme } from "@/theme";
import React from "react";

export default function Info() {
  const handleContinue = () => {
    router.push("/email");
  };

  const infoItems = [
    {
      title: "Seuraa kasvisten kulutusta",
      description: "Kirjaa syömäsi kasvikset ja kerää pisteitä jokaisesta 100 grammasta.",
    },
    {
      title: "Saavuta päivittäinen tavoite",
      description: "Valitse oma kasvistavoitteesi ja ansaitse bonuspisteitä kun saavutat sen.",
    },
    {
      title: "Kilpaile kavereita vastaan",
      description: "Vertaa pisteitäsi muihin ja nouse tulostaulun kärkeen.",
    },
    {
      title: "Löydä uusia reseptejä",
      description: "Selaa reseptejä ja saa inspiraatiota kasvispitoiseen ruokavalioon.",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "25%" }]} />
          </View>
        </View>

        <Text style={styles.title}>Tervetuloa!</Text>
        <Text style={styles.subtitle}>Näin Deliverde toimii</Text>

        {/* Info cards */}
        <View style={styles.infoContainer}>
          {infoItems.map((item, index) => (
            <View key={index} style={styles.infoCard}>
              <View style={styles.infoNumber}>
                <Text style={styles.infoNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>{item.title}</Text>
                <Text style={styles.infoDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Continue button */}
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>Jatka</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  scrollContent: {
    padding: theme.spacing.medium,
    paddingTop: 100,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#37891C",
    borderRadius: 5,
  },
  infoContainer: {
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#37891C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoNumberText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.bold,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: "#37891C",
    padding: 18,
    borderRadius: theme.borderRadius.large,
    alignItems: "center",
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
  },
});
