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
          title: "Luo ryhmä",
        }}
      />
      <Stack.Screen
        name="join"
        options={{
          title: "Liity ryhmään",
        }}
      />
      <Stack.Screen
        name="[groupId]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
