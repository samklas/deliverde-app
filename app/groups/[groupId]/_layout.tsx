import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function GroupDetailLayout() {
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitleStyle: {
          fontFamily: "Poppins_400Regular",
        },
        headerTitleStyle: {
          fontFamily: "Poppins_600SemiBold",
        },
        headerTintColor: "#0c4c25",
        headerBackTitle: "Takaisin",
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={28} color="#0c4c25" />
              <Text style={styles.backText}>Takaisin</Text>
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="leaderboard"
        options={{
          title: "",
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: -8,
  },
  backText: {
    color: "#0c4c25",
    fontSize: 17,
    fontFamily: "Poppins_400Regular",
  },
});
