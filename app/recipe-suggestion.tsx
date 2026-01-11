import { db } from "@/firebaseConfig";
import { theme } from "@/theme";
import { addDoc, collection } from "firebase/firestore";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
  Keyboard,
  Image,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

const RecipeSuggestion = observer(() => {
  const [recipeLink, setRecipeLink] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handlePickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        if (!permissionResult.canAskAgain) {
          Alert.alert(
            "Käyttöoikeus vaaditaan",
            useCamera
              ? "Salli kameran käyttöoikeus asetuksista."
              : "Salli gallerian käyttöoikeus asetuksista.",
            [
              { text: "Peruuta", style: "cancel" },
              { text: "Avaa asetukset", onPress: () => Linking.openSettings() },
            ]
          );
        }
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSubmitLink = async () => {
    if (!recipeLink.trim()) {
      Alert.alert("Virhe", "Lisää linkki reseptiin");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "recipeSuggestions"), {
        type: "link",
        link: recipeLink.trim(),
        createdAt: new Date(),
        status: "pending",
      });

      setRecipeLink("");
      Alert.alert("Kiitos!", "Reseptiehdotus lähetetty onnistuneesti!");
      router.back();
    } catch (error) {
      console.error("Error submitting recipe:", error);
      Alert.alert("Virhe", "Lähetys epäonnistui. Yritä uudelleen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitImage = async () => {
    if (!imageUri) {
      Alert.alert("Virhe", "Valitse kuva ensin");
      return;
    }

    setIsSubmitting(true);
    try {
      // For now, just save a reference - image upload would need storage setup
      await addDoc(collection(db, "recipeSuggestions"), {
        type: "image",
        imageUri: imageUri,
        createdAt: new Date(),
        status: "pending",
      });

      setImageUri(null);
      Alert.alert("Kiitos!", "Reseptiehdotus lähetetty onnistuneesti!");
      router.back();
    } catch (error) {
      console.error("Error submitting recipe:", error);
      Alert.alert("Virhe", "Lähetys epäonnistui. Yritä uudelleen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.header}>Ehdota reseptiä</Text>
            <Text style={styles.info}>
              Löysitkö hyvän kasvisreseptin? Jaa se meille linkkinä tai kuvana!
            </Text>

            {/* Option 1: Link */}
            <View style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <Ionicons name="link" size={24} color={theme.colors.primary} />
                <Text style={styles.optionTitle}>Jaa linkki</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Liitä reseptin linkki tähän..."
                placeholderTextColor="#999"
                value={recipeLink}
                onChangeText={setRecipeLink}
                autoCapitalize="none"
                keyboardType="url"
              />
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!recipeLink.trim() || isSubmitting) && styles.disabledButton,
                ]}
                onPress={handleSubmitLink}
                disabled={!recipeLink.trim() || isSubmitting}
              >
                <Text style={styles.submitButtonText}>Lähetä linkki</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>tai</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Option 2: Image */}
            <View style={styles.optionCard}>
              <View style={styles.optionHeader}>
                <Ionicons name="image" size={24} color={theme.colors.primary} />
                <Text style={styles.optionTitle}>Jaa kuva</Text>
              </View>

              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setImageUri(null)}
                  >
                    <Ionicons name="close-circle" size={28} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.imageButtons}>
                  <TouchableOpacity
                    style={styles.imageOptionButton}
                    onPress={() => handlePickImage(true)}
                  >
                    <Ionicons name="camera" size={28} color={theme.colors.primary} />
                    <Text style={styles.imageOptionText}>Ota kuva</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.imageOptionButton}
                    onPress={() => handlePickImage(false)}
                  >
                    <Ionicons name="images" size={28} color={theme.colors.primary} />
                    <Text style={styles.imageOptionText}>Galleria</Text>
                  </TouchableOpacity>
                </View>
              )}

              {imageUri && (
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    isSubmitting && styles.disabledButton,
                  ]}
                  onPress={handleSubmitImage}
                  disabled={isSubmitting}
                >
                  <Text style={styles.submitButtonText}>Lähetä kuva</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 10,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#2d3436",
    backgroundColor: "#f9f9f9",
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    opacity: 0.5,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  dividerText: {
    marginHorizontal: 16,
    color: "#999",
    fontSize: 14,
  },
  imageButtons: {
    flexDirection: "row",
    gap: 12,
  },
  imageOptionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    borderStyle: "dashed",
    gap: 8,
  },
  imageOptionText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: "500",
  },
  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "white",
    borderRadius: 14,
  },
});

export default RecipeSuggestion;
