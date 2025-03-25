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
  onSnapshot,
  QuerySnapshot,
  getDoc,
  doc,
} from "firebase/firestore";
import { auth, db } from "@/firebaseConfig";
import { Recipe } from "@/types/recipe";
import RecipeBoxV2 from "@/components/recipe/RecipeBoxV2";
import { getImageUrl } from "@/utils/utils";
import challengeStore from "@/stores/challengeStore";
import LeaderboardBox from "@/components/leaderboard/LeaderboardBox";
import DailyChallengeBox from "@/components/challenges/DailyChallengeBox";
import LoadingIndicator from "@/components/common/LoadingIndicator";

const Tab = observer(() => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {
    setRecipes,
    setRecipeOfMonth,
    favoriteRecipes,
    recipeOfMonth,
    recipes,
    setFavoriteRecipes,
  } = recipeStore;
  const { setDailyTotal, setDailyTarget, setStreak } = challengeStore;

  const getRecipes = async () => {
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

  const getRecipeOfMonth = (recipes: Recipe[]) => {
    const recipeOfMonth = recipes.find((recipe) => recipe.recipeOfMonth);
    if (recipeOfMonth) return recipeOfMonth;
  };

  const filterFavoriteRecipes = (favoriteRecipeIds: string[]) => {
    const filteredRecipes = recipes.filter((recipe) =>
      favoriteRecipeIds.includes(recipe.id)
    );

    setFavoriteRecipes(filteredRecipes);
  };

  const getUserDetails = async () => {
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userDoc = await getDoc(doc(db, "users", userId));
      const userData = userDoc.data();

      if (!userData) return;

      const levelTargets: Record<string, number> = {
        beginner: 300,
        intermediate: 500,
        advanced: 800,
      };

      setDailyTotal(userData.dailyTotal ?? 0);
      setDailyTarget(levelTargets[userData.level] ?? 800);
      setStreak(userData.streak ?? 0);
    } catch (error) {
      console.error("Error fetching user's details:", error);
    }
  };

  // real time listener for user's favorite recipes
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
    const initData = async () => {
      setIsLoading(true);
      await getRecipes();
      await getUserDetails();
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
          <LoadingIndicator />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <DailyChallengeBox />
            <LeaderboardBox />
            {recipeOfMonth && (
              <RecipeBoxV2
                recipe={recipeOfMonth}
                userFavoriteRecipes={favoriteRecipes}
                isRecipeOfMonth
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
});
