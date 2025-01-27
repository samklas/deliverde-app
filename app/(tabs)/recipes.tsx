import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { useState } from "react";

export default function Tab() {
  const [activeSection, setActiveSection] = useState("all"); // 'all' or 'favorites'

  // Temporary mock data - replace with your actual data source
  const recipes = [
    { id: 1, title: "Kesäinen kasvisrisotto", isFavorite: true },
    { id: 2, title: "Terveellinen virhesmoothie", isFavorite: true },
    { id: 3, title: "Lempeä kurpitsakeitto", isFavorite: false },
    { id: 4, title: "Jeppis jee", isFavorite: false },
  ];

  const favoriteRecipes = recipes.filter((recipe) => recipe.isFavorite);

  // Helper function to get the correct image based on id
  const getRecipeImage = (id: number) => {
    switch (id) {
      case 1:
        return require("../../assets/images/meal1.png");
      case 2:
        return require("../../assets/images/meal2.png");
      case 3:
        return require("../../assets/images/meal3.png");
      case 4:
        return require("../../assets/images/meal4.png");
      default:
        return require("../../assets/images/meal1.png"); // fallback image
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.tabButtons}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === "all" && styles.activeTab,
            ]}
            onPress={() => setActiveSection("all")}
          >
            <Text style={styles.tabText}>Reseptit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === "favorites" && styles.activeTab,
            ]}
            onPress={() => setActiveSection("favorites")}
          >
            <Text style={styles.tabText}>Omat suosikit</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.recipeList}
          showsVerticalScrollIndicator={false}
        >
          {(activeSection === "all" ? recipes : favoriteRecipes).map(
            (recipe) => (
              <View key={recipe.id} style={[styles.box, styles.recipeBox]}>
                <View style={styles.recipeContent}>
                  <ImageBackground
                    source={getRecipeImage(recipe.id)}
                    style={styles.recipeImage}
                  />
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeDetails}>
                    30 min • Helppo • 4 annosta
                  </Text>
                </View>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 16,
  },
  tabButtons: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 16,
    marginHorizontal: 5,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  activeTab: {
    backgroundColor: "#4cd964",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c4c25",
  },
  recipeList: {
    flex: 1,
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
  recipeBox: {
    marginBottom: 16,
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
  },
  recipeDetails: {
    fontSize: 14,
    color: "#666",
  },
});
