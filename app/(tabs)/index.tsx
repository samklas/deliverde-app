import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install expo/vector-icons
import { theme } from "@/theme";
import { observer } from "mobx-react-lite";
import recipeStore from "@/stores/recipeStore";
import { useEffect, useState } from "react";
import {
  collection,
  DocumentData,
  getDocs,
  QuerySnapshot,
} from "firebase/firestore";
import { db, storage } from "@/firebaseConfig";
import { Recipe } from "@/types/recipe";
import { getDownloadURL, ref } from "firebase/storage";
import RecipeBox from "@/components/recipe/RecipeBox";

const Tab = observer(() => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setRecipes, setRecipeOfMonth, favoriteRecipes, recipeOfMonth } =
    recipeStore;

  const fetchRecipes = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "recipes"));
      const recipes = await mapRecipes(querySnapshot);
      setRecipes(recipes);
      const recipeOfMonth = getRecipeOfMonth(recipes);
      if (recipeOfMonth) setRecipeOfMonth(recipeOfMonth);
    } catch (err) {
      console.error("Error occured while fetching recipes: ", err);
    }
  };

  const mapRecipes = async (
    querySnapshot: QuerySnapshot<DocumentData, DocumentData>
  ) => {
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
    return recipes;
  };

  const getImageUrl = async (url: string) => {
    const refrence = ref(storage, url);
    const imageUrl = await getDownloadURL(refrence);
    return imageUrl;
  };

  const getRecipeOfMonth = (recipes: Recipe[]) => {
    const recipeOfMonth = recipes.find((recipe) => recipe.recipeOfMonth);
    if (recipeOfMonth) return recipeOfMonth;
  };

  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      await fetchRecipes();
      setIsLoading(false);
    };

    initData();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Ladataan...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Combined Streak and Daily Goals Box */}
            <View style={styles.combinedBox}>
              <View style={styles.streakHeader}>
                <Ionicons name="leaf" size={24} color="#4cd964" />
                <Text style={styles.streakCount}>7 päivän putki!</Text>
              </View>
              <Text style={styles.streakSubtext}>Jatka hyvää työtä!</Text>

              <View style={styles.goalsDivider} />

              <Text style={styles.boxTitle}>Päivän tavoitteet</Text>
              <View style={styles.goalRow}>
                <Ionicons name="checkmark-circle" size={24} color="#4cd964" />
                <Text style={styles.goalText}>Syö 5 annosta kasviksia</Text>
              </View>
              <View style={styles.goalRow}>
                <Ionicons name="radio-button-off" size={24} color="#8e8e93" />
                <Text style={styles.goalText}>Kokeile uutta reseptiä</Text>
              </View>
            </View>

            {/* Monthly Challenge */}
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Kuukauden haaste</Text>
              <Text style={styles.challengeText}>
                Kokeile 5 uutta kasvisreseptiä
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progress, { width: "60%" }]} />
              </View>
              <Text style={styles.progressText}>3/5 suoritettu</Text>
            </View>

            {/* Leaderboard of the Month */}
            <View style={styles.box}>
              <Text style={styles.boxTitle}>Kuukauden tulostaulukko</Text>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardPosition}>1.</Text>
                <Text style={styles.leaderboardName}>Käyttäjä A</Text>
                <Text style={styles.leaderboardScore}>150 pistettä</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardPosition}>2.</Text>
                <Text style={styles.leaderboardName}>Käyttäjä B</Text>
                <Text style={styles.leaderboardScore}>120 pistettä</Text>
              </View>
              <View style={styles.leaderboardRow}>
                <Text style={styles.leaderboardPosition}>3.</Text>
                <Text style={styles.leaderboardName}>Käyttäjä C</Text>
                <Text style={styles.leaderboardScore}>100 pistettä</Text>
              </View>
            </View>

            {recipeOfMonth && (
              <RecipeBox
                recipe={recipeOfMonth}
                openModal={() => console.log("hep")}
                toggleFavorite={() => console.log("hep")}
                removeFavorite={() => console.log("hep")}
                userFavoriteRecipes={favoriteRecipes}
              />
            )}
          </ScrollView>
        )}
      </View>
    </ImageBackground>
  );
});

export default Tab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.medium,
  },
  box: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  combinedBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: 20,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  streakCount: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: theme.spacing.small,
    color: theme.colors.primary,
  },
  streakSubtext: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  goalsDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: theme.spacing.medium,
  },
  boxTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
    paddingLeft: 4,
  },
  goalText: {
    marginLeft: theme.spacing.small,
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.text,
  },
  challengeText: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.small,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  recipeBox: {
    marginBottom: 32,
  },
  recipeContent: {
    alignItems: "center",
  },
  recipeTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  recipeDetails: {
    fontSize: 14,
    color: "#666",
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  leaderboardPosition: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.primary,
  },
  leaderboardName: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.text,
  },
  leaderboardScore: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.small,
    color: theme.colors.primary,
    fontSize: theme.fonts.regular.fontSize,
  },
});
