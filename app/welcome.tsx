import { View, Text, StyleSheet, Pressable } from "react-native";
import { router } from "expo-router";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export default function Welcome() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "20%" }]} />
          </View>
        </View>

        <Text style={styles.title} adjustsFontSizeToFit numberOfLines={2}>Tervetuloa DeliVerde -sovellukseen!</Text>

        <Text style={styles.body}>
  DeliVerde-sovelluksen avulla päivittäisen kasvistavoitteen seuraamisesta tulee helppoa ja hauskaa!

</Text>
<Text style={styles.body}>
  Sovelluksen avulla voit seurata syömiäsi kasviksia ja halutessasi haastaa
  perheenjäsenet tai kaverit mukaan yhteiseen tavoitteeseen - unohtamatta herkullisia kasvispainoitteisia reseptejä.
</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.continueButton} onPress={() => router.push("/info")}>
          <Text style={styles.continueButtonText}>Aloitetaan!</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  progressContainer: {
    width: "100%",
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
  iconContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: "rgba(55, 137, 28, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
    lineHeight: 36,
  },
  body: {
    fontSize: 15,
    fontFamily: theme.fontFamily.regular,
    color: "#555",
    textAlign: "center",
    lineHeight: 24,
  },
  buttonContainer: {
    padding: theme.spacing.medium,
    paddingBottom: 40,
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
