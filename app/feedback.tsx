import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useState } from "react";
import { db } from "@/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { theme } from "@/theme";
import { router } from "expo-router";
import React from "react";

export default function Feedback() {
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      Alert.alert("Virhe", "Kirjoita palautetta ennen lähettämistä");
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "feedback"), {
        createdAt: new Date(),
        feedback: feedback.trim(),
      });
      Alert.alert("Kiitos!", "Palautteesi on lähetetty onnistuneesti.", [
        { text: "OK", onPress: () => router.back() },
      ]);
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      Alert.alert("Virhe", "Palautteen lähettäminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
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
        <Text style={styles.title}>Lähetä palautetta</Text>
        <Text style={styles.subtitle}>
          Palautteesi on meille tärkeää! Haluamme jatkuvasti kehittää sovellustamme ja tehdä siitä entistäkin paremman.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Palautteesi</Text>
          <TextInput
            style={styles.input}
            multiline
            placeholder="Kirjoita palautteesi tähän..."
            placeholderTextColor="#999"
            value={feedback}
            onChangeText={setFeedback}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.submitButtonText}>
            {isLoading ? "Lähetetään..." : "Lähetä"}
          </Text>
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
    paddingTop: 40,
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
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    minHeight: 120,
  },
  submitButton: {
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
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
  },
});
