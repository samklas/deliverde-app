import { router } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";
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
import React from "react";

const PRIVACY_POLICY_URL =
  "https://deliverde-shop.myshopify.com/policies/privacy-policy";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);

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
      source={require("../assets/images/Deliverde_tervetuloa2.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Tervetuloa</Text>
          <Text style={styles.subtitle}>
            Kirjaudu sisään jatkaaksesi. Kirjautumalla hyväksyt{" "}
          
            <Text
              style={styles.link}
              onPress={() => setPrivacyModalVisible(true)}
            >
              tietosuojakäytännön
            </Text>
            .
          </Text>

          {/* Apple Sign-In - iOS only */}
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
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

      <Modal
        visible={privacyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tietosuojakäytänne</Text>
            <View style={styles.webViewContainer}>
              <WebView
                source={{ uri: PRIVACY_POLICY_URL }}
                style={styles.webView}
                onLoadStart={() => setWebViewLoading(true)}
                onLoadEnd={() => setWebViewLoading(false)}
              />
              {webViewLoading && (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Sulje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
   // backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    padding: theme.spacing.medium,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
  },
  appleButton: {
    height: 48,
    width: "100%",
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    //padding: ,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    height: 48,
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
  link: {
    textDecorationLine: "underline",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.medium,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    width: "100%",
    height: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    textAlign: "center",
  },
  webViewContainer: {
    flex: 1,
    borderRadius: theme.borderRadius.medium,
    overflow: "hidden",
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  modalCloseButton: {
    marginTop: theme.spacing.medium,
    padding: theme.spacing.small,
    backgroundColor: "#37891C",
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
