import { theme } from "@/theme";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    if (!rating) {
      Alert.alert("Valitse arvosana!");
      return;
    }

    // Täällä voisit lähettää tiedot esim. Firebaseen tai API:in
    Alert.alert(
      "Kiitos palautteestasi!",
      `Arvosana: ${rating}\nPalaute: ${feedback}`
    );
    setRating(0);
    setFeedback("");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Palautteesi on meille tärkeää!</Text>
      <Text style={{ textAlign: "center" }}>
        Haluamme jatkuvasti kehittää palveluamme ja tehdä siitä entistäkin
        paremman. Siksi arvostamme suuresti jokaista kommenttia, risua ja
        ruusua. Kiitos, että autat meitä parantamaan! 💚
      </Text>
      {/* <Text style={styles.label}>Miten arvioisit kokemuksesi? (1-5)</Text>
      <View style={styles.ratingRow}>
        {[1, 2, 3, 4, 5].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.ratingButton, rating === num && styles.selected]}
            onPress={() => setRating(num)}
          >
            <Text style={styles.ratingText}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {/* <Text style={styles.label}>Vapaa palaute</Text> */}
      <TextInput
        style={styles.input}
        multiline
        placeholder="Kirjoita palautteesi tähän..."
        value={feedback}
        onChangeText={setFeedback}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Lähetä</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 50 },
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
    marginTop: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    height: 100,
    padding: 10,
    textAlignVertical: "top",
  },
  submitButton: {
    marginTop: 40,
    backgroundColor: theme.colors.secondary,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "white", fontWeight: "bold", fontSize: 16 },
});

export default Feedback;
