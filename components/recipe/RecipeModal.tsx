import React, { useEffect, useState } from "react";
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
import { capitalizeFirstLetter } from "@/utils/formatting";
import { theme } from "@/theme";
import { auth, db } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { rateRecipe } from "@/services/recipes.service";
import StarRating from "./StarRating";
import recipeStore from "@/stores/recipeStore";

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
  const [ratingStats, setRatingStats] = useState({ sum: 0, count: 0 });
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (!selectedRecipe) return;

    setRatingStats({
      sum: selectedRecipe.ratingSum ?? 0,
      count: selectedRecipe.ratingCount ?? 0,
    });
    setUserRating(null);

    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const userRatingRef = doc(db, `users/${userId}/recipeRatings/${selectedRecipe.id}`);
    getDoc(userRatingRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          setUserRating(snapshot.data().value);
        }
      })
      .catch((error) => console.error("Error fetching user rating: ", error));
  }, [selectedRecipe?.id]);

  const handleRate = async (value: number) => {
    if (!selectedRecipe || isSubmittingRating) return;

    const previousValue = userRating ?? 0;
    const previousStats = ratingStats;
    const newStats = {
      sum: previousStats.sum - previousValue + value,
      count: previousValue ? previousStats.count : previousStats.count + 1,
    };

    setIsSubmittingRating(true);
    setUserRating(value);
    setRatingStats(newStats);
    recipeStore.updateRecipeRating(selectedRecipe.id, newStats.sum, newStats.count);

    try {
      await rateRecipe(selectedRecipe.id, value);
    } catch (error) {
      console.error("Error rating recipe: ", error);
      setUserRating(previousValue || null);
      setRatingStats(previousStats);
      recipeStore.updateRecipeRating(selectedRecipe.id, previousStats.sum, previousStats.count);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const averageRating = ratingStats.count > 0 ? ratingStats.sum / ratingStats.count : 0;

  const closeModal = () => {
    setIsVisible(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      onRequestClose={closeModal}
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
                {capitalizeFirstLetter(selectedRecipe.title)}
              </Text>
              <View style={styles.ratingSection}>
                <StarRating
                  rating={userRating ?? Math.round(averageRating)}
                  size={28}
                  readonly={false}
                  onRate={handleRate}
                />
                <Text style={styles.ratingText}>
                  {ratingStats.count > 0
                    ? `${averageRating.toFixed(1).replace(".", ",")} (${ratingStats.count})`
                    : "Ei arvosteluja"}
                </Text>
              </View>
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
                    <Text style={styles.instructionsText}>
                      {selectedRecipe.instructions}
                    </Text>
                  </View>
                </View>
              </ScrollView>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
    marginTop: 20,
    marginBottom: 20,
    color: "#0c4c25",
    textAlign: "center"
  },
  closeButton: {
    marginTop: 20,
    color: "blue",
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginTop: 6,
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
    fontFamily: theme.fontFamily.semiBold,
    marginTop: 12,
    marginBottom: 5,
    paddingLeft: 20,
    textAlign: "left",
    width: "100%",
  },
  ingredientsList: {
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginBottom: 12,
    textAlign: "left",
  },
  instructionsTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    marginTop: 12,
    marginBottom: 5,
    width: "100%",
    paddingLeft: 20,
  },
  instructionsText: {
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginBottom: 50,
    lineHeight: 24,
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
    // backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  box: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
  },
});
