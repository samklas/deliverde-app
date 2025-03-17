import { useState } from "react";
import {
  Text,
  View,
  TextInput,
  StyleSheet,
  ImageBackground,
  Pressable,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth"; // Make sure you have this config file
import { auth } from "@/firebaseConfig";
import { router } from "expo-router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [passWord, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = () => {
    if (!email || !passWord || !confirmedPassword) {
      Alert.alert("Virhe", "Täytä kaikki kentät");
      return false;
    }

    if (passWord !== confirmedPassword) {
      Alert.alert("Virhe", "Salasanat eivät täsmää");
      return false;
    }

    if (passWord.length < 6) {
      Alert.alert("Virhe", "Salasanan tulee olla vähintään 6 merkkiä pitkä");
      return false;
    }

    return true;
  };

  const handleRegistration = async () => {
    const isValid = isFormValid();
    if (isValid) {
      setIsLoading(true);
      try {
        await createUserWithEmailAndPassword(auth, email, passWord);
        router.navigate("/userDetails");
      } catch (error: any) {
        let errorMessage = "Rekisteröinti epäonnistui";
        if (error.code === "auth/email-already-in-use") {
          errorMessage = "Sähköposti on jo käytössä";
        } else if (error.code === "auth/invalid-email") {
          errorMessage = "Virheellinen sähköpostiosoite";
        }
        Alert.alert("Virhe", errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Luo tili</Text>
        <TextInput
          placeholder="Sähköposti"
          keyboardType="email-address"
          style={styles.input}
          onChangeText={(input) => setEmail(input)}
        />
        <TextInput
          placeholder="Salasana"
          secureTextEntry={true}
          style={styles.input}
          onChangeText={(input) => setPassword(input)}
        />
        <TextInput
          placeholder="Vahvista salasana"
          secureTextEntry={true}
          style={styles.input}
          onChangeText={(input) => setConfirmedPassword(input)}
        />

        <Pressable
          style={styles.button}
          onPress={handleRegistration}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Luodaan tiliä..." : "Luo tili"}
          </Text>
        </Pressable>
      </View>
    </ImageBackground>
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
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0c4c25",
    marginBottom: 5,
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
});
