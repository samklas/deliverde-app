import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useState } from "react";
import { theme } from "@/theme";
import RecipeBox from "@/components/recipe/RecipeBox";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRecipes, useFavorites } from "@/hooks";

export default function Tab() {
  const [activeSection, setActiveSection] = useState("all");
  const router = useRouter();

  const { recipes, isLoading } = useRecipes();
  const { favoriteRecipes } = useFavorites(recipes);

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
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
        <ScrollView style={styles.recipeList} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            (activeSection === "all" ? recipes : favoriteRecipes).map((recipe) => (
              <RecipeBox
                key={recipe.id}
                recipe={recipe}
                userFavoriteRecipes={favoriteRecipes}
              />
            ))
          )}
        </ScrollView>
        <Pressable
          style={[styles.suggestButton, styles.box]}
          onPress={() => router.push("/recipe-suggestion" as any)}
        >
          <Text style={styles.suggestText}>Ehdota reseptiä</Text>
          <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
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
    borderBottomColor: theme.colors.secondary,
  },
  activeText: {
    fontWeight: "bold",
  },
  tabText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  recipeList: {
    flex: 1,
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
    fontWeight: "bold",
  },
});
