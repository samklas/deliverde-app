import leaderboardStore from "@/stores/leaderboardStore";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import {
  Modal,
  Pressable,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

const LeaderboardModal = observer(() => {
  const { isVisible, setIsVisible } = leaderboardStore;
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tulostaulukko</Text>
            <Pressable onPress={() => setIsVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Pressable>
          </View>
          <ScrollView>
            {/* Add more leaderboard entries here */}
            {Array.from({ length: 10 }).map((_, index) => (
              <View key={index} style={styles.leaderboardRow}>
                <Text style={styles.leaderboardPosition}>{index + 1}.</Text>
                <Text style={styles.leaderboardName}>
                  Käyttäjä {String.fromCharCode(65 + index)}
                </Text>
                <Text style={styles.leaderboardScore}>
                  {150 - index * 10} pistettä
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

export default LeaderboardModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    width: "90%",
    height: "80%",
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.medium,
  },
  modalTitle: {
    fontSize: theme.fonts.title.fontSize,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.small,
  },
  leaderboardPosition: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.primary,
  },
  leaderboardName: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.text,
  },
  leaderboardScore: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.secondary,
  },
});
