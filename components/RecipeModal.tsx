import { Recipe } from "@/app/(tabs)/recipes";
import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
} from "react-native";

type Props = {
  selectedRecipe: Recipe | null;
  isVisible: boolean;
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function RecipeModal({
  selectedRecipe,
  isVisible,
  setIsVisible,
}: Props) {
  const closeModal = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        {selectedRecipe && (
          <>
            <ImageBackground
              source={{ uri: selectedRecipe.imageUrl }}
              style={styles.modalImage}
            />
            <Text style={styles.modalTitle}>{selectedRecipe.title}</Text>
            <Text style={styles.ingredientsTitle}>Ainesosat:</Text>
            <FlatList
              data={selectedRecipe.ingredients}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.ingredientsList}>{item}</Text>
              )}
            />
            <Text style={styles.instructionsTitle}>Ohjeet:</Text>
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
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
  ingredientsList: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
  },
});
