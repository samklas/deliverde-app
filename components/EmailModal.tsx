import { theme } from "@/theme";
import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";

type Props = {
  visible: boolean;
  currentEmail: string | null;
  onClose: () => void;
  onSave: (email: string) => Promise<void>;
  onRemove: () => Promise<void>;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailModal({
  visible,
  currentEmail,
  onClose,
  onSave,
  onRemove,
}: Props) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (visible) {
      setEmail(currentEmail ?? "");
      setErrorMessage("");
    }
  }, [visible, currentEmail]);

  const handleSave = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("Anna sähköpostiosoite tai poista se kokonaan.");
      return;
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setErrorMessage("Tarkista sähköpostiosoitteen muoto.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      await onSave(trimmedEmail);
      onClose();
    } catch (error) {
      console.error("Error saving email:", error);
      setErrorMessage("Tallentaminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      await onRemove();
      onClose();
    } catch (error) {
      console.error("Error removing email:", error);
      setErrorMessage("Poistaminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Sähköpostiosoite</Text>
          <Text style={styles.subtitle}>
            Sähköpostia käytetään ainoastaan kuukauden palkinnon lähettämiseen, jos voitat.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="esimerkki@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              <View style={styles.buttonContainer}>
                <Pressable style={styles.cancelButton} onPress={onClose}>
                  <Text style={styles.cancelButtonText}>Peruuta</Text>
                </Pressable>
                <Pressable style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Tallenna</Text>
                </Pressable>
              </View>

              {currentEmail ? (
                <Pressable style={styles.removeButton} onPress={handleRemove}>
                  <Text style={styles.removeButtonText}>Poista sähköposti</Text>
                </Pressable>
              ) : null}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
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
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#37891C",
  },
  cancelButtonText: {
    color: "#37891C",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#37891C",
    padding: 14,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  removeButton: {
    marginTop: 12,
    padding: 14,
    alignItems: "center",
  },
  removeButtonText: {
    color: theme.colors.error,
    fontSize: 15,
    fontFamily: theme.fontFamily.medium,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 12,
    fontFamily: theme.fontFamily.regular,
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: theme.spacing.medium,
    marginTop: 20,
  },
});
