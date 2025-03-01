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
import { db } from "@/firebaseConfig";
import { collection, doc, setDoc, addDoc, getDocs } from "firebase/firestore";
import { data } from "@/data";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddVegetableModal from "@/components/AddVegetableModal";
import { Vegetable } from "@/types/vegetable";

export default function Tab() {
  const [dailyGoal, setDailyGoal] = useState(800);
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [lastUsedVegetables, setLastUsedVegetables] = useState<Vegetable[]>([
    {
      id: "1",
      name: "Tomaatti",
      averageWeight: 150,
    },
    {
      id: "2",
      name: "Kurkku",
      averageWeight: 300,
    },
    {
      id: "3",
      name: "Salaatti",
      averageWeight: 100,
    },
    {
      id: "4",
      name: "Porkkana",
      averageWeight: 150,
    },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.3)).current;
  const [vegetable, setVegetable] = useState<Vegetable>();

  const vegetables2 = data;

  useEffect(() => {
    const fetchVegetables = async () => {
      const cachedVegetables = await AsyncStorage.getItem("vegetables");
      if (cachedVegetables !== null) {
        console.log("data haettu cachesta");
        const veggies: Vegetable[] = JSON.parse(cachedVegetables);
        setVegetables(veggies);
      } else {
        try {
          const querySnapshot = await getDocs(collection(db, "vegetables"));
          const fetchedVegetables = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Save fetched vegetables to AsyncStorage
          await AsyncStorage.setItem(
            "vegetables",
            JSON.stringify(fetchedVegetables)
          );

          //setVegetables(fetchedVegetables);
        } catch (error) {
          console.error("Error fetching vegetables: ", error);
        }
      }
    };

    fetchVegetables();
  }, []);

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

  //const totalServings = vegetables.reduce((sum, veg) => sum + veg.servings, 0);
  const totalServings = 0;
  const progress = Math.min((totalServings / dailyGoal) * 100, 100); // Cap at 100%

  const filteredVegetables = vegetables.filter((veg) =>
    veg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeModal = () => {
    setIsVisible(false);
  };

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
              {totalServings} / {dailyGoal}g
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

        {searchQuery.length > 0 && (
          <ScrollView style={styles.scrollView}>
            {filteredVegetables.map((veg, index) => (
              <TouchableOpacity
                key={veg.id}
                style={styles.vegItem}
                onPress={() => setIsVisible(true)}
              >
                <Text style={styles.vegName}>{veg.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <AddVegetableModal
          isVisible={isVisible}
          vegetable={vegetable}
          onClose={closeModal}
        />

        {/* Last used */}

        <Text>Viimeksi käytetyt</Text>
        <ScrollView style={styles.scrollView}>
          {lastUsedVegetables.map((veg, index) => (
            <TouchableOpacity
              key={veg.id}
              style={styles.vegItem}
              onPress={() => {
                setVegetable(veg);
                setIsVisible(true);
              }}
            >
              <Text style={styles.vegName}>{veg.name}</Text>
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
