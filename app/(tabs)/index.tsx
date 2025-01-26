import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install expo/vector-icons

export default function Tab() {
  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* <Text style={styles.welcomeText}>Hei Samppa! 👋</Text> */}

          {/* Streak Box */}
          <Pressable style={styles.streakBox}>
            <View style={styles.streakHeader}>
              <Ionicons name="leaf" size={24} color="#4cd964" />
              <Text style={styles.streakCount}>7 päivän putki!</Text>
            </View>
            <Text style={styles.streakSubtext}>Jatka hyvää työtä!</Text>
          </Pressable>

          {/* Daily Goals */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Päivän tavoitteet</Text>
            <View style={styles.goalRow}>
              <Ionicons name="checkmark-circle" size={24} color="#4cd964" />
              <Text style={styles.goalText}>Syö 5 annosta kasviksia</Text>
            </View>
            <View style={styles.goalRow}>
              <Ionicons name="radio-button-off" size={24} color="#8e8e93" />
              <Text style={styles.goalText}>Kokeile uutta reseptiä</Text>
            </View>
          </View>

          {/* Monthly Challenge */}
          <View style={styles.box}>
            <Text style={styles.boxTitle}>Kuukauden haaste</Text>
            <Text style={styles.challengeText}>
              Kokeile 5 uutta kasvisreseptiä
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progress, { width: "60%" }]} />
            </View>
            <Text style={styles.progressText}>3/5 suoritettu</Text>
          </View>

          {/* Recipe of the Month */}
          <View style={[styles.box, styles.recipeBox]}>
            <Text style={styles.boxTitle}>Kuukauden resepti</Text>
            <View style={styles.recipeContent}>
              <ImageBackground
                source={require("../../assets/images/meal.png")}
                style={styles.recipeImage}
              />
              <Text style={styles.recipeTitle}>Kesäinen Kasvisrisotto</Text>
              <Text style={styles.recipeDetails}>
                30 min • Helppo • 4 annosta
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0c4c25",
    marginBottom: 20,
  },
  box: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  streakBox: {
    backgroundColor: "#f0fff0",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#0c4c25",
  },
  streakSubtext: {
    color: "#666",
    fontSize: 14,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0c4c25",
    marginBottom: 12,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  goalText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
  },
  challengeText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: 4,
    marginBottom: 8,
  },
  progress: {
    height: "100%",
    backgroundColor: "#4cd964",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  recipeBox: {
    marginBottom: 32,
  },
  recipeContent: {
    alignItems: "center",
  },
  recipePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  recipeDetails: {
    fontSize: 14,
    color: "#666",
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
});
