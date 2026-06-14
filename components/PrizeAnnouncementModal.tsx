import { theme } from "@/theme";
import { MonthlyPrize } from "@/types/prize";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

type Props = {
  visible: boolean;
  prize: MonthlyPrize;
  onClose: () => void;
};

export default function PrizeAnnouncementModal({ visible, prize, onClose }: Props) {
  const cardScale = useRef(new Animated.Value(0)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0)).current;
  const badgePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;

    cardScale.setValue(0);
    backdropOpacity.setValue(0);
    badgeScale.setValue(0);
    badgePulse.setValue(1);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    Animated.timing(backdropOpacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    Animated.spring(cardScale, {
      toValue: 1,
      friction: 7,
      tension: 50,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(200),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 5,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(badgePulse, {
            toValue: 1.08,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(badgePulse, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

        <Animated.View style={[styles.card, { transform: [{ scale: cardScale }] }]}>
          <LinearGradient
            colors={["#2C6E16", "#37891C", "#4FA526"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <Animated.View
              style={[
                styles.badge,
                {
                  transform: [
                    { scale: badgeScale },
                    { scale: badgePulse },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={["#FFE259", "#FFA751"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.badgeGradient}
              >
                <Ionicons name="trophy" size={42} color="#7A4F00" />
              </LinearGradient>
            </Animated.View>

            {/* <Text style={styles.eyebrow}>KUUKAUDEN KISA</Text> */}
            <Text style={styles.title}>{prize.title}</Text>
            <Text style={styles.description}>{prize.description}</Text>

            <Pressable
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Selvä!</Text>
            </Pressable>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  card: {
    width: width - 48,
    maxWidth: 340,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
  },
  gradient: {
    paddingTop: 36,
    paddingBottom: 28,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  badge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 16,
    shadowColor: "#FFA751",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  badgeGradient: {
    flex: 1,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
  },
  eyebrow: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 13,
    letterSpacing: 2,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 8,
  },
  title: {
    fontFamily: theme.fontFamily.bold,
    fontSize: 24,
    color: "white",
    textAlign: "center",
    marginBottom: 10,
  },
  description: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "rgba(255,255,255,0.92)",
    textAlign: "center",
    marginBottom: 28,
  },
  button: {
    backgroundColor: "white",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonText: {
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 16,
    color: "#1F6B16",
  },
});
