import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect, useState, useCallback, useRef } from "react";
import * as SplashScreen from "expo-splash-screen";
import { View } from "react-native";
import "../firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { loadAppData, checkUserExists } from "@/services";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const hasInitialized = useRef(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

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
          // Check if user has completed profile setup
          const profileExists = await checkUserExists(user.uid);

          if (profileExists) {
            // User has completed profile - load all app data
            await loadAppData();
            setInitialRoute("(tabs)");
          } else {
            // User is authenticated but hasn't completed profile
            setInitialRoute("userDetails");
          }
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
        hasInitialized.current = true;
      }
    }

    prepare();
  }, []);

  // Listen for auth state changes after initial load (handles logout)
  useEffect(() => {
    if (!hasInitialized.current) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const inAuthGroup = segments[0] === "(tabs)";

      if (!user && inAuthGroup) {
        // User logged out while in authenticated area
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [segments]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady || !initialRoute || !fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <Stack
        initialRouteName={initialRoute}
        screenOptions={{
          headerBackTitleStyle: {
            fontFamily: "Poppins_400Regular",
          },
          headerTitleStyle: {
            fontFamily: "Poppins_600SemiBold",
          },
        }}
      >
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
          name="userDetails"
          options={{
            headerShown: true,
            title: "",
            headerBackTitle: "Takaisin",
            headerTintColor: "#0c4c25",
          }}
        />
        <Stack.Screen
          name="userLevel"
          options={{
            headerShown: true,
            title: "",
            headerBackTitle: "Takaisin",
            headerTintColor: "#0c4c25",
          }}
        />
        <Stack.Screen
          name="info"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="email"
          options={{
            headerShown: true,
            title: "",
            headerBackTitle: "Takaisin",
            headerTintColor: "#0c4c25",
          }}
        />
        <Stack.Screen
          name="feedback"
          options={{
            headerShown: true,
            title: "",
            headerBackTitle: "Takaisin",
            headerTintColor: "#0c4c25",
          }}
        />
        <Stack.Screen
          name="recipe-suggestion"
          options={{
            headerShown: true,
            title: "",
            headerBackTitle: "Takaisin",
            headerTintColor: "#0c4c25",
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}
