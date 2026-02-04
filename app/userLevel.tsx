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
import { doc, setDoc, getDocs, query, collection, where, updateDoc, increment } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { generateUniqueUserInviteCode } from "@/utils/inviteCode";
import { router } from "expo-router";

// Increment referral count for the user who owns the invite code
const incrementReferralCount = async (inviteCode: string): Promise<void> => {
  const q = query(collection(db, "users"), where("inviteCode", "==", inviteCode));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const referrerDoc = snapshot.docs[0];
    await updateDoc(doc(db, "users", referrerDoc.id), {
      referralCount: increment(1),
    });
  }
};
import { storage, loadAppData } from "@/services";
import { STORAGE_KEYS } from "@/constants";
import { theme } from "@/theme";
import LevelSelector from "@/components/LevelSelector";
import React from "react";

export default function UserLevel() {
  const [username, setUsername] = useState("");
  const [avatarId, setAvatarId] = useState("");
  const [email, setEmail] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [level, setLevel] = useState("beginner");
  const [isLoading, setIsLoading] = useState(false);

  // Load onboarding data from storage
  useEffect(() => {
    const loadOnboardingData = async () => {
      const savedUsername = await storage.get(STORAGE_KEYS.ONBOARDING_USERNAME);
      const savedAvatar = await storage.get(STORAGE_KEYS.ONBOARDING_AVATAR);
      const savedEmail = await storage.get(STORAGE_KEYS.ONBOARDING_EMAIL);
      const savedFriendCode = await storage.get(STORAGE_KEYS.ONBOARDING_FRIEND_CODE);
      if (savedUsername) setUsername(savedUsername);
      if (savedAvatar) setAvatarId(savedAvatar);
      if (savedEmail) setEmail(savedEmail);
      if (savedFriendCode) setFriendCode(savedFriendCode);
    };
    loadOnboardingData();
  }, []);

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
      // Generate unique invite code for this user
      const inviteCode = await generateUniqueUserInviteCode();

      await setDoc(doc(db, "users", uid), {
        username: username,
        level: level,
        createdAt: new Date(),
        uid: uid,
        dailyTotal: 0,
        score: 0,
        streak: 0,
        avatarId: avatarId,
        inviteCode: inviteCode,
        referralCount: 0,
        ...(email && { email: email }),
        ...(friendCode && { referredBy: friendCode }),
      });

      // Increment referral count for the user who shared the invite code
      if (friendCode) {
        await incrementReferralCount(friendCode);
      }

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
        STORAGE_KEYS.ONBOARDING_EMAIL,
        STORAGE_KEYS.ONBOARDING_FRIEND_CODE,
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
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Progress indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: "100%" }]} />
            </View>
          </View>

          <Text style={styles.title}>Valitse taso</Text>
          <Text style={styles.subtitle}>
            Mikä on päivittäinen tavoitteesi? Taso määrittää päivittäisen kasvistavoitteesi. Voit muuttaa tätä myöhemmin profiilissasi.
          </Text>

          {/* Level Selection */}
          <View style={styles.card}>
            <LevelSelector
              selectedLevel={level}
              onSelectLevel={setLevel}
              showHelperText={false}
            />
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
  },
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    padding: theme.spacing.medium,
    paddingTop: 60,
    paddingBottom: 40,
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
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
    fontFamily: theme.fontFamily.semiBold,
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
    fontFamily: theme.fontFamily.semiBold,
  },
});
