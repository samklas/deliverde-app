import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import { db } from "@/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ImagePickerExample from "@/components/ImagePicker";
import React from "react";

export default function RecipeSuggestion() {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleAddRecipe = async () => {
    if (!title.trim() || ingredients.length === 0 || !instructions.trim()) {
      Alert.alert("Virhe", "Täytä kaikki kentät ennen lähettämistä");
      return;
    }

    setIsLoading(true);
    try {
      const recipeData = {
        title: title.trim(),
        ingredients,
        instructions: instructions.trim(),
        createdAt: new Date(),
        status: "pending",
      };

      await addDoc(collection(db, "recipeSuggestions"), recipeData);

      Alert.alert("Kiitos!", "Reseptiehdotuksesi on lähetetty onnistuneesti.", [
        { text: "OK", onPress: () => router.back() },
      ]);

      // Reset form
      setTitle("");
      setIngredients([]);
      setInstructions("");
      setCurrentIngredient("");
    } catch (error) {
      console.error("Error adding recipe:", error);
      Alert.alert("Virhe", "Reseptin lähettäminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
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
        <Text style={styles.title}>Ehdota reseptiä</Text>
        <Text style={styles.subtitle}>
          Voit ehdottaa omaa suosikkireseptiäsi lisättäväksi sovellukseen.
          Arvostamme erityisesti kasvisruokareseptejä!
        </Text>

        {/* Recipe Name */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Reseptin nimi</Text>
          <TextInput
            style={styles.input}
            placeholder="Kirjoita reseptin nimi"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Ingredients */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ainesosat</Text>
          <View style={styles.ingredientInputContainer}>
            <TextInput
              style={styles.ingredientInput}
              placeholder="Esim. 2 kpl porkkanaa"
              placeholderTextColor="#999"
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
              onSubmitEditing={handleAddIngredient}
            />
            <Pressable onPress={handleAddIngredient} style={styles.addButton}>
              <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
            </Pressable>
          </View>

          {ingredients.length > 0 && (
            <View style={styles.ingredientsList}>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                  <Pressable onPress={() => handleRemoveIngredient(index)}>
                    <Ionicons name="close-circle" size={24} color="#999" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Valmistusohjeet</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Kirjoita valmistusohjeet"
            placeholderTextColor="#999"
            multiline
            value={instructions}
            onChangeText={setInstructions}
            textAlignVertical="top"
          />
        </View>

        {/* Image */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Kuva (valinnainen)</Text>
          <ImagePickerExample />
        </View>

        <Pressable
          style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
          onPress={handleAddRecipe}
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
    marginBottom: theme.spacing.medium,
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
  },
  textArea: {
    minHeight: 120,
  },
  ingredientInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ingredientInput: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: theme.borderRadius.medium,
    padding: 16,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addButton: {
    padding: 4,
  },
  ingredientsList: {
    marginTop: 16,
    gap: 8,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f5f5f5",
    padding: 12,
    borderRadius: theme.borderRadius.medium,
  },
  ingredientText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#333",
    flex: 1,
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
    marginTop: 8,
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
