import { router } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  storage,
  loadAppData,
  signInWithApple,
  signInWithGoogle,
  type AuthResult,
} from "@/services";
import { STORAGE_KEYS } from "@/constants";
import { theme } from "@/theme";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAuthResult = async (result: AuthResult) => {
    if (result.isNewUser) {
      router.navigate("/userDetails");
    } else {
      await storage.multiSet([
        [STORAGE_KEYS.USER_ID, result.uid],
        [STORAGE_KEYS.USERNAME, result.username || ""],
      ]);
      await loadAppData();
      router.replace("/(tabs)");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const result = await signInWithApple();
      await handleAuthResult(result);
    } catch (error: any) {
      console.error("Apple Sign-In error:", error);
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      setErrorMessage("Kirjautuminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const result = await signInWithGoogle();
      await handleAuthResult(result);
    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      if (error.code === "SIGN_IN_CANCELLED") {
        return;
      }
      setErrorMessage("Kirjautuminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Tervetuloa</Text>
          <Text style={styles.subtitle}>Kirjaudu sisään jatkaaksesi</Text>

          {/* Apple Sign-In - iOS only */}
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={8}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Google Sign-In - Android only */}
          {Platform.OS === "android" && (
            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Text style={styles.googleButtonText}>
                {isLoading ? "Kirjaudutaan..." : "Jatka Google-tilillä"}
              </Text>
            </Pressable>
          )}

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>
      </View>
    </ImageBackground>
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
    justifyContent: "center",
    padding: theme.spacing.medium,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  appleButton: {
    height: 56,
    width: "100%",
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    height: 56,
    justifyContent: "center",
    marginBottom: 16,
  },
  googleButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 16,
  },
});
