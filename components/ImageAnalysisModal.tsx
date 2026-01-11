import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { analyzeVegetableImage } from "@/services";
import { VegetableAnalysisResult } from "@/types/vision";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  onAnalysisComplete: (results: VegetableAnalysisResult[]) => void;
};

type AnalysisState = "idle" | "analyzing" | "error";

const ImageAnalysisModal = ({
  isVisible,
  onClose,
  onAnalysisComplete,
}: Props) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handlePickImage = async (useCamera: boolean) => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      };

      const result = useCamera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setAnalysisState("idle");
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      setErrorMessage("Kuvan valinta epäonnistui.");
      setAnalysisState("error");
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;

    setAnalysisState("analyzing");
    setErrorMessage("");

    try {
      const results = await analyzeVegetableImage(imageUri);
      console.log("Analysis results:", results);

      if (results.length === 0) {
        setErrorMessage("Kuvasta ei tunnistettu vihanneksia.");
        setAnalysisState("error");
        return;
      }

      onAnalysisComplete(results);
      handleClose();
    } catch (error) {
      console.error("Analysis error:", error);
      if (error instanceof Error) {
        if (error.message.includes("not configured")) {
          setErrorMessage("Kuvantunnistus ei ole käytettävissä.");
        } else if (error.message.includes("network")) {
          setErrorMessage("Verkkovirhe. Tarkista internet-yhteytesi.");
        } else {
          setErrorMessage("Tunnistuksessa tapahtui virhe. Yritä uudelleen.");
        }
      } else {
        setErrorMessage("Tunnistuksessa tapahtui virhe. Yritä uudelleen.");
      }
      setAnalysisState("error");
    }
  };

  const handleClose = () => {
    setImageUri(null);
    setAnalysisState("idle");
    setErrorMessage("");
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tunnista kuvasta</Text>

          {!imageUri ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handlePickImage(true)}
              >
                <Ionicons
                  name="camera"
                  size={32}
                  color={theme.colors.primary}
                />
                <Text style={styles.optionText}>Ota kuva</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.optionButton}
                onPress={() => handlePickImage(false)}
              >
                <Ionicons
                  name="images"
                  size={32}
                  color={theme.colors.primary}
                />
                <Text style={styles.optionText}>Valitse galleriasta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />

              {analysisState === "analyzing" && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>
                    Tunnistetaan vihanneksia...
                  </Text>
                </View>
              )}

              {analysisState === "error" && (
                <Text style={styles.errorText}>{errorMessage}</Text>
              )}

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={() => setImageUri(null)}
                  disabled={analysisState === "analyzing"}
                >
                  <Text style={styles.changeButtonText}>Vaihda kuva</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.analyzeButton,
                    analysisState === "analyzing" && styles.disabledButton,
                  ]}
                  onPress={handleAnalyze}
                  disabled={analysisState === "analyzing"}
                >
                  <Text style={styles.analyzeButtonText}>Analysoi</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            disabled={analysisState === "analyzing"}
          >
            <Text style={styles.closeButtonText}>Peruuta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.large,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: theme.spacing.large,
  },
  optionButton: {
    alignItems: "center",
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    width: "45%",
  },
  optionText: {
    marginTop: theme.spacing.small,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  previewContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.medium,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: theme.borderRadius.medium,
  },
  loadingText: {
    marginTop: theme.spacing.small,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: theme.spacing.medium,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: theme.spacing.small,
  },
  changeButton: {
    flex: 1,
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  changeButtonText: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  analyzeButton: {
    flex: 1,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  analyzeButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
  closeButton: {
    padding: theme.spacing.medium,
    alignItems: "center",
    marginTop: theme.spacing.small,
  },
  closeButtonText: {
    color: theme.colors.error,
    fontWeight: "500",
  },
});

export default ImageAnalysisModal;
