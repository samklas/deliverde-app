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
  const [dailyGoal, setDailyGoal] = useState(5);
  const [vegetables, setVegetables] = useState<VegetableEntry[]>([
    { name: "Salaatti", servings: 0 },
    { name: "Tomaatti", servings: 0 },
    { name: "Kesäkurpitsa", servings: 0 },
    { name: "Kurkku", servings: 0 },
    { name: "Pinaatti", servings: 0 },
    { name: "Parsakaali", servings: 0 },
    { name: "Porkkana", servings: 0 },
    { name: "Lehtikaali", servings: 0 },
    { name: "Paprika", servings: 0 },
    { name: "Vihreät pavut", servings: 0 },
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
              {totalServings} / {dailyGoal} annosta
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
              <Text style={styles.servings}>{veg.servings} annosta</Text>
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
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  todayBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a472a",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
    marginTop: 10,
    backgroundColor: "transparent",
    paddingHorizontal: 4,
  },
  vegItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    marginBottom: 12,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
  },
  vegName: {
    fontSize: 17,
    fontWeight: "500",
    color: "#2d3436",
  },
  servings: {
    fontSize: 15,
    color: "#1a472a",
    fontWeight: "600",
  },
  progressContainer: {
    height: 40,
    backgroundColor: "#f5f9f7",
    borderRadius: 20,
    marginBottom: 8,
    overflow: "hidden",
    position: "relative",
  },
  progressBar: {
    position: "absolute",
    height: "100%",
    backgroundColor: "#4cd964",
    borderRadius: 20,
  },
  progressText: {
    position: "absolute",
    width: "100%",
    textAlign: "center",
    lineHeight: 40,
    color: "#2d3436",
    fontWeight: "600",
    fontSize: 15,
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
    fontSize: 22,
    fontWeight: "700",
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
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  searchContainer: {
    marginVertical: 16,
    width: "100%",
  },
  searchInput: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 14,
    fontSize: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 2,
    color: "#2d3436",
  },
});
