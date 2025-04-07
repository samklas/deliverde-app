import { Redirect, Stack } from "expo-router";
import React from "react";
import "../firebaseConfig"; // Import at the top of your entry file

export default function RootLayout() {
  // Add a way to check authentication status
  // const isAuthenticated = false; // Replace this with your actual auth check

  // Redirect authenticated users to tabs, otherwise to index
  // if (isAuthenticated) {
  //   return <Redirect href="/(tabs)" />;
  // }

  return (
    <Stack>
      {/* <Stack.Screen name="splash" options={{ headerShown: false }} /> */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="login"
        options={{ headerShown: false, title: "Kirjaudu" }}
      />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "takaisin",
          headerTintColor: "green",
        }}
      />
      <Stack.Screen
        name="userDetails"
        options={{ headerShown: false, title: "" }}
      />
      <Stack.Screen
        name="feedback"
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "takaisin",
          headerTintColor: "green",
        }}
      />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
