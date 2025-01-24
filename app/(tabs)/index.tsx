import { View, Text, StyleSheet } from "react-native";

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tervetuloa Deliverde-sovellukseen!</Text>
      <Text style={styles.subtitle}>
        Tällä sovelluksella voit valita ja ostaa vihannekset ja reseptit
        Deliverde-sovellukseen!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
});
