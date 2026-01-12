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
import LettuceRainBackground from "./challenges/LettuceRainBackground";

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
      <LettuceRainBackground />
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.celebrationContainer,
            styles.box,
            {
              opacity: celebrationOpacity,
              transform: [{ scale: celebrationScale }],
            },
          ]}
        >
          {/* <Image
            style={{ height: 200, width: 200 }}
            source={require("../assets/images/Sipuli.png")}
          /> */}
          <Text style={styles.celebrationText}>
            Saavutit päivän tavoitteen. Mahtavaa työtä!
          </Text>
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
    fontFamily: theme.fontFamily.bold,
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
    textAlign: "center",
  },
  celebrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  closeButton: {
    marginTop: 50,
    padding: 15,
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontFamily: theme.fontFamily.semiBold,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    // backgroundColor: "rgba(255, 255, 255, 0.98)",
    justifyContent: "center",
    alignItems: "center",
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
});
