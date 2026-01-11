import { theme } from "@/theme";
import React, { useEffect } from "react";
import { View, Dimensions, StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  withDelay,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");
const NUM_EMOJIS = 20;

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const EMOJIS = ["🥬", "🥕"]; // Lisää haluamasi emojit tänne

const FallingEmoji = ({ index }: { index: number }) => {
  const top = useSharedValue(-random(50, 300));
  const left = random(0, width - 40);
  const delay = random(0, 3000);
  const size = random(24, 40);
  const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

  useEffect(() => {
    top.value = withRepeat(
      withDelay(
        delay,
        withTiming(height + 50, {
          duration: random(4000, 7000),
          easing: Easing.linear,
        })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    position: "absolute",
    top: top.value,
    left,
    fontSize: size,
  }));

  return <Animated.Text style={animatedStyle}>{emoji}</Animated.Text>;
};

const LettuceRainBackground = () => {
  return (
    <View style={styles.container} pointerEvents="none">
      {[...Array(NUM_EMOJIS)].map((_, i) => (
        <FallingEmoji key={i} index={i} />
      ))}
    </View>
  );
};

export default LettuceRainBackground;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: "#f0fdf4", // vaalea vihreä tausta
    backgroundColor: theme.colors.background,
    zIndex: -1,
  },
});
