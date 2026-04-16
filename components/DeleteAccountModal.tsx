import { theme } from "@/theme";
import { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  reauthenticateWithApple,
  reauthenticateWithGoogle,
  deleteAccount,
  isAnonymousUser,
  storage,
} from "@/services";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

type Props = {
  visible: boolean;
  onClose: () => void;
  onDeleted: () => void;
};

export default function DeleteAccountModal({
  visible,
  onClose,
  onDeleted,
}: Props) {
  const [step, setStep] = useState<"confirm" | "reauth">("confirm");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirmDelete = async () => {
    // Anonymous users don't need re-authentication
    if (isAnonymousUser()) {
      setIsLoading(true);
      try {
        await deleteAccount();
        await storage.clearUserData();
        onDeleted();
      } catch (error) {
        console.error("Error during account deletion:", error);
        setErrorMessage("Tilin poistaminen epäonnistui. Yritä uudelleen.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setStep("reauth");
    setErrorMessage("");
  };

  const handleReauthAndDelete = async (provider: "apple" | "google") => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Re-authenticate
      if (provider === "apple") {
        await reauthenticateWithApple();
      } else {
        await reauthenticateWithGoogle();
      }

      // Delete account after successful re-authentication
      await deleteAccount();
      await storage.clearUserData();

      // Notify parent component
      onDeleted();
    } catch (error: any) {
      console.error("Error during account deletion:", error);

      // Handle user cancellation
      if (
        error.code === "ERR_REQUEST_CANCELED" ||
        error.code === "SIGN_IN_CANCELLED"
      ) {
        return;
      }

      setErrorMessage("Tilin poistaminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep("confirm");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {step === "confirm" ? (
            <>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="warning-outline"
                  size={48}
                  color={theme.colors.error}
                />
              </View>
              <Text style={styles.title}>Poista tili</Text>
              <Text style={styles.description}>
                Oletko varma, että haluat poistaa tilisi? Kaikki tietosi
                poistetaan pysyvästi, eikä tätä toimintoa voi perua.
              </Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                  <Text style={styles.loadingText}>Poistetaan tiliä...</Text>
                </View>
              ) : (
                <>
                  {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  ) : null}
                  <View style={styles.buttonContainer}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={handleClose}
                    >
                      <Text style={styles.cancelButtonText}>Peruuta</Text>
                    </Pressable>
                    <Pressable
                      style={styles.deleteButton}
                      onPress={handleConfirmDelete}
                    >
                      <Text style={styles.deleteButtonText}>Jatka</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={48}
                  color={theme.colors.primary}
                />
              </View>
              <Text style={styles.title}>Vahvista henkilöllisyytesi</Text>
              <Text style={styles.description}>
                Turvallisuussyistä sinun täytyy kirjautua uudelleen ennen tilin
                poistamista.
              </Text>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                  <Text style={styles.loadingText}>Poistetaan tiliä...</Text>
                </View>
              ) : (
                <>
                  {/* Apple Sign-In - iOS only */}
                  {Platform.OS === "ios" && (
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={
                        AppleAuthentication.AppleAuthenticationButtonType
                          .CONTINUE
                      }
                      buttonStyle={
                        AppleAuthentication.AppleAuthenticationButtonStyle
                          .WHITE_OUTLINE
                      }
                      cornerRadius={8}
                      style={styles.appleButton}
                      onPress={() => handleReauthAndDelete("apple")}
                    />
                  )}

                  {/* Google Sign-In - Android only */}
                  {Platform.OS === "android" && (
                    <Pressable
                      style={styles.googleButton}
                      onPress={() => handleReauthAndDelete("google")}
                    >
                      <Text style={styles.googleButtonText}>
                        Jatka Google-tilillä
                      </Text>
                    </Pressable>
                  )}

                  {errorMessage ? (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  ) : null}

                  <Pressable style={styles.backButton} onPress={handleClose}>
                    <Text style={styles.backButtonText}>Peruuta</Text>
                  </Pressable>
                </>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    padding: theme.spacing.large,
    width: "100%",
    maxWidth: 340,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginBottom: theme.spacing.large,
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  cancelButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: theme.colors.error,
    padding: 14,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  appleButton: {
    height: 48,
    width: "100%",
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    height: 48,
    justifyContent: "center",
    marginBottom: 16,
  },
  googleButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  backButton: {
    padding: 14,
    alignItems: "center",
    width: "100%",
  },
  backButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: 12,
    fontFamily: theme.fontFamily.regular,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.large,
  },
  loadingText: {
    marginTop: theme.spacing.medium,
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.text,
  },
});
