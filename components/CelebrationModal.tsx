import { theme } from "@/theme";
import {
  Animated,
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

type Props = {
  isCelebrationVisible: boolean;
  celebrationOpacity: Animated.Value;
  celebrationScale: Animated.Value;
  closeCelebration: () => void;
};

export default function CelebrationModal({
  isCelebrationVisible,
  celebrationOpacity,
  celebrationScale,
  closeCelebration,
}: Props) {
  return (
    <Modal
      visible={isCelebrationVisible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.celebrationContainer,
            {
              opacity: celebrationOpacity,
              transform: [{ scale: celebrationScale }],
            },
          ]}
        >
          <Image
            style={{ height: 200, width: 200 }}
            source={require("../assets/images/Sipuli.png")}
          />
          <Text style={styles.celebrationText}>Upeaa työtä!</Text>
          <TouchableOpacity
            onPress={closeCelebration}
            style={styles.closeButton}
          >
            <Text style={styles.closeButtonText}>Jatka</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  celebrationText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a472a",
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },
  celebrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  closeButton: {
    marginTop: 40,
    padding: 15,
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    justifyContent: "center",
    alignItems: "center",
  },
});
