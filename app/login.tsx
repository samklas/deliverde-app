import { db, auth } from "@/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getUsername = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const document = await getDoc(docRef);
    if (document.exists()) {
      return document.data().username as string;
    }

    throw new Error("error");
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      //const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const username = await getUsername(userCredential.user.uid);

      storeUserId(userCredential.user.uid, username);
      getUserId();
      router.push("/(tabs)");
    } catch (error: any) {
      //console.error("Error logging in:", error);
      let message =
        "Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana.";

      // if (error.code === "auth/user-not-found") {
      //   message = "Käyttäjää ei löytynyt.";
      // } else if (error.code === "auth/wrong-password") {
      //   message = "Väärä salasana.";
      // } else if (error.code === "auth/invalid-email") {
      //   message = "Virheellinen sähköpostiosoite.";
      // }
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const storeUserId = async (uid: string, username: string) => {
    try {
      await AsyncStorage.multiSet([
        ["id", uid],
        ["username", username],
      ]);
    } catch (e) {
      console.log("error: " + e);
    }
  };

  const getUserId = async () => {
    try {
      const value = await AsyncStorage.getItem("id");
      if (value !== null) {
        return value;
      }
    } catch (e) {
      // error reading value
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ImageBackground
        source={require("../assets/images/background.jpeg")}
        style={styles.container}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Text style={styles.title}>Tervetuloa</Text>

          <TextInput
            style={styles.input}
            placeholder="Sähköposti"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Salasana"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Pressable
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
            </Text>
          </Pressable>

          {errorMessage ? (
            <Text
              style={{ color: "#c00", textAlign: "center", marginBottom: 10 }}
            >
              {errorMessage}
            </Text>
          ) : null}

          <Link href="/register" style={styles.link}>
            Eikö ole tiliä? Luo tili painamalla tästä!
          </Link>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)",
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
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  button: {
    backgroundColor: "#0c4c25",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    color: "#0c4c25",
    textAlign: "center",
  },
});
