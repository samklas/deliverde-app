import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ImageBackground,
  TextInput,
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
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredVegetables = vegetables.filter((veg) =>
    veg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Today box */}
        <View style={styles.todayBox}>
          <Text style={styles.title}>Tänään</Text>
          {/* Progress meter */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>
              {totalServings} of {dailyGoal} servings
            </Text>
          </View>
        </View>

        {/* Week box */}
        <View style={styles.todayBox}>
          <Text style={styles.title}>Viikko</Text>
          {/* Progress meter */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>
              {totalServings} of {dailyGoal} servings
            </Text>
          </View>
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
          <Text style={styles.celebrationText}>🎉 Hienoa työtä! 🎉</Text>
        </Animated.View>

        {/* Add search input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Etsi vihanneksia..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>

        <ScrollView style={styles.scrollView}>
          {filteredVegetables.map((veg, index) => (
            <TouchableOpacity
              key={veg.name}
              style={styles.vegItem}
              onPress={() => addServing(vegetables.indexOf(veg))}
            >
              <Text style={styles.vegName}>{veg.name}</Text>
              <Text style={styles.servings}>{veg.servings} servings</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255)",
    //padding: 24,
  },
  todayBox: {
    backgroundColor: "#f7f9f8",
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8eee9",
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0c4c25",
    marginBottom: 20,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
    backgroundColor: "#ffffff",
    padding: 20,
  },
  vegItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f7f9f8",
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e8eee9",
  },
  vegName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333333",
  },
  servings: {
    fontSize: 16,
    color: "#0c4c25",
    fontWeight: "600",
  },
  progressContainer: {
    height: 36,
    backgroundColor: "#f7f9f8",
    borderRadius: 18,
    marginBottom: 24,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#e8eee9",
  },
  progressBar: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#0c4c25",
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    lineHeight: 36,
    color: "#333333",
    fontWeight: "600",
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
    color: "#0c4c25",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    marginTop: 20,
    marginBottom: 16,
    width: "100%",
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e8eee9",
    color: "#333333",
  },
});
