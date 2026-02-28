import { Text, StyleSheet, ScrollView, Pressable, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { observer } from "mobx-react-lite";
import recipeStore from "@/stores/recipeStore";
import RecipeBox from "@/components/recipe/RecipeBox";
import LeaderboardBox from "@/components/leaderboard/LeaderboardBox";
import DailyChallengeBox from "@/components/challenges/DailyChallengeBox";
import { useRouter } from "expo-router";
import { useFavorites } from "@/hooks";
import React from "react";

const Tab = observer(() => {
  const router = useRouter();
  const { recipes, recipeOfMonth, favoriteRecipes } = recipeStore;

  // Real-time listener for favorites (keeps favorites in sync)
  const { favoriteRecipes: liveFavorites } = useFavorites(recipes);

  // Use live favorites if available, otherwise use stored ones
  const currentFavorites = liveFavorites.length > 0 ? liveFavorites : favoriteRecipes;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Pressable
        style={styles.shopLinkContainer}
        onPress={() => Linking.openURL("https://deliverde-shop.myshopify.com/collections/all")}
      >
        <Ionicons name="bag-handle-outline" size={18} color={theme.colors.primary} />
        <Text style={styles.shopLink}>DeliVerde Shoppiin</Text>
        <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
      </Pressable>
      <DailyChallengeBox />
      <LeaderboardBox />
      {recipeOfMonth && recipeOfMonth.id && (
        <RecipeBox
          recipe={recipeOfMonth}
          userFavoriteRecipes={currentFavorites}
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
  );
});

export default Tab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
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
    fontFamily: theme.fontFamily.semiBold,
  },
  shopLinkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    marginBottom: theme.spacing.medium,
  },
  shopLink: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
    textDecorationLine: "underline",
    fontSize: 15,
  },
});
