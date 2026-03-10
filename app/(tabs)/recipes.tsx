import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useState, useCallback } from "react";
import { theme } from "@/theme";
import RecipeBox from "@/components/recipe/RecipeBox";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useFavorites } from "@/hooks";
import { observer } from "mobx-react-lite";
import recipeStore from "@/stores/recipeStore";
import { fetchRecipes, getRecipeOfMonth } from "@/services/recipes.service";
import React from "react";

const Tab = observer(() => {
  const [activeSection, setActiveSection] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const { recipes } = recipeStore;
  const { favoriteRecipes } = useFavorites(recipes);

  const loadRecipes = useCallback(async () => {
    if (recipeStore.recipes.filter((r) => r.id).length > 0) return;
    try {
      setLoading(true);
      setError(false);
      const fetched = await fetchRecipes();
      recipeStore.setRecipes(fetched);
      const monthRecipe = getRecipeOfMonth(fetched);
      if (monthRecipe) recipeStore.setRecipeOfMonth(monthRecipe);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadRecipes(); }, [loadRecipes]));

  return (
    <View style={styles.overlay}>
      <View style={styles.tabButtons}>
        <Pressable
          style={[styles.tabButton, activeSection === "all" && styles.activeTab]}
          onPress={() => setActiveSection("all")}
        >
          <Text style={[styles.tabText, activeSection === "all" && styles.activeText]}>
            Reseptit
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeSection === "favorites" && styles.activeTab]}
          onPress={() => setActiveSection("favorites")}
        >
          <Text style={[styles.tabText, activeSection === "favorites" && styles.activeText]}>
            Omat suosikit
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#37891C" />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
          <Text style={styles.errorText}>Reseptien lataus epäonnistui</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              recipeStore.setRecipes([]);
              loadRecipes();
            }}
          >
            <Text style={styles.retryText}>Yritä uudelleen</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView style={styles.recipeList} showsVerticalScrollIndicator={false}>
          {(activeSection === "all" ? recipes : favoriteRecipes)
            .filter((recipe) => recipe.id)
            .map((recipe) => (
              <RecipeBox
                key={recipe.id}
                recipe={recipe}
                userFavoriteRecipes={favoriteRecipes}
              />
            ))}
        </ScrollView>
      )}

      <Pressable
        style={[styles.suggestButton, styles.box]}
        onPress={() => router.push("/recipe-suggestion" as any)}
      >
        <Text style={styles.suggestText}>Ehdota reseptiä</Text>
        <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
      </Pressable>
    </View>
  );
});

export default Tab;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
  },
  tabButtons: {
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    backgroundColor: theme.colors.background,
    elevation: 3,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: "#37891C",
  },
  activeText: {
    fontFamily: theme.fontFamily.semiBold,
  },
  tabText: {
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.primary,
  },
  recipeList: {
    flex: 1,
    padding: theme.spacing.medium,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
  },
  retryButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  retryText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.medium,
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
  suggestButton: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 15,
    marginTop: 15,
  },
  suggestText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
});
