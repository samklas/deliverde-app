import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Image,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, storage } from "@/firebaseConfig";
import { getDownloadURL, ref } from "firebase/storage";

type Details = {
  duration: string;
  difficultyLevel: string;
  portionaAmount: string;
};
type Recipe = {
  id: string;
  created: string;
  imageUrl: string;
  title: string;
  ingredients: string[];
  instructions: string;
  details: Details;
};

export default function Tab() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      let recipes: Recipe[] = [];
      for (const doc of querySnapshot.docs) {
        // Changed from forEach to for...of
        const data = doc.data();
        const recipe: Recipe = {
          id: doc.id,
          created: data.created,
          imageUrl: await getImageUrl(data.imageUrl),
          title: data.title,
          ingredients: data.ingredients,
          instructions: data.insructions,
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

  const modifyFirstLetterToUpperCase = (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.tabButtons}></View>
        <ScrollView
          style={styles.recipeList}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            recipes.map((recipe) => (
              <View key={recipe.id} style={[styles.box, styles.recipeBox]}>
                <View style={styles.recipeContent}>
                  <ImageBackground
                    source={{ uri: recipe.imageUrl }}
                    style={styles.recipeImage}
                  />
                  <Text style={styles.recipeTitle}>
                    {modifyFirstLetterToUpperCase(recipe.title)}
                  </Text>
                  <Text style={styles.recipeDetails}>
                    {`${
                      recipe.details.duration
                    } min • ${modifyFirstLetterToUpperCase(
                      recipe.details.difficultyLevel
                    )} • ${recipe.details.portionaAmount} annosta`}
                  </Text>
                </View>
              </View>
            ))
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
