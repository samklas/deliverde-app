import { View, Text, StyleSheet, Image } from "react-native";

export default function Tab() {
  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={require("../../assets/images/herb.jpg")}
          style={styles.avatar}
        />
        <Text style={styles.username}>Samppa</Text>
      </View>

      <View style={styles.goalsSection}>
        <Text style={styles.sectionTitle}>Päivän tavoitteet</Text>
        <View style={styles.goalItem}>
          <Text>🎯 1kg vihanneksia</Text>
        </View>
        <View style={styles.goalItem}>
          <Text>💪 Exercise 3 times a week</Text>
        </View>
        <View style={styles.goalItem}>
          <Text>📚 Read 12 books this year</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  goalsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  goalItem: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
});
