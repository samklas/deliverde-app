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
    return require("../assets/images/avatar3_transparent.png");
  }
  if (avatarId === "3") {
    return require("../assets/images/avatar4_transparent.png");
  }
  if (avatarId === "4") {
    return require("../assets/images/avatar5_transparent.png");
  }
  return require("../assets/images/avatar2_transparent.png");
};

// Each avatar PNG has a different amount of transparent padding baked in
// above/below the actual figure (measured from each file's alpha channel
// bounding box, then mapped through the same "contain" letterboxing the
// <Image> below applies, since a couple of these images are wide enough to
// get vertical letterbox bars inside the square box). If the reveal clips
// against the raw box instead of this content area, low progress gets
// "spent" uncovering blank space at the bottom (no visible change) and the
// final stretch toward 100% only uncovers blank space at the top (looks
// fully revealed while still short).
const AVATAR_CONTENT_BOUNDS: Record<string, { top: number; bottom: number }> =
  {
    "1": { top: 0.098, bottom: 0.911 }, // avatar2_transparent.png
    "2": { top: 0.09, bottom: 0.887 }, // avatar3_transparent.png
    "3": { top: 0.07, bottom: 0.962 }, // avatar4_transparent.png
    "4": { top: 0.113, bottom: 0.803 }, // avatar5_transparent.png
  };
const DEFAULT_CONTENT_BOUNDS = AVATAR_CONTENT_BOUNDS["1"];

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

  const { top, bottom } =
    AVATAR_CONTENT_BOUNDS[avatarId] ?? DEFAULT_CONTENT_BOUNDS;
  const contentRange = bottom - top;

  // Grey overlay shrinks from the top down as progress grows, revealing the
  // full-color avatar underneath from bottom to top. The shrink is mapped
  // onto the figure's actual content area (top..bottom), not the raw image
  // box, so every bit of progress uncovers visible artwork.
  const overlayStyle = useAnimatedStyle(() => ({
    height: (bottom - fillAnim.value * contentRange) * size,
  }));

  const avatarSource = getAvatar(avatarId);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Full-color avatar underneath. contain (rather than the default
          cover) keeps the whole avatar visible since the source images
          aren't square and would otherwise get cropped to fit the box. */}
      <Image
        source={avatarSource}
        resizeMode="contain"
        style={[styles.image, { width: size, height: size }]}
      />

      {/* Grey silhouette of the same avatar on top, clipped to a shrinking
          box anchored at the top so the reveal animates bottom-to-top.
          tintColor recolors its non-transparent pixels, so the grey matches
          the avatar's own shape instead of a box. */}
      <Animated.View
        style={[styles.clip, { width: size }, overlayStyle]}
      >
        <Image
          source={avatarSource}
          resizeMode="contain"
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
  clip: {
    position: "absolute",
    top: 0,
    left: 0,
    overflow: "hidden",
  },
});
