import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { useState } from "react";
import { auth } from "@/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentYearMonth } from "@/utils/utils";

export default function UserDetails() {
  const [username, setUsername] = useState("");
  const [level, setLevel] = useState("aloittelija");
  const [isLoading, setIsLoading] = useState(false);
  const levels = ["aloittelija", "keskitaso", "kokenut"];

  const isUsernameAvailable = async (username: string) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const isValid = async () => {
    if (!username.trim()) {
      Alert.alert("Virhe", "Käyttäjänimi on pakollinen");
      return false;
    }
    if (!(await isUsernameAvailable(username))) {
      Alert.alert("Virhe", "Käyttäjänimi on jo käytössä");
      return false;
    }

    return true;
  };

  const addUser = async () => {
    const uid = auth.currentUser?.uid;

    if ((await isValid()) && uid) {
      setIsLoading(true);
      try {
        // Using setDoc with custom ID (uid) instead of addDoc
        await setDoc(doc(db, "users", uid), {
          username: username,
          level: level,
          createdAt: new Date(),
          uid: uid,
          dailyTotal: 0,
          score: 0,
          streak: 0,
        });

        await addUserToLeaderBoard(uid);

        await AsyncStorage.multiSet([
          ["id", uid],
          ["username", username],
        ]);

        router.push("/(tabs)");
      } catch (error) {
        console.error("Error adding user:", error);
        Alert.alert("Virhe", "Käyttäjätietojen tallentaminen epäonnistui");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const addUserToLeaderBoard = async (uid: string) => {
    const currentYearMonth = getCurrentYearMonth();
    await setDoc(doc(db, `leaderboard/${currentYearMonth}/users`, uid), {
      username: username,
      uid: uid,
      points: 0,
    });
  };

  return (
    <View style={styles.overlay}>
      <Text style={styles.levelLabel}>
        Tili luotu onnistuneesti! Asetetaan vielä käyttäjänimi sekä taso, niin
        sen jälkeen olemme valmiit aloittamaan!
      </Text>
      {/* <Text style={styles.title}>Käyttäjätiedot</Text> */}
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Käyttäjänimi"
      />

      <Text style={styles.levelLabel}>Valitse tasosi</Text>
      <View style={styles.levelButtons}>
        {levels.map((lvl) => (
          <Pressable
            key={lvl}
            style={[styles.levelButton, level === lvl && styles.selectedLevel]}
            onPress={() => setLevel(lvl)}
          >
            <Text
              style={[
                styles.levelText,
                level === lvl && styles.selectedLevelText,
              ]}
            >
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.continueButton}
        onPress={addUser}
        disabled={isLoading}
      >
        <Text style={styles.continueButtonText}>
          {isLoading ? "Tallennetaan..." : "Jatka"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  todayBox: {
    backgroundColor: "white",
    padding: 40,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    flexDirection: "column",
  },
  overlay: {
    flex: 1,
    // backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 16,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0c4c25",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c4c25",
    marginBottom: 10,
  },
  levelButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  levelButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedLevel: {
    backgroundColor: "#0c4c25",
  },
  levelText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  selectedLevelText: {
    color: "white",
  },
  continueButton: {
    backgroundColor: "#0c4c25",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
