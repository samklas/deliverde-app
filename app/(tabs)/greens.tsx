import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ImageBackground,
  TextInput,
  Modal,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { collection, doc, setDoc, addDoc, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddVegetableModal from "@/components/AddVegetableModal";
import { Vegetable } from "@/types/vegetable";
import { Audio } from "expo-av";
import { Image } from "expo-image";
import { theme } from "@/theme";
import CircularProgress from "@/components/CircularProgress";

export default function Tab() {
  const [dailyGoal, setDailyGoal] = useState(800);
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [lastUsedVegetables, setLastUsedVegetables] = useState<Vegetable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.3)).current;
  const [vegetable, setVegetable] = useState<Vegetable>();
  const [total, setTotal] = useState(0);
  const [sound, setSound] = useState<Audio.Sound>();
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const progress = Math.min((total / dailyGoal) * 100, 100); // Cap at 100%
  const [isCelebrationVisible, setIsCelebrationVisible] = useState(false);

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

    const getLastUsedVegetables = async () => {
      const lastUsedVegetables = await AsyncStorage.getItem(
        "lastUsedVegetables"
      );
      if (lastUsedVegetables) {
        setLastUsedVegetables(JSON.parse(lastUsedVegetables) as Vegetable[]);
      }
    };

    fetchVegetables();
    getLastUsedVegetables();
  }, []);

  useEffect(() => {
    if (progress >= 100 && !hasCelebrated) {
      triggerCelebration();
      setHasCelebrated(true);
      setIsCelebrationVisible(true);
    }
  }, [progress, hasCelebrated]);

  useEffect(() => {
    const setLastUsedVegetables = async () => {
      await AsyncStorage.setItem(
        "lastUsedVegetables",
        JSON.stringify(lastUsedVegetables)
      );
    };

    setLastUsedVegetables();
  }, [lastUsedVegetables]);

  const triggerCelebration = () => {
    celebrationOpacity.setValue(0);
    celebrationScale.setValue(0.3);

    playSound();

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
    ]).start();
  };

  const closeCelebration = () => {
    setIsCelebrationVisible(false);
  };

  const filteredVegetables = vegetables.filter((veg) =>
    veg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeModal = () => {
    setIsVisible(false);
    setSearchQuery("");
  };

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/sounds/Hello.mp3")
    );
    if (sound) setSound(sound);

    console.log("Playing Sound");
    await sound.playAsync();
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
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              margin: 30,
            }}
          >
            <CircularProgress
              size={150}
              strokeWidth={10}
              progress={progress} // Progress in percentage
              backgroundColor="#e0e0e0"
              progressColor="#4caf50"
            />
          </View>
          <Text style={styles.progressText}>
            {total}g / {dailyGoal}g
          </Text>

          {/* Progress meter */}
          {/* <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
            <Text style={styles.progressText}>
              {total}g / {dailyGoal}g
            </Text>
          </View> */}
        </View>

        {/* Celebration Animation */}
        <Modal
          visible={isCelebrationVisible}
          transparent={true}
          animationType="fade"
        >
          <View style={styles.modalOverlay}>
            <Animated.View
              style={[
                styles.celebrationContainer,
                {
                  opacity: celebrationOpacity,
                  transform: [{ scale: celebrationScale }],
                },
              ]}
            >
              {/* <TouchableOpacity
                onPress={closeCelebration}
                style={styles.closeIconButton}
              >
                <Text style={styles.closeIconText}>✕</Text>
              </TouchableOpacity> */}
              <Image
                style={{ height: 200, width: 200 }}
                source={require("../../assets/images/Sipuli.png")}
              />
              <Text style={styles.celebrationText}>Upeaa työtä!</Text>
              <TouchableOpacity
                onPress={closeCelebration}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Jatka</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>

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
                onPress={() => {
                  setVegetable(veg);
                  setIsVisible(true);
                }}
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
          setTotal={setTotal}
          setLastUsed={setLastUsedVegetables}
          lastUsed={lastUsedVegetables}
        />

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
    padding: 40,
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
    flex: 1,
    flexDirection: "column",
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
    // position: "absolute",
    width: "100%",
    textAlign: "center",
    lineHeight: 40,
    color: "#2d3436",
    fontWeight: "600",
    fontSize: 15,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    justifyContent: "center",
    alignItems: "center",
  },
  celebrationContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
    textAlign: "center",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginTop: 20,
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
  closeButton: {
    marginTop: 40,
    padding: 15,
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  closeIconButton: {
    position: "absolute",
    top: 0,
    right: 0,
    padding: 16,
    zIndex: 1,
  },
  closeIconText: {
    fontSize: 24,
    color: "#666",
    fontWeight: "500",
  },
});
