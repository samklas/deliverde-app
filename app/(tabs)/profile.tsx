import { auth, db } from "@/firebaseConfig";
import userStore from "@/stores/userStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, Button, Alert } from "react-native";

export default function Tab() {
  const [username, setUsername] = useState("");
  const { avatarId, dailyTarget } = userStore;

  const handleLogout = async () => {
    Alert.alert(
      "Vahvista uloskirjautuminen",
      "Oletko varma, että haluat kirjautua ulos?",
      [
        {
          text: "Kyllä",
          onPress: async () => {
            try {
              auth.signOut();
              // remove all the data from async storage
              await AsyncStorage.multiRemove([
                "id",
                "username",
                "dailyTotal",
                "vegetables",
                "lastUsedVegetables",
              ]);
              router.push("/login");
            } catch (error) {
              console.error("Error logging out:", error);
            }
          },
        },
        {
          text: "Ei",
          onPress: () => console.log("Logout cancelled"),
          //style: "cancel",
        },
      ],

      { cancelable: false }
    );
  };

  const getUsername = async () => {
    const username = await AsyncStorage.getItem("username");

    if (username) {
      setUsername(username);
    }
  };

  useEffect(() => {
    getUsername();
  }, []);

  const getAvatar = () => {
    if (avatarId === "1") {
      return require("../../assets/images/avatar2.jpg");
    }
    if (avatarId === "2") {
      return require("../../assets/images/avatar3.jpg");
    }
    if (avatarId === "3") {
      return require("../../assets/images/avatar4.jpg");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image source={getAvatar()} style={styles.avatar} />
        <Text style={styles.username}>{username}</Text>
      </View>

      <View style={styles.goalsSection}>
        <Text style={styles.sectionTitle}>Päivän tavoitteet</Text>
        <View style={styles.goalItem}>
          <Text>🎯 Päivän tavoite {dailyTarget}g</Text>
        </View>
      </View>
      <Button
        title="Kirjaudu ulos"
        onPress={async () => {
          await handleLogout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  goalsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  goalItem: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
