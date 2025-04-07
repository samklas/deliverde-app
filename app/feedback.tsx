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
      await addDoc(collection(db, "leaderboard"), {
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.heading}>Palautteesi on meille tärkeää!</Text>
        <Text style={{ textAlign: "center" }}>
          Haluamme jatkuvasti kehittää sovellustamme ja tehdä siitä entistäkin
          paremman. Siksi arvostamme suuresti jokaista kommenttia, risua ja
          ruusua.
        </Text>
        <Text style={{ textAlign: "center", marginTop: 10 }}>
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
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: theme.colors.primary,
  },
  label: { fontSize: 16, marginVertical: 10 },
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
  ratingText: { fontSize: 16 },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    height: 100,
    width: "100%",
    padding: 10,
    textAlignVertical: "top",
    backgroundColor: "#fff",
  },
  submitButton: {
    marginTop: 50,
    backgroundColor: theme.colors.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
  },
  submitText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default Feedback;
