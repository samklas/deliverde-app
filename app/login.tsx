import { router } from "expo-router";
import { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  View,
  Text,
  Platform,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as AppleAuthentication from "expo-apple-authentication";
import {
  storage,
  loadAppData,
  signInWithApple,
  signInWithGoogle,
  type AuthResult,
} from "@/services";
import { STORAGE_KEYS } from "@/constants";
import { theme } from "@/theme";
import React from "react";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);

  const handleAuthResult = async (result: AuthResult) => {
    if (result.isNewUser) {
      router.navigate("/info");
    } else {
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
      setIsLoading(true);
      setErrorMessage("");
      const result = await signInWithApple();
      await handleAuthResult(result);
    } catch (error: any) {
      if (error.code === "ERR_REQUEST_CANCELED") {
        return;
      }
      setErrorMessage("Kirjautuminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      const result = await signInWithGoogle();
      await handleAuthResult(result);
    } catch (error: any) {
      if (error.code === "SIGN_IN_CANCELLED") {
        return;
      }
      setErrorMessage("Kirjautuminen epäonnistui. Yritä uudelleen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/Deliverde_tervetuloa2.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Tervetuloa</Text>
          <Text style={styles.subtitle}>
            Kirjaudu sisään jatkaaksesi. Kirjautumalla hyväksyt{" "}
          
            <Text
              style={styles.link}
              onPress={() => setPrivacyModalVisible(true)}
            >
              tietosuojakäytännön
            </Text>
            .
          </Text>

          {/* Apple Sign-In - iOS only */}
          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
              cornerRadius={8}
              style={styles.appleButton}
              onPress={handleAppleSignIn}
            />
          )}

          {/* Google Sign-In - Android only */}
          {Platform.OS === "android" && (
            <Pressable
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <AntDesign name="google" size={20} color="white" style={styles.googleIcon} />
              <Text style={styles.googleButtonText}>
                {isLoading ? "Kirjaudutaan..." : "Jatka Google-tilillä"}
              </Text>
            </Pressable>
          )}

          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>
      </View>

      <Modal
        visible={privacyModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tietosuojaseloste</Text>
            <ScrollView style={styles.privacyScrollView}>
              <Text style={styles.privacyDate}>Viimeksi päivitetty: 28.1.2026</Text>

              <Text style={styles.privacySectionTitle}>1. Rekisterinpitäjä</Text>
              <Text style={styles.privacyText}>
                DeliVerde Puutarhat Oy{"\n"}
                Sähköposti: tilaus@deliverde.fi
              </Text>

              <Text style={styles.privacySectionTitle}>2. Sovelluksen tarkoitus</Text>
              <Text style={styles.privacyText}>
                DeliVerde on mobiilisovellus, jonka avulla käyttäjät voivat seurata kasvisten kulutustaan, selata reseptejä ja osallistua kilpailuihin.
              </Text>

              <Text style={styles.privacySectionTitle}>3. Kerättävät henkilötiedot</Text>
              <Text style={styles.privacyText}>
                Sovelluksen käyttö ei edellytä henkilötietojen antamista. Käyttäjä voi halutessaan antaa:{"\n\n"}
                • sähköpostiosoitteen{"\n"}
                • valokuvia
              </Text>

              <Text style={styles.privacySectionTitle}>4. Henkilötietojen käyttötarkoitus</Text>
              <Text style={styles.privacyText}>
                Henkilötietoja käytetään ainoastaan:{"\n\n"}
                • kilpailuihin ja arvontoihin osallistumisen mahdollistamiseen{"\n"}
                • sovelluksen toiminnallisuuksien toteuttamiseen käyttäjän aloitteesta{"\n\n"}
                Tietoja ei käytetä markkinointiin.
              </Text>

              <Text style={styles.privacySectionTitle}>5. Käsittelyn oikeusperuste</Text>
              <Text style={styles.privacyText}>
                Henkilötietojen käsittely perustuu käyttäjän antamaan suostumukseen (GDPR 6.1.a).
              </Text>

              <Text style={styles.privacySectionTitle}>6. Tietojen säilytys</Text>
              <Text style={styles.privacyText}>
                Henkilötietoja säilytetään vain niin kauan kuin se on tarpeellista käyttötarkoituksen toteuttamiseksi tai kunnes käyttäjä pyytää tietojensa poistamista.
              </Text>

              <Text style={styles.privacySectionTitle}>7. Tietojen käsittelijät ja siirrot</Text>
              <Text style={styles.privacyText}>
                Henkilötietoja käsitellään sovelluksen teknisen toteutuksen ja ylläpidon yhteydessä luotettavien palveluntarjoajien toimesta. Tietoja voidaan käsitellä EU:ssa tai EU:n ulkopuolella GDPR:n edellyttämiä suojatoimia noudattaen.
              </Text>

              <Text style={styles.privacySectionTitle}>8. Käyttäjän oikeudet</Text>
              <Text style={styles.privacyText}>
                Käyttäjällä on oikeus:{"\n\n"}
                • tarkastaa itseään koskevat tiedot{"\n"}
                • pyytää tietojen oikaisua tai poistamista{"\n\n"}
                Pidätämme oikeuden päivittää tätä tietosuojaselostetta. Muutoksista ilmoitetaan sovelluksessa.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>Sulje</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
   // backgroundColor: theme.colors.overlay,
    justifyContent: "center",
    padding: theme.spacing.medium,
  },
  content: {
    alignItems: "center",
  },
  title: {
    fontSize: 36,
    fontFamily: theme.fontFamily.bold,
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: "#fff",
    marginBottom: 40,
    textAlign: "center",
  },
  appleButton: {
    height: 48,
    width: "100%",
    marginBottom: 16,
  },
  googleButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    width: "100%",
    height: 48,
    justifyContent: "center",
    marginBottom: 16,
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    marginTop: 16,
    fontFamily: theme.fontFamily.regular,
  },
  link: {
    textDecorationLine: "underline",
    fontFamily: theme.fontFamily.semiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.medium,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    width: "100%",
    height: "80%",
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.medium,
    textAlign: "center",
  },
  privacyScrollView: {
    flex: 1,
  },
  privacyDate: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.medium,
  },
  privacySectionTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.medium,
    marginBottom: theme.spacing.small,
  },
  privacyText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
    lineHeight: 22,
  },
  modalCloseButton: {
    marginTop: theme.spacing.medium,
    padding: theme.spacing.small,
    backgroundColor: "#37891C",
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  modalCloseButtonText: {
    color: "white",
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 16,
  },
});
