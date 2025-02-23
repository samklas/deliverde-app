import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from "react-native";
import Icon from "@expo/vector-icons/Ionicons";
import { theme } from "@/theme";
import { Recipe } from "@/types/recipe";

type Props = {
  recipe: Recipe;
  openModal: (recipe: Recipe) => void;
  toggleFavorite: (recipeId: string) => void;
  userFavoriteRecipes: Recipe[];
};

export default function RecipeBox({
  recipe,
  openModal,
  toggleFavorite,
  userFavoriteRecipes,
}: Props) {
  const modifyFirstLetterToUpperCase = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <TouchableOpacity key={recipe.id} onPress={() => openModal(recipe)}>
      <View style={styles.box}>
        <View style={styles.recipeContent}>
          <ImageBackground
            source={{ uri: recipe.imageUrl }}
            style={styles.recipeImage}
          ></ImageBackground>
          <Text style={styles.recipeTitle}>
            {modifyFirstLetterToUpperCase(recipe.title)}
          </Text>
          <TouchableOpacity
            style={styles.heartButton}
            onPress={() => toggleFavorite(recipe.id)}
          >
            <Icon
              name={
                userFavoriteRecipes.some((fav) => fav.id === recipe.id)
                  ? "heart"
                  : "heart-outline"
              }
              size={30}
              color={theme.colors.secondary}
            />
          </TouchableOpacity>
          <Text style={styles.recipeDetails}>
            {`${recipe.details.duration} min • ${modifyFirstLetterToUpperCase(
              recipe.details.difficultyLevel
            )} • ${recipe.details.portionaAmount} annosta`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
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
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    flexDirection: "row",
    flex: 1,
  },
  recipeDetails: {
    fontSize: 14,
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
    fontWeight: "bold",
  },
  heartButton: {
    // position: "absolute",
    // top: 10,
    // right: 10,
    // zIndex: 1,
  },
});
