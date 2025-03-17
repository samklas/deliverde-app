import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import { useState } from "react";
import { Link } from "expo-router";

export default function UserDetails() {
  const [username, setUsername] = useState("");
  const [level, setLevel] = useState("beginner");

  const levels = ["aloittelija", "keskitaso", "kokenut"];

  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Käyttäjätiedot</Text>

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

      <Link href="/(tabs)" asChild>
        <Pressable
          style={styles.continueButton}
          onPress={() => {
            /* Handle continue */
          }}
        >
          <Text style={styles.continueButtonText}>Jatka</Text>
        </Pressable>
      </Link>
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
