import { Stack } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { loadAppData } from "@/services";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Wait for auth state to be determined
        const user = await new Promise<User | null>((resolve) => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
          });
        });

        if (user) {
          // User is logged in - load all app data
          await loadAppData();
          setInitialRoute("(tabs)");
        } else {
          // User not logged in
          setInitialRoute("login");
        }
      } catch (e) {
        console.error("Error loading app data:", e);
        // On error, still allow app to proceed to login
        setInitialRoute("login");
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || !initialRoute) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack initialRouteName={initialRoute}>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
          redirect={true}
        />
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
            headerTintColor: "#0c4c25",
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
            headerTintColor: "#0c4c25",
          }}
        />
        <Stack.Screen
          name="recipe-suggestion"
          options={{
            headerShown: true,
            title: "",
            headerBackTitle: "takaisin",
            headerTintColor: "#0c4c25",
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
