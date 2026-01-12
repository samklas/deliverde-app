import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { auth } from "@/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { router } from "expo-router";
import { storage, loadAppData } from "@/services";
import { STORAGE_KEYS } from "@/constants";
import { theme } from "@/theme";
import React from "react";

export default function UserLevel() {
  const [username, setUsername] = useState("");
  const [avatarId, setAvatarId] = useState("");
  const [level, setLevel] = useState("beginner");
  const [isLoading, setIsLoading] = useState(false);

  // Load onboarding data from storage
  useEffect(() => {
    const loadOnboardingData = async () => {
      const savedUsername = await storage.get(STORAGE_KEYS.ONBOARDING_USERNAME);
      const savedAvatar = await storage.get(STORAGE_KEYS.ONBOARDING_AVATAR);
      if (savedUsername) setUsername(savedUsername);
      if (savedAvatar) setAvatarId(savedAvatar);
    };
    loadOnboardingData();
  }, []);

  const levels = [
    { id: "beginner", name: "Aloittelija", target: "300g", description: "Satunnainen haukkailija" },
    { id: "intermediate", name: "Mestari", target: "500g", description: "Vihannesmestari" },
    { id: "advanced", name: "Legenda", target: "800g", description: "Vihreä legenda" },
  ];

  const addUser = async () => {
    const uid = auth.currentUser?.uid;

    if (!uid) {
      Alert.alert("Virhe", "Käyttäjää ei löytynyt");
      return;
    }

    if (!username || !avatarId) {
      Alert.alert("Virhe", "Tietoja puuttuu. Palaa takaisin ja täytä kaikki kentät.");
      return;
    }

    setIsLoading(true);
    try {
      await setDoc(doc(db, "users", uid), {
        username: username,
        level: level,
        createdAt: new Date(),
        uid: uid,
        dailyTotal: 0,
        score: 0,
        streak: 0,
        avatarId: avatarId,
      });

      await setDoc(doc(db, "leaderboard", uid), {
        username: username,
        uid: uid,
        avatarId: avatarId,
        points: 0,
      });

      await storage.multiSet([
        [STORAGE_KEYS.USER_ID, uid],
        [STORAGE_KEYS.USERNAME, username],
      ]);

      // Clear onboarding data
      await storage.multiRemove([
        STORAGE_KEYS.ONBOARDING_USERNAME,
        STORAGE_KEYS.ONBOARDING_AVATAR,
      ]);

      await loadAppData();

      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error adding user:", error);
      Alert.alert("Virhe", "Käyttäjätietojen tallentaminen epäonnistui");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <View style={styles.overlay}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.title}>Valitse taso</Text>
          <Text style={styles.subtitle}>Mikä on päivittäinen tavoitteesi?</Text>

          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressDot, styles.progressDotCompleted]} />
            <View style={[styles.progressLine, styles.progressLineActive]} />
            <View style={[styles.progressDot, styles.progressDotActive]} />
          </View>

          {/* Level Selection */}
          <View style={styles.card}>
            <Text style={styles.helperText}>
              Taso määrittää päivittäisen vihannestauvoitteesi. Voit muuttaa tätä myöhemmin profiilissasi.
            </Text>
            <View style={styles.levelButtons}>
              {levels.map((lvl) => (
                <Pressable
                  key={lvl.id}
                  style={[
                    styles.levelButton,
                    level === lvl.id && styles.selectedLevel,
                  ]}
                  onPress={() => setLevel(lvl.id)}
                >
                  <View style={styles.levelContent}>
                    <View style={styles.levelHeader}>
                      <Text
                        style={[
                          styles.levelName,
                          level === lvl.id && styles.selectedLevelText,
                        ]}
                      >
                        {lvl.description}
                      </Text>
                      <View style={[
                        styles.targetBadge,
                        level === lvl.id && styles.selectedTargetBadge,
                      ]}>
                        <Text style={[
                          styles.targetText,
                          level === lvl.id && styles.selectedTargetText,
                        ]}>
                          {lvl.target}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
              onPress={addUser}
              disabled={isLoading}
            >
              <Text style={styles.continueButtonText}>
                {isLoading ? "Tallennetaan..." : "Valmis"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
  );
}

const styles = StyleSheet.create({

  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    padding: theme.spacing.medium,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
  },
  progressDotActive: {
    backgroundColor: "#37891C",
  },
  progressDotCompleted: {
    backgroundColor: "#37891C",
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 8,
  },
  progressLineActive: {
    backgroundColor: "#37891C",
  },
  card: {
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
  helperText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  levelButtons: {
    gap: 12,
  },
  levelButton: {
    backgroundColor: "#fafafa",
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  selectedLevel: {
    backgroundColor: "#37891C",
    borderColor: "#37891C",
  },
  levelContent: {
    flexDirection: "column",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.text,
  },
  selectedLevelText: {
    color: "white",
  },
  targetBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedTargetBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  targetText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  selectedTargetText: {
    color: "white",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  backButton: {
    flex: 1,
    padding: 18,
    borderRadius: theme.borderRadius.large,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  continueButton: {
    flex: 2,
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
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
