import { Stack } from "expo-router";
import React from "react";

export default function CompetitionDetailLayout() {
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
          title: "Kilpailu",
        }}
      />
    </Stack>
  );
}
