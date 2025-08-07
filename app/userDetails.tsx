import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
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
import userStore from "@/stores/userStore";

export default function UserDetails() {
  const [username, setUsername] = useState("");
  const [level, setLevel] = useState("aloittelija");
  const [isLoading, setIsLoading] = useState(false);
  const levels = ["beginner", "intermediate", "advanced"];
  const [selectedAvatar, setSelectedAvatar] = useState("");
  const { setAvatarId } = userStore;
  const avatar1 = {
    id: "1",
    item: require("@/assets/images/avatar2.jpg"),
  };
  const avatar2 = {
    id: "2",
    item: require("@/assets/images/avatar3.jpg"),
  };
  const avatar3 = {
    id: "3",
    item: require("@/assets/images/avatar4.jpg"),
  };
  const avatars = [avatar1, avatar2, avatar3];

  // const isUsernameAvailable = async (username: string) => {
  //   const usersRef = collection(db, "users");
  //   const q = query(usersRef, where("username", "==", username));
  //   const querySnapshot = await getDocs(q);
  //   return querySnapshot.empty;
  // };

  const isValid = async () => {
    if (!username.trim()) {
      Alert.alert("Virhe", "Käyttäjänimi on pakollinen");
      return false;
    }
    // if (!(await isUsernameAvailable(username))) {
    //   Alert.alert("Virhe", "Käyttäjänimi on jo käytössä");
    //   return false;
    // }

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
          avatarId: selectedAvatar,
        });

        await addUserToLeaderBoard(uid);

        await AsyncStorage.multiSet([
          ["id", uid],
          ["username", username],
        ]);

        setAvatarId(selectedAvatar);

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
    await setDoc(doc(db, `leaderboard`, uid), {
      username: username,
      uid: uid,
      avatarId: selectedAvatar,
      points: 0,
    });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.overlay}>
        <Text style={styles.levelLabel}>Käyttäjänimi</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="Käyttäjänimi"
        />

        <Text style={styles.levelLabel}>Taso</Text>
        <Text style={{ marginBottom: 10, color: "#8D8D8D" }}>
          Valitse itsellesi sopiva taso alla olevista vaihtoehdoista. Taso
          määrittää, kuinka paljon vihanneksia pyrit syömään päivittäin. Voit
          muokata tasoasi myöhemmin Profiili-näkymässä, jos haluat säätää
          tavoitteitasi.
        </Text>
        <View style={styles.levelButtons}>
          {levels.map((lvl) => (
            <Pressable
              key={lvl}
              style={[
                styles.levelButton,
                level === lvl && styles.selectedLevel,
              ]}
              onPress={() => setLevel(lvl)}
            >
              {lvl === "beginner" && (
                <View>
                  <Text
                    style={[
                      styles.levelText,
                      level === lvl && styles.selectedLevelText,
                    ]}
                  >
                    Satunnainen haukkailija | 300g
                  </Text>
                </View>
              )}
              {lvl === "intermediate" && (
                <View>
                  <Text
                    style={[
                      styles.levelText,
                      level === lvl && styles.selectedLevelText,
                    ]}
                  >
                    Vihannesmestari | 500g
                  </Text>
                </View>
              )}
              {lvl === "advanced" && (
                <View>
                  <Text
                    style={[
                      styles.levelText,
                      level === lvl && styles.selectedLevelText,
                    ]}
                  >
                    Vihreä legenda | 800g
                  </Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.levelLabel}>Avatar</Text>
        <View style={styles.avatarSelection}>
          {avatars.map((avatar, index) => (
            <Pressable
              key={index}
              onPress={() => setSelectedAvatar(avatar.id)}
              style={[
                styles.avatarButton,
                selectedAvatar === avatar.id && styles.selectedAvatar,
              ]}
            >
              <Image source={avatar.item} style={styles.avatarImage} />
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
    </TouchableWithoutFeedback>
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
  text: {
    fontSize: 16,
    marginBottom: 50,
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
    flexDirection: "column",
    gap: 10,
    marginBottom: 20,
  },
  levelButton: {
    width: "100%",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
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
    textAlign: "center",
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
  avatarSelection: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  avatarButton: {
    padding: 5,
    borderWidth: 2,
    borderColor: "transparent",
    borderRadius: 50,
  },
  selectedAvatar: {
    borderColor: "#0c4c25",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
