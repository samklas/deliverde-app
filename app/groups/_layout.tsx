import { Stack } from "expo-router";
import React from "react";

export default function GroupsLayout() {
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
        name="create"
        options={{
            headerShown: true,
            title: "",
            headerBackTitle: "Takaisin",
            headerTintColor: "#0c4c25",
          }}
      />
      <Stack.Screen
        name="join"
        options={{
          headerBackTitle: "Takaisin",
          title: "",
        }}
      />
      <Stack.Screen
        name="[groupId]"
        options={{
          headerBackTitle: "Takaisin",
          title: "",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
