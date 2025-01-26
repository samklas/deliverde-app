import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "green",
        headerBackground: () => {
          return (
            <Image
              source={require("../../assets/images/header-background.png")} // Adjust the path to your image
              style={{
                height: "100%",
                width: "100%",
                resizeMode: "cover",
              }}
            />
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Etusivu",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Reseptit",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="receipt" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="greens"
        options={{
          title: "Vihannekset",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="nutrition" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profiili",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
