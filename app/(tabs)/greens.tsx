import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AddVegetablesModal from "@/components/AddVegetablesModal";
import { Vegetable, TodayVegetable } from "@/types/vegetable";
import { Audio } from "expo-av";
import { theme } from "@/theme";
import CircularProgress from "@/components/CircularProgress";
import CelebrationModal from "@/components/CelebrationModal";
import { observer } from "mobx-react-lite";
import { Ionicons } from "@expo/vector-icons";

import userStore from "@/stores/userStore";
import { getDailyTotalForCurrentUser, setDailyTotalForCurrentUser } from "@/services";

const Tab = observer(() => {
  const { dailyTotal, dailyTarget, setDailyTotal } = userStore;
  const [vegetables, setVegetables] = useState<Vegetable[]>([]);
  const [lastUsedVegetables, setLastUsedVegetables] = useState<Vegetable[]>([]);
  const [todayVegetables, setTodayVegetables] = useState<TodayVegetable[]>([]);
  const celebrationOpacity = useRef(new Animated.Value(0)).current;
  const celebrationScale = useRef(new Animated.Value(0.3)).current;
  const [sound, setSound] = useState<Audio.Sound>();
  const [hasCelebrated, setHasCelebrated] = useState(true);
  const progress = Math.min((dailyTotal / dailyTarget) * 100, 100);
  const [isCelebrationVisible, setIsCelebrationVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  useEffect(() => {
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
      const lastUsed = await AsyncStorage.getItem("lastUsedVegetables");
      if (lastUsed) {
        setLastUsedVegetables(JSON.parse(lastUsed) as Vegetable[]);
      }
    };

    const getDailyTotal = async () => {
      if (Number(await getDailyTotalForCurrentUser()) >= dailyTarget) {
        setHasCelebrated(true);
      }
    };

    const getTodayVegetables = async () => {
      const today = new Date().toDateString();
      const storedDate = await AsyncStorage.getItem("todayVegetablesDate");
      if (storedDate === today) {
        const stored = await AsyncStorage.getItem("todayVegetables");
        if (stored) {
          setTodayVegetables(JSON.parse(stored) as TodayVegetable[]);
        }
      } else {
        // New day, clear today's vegetables
        await AsyncStorage.setItem("todayVegetablesDate", today);
        await AsyncStorage.setItem("todayVegetables", JSON.stringify([]));
        setTodayVegetables([]);
      }
    };

    fetchVegetables();
    getLastUsedVegetables();
    getDailyTotal();
    getTodayVegetables();
  }, []);

  // Celebration modal disabled for now
  // useEffect(() => {
  //   if (progress >= 100 && !hasCelebrated) {
  //     triggerCelebration();
  //     setHasCelebrated(true);
  //     setIsCelebrationVisible(true);
  //   }
  // }, [progress, hasCelebrated]);

  useEffect(() => {
    const saveLastUsed = async () => {
      await AsyncStorage.setItem(
        "lastUsedVegetables",
        JSON.stringify(lastUsedVegetables)
      );
    };

    saveLastUsed();
  }, [lastUsedVegetables]);

  useEffect(() => {
    const saveTodayVegetables = async () => {
      await AsyncStorage.setItem(
        "todayVegetables",
        JSON.stringify(todayVegetables)
      );
    };

    saveTodayVegetables();
  }, [todayVegetables]);

  const handleAddVegetable = (vegetable: TodayVegetable) => {
    setTodayVegetables((prev) => [...prev, vegetable]);
  };

  const handleDeleteVegetable = (id: string) => {
    const vegetableToDelete = todayVegetables.find((v) => v.id === id);
    if (vegetableToDelete) {
      const newDailyTotal = Math.max(0, dailyTotal - vegetableToDelete.grams);
      setDailyTotal(newDailyTotal);
      setDailyTotalForCurrentUser(newDailyTotal);
      setTodayVegetables((prev) => prev.filter((v) => v.id !== id));
    }
  };

  /*
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
  */

  const closeCelebration = () => {
    setIsCelebrationVisible(false);
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
    <View style={styles.container}>
      {/* Today box */}
      <View style={styles.todayBox}>
        <Text style={styles.title}>Tänään</Text>
        <View style={styles.progressWrapper}>
          <CircularProgress
            size={120}
            strokeWidth={12}
            progress={progress}
            backgroundColor="#e0e0e0"
            progressColor="#4caf50"
          />
          <Text style={styles.progressText}>
            {dailyTotal}g / {dailyTarget}g
          </Text>
        </View>
      </View>

      {/* Today's vegetables section */}
      <View style={styles.todayVegetablesSection}>
        
        {todayVegetables.length === 0 ? (
          <Text style={styles.emptyText}>
            Ei lisättyjä vihanneksia tälle päivälle
          </Text>
        ) : (
          <ScrollView style={styles.todayScrollView}>
            {todayVegetables.map((veg) => (
              <View key={veg.id} style={styles.todayVegItem}>
                <View style={styles.todayVegInfo}>
                  <Text style={styles.vegName}>{veg.name}</Text>
                  <Text style={styles.gramsText}>{veg.grams}g</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteVegetable(veg.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={"#666"}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Add vegetables button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setIsAddModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.addButtonText}>Lisää vihanneksia</Text>
      </TouchableOpacity>

      {/* Celebration Animation */}
      <CelebrationModal
        isCelebrationVisible={isCelebrationVisible}
        celebrationOpacity={celebrationOpacity}
        celebrationScale={celebrationScale}
        closeCelebration={closeCelebration}
      />

      {/* Add Vegetables Modal */}
      <AddVegetablesModal
        isVisible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        vegetables={vegetables}
        lastUsedVegetables={lastUsedVegetables}
        setLastUsedVegetables={setLastUsedVegetables}
        onAddVegetable={handleAddVegetable}
      />
    </View>
  );
});

export default Tab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  todayBox: {
    backgroundColor: "white",
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fontFamily.bold,
    color: "#184B10",
    marginBottom: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  progressWrapper: {
    alignItems: "center",
    marginVertical: 12,
  },
  progressText: {
    marginTop: 16,
    color: "#2d3436",
    fontFamily: theme.fontFamily.semiBold,
    fontSize: 18,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#37891C",
    padding: 14,
    borderRadius: 16,
    gap: 8,
    shadowColor: "#37891C",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
  },
  todayVegetablesSection: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: "#1a472a",
    marginBottom: 12,
  },
  todayScrollView: {
    maxHeight: 200,
  },
  todayVegItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f5f9f7",
    marginBottom: 8,
    borderRadius: 10,
  },
  todayVegInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 12,
  },
  vegName: {
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
    color: "#2d3436",
  },
  gramsText: {
    fontSize: 14,
    color: "#666",
    fontFamily: theme.fontFamily.medium,
  },
  emptyText: {
    color: "#999",
    fontFamily: theme.fontFamily.regular,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 16,
  },
  deleteButton: {
    padding: 8,
  },
});
