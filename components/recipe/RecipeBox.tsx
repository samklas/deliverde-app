import { View, Text, TouchableOpacity, StyleSheet, Pressable } from "react-native";
import Icon from "@expo/vector-icons/Ionicons";
import { theme } from "@/theme";
import { Recipe } from "@/types/recipe";
import { Image } from "expo-image";
import RecipeModal from "./RecipeModal";
import { useState } from "react";
import { auth, db } from "@/firebaseConfig";
import { deleteDoc, doc, setDoc } from "firebase/firestore";
import { capitalizeFirstLetter } from "@/utils/formatting";
import React from "react";

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
      await setDoc(favoriteRef, { addedAt: new Date() });
    } catch (error) {
      console.error("Error adding to favorites: ", error);
    }
  };

  const removeFromFavorites = async (recipeId: string) => {
    const userId = auth.currentUser?.uid;
    const favoriteRef = doc(db, `users/${userId}/favoriteRecipes/${recipeId}`);

    try {
      await deleteDoc(favoriteRef);
    } catch (error) {
      console.error("Error removing from favorites: ", error);
    }
  };

  const isFavorite = userFavoriteRecipes.some((fav) => fav.id === recipe.id);

  const handleFavoritePress = () => {
    if (isFavorite) {
      removeFromFavorites(recipe.id);
    } else {
      addToFavorites(recipe.id);
    }
  };

  return (
    <View>
      <Pressable onPress={() => setIsRecipeModalVisible(true)}>
        <View style={styles.box}>
          {isRecipeOfMonth && (
            <Text style={styles.boxTitle}>Kuukauden resepti</Text>
          )}

          <View style={styles.imageContainer}>
            <Image
              style={styles.recipeImage}
              source={{ uri: recipe.imageUrl }}
            />
            <TouchableOpacity
              style={styles.heartButton}
              onPress={handleFavoritePress}
              activeOpacity={0.7}
            >
              <Icon
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#37891C" : "#fff"}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.recipeTitle}>
            {capitalizeFirstLetter(recipe.title)}
          </Text>
        </View>
      </Pressable>

      <RecipeModal
        selectedRecipe={recipe}
        isVisible={isRecipeModalVisible}
        setIsVisible={setIsRecipeModalVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  boxTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 12,
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  recipeTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    textAlign: "center",
  },
});
