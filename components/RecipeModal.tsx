import { Recipe } from "@/app/(tabs)/recipes";
import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
  selectedRecipe: Recipe | null;
  isVisible: boolean;
};

export default function RecipeModal({ selectedRecipe, isVisible }: Props) {
  const [isModalVisible, setIsModalVisible] = useState(isVisible);

  const closeModal = () => {
    setIsModalVisible(false);
  };

  return (
    <Modal
      visible={isModalVisible}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        {selectedRecipe && (
          <>
            <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
            <Text>{selectedRecipe.instructions}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    color: "blue",
  },
});
