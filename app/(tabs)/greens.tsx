import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useState, useRef, useEffect } from "react";

type VegetableEntry = {
  name: string;
  servings: number;
};

export default function Tab() {
  const [dailyGoal, setDailyGoal] = useState(5); // Default goal of 5 servings
  const [vegetables, setVegetables] = useState<VegetableEntry[]>([
    { name: "Spinach", servings: 0 },
    { name: "Broccoli", servings: 0 },
    { name: "Carrots", servings: 0 },
    { name: "Kale", servings: 0 },
    { name: "Bell Peppers", servings: 0 },
    { name: "Green Beans", servings: 0 },
  ]);

  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.3)).current;

  const addServing = (index: number) => {
    const newVegetables = [...vegetables];
    newVegetables[index].servings += 1;
    setVegetables(newVegetables);

    // Check if we just hit the goal
    const newTotal = newVegetables.reduce((sum, veg) => sum + veg.servings, 0);
    if (newTotal === dailyGoal) {
      triggerCelebration();
    }
  };

  const triggerCelebration = () => {
    celebrationOpacity.setValue(0);
    celebrationScale.setValue(0.3);

    Animated.parallel([
      Animated.timing(celebrationOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Fade out after 2 seconds
      setTimeout(() => {
        Animated.timing(celebrationOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });
  };

  const totalServings = vegetables.reduce((sum, veg) => sum + veg.servings, 0);
  const progress = Math.min((totalServings / dailyGoal) * 100, 100); // Cap at 100%

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Vegetable Tracker</Text>

      {/* Progress meter */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>
          {totalServings} of {dailyGoal} servings
        </Text>
      </View>

      {/* Celebration Animation */}
      <Animated.View
        style={[
          styles.celebration,
          {
            opacity: celebrationOpacity,
            transform: [{ scale: celebrationScale }],
          },
        ]}
      >
        <Text style={styles.celebrationText}>🎉 Daily Goal Achieved! 🎉</Text>
      </Animated.View>

      <ScrollView style={styles.scrollView}>
        {vegetables.map((veg, index) => (
          <TouchableOpacity
            key={veg.name}
            style={styles.vegItem}
            onPress={() => addServing(index)}
          >
            <Text style={styles.vegName}>{veg.name}</Text>
            <Text style={styles.servings}>{veg.servings} servings</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  total: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  vegItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#e8f5e9",
    marginBottom: 10,
    borderRadius: 10,
  },
  vegName: {
    fontSize: 16,
    fontWeight: "500",
  },
  servings: {
    fontSize: 16,
    color: "#2e7d32",
  },
  progressContainer: {
    height: 30,
    backgroundColor: "#e0e0e0",
    borderRadius: 15,
    marginBottom: 20,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#4caf50",
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    lineHeight: 30,
    color: "#000",
    fontWeight: "500",
    zIndex: 1,
  },
  celebration: {
    position: "absolute",
    top: "40%",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2e7d32",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    overflow: "hidden",
  },
});
