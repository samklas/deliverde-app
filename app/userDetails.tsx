import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { theme } from "@/theme";
import { storage } from "@/services";
import { STORAGE_KEYS } from "@/constants";
import React from "react";

export default function UserDetails() {
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const avatars = [
    { id: "1", item: require("@/assets/images/avatar2.jpg") },
    { id: "2", item: require("@/assets/images/avatar3.jpg") },
    { id: "3", item: require("@/assets/images/avatar4.jpg") },
  ];

  // Load any saved onboarding data (in case user closed app mid-flow)
  useEffect(() => {
    const loadSavedData = async () => {
      const savedUsername = await storage.get(STORAGE_KEYS.ONBOARDING_USERNAME);
      const savedAvatar = await storage.get(STORAGE_KEYS.ONBOARDING_AVATAR);
      if (savedUsername) setUsername(savedUsername);
      if (savedAvatar) setSelectedAvatar(savedAvatar);
    };
    loadSavedData();
  }, []);

  const handleContinue = async () => {
    if (!username.trim()) {
      Alert.alert("Virhe", "Käyttäjänimi on pakollinen");
      return;
    }
    if (!selectedAvatar) {
      Alert.alert("Virhe", "Valitse avatar");
      return;
    }

    // Save to storage before navigating (persists if app is closed)
    await storage.multiSet([
      [STORAGE_KEYS.ONBOARDING_USERNAME, username.trim()],
      [STORAGE_KEYS.ONBOARDING_AVATAR, selectedAvatar],
    ]);

    router.push("/userLevel");
  };

  return (
  
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Progress indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: "80%" }]} />
              </View>
            </View>

            <Text style={styles.title}>Luo profiili</Text>
            <Text style={styles.subtitle}>Kerro meille hieman itsestäsi</Text>

            {/* Avatar Selection */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Valitse avatar</Text>
              <View style={styles.avatarSelection}>
                {avatars.map((avatar) => (
                  <Pressable
                    key={avatar.id}
                    onPress={() => setSelectedAvatar(avatar.id)}
                    style={[
                      styles.avatarButton,
                      selectedAvatar === avatar.id && styles.selectedAvatar,
                    ]}
                  >
                    <Image source={avatar.item} style={styles.avatarImage} />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Username Input */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Käyttäjänimi</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Kirjoita käyttäjänimesi"
                placeholderTextColor="#999"
              />
            </View>

            {/* Continue Button */}
            <Pressable style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Jatka</Text>
            </Pressable>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  scrollContent: {
    padding: theme.spacing.medium,
    paddingTop: 60,
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  input: {
    height: 50,
    borderColor: "#e0e0e0",
    borderWidth: 1,
    borderRadius: theme.borderRadius.medium,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    backgroundColor: "#fafafa",
  },
  avatarSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
  },
  avatarButton: {
    padding: 4,
    borderWidth: 3,
    borderColor: "transparent",
    borderRadius: 50,
  },
  selectedAvatar: {
    borderColor: "#37891C",
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  continueButton: {
    backgroundColor: "#37891C",
    padding: 14,
    borderRadius: theme.borderRadius.large,
    alignItems: "center",
    marginTop: 8,
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
