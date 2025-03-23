import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";
import { theme } from "@/theme";
import ImagePickerExample from "../ImagePicker";

type Props = {
  isVisible: boolean;
  onClose: () => void;
};

const AddRecipeModal = ({ isVisible, onClose }: Props) => {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [instructions, setInstructions] = useState("");

  const handleAddRecipe = () => {
    // Logic to add the recipe to the database
    console.log("Adding recipe:", { title, ingredients, instructions });
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Lisää uusi resepti</Text>
          <TextInput
            style={styles.input}
            placeholder="Reseptin nimi"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Ainesosat"
            value={ingredients}
            onChangeText={setIngredients}
          />
          <TextInput
            style={styles.input}
            placeholder="Valmistus"
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
});

export default AddRecipeModal;
