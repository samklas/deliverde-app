import {
  Text,
  View,
  TextInput,
  Button,
  StyleSheet,
  ImageBackground,
} from "react-native";

export default function Register() {
  return (
    <ImageBackground
      source={require("../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Register</Text>
        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput placeholder="Username" style={styles.input} />
        <TextInput
          placeholder="Password"
          secureTextEntry={true}
          style={styles.input}
        />
        <Button
          title="Submit"
          onPress={() => {
            /* Handle registration */
          }}
        />
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
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
});
