import { Link, router } from "expo-router";
import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ImageBackground,
} from "react-native";
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
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        router.push("/(tabs)");
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
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

          <Link href="/register" style={styles.link}>
            Eikö ole tiliä? Luo tili painamalla tästä!
          </Link>
        </View>
      </ImageBackground>
    );
  }

  return null;
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
