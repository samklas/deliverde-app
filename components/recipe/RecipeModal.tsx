import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Recipe } from "@/types/recipe";
import { Image } from "expo-image";

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
      <ImageBackground
        source={require("../../assets/images/background.jpeg")}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {selectedRecipe && (
              <>
                <ImageBackground
                  source={{ uri: selectedRecipe.imageUrl }}
                  style={styles.modalImage}
                >
                  <Image
                    style={styles.modalImage}
                    source={{ uri: selectedRecipe.imageUrl }}
                  />
                  <TouchableOpacity
                    onPress={closeModal}
                    style={styles.closeButtonContainer}
                  >
                    <Ionicons name="close" size={35} color="white" />
                  </TouchableOpacity>
                </ImageBackground>
                <Text style={styles.modalTitle}>
                  {modifyFirstLetterToUpperCase(selectedRecipe.title)}
                </Text>
                <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                  <View style={styles.box}>
                    <Text style={styles.ingredientsTitle}>Ainesosat</Text>
                    <FlatList
                      style={{ width: "100%", paddingLeft: 20 }}
                      data={selectedRecipe.ingredients}
                      keyExtractor={(item, index) => index.toString()}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <Text style={styles.ingredientsList}>{item}</Text>
                      )}
                    />

                    <View>
                      <Text style={styles.instructionsTitle}>Valmistus</Text>
                      <Text
                        style={{
                          paddingLeft: 20,
                          paddingRight: 20,
                          fontSize: 16,
                          color: "#666",
                          marginBottom: 50,
                        }}
                      >
                        {selectedRecipe.instructions}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </ImageBackground>
    </Modal>
  );
}

const modifyFirstLetterToUpperCase = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    //padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 20,
    color: "#0c4c25",
  },
  closeButton: {
    marginTop: 20,
    color: "blue",
  },
  modalImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 12,
  },
  ingredientsContainer: {},
  ingredientsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 5,
    paddingLeft: 20,
    textAlign: "left",
    width: "100%",
  },
  ingredientsList: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
    textAlign: "left",
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 5,
    width: "100%",
    paddingLeft: 20,
  },
  scrollViewContainer: {
    // Add any necessary styles for the scroll view container
  },
  closeButtonContainer: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1, // Ensure the button is above other elements
  },
  background: {
    flex: 1,
    backgroundColor: "white",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  box: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
