import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import {
  analyzeVegetableImage,
  getImageAnalysisUsageToday,
  incrementImageAnalysisUsage,
  IMAGE_ANALYSIS_DAILY_LIMIT,
} from "@/services";
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
  const [showSettingsPrompt, setShowSettingsPrompt] = useState(false);

  const handlePickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        // Check if permission was denied (not just undetermined)
        if (!permissionResult.canAskAgain) {
          setShowSettingsPrompt(true);
          setErrorMessage(
            useCamera
              ? "Kameran käyttöoikeus on estetty. Salli käyttöoikeus asetuksista."
              : "Gallerian käyttöoikeus on estetty. Salli käyttöoikeus asetuksista."
          );
        } else {
          setErrorMessage(
            useCamera
              ? "Kameran käyttöoikeus vaaditaan kuvan ottamiseen."
              : "Gallerian käyttöoikeus vaaditaan kuvan valitsemiseen."
          );
        }
        setAnalysisState("error");
        return;
      }

      setShowSettingsPrompt(false);

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
      const usageToday = await getImageAnalysisUsageToday();
      if (usageToday >= IMAGE_ANALYSIS_DAILY_LIMIT) {
        setErrorMessage(
          `Olet käyttänyt päivittäisen kuva-analyysikiintiösi (${IMAGE_ANALYSIS_DAILY_LIMIT}/${IMAGE_ANALYSIS_DAILY_LIMIT}). Yritä uudelleen huomenna.`
        );
        setAnalysisState("error");
        return;
      }

      const results = await analyzeVegetableImage(imageUri);

      if (results.length === 0) {
        setErrorMessage("Kuvasta ei tunnistettu vihanneksia.");
        setAnalysisState("error");
        return;
      }

      await incrementImageAnalysisUsage();
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
    setShowSettingsPrompt(false);
    onClose();
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Tunnista kuvasta</Text>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={15} color="#888" />
            <Text style={styles.infoText}>
              Kuva-analyysi on suuntaa-antava. Tarkistathan tulokset ennen tallentamista. Päivittäinen raja on {IMAGE_ANALYSIS_DAILY_LIMIT} analyysiä.
            </Text>
          </View>

          {!imageUri ? (
            <View>
              {analysisState === "error" && (
                <View style={styles.permissionError}>
                  <Text style={styles.permissionErrorText}>{errorMessage}</Text>
                  {showSettingsPrompt && (
                    <TouchableOpacity style={styles.settingsButton} onPress={openSettings}>
                      <Text style={styles.settingsButtonText}>Avaa asetukset</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => handlePickImage(true)}
                >
                  <Ionicons name="camera" size={32} color="#37891C" />
                  <Text style={styles.optionText}>Ota kuva</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={() => handlePickImage(false)}
                >
                  <Ionicons name="images" size={32} color="#37891C" />
                  <Text style={styles.optionText}>Valitse galleriasta</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />

              {analysisState === "analyzing" && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.loadingText}>
                    Tunnistetaan kasviksia...
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
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(0,0,0,0.04)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: theme.spacing.medium,
    gap: 6,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#888",
    lineHeight: 17,
    fontFamily: theme.fontFamily.regular,
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
    borderColor: "#4caf50",
    borderRadius: theme.borderRadius.medium,
    width: "45%",
  },
  optionText: {
    marginTop: theme.spacing.small,
    color: "#4caf50",
    fontWeight: "500",
    textAlign: "center",
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
    borderColor: "#37891C",
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  changeButtonText: {
    color: "#37891C",
    fontWeight: "500",
  },
  analyzeButton: {
    flex: 1,
    padding: theme.spacing.medium,
    backgroundColor: "#37891C",
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
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  closeButtonText: {
    color: "#666",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  permissionError: {
    backgroundColor: "#fff3e0",
    padding: theme.spacing.medium,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    alignItems: "center",
  },
  permissionErrorText: {
    color: "#e65100",
    textAlign: "center",
    marginBottom: theme.spacing.small,
  },
  settingsButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.medium,
    marginTop: theme.spacing.small,
  },
  settingsButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default ImageAnalysisModal;
