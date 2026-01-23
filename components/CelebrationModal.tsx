import { theme } from "@/theme";
import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import * as Haptics from "expo-haptics";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  dailyTarget: number;
  onClose: () => void;
};

export default function CelebrationModal({
  visible,
  dailyTarget,
  onClose,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const textScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset animations
      scaleAnim.setValue(0);
      textScale.setValue(0);

      // Trigger haptic
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      // Animate modal entrance
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();

      // Animate "Mahtavaa!" text with bounce
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(textScale, {
          toValue: 1,
          friction: 2,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animated.Text
            style={[
              styles.congratsText,
              {
                transform: [{ scale: textScale }],
              },
            ]}
          >
            Mahtavaa!
          </Animated.Text>
          <Text style={styles.messageText}>
            Saavutit päivän tavoitteen
          </Text>
          <View style={styles.targetBadge}>
            <Text style={styles.targetText}>{dailyTarget}g</Text>
          </View>
          <Text style={styles.encouragementText}>
            Jatka samaan malliin!
          </Text>

          <Pressable style={styles.continueButton} onPress={onClose}>
            <Text style={styles.continueButtonText}>Jatka</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    width: width - 48,
    maxWidth: 320,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  congratsText: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  messageText: {
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  targetBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 12,
  },
  targetText: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: "#37891C",
  },
  encouragementText: {
    fontSize: 15,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: "#37891C",
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    width: "100%",
    shadowColor: "#37891C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  continueButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: theme.fontFamily.semiBold,
    textAlign: "center",
  },
});
