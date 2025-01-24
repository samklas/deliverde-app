import { View, Text, StyleSheet, ImageBackground } from "react-native";

export default function Tab() {
  return (
    <ImageBackground
      source={require("../../assets/images/Designer.jpeg")} // Adjust the path to your image
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Tervetuloa Deliverde-sovellukseen!</Text>
          <View style={styles.divider} />
          <Text style={styles.subtitle}>
            Tällä sovelluksella voit valita ja ostaa vihannekset ja reseptit
            Deliverde-sovellukseen!
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 200,
    paddingBottom: 200,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0c4c25",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    color: "#333333",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  divider: {
    width: 60,
    height: 4,
    backgroundColor: "#0c4c25",
    borderRadius: 2,
    marginBottom: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 1)", // Semi-transparent white overlay
    padding: 24,
  },
});
