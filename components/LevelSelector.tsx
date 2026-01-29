import { View, Text, StyleSheet, Pressable } from "react-native";
import { theme } from "@/theme";
import React from "react";

type Level = {
  id: string;
  name: string;
  target: string;
  description: string;
};

type Props = {
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
  showHelperText?: boolean;
};

const levels: Level[] = [
  { id: "beginner", name: "Aloittelija", target: "300g", description: "Satunnainen haukkailija" },
  { id: "intermediate", name: "Mestari", target: "500g", description: "Vihannesmestari" },
  { id: "advanced", name: "Legenda", target: "800g", description: "Vihreä legenda" },
];

export default function LevelSelector({
  selectedLevel,
  onSelectLevel,
  showHelperText = true,
}: Props) {
  return (
    <View style={styles.container}>
      {showHelperText && (
        <Text style={styles.helperText}>
          Taso määrittää päivittäisen vihannestauvoitteesi. Voit muuttaa tätä myöhemmin profiilissasi.
        </Text>
      )}
      <View style={styles.levelButtons}>
        {levels.map((lvl) => (
          <Pressable
            key={lvl.id}
            style={[
              styles.levelButton,
              selectedLevel === lvl.id && styles.selectedLevel,
            ]}
            onPress={() => onSelectLevel(lvl.id)}
          >
            <View style={styles.levelContent}>
              <View style={styles.levelHeader}>
                <Text
                  style={[
                    styles.levelName,
                    selectedLevel === lvl.id && styles.selectedLevelText,
                  ]}
                >
                  {lvl.description}
                </Text>
                <View style={[
                  styles.targetBadge,
                  selectedLevel === lvl.id && styles.selectedTargetBadge,
                ]}>
                  <Text style={[
                    styles.targetText,
                    selectedLevel === lvl.id && styles.selectedTargetText,
                  ]}>
                    {lvl.target}
                  </Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export { levels };
export type { Level };

const styles = StyleSheet.create({
  container: {},
  helperText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginBottom: 16,
    lineHeight: 20,
  },
  levelButtons: {
    gap: 12,
  },
  levelButton: {
    backgroundColor: "#fafafa",
    padding: 16,
    borderRadius: theme.borderRadius.medium,
    borderWidth: 2,
    borderColor: "#e0e0e0",
  },
  selectedLevel: {
    backgroundColor: "#37891C",
    borderColor: "#37891C",
  },
  levelContent: {
    flexDirection: "column",
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  levelName: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.text,
  },
  selectedLevelText: {
    color: "white",
  },
  targetBadge: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedTargetBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  targetText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  selectedTargetText: {
    color: "white",
  },
});
