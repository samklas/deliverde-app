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
} from "react-native";
import ImagePickerExample from "@/components/ImagePicker";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";

const RecipeSuggestion = observer(() => {
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");

  const router = useRouter();

  const handleAddRecipe = async () => {
    try {
      if (!title.trim() || ingredients.length === 0 || !instructions.trim()) {
        Alert.alert("Virhe", "Täytä kaikki kentät!");
        return;
      }

      const recipeData = {
        title: title.trim(),
        ingredients,
        instructions: instructions.trim(),
        createdAt: new Date(),
        status: "pending",
      };

      await addDoc(collection(db, "recipeSuggestions"), recipeData);

      // Reset form
      setTitle("");
      setIngredients([]);
      setInstructions("");
      setCurrentIngredient("");

      Alert.alert("Onnistui", "Resepti lähetetty onnistuneesti!");
      router.back();
    } catch (error) {
      console.error("Error adding recipe:", error);
      Alert.alert("Virhe", "Virhe reseptin lisäämisessä. Yritä uudelleen.");
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
              Voit ehdottaa omaa suosikkireseptiäsi lisättäväksi sovellukseen.
              Arvostamme erityisesti kasvisruokareseptejä, jotka innostavat
              kokeilemaan kasvipohjaista ruokavaliota.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Reseptin nimi</Text>
              <TextInput
                style={styles.input}
                placeholder="Kirjoita reseptin nimi"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ainesosat</Text>
              <View style={styles.ingredientInputContainer}>
                <TextInput
                  style={styles.ingredientInput}
                  placeholder="Lisää ainesosa ja määrä. Esim. 2 kpl porkkanaa "
                  placeholderTextColor="#999"
                  value={currentIngredient}
                  onChangeText={setCurrentIngredient}
                  onSubmitEditing={handleAddIngredient}
                />
                <TouchableOpacity
                  //style={styles.addButton}
                  onPress={handleAddIngredient}
                >
                  <Ionicons name="add-circle" size={32} color="#0c4c25" />
                </TouchableOpacity>
              </View>

              <View style={styles.ingredientsList}>
                {ingredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <Text style={styles.ingredientText}>{ingredient}</Text>
                    <TouchableOpacity
                      //style={styles.removeButton}
                      onPress={() => handleRemoveIngredient(index)}
                    >
                      <Ionicons name="remove-circle-outline" size={28} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Valmistusohjeet</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Kirjoita valmistusohjeet"
                placeholderTextColor="#999"
                multiline
                value={instructions}
                onChangeText={setInstructions}
              />
            </View>

            <View style={styles.inputGroup}>
              {/* <Text style={styles.label}>Reseptin kuva</Text> */}
              <ImagePickerExample />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddRecipe}
            >
              <Text style={styles.submitButtonText}>Lähetä</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: 15,
    textAlign: "center",
  },
  info: {
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#2d3436",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  ingredientInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  ingredientInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#2d3436",
    marginRight: 10,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
  },
  ingredientsList: {
    marginTop: 10,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    //backgroundColor: "#f0f0f0",
    paddingBottom: 2,
    borderRadius: 8,
    marginBottom: 8,
  },
  ingredientText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#333",
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ff4444",
    justifyContent: "center",
    alignItems: "center",
  },
  removeButtonText: {
    color: "#fff",
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
});

export default RecipeSuggestion;
