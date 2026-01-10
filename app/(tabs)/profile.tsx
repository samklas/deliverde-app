import { auth } from "@/firebaseConfig";
import userStore from "@/stores/userStore";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
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
import { storage, deleteAccount } from "@/services";
import { STORAGE_KEYS } from "@/constants";

export default function Tab() {
  const [username, setUsername] = useState("");
  const { avatarId, dailyTarget } = userStore;
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      "Vahvista uloskirjautuminen",
      "Oletko varma, että haluat kirjautua ulos?",
      [
        {
          text: "Kyllä",
          onPress: async () => {
            try {
              await storage.clearUserData();
              auth.signOut();
            } catch (error) {
              console.error("Error logging out:", error);
            }
          },
        },
        {
          text: "Ei",
          onPress: () => {},
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Poista tili",
      "Oletko varma, että haluat poistaa tilisi? Tätä toimintoa ei voi perua.",
      [
        {
          text: "Poista",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              await storage.clearUserData();
              router.replace("/login");
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Virhe", "Tilin poistaminen epäonnistui. Yritä uudelleen.");
            }
          },
        },
        {
          text: "Peruuta",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const loadUsername = async () => {
    const storedUsername = await storage.get(STORAGE_KEYS.USERNAME);
    if (storedUsername) {
      setUsername(storedUsername);
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
    loadUsername();
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

          <View style={[styles.box, styles.goalBox]}>
            <Text style={styles.sectionTitle}>Päivän tavoite</Text>
            <View style={styles.goalItem}>
              <Text>Syö {dailyTarget}g vihanneksia</Text>
            </View>
          </View>

          <Pressable
            style={[styles.feedbackButton, styles.box]}
            onPress={() => router.push("/feedback")}
          >
            <Text>Lähetä palautetta</Text>
            <Ionicons name="arrow-forward" size={20} />
          </Pressable>

          <View style={styles.logoutContainer}>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Kirjaudu ulos</Text>
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>Poista tili</Text>
            </Pressable>
          </View>
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
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: theme.colors.primary,
  },
  goalItem: {},
  goalBox: {
    marginTop: 50,
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
  feedbackButton: {
    flex: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoutContainer: {
    alignItems: "center",
    marginBottom: 30,
    flex: 1,
    justifyContent: "flex-end",
  },
  logoutButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: theme.colors.primary,
    fontWeight: "500",
  },
  deleteButton: {
    borderWidth: 2,
    borderColor: theme.colors.error,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  deleteText: {
    color: theme.colors.error,
    fontWeight: "500",
  },
});
