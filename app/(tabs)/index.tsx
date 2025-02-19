import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Make sure to install expo/vector-icons
import { theme } from "@/theme";

export default function Tab() {
  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Combined Streak and Daily Goals Box */}
          <View style={styles.combinedBox}>
            <View style={styles.streakHeader}>
              <Ionicons name="leaf" size={24} color="#4cd964" />
              <Text style={styles.streakCount}>7 päivän putki!</Text>
            </View>
            <Text style={styles.streakSubtext}>Jatka hyvää työtä!</Text>

            <View style={styles.goalsDivider} />

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
                source={require("../../assets/images/meal4.png")}
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
    backgroundColor: theme.colors.background,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    padding: theme.spacing.medium,
  },
  box: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  combinedBox: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: 20,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.secondary,
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  streakCount: {
    fontSize: 20,
    marginLeft: theme.spacing.small,
    color: theme.colors.primary,
  },
  streakSubtext: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  goalsDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: theme.spacing.medium,
  },
  boxTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
  },
  goalRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.small,
    paddingLeft: 4,
  },
  goalText: {
    marginLeft: theme.spacing.small,
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.text,
  },
  challengeText: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e9ecef",
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.small,
  },
  progress: {
    height: "100%",
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.small,
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
  recipeTitle: {
    fontSize: theme.fonts.subtitle.fontSize,
    color: theme.colors.text,
    marginBottom: theme.spacing.small,
  },
  recipeDetails: {
    fontSize: 14,
    color: "#666",
  },
  recipeImage: {
    width: "100%",
    height: 200,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.small,
  },
});
