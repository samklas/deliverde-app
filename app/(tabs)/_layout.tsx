import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { Image } from "react-native";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "green" }}>
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
          headerTitle: "",
          headerBackground: () => (
            <Image
              source={require("../../assets/images/background.jpeg")} // Adjust the path to your image
              style={{
                height: "100%",
                width: "100%",
                resizeMode: "cover",
              }}
            />
          ),
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="document-text-sharp" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="greens"
        options={{
          title: "Vihannekset",
          headerTitle: "",
          headerBackground: () => (
            <Image
              source={require("../../assets/images/background.jpeg")} // Adjust the path to your image
              style={{
                height: "100%",
                width: "100%",
                resizeMode: "cover",
              }}
            />
          ),

          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="checkmark" color={color} />
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
