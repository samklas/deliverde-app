import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/Ionicons";
import { theme } from "@/theme";
import { Recipe } from "@/types/recipe";
import { Image } from "expo-image";
import RecipeModal from "./RecipeModal";
import { useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { capitalizeFirstLetter } from "@/utils/formatting";

type Props = {
  recipe: Recipe;
  userFavoriteRecipes: Recipe[];
  isRecipeOfMonth?: boolean;
};

export default function RecipeBox({
  recipe,
  userFavoriteRecipes,
  isRecipeOfMonth,
}: Props) {
  const [isRecipeModalVisible, setIsRecipeModalVisible] = useState(false);

  const addToFavorites = async (recipeId: string) => {
    const userId = auth.currentUser?.uid;
    const favoriteRef = doc(db, `users/${userId}/favoriteRecipes/${recipeId}`);

    try {
      await setDoc(favoriteRef, { addedAt: new Date() }); // Add recipe to favorites
      console.log("Recipe added to favorites!");
    } catch (error) {
      console.error("Error adding to favorites: ", error);
    }
  };

  const removeFromFavorites = async (recipeId: string) => {
    const userId = auth.currentUser?.uid;
    const favoriteRef = doc(db, `users/${userId}/favoriteRecipes/${recipeId}`);

    try {
      await deleteDoc(favoriteRef); // Remove recipe from favorites
      console.log("Recipe removed from favorites!");
    } catch (error) {
      console.error("Error removing from favorites: ", error);
    }
  };

  let isFavorite = userFavoriteRecipes.some((fav) => fav.id === recipe.id);

  return (
    <View>
      <TouchableOpacity
        key={recipe.id}
        onPress={() => setIsRecipeModalVisible(true)}
      >
        <View style={styles.box}>
          {isRecipeOfMonth && (
            <Text style={styles.boxTitle}>Kuukauden resepti</Text>
          )}
          <View style={styles.recipeContent}>
            <Image
              style={styles.recipeImage}
              source={{ uri: recipe.imageUrl }}
            />
            <Text style={styles.recipeTitle}>
              {capitalizeFirstLetter(recipe.title)}
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={styles.recipeDetails}>
                {`${
                  recipe.details.duration
                } min • ${capitalizeFirstLetter(
                  recipe.details.difficultyLevel
                )} • ${recipe.details.portionAmount} annosta`}
              </Text>
              <TouchableOpacity
                style={styles.heartButton}
                onPress={() => {
                  isFavorite
                    ? removeFromFavorites(recipe.id)
                    : addToFavorites(recipe.id);
                }}
              >
                <Icon
                  name={isFavorite ? "heart" : "heart-outline"}
                  size={30}
                  color={theme.colors.secondary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <RecipeModal
        selectedRecipe={recipe}
        isVisible={isRecipeModalVisible}
        setIsVisible={setIsRecipeModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
  recipeContent: {
    alignItems: "center",
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  recipeTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: "#333",
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  addButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    backgroundColor: "#4cd964",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  heartButton: {
    marginLeft: 30,
  },
  boxTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
});
