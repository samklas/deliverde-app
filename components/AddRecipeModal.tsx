import React, { useState } from "react";
import { Modal, View, Text, TextInput, Button, StyleSheet } from "react-native";

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
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default AddRecipeModal;
