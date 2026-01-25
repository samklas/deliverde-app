import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { storage } from "@/services";
import { STORAGE_KEYS } from "@/constants";
import { theme } from "@/theme";
import React from "react";

export default function FriendCode() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric characters and limit to 6 characters
    const sanitized = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (sanitized.length <= 6) {
      setCode(sanitized);
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Save friend code to storage for later use during user creation
      if (code.trim().length === 6) {
        await storage.set(STORAGE_KEYS.ONBOARDING_FRIEND_CODE, code.trim());
      }
      router.push("/userDetails");
    } catch (error) {
      console.error("Error saving friend code:", error);
      // Continue anyway even if save fails
      router.push("/userDetails");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/userDetails");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: "60%" }]} />
          </View>
        </View>

        <Text style={styles.title}>Lisää kutsukoodi</Text>
        <Text style={styles.subtitle}>
          Saitko kaveriltasi kutsukoodin? Voit syöttää sen alle.
        </Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeTitle}>Kutsu  koodi</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="ABC123"
            placeholderTextColor="#999"
            value={code}
            onChangeText={handleCodeChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
          />
          <Text style={styles.codeHint}>Syötä 6-merkkinen koodi</Text>
        </View>

        <Pressable
          style={[
            styles.continueButton,
            isLoading && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? "Ladataan..." : "Jatka"}
          </Text>
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>Ohita</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
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
  codeCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  codeTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  codeInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    fontSize: 24,
    fontFamily: theme.fontFamily.semiBold,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "center",
    letterSpacing: 8,
  },
  codeHint: {
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
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
  continueButtonDisabled: {
    opacity: 0.7,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
  },
  skipButton: {
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },
  skipButtonText: {
    color: "#666",
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
  },
});
