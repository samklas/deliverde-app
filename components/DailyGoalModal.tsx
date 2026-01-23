import { theme } from "@/theme";
import { useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React from "react";
import LevelSelector, { levels } from "./LevelSelector";
import { LEVEL_TARGETS } from "@/constants";

type Props = {
  visible: boolean;
  currentTarget: number;
  onClose: () => void;
  onSave: (level: string, target: number) => Promise<void>;
};

export default function DailyGoalModal({
  visible,
  currentTarget,
  onClose,
  onSave,
}: Props) {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const getCurrentLevel = () => {
    const level = levels.find(
      (lvl) => LEVEL_TARGETS[lvl.id as keyof typeof LEVEL_TARGETS] === currentTarget
    );
    return level?.id || "intermediate";
  };

  const handleSave = async () => {
    const levelToSave = selectedLevel || getCurrentLevel();
    const target = LEVEL_TARGETS[levelToSave as keyof typeof LEVEL_TARGETS];

    setIsLoading(true);
    setErrorMessage("");

    try {
      await onSave(levelToSave, target);
      handleClose();
    } catch (error) {
      console.error("Error saving daily goal:", error);
      setErrorMessage("Tavoitteen tallentaminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedLevel(null);
    setErrorMessage("");
    onClose();
  };

  const effectiveSelected = selectedLevel || getCurrentLevel();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Muuta tavoitetta</Text>
          <Text style={styles.subtitle}>Mikä on päivittäinen tavoitteesi?</Text>

          <LevelSelector
            selectedLevel={effectiveSelected}
            onSelectLevel={setSelectedLevel}
            showHelperText={false}
          />

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <Pressable style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Peruuta</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.saveButton,
                  !selectedLevel && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!selectedLevel}
              >
                <Text style={styles.saveButtonText}>Tallenna</Text>
              </Pressable>
            </View>
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
  },
  title: {
    fontSize: 24,
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
    marginBottom: 20,
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
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
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
