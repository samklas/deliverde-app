import { db, auth } from "@/firebaseConfig";
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
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import { storage, loadAppData, signInWithApple, signInWithGoogle, type AuthResult } from "@/services";
import { STORAGE_KEYS } from "@/constants";
import { theme } from "@/theme";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const getUsername = async (uid: string): Promise<string> => {
    const docRef = doc(db, "users", uid);
    const document = await getDoc(docRef);
    if (document.exists()) {
      return document.data().username as string;
    }
    throw new Error("User document not found");
  };

  const handleSocialAuthResult = async (result: AuthResult) => {
    if (result.isNewUser) {
      // New user - go to userDetails to complete profile
      router.navigate("/userDetails");
    } else {
      // Returning user - save to storage and go to main app
      await storage.multiSet([
        [STORAGE_KEYS.USER_ID, result.uid],
        [STORAGE_KEYS.USERNAME, result.username || ""],
      ]);
      await loadAppData();
      router.replace("/(tabs)");
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setIsAppleLoading(true);
      setErrorMessage("");
      const result = await signInWithApple();
      await handleSocialAuthResult(result);
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        // User canceled - don't show error
        return;
      }
      setErrorMessage("Apple-kirjautuminen epäonnistui");
    } finally {
      setIsAppleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMessage("");
      const result = await signInWithGoogle();
      await handleSocialAuthResult(result);
    } catch (error: any) {
      if (error.code === "SIGN_IN_CANCELLED") {
        // User canceled - don't show error
        return;
      }
      setErrorMessage("Google-kirjautuminen epäonnistui");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const username = await getUsername(userCredential.user.uid);

      await storage.multiSet([
        [STORAGE_KEYS.USER_ID, userCredential.user.uid],
        [STORAGE_KEYS.USERNAME, username],
      ]);

      // Load all app data before navigating
      await loadAppData();

      router.replace("/(tabs)");
    } catch (error) {
      const message = "Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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

          <Pressable style={styles.button} onPress={handleLogin} disabled={isLoading}>
            <Text style={styles.buttonText}>
              {isLoading ? "Kirjaudutaan..." : "Kirjaudu sisään"}
            </Text>
          </Pressable>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>tai</Text>
            <View style={styles.divider} />
          </View>

          {/* Apple Sign-In - iOS only */}
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={5}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Google Sign-In */}
          <Pressable
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <Text style={styles.googleButtonText}>
              {isGoogleLoading ? "Kirjaudutaan..." : "Jatka Google-tilillä"}
            </Text>
          </Pressable>

          <Link href="/register" style={styles.link}>
            Eikö ole tiliä? Luo tili painamalla tästä!
          </Link>
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: 10,
  },
  link: {
    color: theme.colors.primary,
    textAlign: "center",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#666",
    fontSize: 14,
  },
  appleButton: {
    height: 50,
    width: "100%",
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 12,
  },
  googleButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
