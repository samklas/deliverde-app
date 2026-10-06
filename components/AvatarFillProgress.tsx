import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

const getAvatar = (avatarId: string) => {
  if (avatarId === "1") {
    return require("../assets/images/avatar2_transparent.png");
  }
  if (avatarId === "2") {
    return require("../assets/images/avatar3.jpg");
  }
  if (avatarId === "3") {
    return require("../assets/images/avatar4.jpg");
  }
  if (avatarId === "4") {
    return require("../assets/images/avatar5.png");
  }
  return require("../assets/images/avatar2.jpg");
};

type Props = {
  avatarId: string;
  progress: number; // 0-100
  size?: number;
};

const AvatarFillProgress = ({ avatarId, progress, size = 120 }: Props) => {
  const clamped = Math.max(0, Math.min(progress, 100)) / 100;
  const fillAnim = useSharedValue(clamped);

  useEffect(() => {
    fillAnim.value = withTiming(clamped, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [clamped]);

  // Grey overlay fades out as progress grows, revealing the full-color avatar underneath
  const overlayStyle = useAnimatedStyle(() => ({
    opacity: 1 - fillAnim.value,
  }));

  const avatarSource = getAvatar(avatarId);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Full-color avatar underneath */}
      <Image
        source={avatarSource}
        style={[styles.image, { width: size, height: size }]}
      />

      {/* Grey silhouette of the same avatar on top — tintColor recolors its
          non-transparent pixels, so the grey matches the avatar's own shape
          instead of a box. Its opacity controls how much color shows through. */}
      <Animated.View
        style={[styles.image, { width: size, height: size }, overlayStyle]}
      >
        <Image
          source={avatarSource}
          style={[
            styles.image,
            { width: size, height: size, tintColor: "rgba(170, 170, 170, 0.92)" },
          ]}
        />
      </Animated.View>
    </View>
  );
};

export default AvatarFillProgress;

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    position: "absolute",
    top: 0,
    left: 0,
  },
});
