import { db } from "@/firebaseConfig";
import { theme } from "@/theme";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const Feedback = () => {
  const [feedback, setFeedback] = useState("");

  const handleSubmit = async () => {
    if (feedback === "") {
      Alert.alert("Palaute puuttuu!");
      return;
    }

    try {
      // Add a new document with a generated ID
      await addDoc(collection(db, "feedback"), {
        createdAt: new Date(),
        feedback: feedback,
      });
      Alert.alert("Kiitos palautteestasi!");
      setFeedback("");
    } catch (error) {
      Alert.alert("Virhe tallennettaessa palautetta! Yritä uudestaan.");
    }
  };

  return (
    <TouchableWithoutFeedback
      style={{ backgroundColor: "#fff" }}
      onPress={Keyboard.dismiss}
    >
      <View style={styles.container}>
        <Text style={styles.heading}>Palautteesi on meille tärkeää!</Text>
        <Text style={styles.bodyText}>
          Haluamme jatkuvasti kehittää sovellustamme ja tehdä siitä entistäkin
          paremman. Siksi arvostamme suuresti jokaista kommenttia, risua ja
          ruusua.
        </Text>
        <Text style={[styles.bodyText, { marginTop: 10 }]}>
          Kiitos, että autat meitä parantamaan! 💚
        </Text>

        <TextInput
          style={styles.input}
          multiline
          placeholder="Kirjoita palautteesi tähän..."
          placeholderTextColor="#ccc"
          value={feedback}
          onChangeText={setFeedback}
        />

        <TouchableOpacity
          style={styles.submitButton}
          onPress={() => handleSubmit()}
        >
          <Text style={styles.submitText}>Lähetä</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 0,
    width: "100%",
    backgroundColor: "white",
  },
  heading: {
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
    marginBottom: 30,
    textAlign: "center",
    color: theme.colors.primary,
  },
  bodyText: {
    textAlign: "center",
    fontFamily: theme.fontFamily.regular,
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  label: { fontSize: 16, marginVertical: 10, fontFamily: theme.fontFamily.regular },
  ratingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  ratingButton: {
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
    width: 50,
    alignItems: "center",
  },
  selected: { backgroundColor: "#5cb85c" },
  ratingText: { fontSize: 16, fontFamily: theme.fontFamily.regular },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    color: "#2d3436",
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    height: 100,
    width: "100%",
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 50,
    width: "100%",
  },
  submitText: { color: "white", fontFamily: theme.fontFamily.semiBold, fontSize: 16 },
});

export default Feedback;
