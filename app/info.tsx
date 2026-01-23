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
import { auth, db } from "@/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { theme } from "@/theme";
import React from "react";

export default function Info() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Save email if provided
      if (email.trim()) {
        const uid = auth.currentUser?.uid;
        if (uid) {
          await updateDoc(doc(db, "users", uid), {
            email: email.trim(),
          });
        }
      }
      router.replace("/(tabs)");
    } catch (error) {
      console.error("Error saving email:", error);
      // Continue anyway even if email save fails
      router.replace("/(tabs)");
    } finally {
      setIsLoading(false);
    }
  };

  const infoItems = [
    {
      title: "Seuraa vihanneksiasi",
      description: "Lisää päivittäin syömäsi vihannekset ja seuraa edistymistäsi kohti tavoitettasi.",
    },
    {
      title: "Saavuta tavoitteesi",
      description: "Aseta itsellesi päivittäinen vihannestavoite ja kerää pisteitä joka kerta kun saavutat sen.",
    },
    {
      title: "Kilpaile kavereiden kanssa",
      description: "Näe miten pärjäät muihin käyttäjiin verrattuna tulostaululla.",
    },
    {
      title: "Löydä uusia reseptejä",
      description: "Selaa terveellisiä reseptejä ja saa inspiraatiota vihannespitoiseen ruokavalioon.",
    },
  ];

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

        {/* Email section */}
        <View style={styles.emailCard}>
          <Text style={styles.emailTitle}>Sähköpostiosoite (valinnainen)</Text>
          <Text style={styles.emailDescription}>
            Lisää sähköpostiosoitteesi, jos haluat saada tietoa uusista ominaisuuksista ja päivityksistä.
          </Text>
          <TextInput
            style={styles.emailInput}
            placeholder="esimerkki@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* Continue button */}
        <Pressable
          style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={isLoading}
        >
          <Text style={styles.continueButtonText}>
            {isLoading ? "Ladataan..." : "Aloita käyttö"}
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
    fontSize: 18,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
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
  emailCard: {
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
  emailTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  emailDescription: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  emailInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
});
