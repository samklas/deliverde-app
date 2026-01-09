import { View, Text, StyleSheet, ImageBackground, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { observer } from "mobx-react-lite";
import recipeStore from "@/stores/recipeStore";
import { useEffect } from "react";
import RecipeBox from "@/components/recipe/RecipeBox";
import LeaderboardBox from "@/components/leaderboard/LeaderboardBox";
import DailyChallengeBox from "@/components/challenges/DailyChallengeBox";
import LoadingIndicator from "@/components/common/LoadingIndicator";
import { useRouter } from "expo-router";
import { useRecipes, useFavorites, useUserData } from "@/hooks";
import { getRecipeOfMonth } from "@/services";

const Tab = observer(() => {
  const router = useRouter();
  const { recipes, recipeOfMonth, isLoading: recipesLoading } = useRecipes();
  const { favoriteRecipes } = useFavorites(recipes);
  const { isLoading: userLoading } = useUserData();

  const { setRecipes, setRecipeOfMonth, setFavoriteRecipes } = recipeStore;

  useEffect(() => {
    if (recipes.length > 0) {
      setRecipes(recipes);
      const monthRecipe = getRecipeOfMonth(recipes);
      if (monthRecipe) setRecipeOfMonth(monthRecipe);
    }
  }, [recipes]);

  useEffect(() => {
    setFavoriteRecipes(favoriteRecipes);
  }, [favoriteRecipes]);

  const isLoading = recipesLoading || userLoading;

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
              <RecipeBox
                recipe={recipeOfMonth}
                userFavoriteRecipes={favoriteRecipes}
                isRecipeOfMonth
              />
            )}
            <Pressable
              style={[styles.feedbackButton, styles.box]}
              onPress={() => router.push("/feedback")}
            >
              <Text style={styles.feedbackText}>Lähetä palautetta</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
            </Pressable>
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
  feedbackButton: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  feedbackText: {
    color: theme.colors.primary,
    fontWeight: "bold",
  },
});
