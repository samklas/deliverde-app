import { auth } from "@/firebaseConfig";
import userStore from "@/stores/userStore";
import { theme } from "@/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  ImageBackground,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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

  useEffect(() => {
    getUsername();
  }, []);

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.profileHeader}>
            <Image source={getAvatar()} style={styles.avatar} />
            <Text style={styles.username}>{username}</Text>
          </View>

          <View style={[styles.box, { marginTop: 50 }]}>
            <Text style={styles.sectionTitle}>Päivän tavoite</Text>
            <View style={styles.goalItem}>
              <Text> Syö {dailyTarget}g vihanneksia 🥬</Text>
            </View>
          </View>
          <View
            style={[
              styles.box,
              {
                flex: 0,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              },
            ]}
          >
            <Text>Lähetä palautetta</Text>
            <Ionicons name="arrow-forward" size={20} />
          </View>

          <Pressable
            style={{
              alignItems: "center",
              marginBottom: 30,
              flex: 1,
              justifyContent: "flex-end",
            }}
            onPress={async () => await handleLogout()}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: "500",
                borderWidth: 2,
                borderColor: theme.colors.primary,
                borderRadius: 20,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              Kirjaudu ulos
            </Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 10,
    marginTop: 50,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.medium,
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
    // borderWidth: 5,

    // borderColor: theme.colors.primary,
    // // borderRadius: 25,
    // // padding: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  goalsSection: {
    marginTop: 20,
    backgroundColor: theme.colors.background,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: theme.colors.primary,
  },
  goalItem: {
    // backgroundColor: theme.colors.background,
    // padding: 15,
    // borderRadius: 10,
    // marginBottom: 10,
  },
  box: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
