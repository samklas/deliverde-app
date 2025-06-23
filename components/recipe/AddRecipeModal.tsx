import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { theme } from "@/theme";
import ImagePickerExample from "../ImagePicker";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/firebaseConfig";

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const AddRecipeModal = ({ isVisible, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleAddIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleAddRecipe = async () => {
    try {
      if (!title.trim() || ingredients.length === 0 || !instructions.trim()) {
        alert("Täytä kaikki kentät!");
        return;
      }

      const recipeData = {
        title: title.trim(),
        ingredients,
        instructions: instructions.trim(),
        createdAt: new Date(),
        status: "pending", // For moderation purposes
      };

      await addDoc(collection(db, "recipeSuggestions"), recipeData);

      // Reset form
      setTitle("");
      setIngredients([]);
      setInstructions("");

      alert("Resepti lisätty onnistuneesti!");
      onClose();
    } catch (error) {
      console.error("Error adding recipe:", error);
      alert("Virhe reseptin lisäämisessä. Yritä uudelleen.");
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Lisää uusi resepti</Text>
          <TextInput
            style={styles.input}
            placeholder="Reseptin nimi"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
          <View style={styles.ingredientsContainer}>
            <TextInput
              style={styles.ingredientInput}
              placeholder="Lisää ainesosa"
              placeholderTextColor="#999"
              value={currentIngredient}
              onChangeText={setCurrentIngredient}
            />
            <Button title="+" onPress={handleAddIngredient} />
          </View>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <Text>{ingredient}</Text>
              <Button
                title="Poista"
                onPress={() => handleRemoveIngredient(index)}
                color="red"
              />
            </View>
          ))}
          <TextInput
            style={styles.input}
            placeholder="Valmistus"
            placeholderTextColor="#999"
            value={instructions}
            onChangeText={setInstructions}
          />
          <ImagePickerExample />
          <Button title="Lisää resepti" onPress={handleAddRecipe} />
          <Button title="Peruuta" onPress={onClose} color="red" />
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
    width: "80%",
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
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: theme.spacing.small,
    marginBottom: theme.spacing.large,
    borderRadius: theme.borderRadius.small,
  },
  ingredientsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  ingredientInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: theme.spacing.small,
    marginRight: theme.spacing.small,
    borderRadius: theme.borderRadius.small,
  },
  ingredientItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.small,
    marginBottom: theme.spacing.small,
    backgroundColor: "#f0f0f0",
    borderRadius: theme.borderRadius.small,
  },
});

export default AddRecipeModal;
