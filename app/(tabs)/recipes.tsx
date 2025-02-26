import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { auth, db, storage } from "@/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";
import React from "react";
import RecipeModal from "@/components/RecipeModal";
import AddRecipeModal from "@/components/AddRecipeModal";
import { theme } from "@/theme";
import { Recipe } from "@/types/recipe";
import RecipeBox from "@/components/RecipeBox";

export default function Tab() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userFavoriteRecipes, setUserFavoriteRecipes] = useState<Recipe[]>([]);
  const [activeSection, setActiveSection] = useState("all"); // 'all' or 'favorites'
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAddRecipeModalVisible, setIsAddRecipeModalVisible] = useState(false);

  useEffect(() => {
    const userId = auth.currentUser?.uid;
    const usersRef = collection(db, `users/${userId}`, "favoriteRecipes");

    const unsubscribe = onSnapshot(usersRef, (snapshot) => {
      let ids: string[] = [];
      for (const doc of snapshot.docs) {
        ids.push(doc.id);
      }

      filterFavoriteRecipes(ids);
    });

    return () => unsubscribe();
  }, [recipes]);

  useEffect(() => {
    const initRecipes = async () => {
      fetchRecipes();
    };

    initRecipes();
  }, []);

  const filterFavoriteRecipes = (favoriteRecipeIds: string[]) => {
    const filteredRecipes = recipes.filter((recipe) =>
      favoriteRecipeIds.includes(recipe.id)
    );

    setUserFavoriteRecipes(filteredRecipes);
  };

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      let recipes: Recipe[] = [];
      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        const recipe: Recipe = {
          id: doc.id,
          created: data.created,
          imageUrl: await getImageUrl(data.imageUrl),
          title: data.title,
          ingredients: data.ingredients,
          instructions: data.instructions,
          details: {
            duration: data.details.duration,
            difficultyLevel: data.details.difficultyLevel,
            portionaAmount: data.details.portionAmount,
          },
        };

        recipes.push(recipe);
      }
      setRecipes(recipes);
      setIsLoading(false);
    } catch (err) {
      console.error("Virhe reseptejä haettaessa: ", err);
    }
  };

  const getImageUrl = async (url: string) => {
    const refrence = ref(storage, url);
    const imageUrl = await getDownloadURL(refrence);
    return imageUrl;
  };

  const openModal = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setIsModalVisible(true);
  };

  const openAddRecipeModal = () => {
    setIsAddRecipeModalVisible(true);
  };

  const closeAddRecipeModal = () => {
    setIsAddRecipeModalVisible(false);
  };

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
            onPress={() => {
              setActiveSection("all");
            }}
          >
            <Text style={styles.tabText}>Reseptit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeSection === "favorites" && styles.activeTab,
            ]}
            onPress={() => {
              setActiveSection("favorites");
            }}
          >
            <Text style={styles.tabText}>Omat suosikit</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          style={styles.recipeList}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            (activeSection === "all" ? recipes : userFavoriteRecipes).map(
              (recipe) => (
                <RecipeBox
                  key={recipe.id}
                  recipe={recipe}
                  openModal={openModal}
                  toggleFavorite={addToFavorites}
                  removeFavorite={removeFromFavorites}
                  userFavoriteRecipes={userFavoriteRecipes}
                />
              )
            )
          )}
        </ScrollView>

        <TouchableOpacity style={styles.addButton} onPress={openAddRecipeModal}>
          <Text style={styles.addButtonText}>Lisää resepti</Text>
        </TouchableOpacity>
      </View>

      <RecipeModal
        selectedRecipe={selectedRecipe}
        isVisible={isModalVisible}
        setIsVisible={setIsModalVisible}
      />

      <AddRecipeModal
        isVisible={isAddRecipeModalVisible}
        onClose={closeAddRecipeModal}
      />
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
