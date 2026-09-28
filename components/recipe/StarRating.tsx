import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Icon from "@expo/vector-icons/Ionicons";

type Props = {
  rating: number;
  size?: number;
  color?: string;
  emptyColor?: string;
  readonly?: boolean;
  onRate?: (value: number) => void;
};

export default function StarRating({
  rating,
  size = 16,
  color = "#37891C",
  emptyColor = "#ccc",
  readonly = true,
  onRate,
}: Props) {
  const filledCount = Math.round(rating);

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((value) => {
        const filled = value <= filledCount;
        const star = (
          <Icon
            name={filled ? "star" : "star-outline"}
            size={size}
            color={filled ? color : emptyColor}
          />
        );

        if (readonly) {
          return (
            <View key={value} style={styles.star}>
              {star}
            </View>
          );
        }

        return (
          <Pressable
            key={value}
            style={styles.star}
            onPress={() => onRate?.(value)}
            hitSlop={6}
          >
            {star}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
  },
  star: {
    marginRight: 2,
  },
});
