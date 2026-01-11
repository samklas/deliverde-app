import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";
import { Image } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#37891C",
        headerTitle: "",
        headerTitleStyle: {
          color: "white",
        },
        headerBackground: () => {
          return (
            <Image
              source={require("../../assets/images/Deliverde_header.jpg")} // Adjust the path to your image
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
        name="greens"
        options={{
          title: "Tavoitteet",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="leaf" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Reseptit",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="book" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profiili",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="user" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
