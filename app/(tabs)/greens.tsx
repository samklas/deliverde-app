import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ImageBackground,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddVegetableModal from "@/components/AddVegetableModal";
import { Vegetable } from "@/types/vegetable";
import { Audio } from "expo-av";
import { theme } from "@/theme";
import CircularProgress from "@/components/CircularProgress";
import CelebrationModal from "@/components/CelebrationModal";
import { observer } from "mobx-react-lite";

import userStore from "@/stores/userStore";
import { getDailyTotalForCurrentUser } from "@/services";

const Tab = observer(() => {
  const { dailyTotal, setDailyTotal, dailyTarget } = userStore;
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [lastUsedVegetables, setLastUsedVegetables] = useState<Vegetable[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.3)).current;
  const [vegetable, setVegetable] = useState<Vegetable>();
  const [sound, setSound] = useState<Audio.Sound>();
  const [hasCelebrated, setHasCelebrated] = useState(true);
  const progress = Math.min((dailyTotal / dailyTarget) * 100, 100); // Cap at 100%
  const [isCelebrationVisible, setIsCelebrationVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // addVegetablesToFirestore();

    if (dailyTotal < dailyTarget) setHasCelebrated(false);

    const fetchVegetables = async () => {
      setIsLoading(true);
      const cachedVegetables = await AsyncStorage.getItem("vegetables");
      if (cachedVegetables !== null) {
        const veggies: Vegetable[] = JSON.parse(cachedVegetables);
        setVegetables(veggies);
      } else {
        try {
          const querySnapshot = await getDocs(collection(db, "vegetables"));
          const fetchedVegetables = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Vegetable[];

          // Save fetched vegetables to AsyncStorage
          await AsyncStorage.setItem(
            "vegetables",
            JSON.stringify(fetchedVegetables)
          );

          setVegetables(fetchedVegetables);
        } catch (error) {
          console.error("Error fetching vegetables: ", error);
        }
      }
      setIsLoading(false);
    };

    const getLastUsedVegetables = async () => {
      const lastUsedVegetables = await AsyncStorage.getItem(
        "lastUsedVegetables"
      );
      if (lastUsedVegetables) {
        setLastUsedVegetables(JSON.parse(lastUsedVegetables) as Vegetable[]);
      }
    };

    const getDailyTotal = async () => {
      if (Number(await getDailyTotalForCurrentUser()) >= dailyTarget) {
        setHasCelebrated(true);
        setIsLoading(false);
      }
    };

    fetchVegetables();
    getLastUsedVegetables();
    getDailyTotal();
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

    await sound.playAsync();
  };
  if (isLoading) return null;
  return (
    <ImageBackground
      source={require("../../assets/images/background.jpeg")}
      style={styles.container}
      resizeMode="cover"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.overlay}>
          {/* Today box */}

          <View style={styles.todayBox}>
            <Text style={styles.title}>Tänään</Text>
            <View style={styles.progressWrapper}>
              <CircularProgress
                size={100}
                strokeWidth={10}
                progress={progress}
                backgroundColor="#e0e0e0"
                progressColor="#4caf50"
              />
              <Text style={styles.progressText}>
                {dailyTotal}g / {dailyTarget}g
              </Text>
            </View>
          </View>

          {/* Celebration Animation */}
          <CelebrationModal
            isCelebrationVisible={isCelebrationVisible}
            celebrationOpacity={celebrationOpacity}
            celebrationScale={celebrationScale}
            closeCelebration={closeCelebration}
          />

          {/* Main content container */}
          <View style={styles.mainContent}>
            <Text style={styles.description}>
              Etsi haluamasi vihannes alla olevasta kentästä ja lisää se. Jos et
              löydä etsimääsi, voit lisätä sen nimikkeellä 'muu'.
            </Text>
            {/* Search section */}
            <View style={styles.searchSection}>
              <TextInput
                style={styles.searchInput}
                placeholder="Etsi vihanneksia..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#666"
              />
            </View>

            {/* Results container */}
            <View style={styles.resultsContainer}>
              {searchQuery.length > 0 ? (
                <ScrollView style={styles.scrollView}>
                  {filteredVegetables.map((veg) => (
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
              ) : (
                <View style={styles.recentSection}>
                  {lastUsedVegetables.length > 0 && (
                    <Text style={styles.sectionTitle}>Viimeksi käytetyt</Text>
                  )}
                  <ScrollView style={styles.scrollView}>
                    {lastUsedVegetables.map((veg) => (
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
              )}
            </View>
          </View>

          <AddVegetableModal
            isVisible={isVisible}
            vegetable={vegetable}
            onClose={closeModal}
            setLastUsed={setLastUsedVegetables}
            lastUsed={lastUsedVegetables}
          />
        </View>
      </TouchableWithoutFeedback>
    </ImageBackground>
  );
});

export default Tab;

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
    fontSize: 24,
    fontWeight: "700",
    color: "#1a472a",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
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
  searchSection: {
    marginBottom: 16,
  },
  searchInput: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
    color: "#2d3436",
  },
  resultsContainer: {
    flex: 1,
  },
  recentSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a472a",
    marginBottom: 12,
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  vegItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#f5f9f7",
    marginBottom: 8,
    borderRadius: 12,
  },
  vegName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2d3436",
  },
  progressWrapper: {
    alignItems: "center",
    marginVertical: 10,
  },
  progressText: {
    marginTop: 12,
    color: "#2d3436",
    fontWeight: "600",
    fontSize: 16,
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
  description: {
    marginBottom: 16,
    //textAlign: "center",
  },
});
