import { Link, router } from "expo-router";
import { Text, View, TextInput, Pressable, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/firebaseConfig";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const userId = await AsyncStorage.getItem("id");

      if (userId) {
        setIsLoggedIn(true);
        router.push("/(tabs)");
      } else {
        console.log("ei userId:tä");
        setIsLoggedIn(false);
      }

      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      //const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(userCredential);
      storeUserId(userCredential.user.uid);
      getUserId();
      router.push("/(tabs)");
    } catch (error) {
      console.error("Error logging in:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const storeUserId = async (value: string) => {
    try {
      await AsyncStorage.setItem("id", value);
    } catch (e) {
      console.log("error: " + e);
    }
  };

  const getUserId = async () => {
    try {
      const value = await AsyncStorage.getItem("id");
      if (value !== null) {
        console.log("id from ascyn storage: " + value);
        return value;
      }
    } catch (e) {
      // error reading value
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
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
            {isLoading ? "Logging in..." : "Login"}
          </Text>
        </Pressable>

        <Link href="/splash" style={styles.link}>
          Go to Home
        </Link>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
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
    backgroundColor: "#007AFF",
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
    color: "#007AFF",
    textAlign: "center",
  },
});
