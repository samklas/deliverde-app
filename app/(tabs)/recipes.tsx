import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import React from "react";
import { theme } from "@/theme";
import { Recipe } from "@/types/recipe";
import RecipeBoxV2 from "@/components/recipe/RecipeBoxV2";
import { getImageUrl } from "@/utils/utils";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Tab() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [userFavoriteRecipes, setUserFavoriteRecipes] = useState<Recipe[]>([]);
  const [activeSection, setActiveSection] = useState("all");

  const router = useRouter();

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
          recipeOfMonth: data.recipeOfMonth,
        };

        recipes.push(recipe);
      }
      setRecipes(recipes);
      setIsLoading(false);
    } catch (err) {
      console.error("Virhe reseptejä haettaessa: ", err);
    }
  };

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

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.tabButtons}>
          <Pressable
            style={[
              styles.tabButton,
              activeSection === "all" && styles.activeTab,
            ]}
            onPress={() => {
              setActiveSection("all");
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeSection === "all" && styles.activeText,
              ]}
            >
              Reseptit
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.tabButton,
              activeSection === "favorites" && styles.activeTab,
            ]}
            onPress={() => {
              setActiveSection("favorites");
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeSection === "favorites" && styles.activeText,
              ]}
            >
              Omat suosikit
            </Text>
          </Pressable>
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
                <RecipeBoxV2
                  key={recipe.id}
                  recipe={recipe}
                  userFavoriteRecipes={userFavoriteRecipes}
                />
              )
            )
          )}
        </ScrollView>
        <Pressable
          style={[
            {
              flex: 0,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginHorizontal: 15,
              marginTop: 15,
            },
            styles.box,
          ]}
          onPress={() => router.push("/recipeSuggestionV2")}
        >
          <Text style={{ color: "#0c4c25", fontWeight: "bold" }}>
            Ehdota reseptiä
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#0c4c25" />
        </Pressable>
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
  },
  tabButtons: {
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    backgroundColor: "white",
    elevation: 3,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
    color: "#ccc",
  },
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: "#4cd964",
  },
  activeText: {
    fontWeight: "bold",
  },
  tabText: {
    fontSize: 16,
    color: "#0c4c25",
  },
  recipeList: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  box: {
    backgroundColor: "#fff",
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
    // position: "absolute",
    // bottom: 30,
    // right: 30,
    backgroundColor: "#4cd964",
    padding: 15,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    marginBottom: 10,
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
