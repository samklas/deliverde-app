import React, { useState } from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { theme } from "@/theme";
import { Vegetable, TodayVegetable } from "@/types/vegetable";
import { Picker } from "@react-native-picker/picker";
import { observer } from "mobx-react-lite";
import userStore from "@/stores/userStore";
import { setDailyTotalForCurrentUser } from "@/services";

type Props = {
  isVisible: boolean;
  vegetable: Vegetable | undefined;
  onClose: () => void;
  setLastUsed: React.Dispatch<React.SetStateAction<Vegetable[]>>;
  lastUsed: Vegetable[];
  onVegetableAdded: (vegetable: TodayVegetable) => void;
};

const AddVegetableModal = observer(
  ({ isVisible, vegetable, onClose, setLastUsed, onVegetableAdded }: Props) => {
    const [selectedInteger, setSelectedInteger] = useState("0");
    const [selectedDecimal, setSelectedDecimal] = useState("0");
    const [selectedHundreds, setSelectedHundreds] = useState("0");
    const [selectedTens, setSelectedTens] = useState("0");
    const { dailyTotal, setDailyTotal } = userStore;

    const isBerry = vegetable?.category === "marjat";

    const handleAddVegetable = async () => {
      const grams = calculateTotalGrams();
      if (grams === 0) return;

      setDailyTotal(dailyTotal + grams);
      setDailyTotalForCurrentUser(dailyTotal + grams);

      if (vegetable) {
        // Add to today's vegetables
        const todayVegetable: TodayVegetable = {
          id: `${vegetable.id}-${Date.now()}`,
          vegetableId: vegetable.id,
          name: vegetable.name,
          grams: grams,
          addedAt: Date.now(),
        };
        onVegetableAdded(todayVegetable);

        setLastUsed((lastUsed) => {
          const exists = lastUsed.find((item) => item.id === vegetable.id);
          if (!exists) {
            if (lastUsed.length >= 5) {
              lastUsed.pop();
            }
            return [vegetable, ...lastUsed];
          }
          return lastUsed;
        });
      }
      setSelectedInteger("0");
      setSelectedDecimal("0");
      setSelectedHundreds("0");
      setSelectedTens("0");
      onClose();
    };

    const calculateTotalGrams = () => {
      if (!vegetable) return 0;

      if (isBerry) {
        return parseInt(selectedHundreds) * 100 + parseInt(selectedTens);
      }

      const integerGrams =
        vegetable.averageWeight * parseInt(selectedInteger);
      const decimalGrams =
        vegetable.averageWeight * parseFloat(selectedDecimal);
      return Math.round(integerGrams + decimalGrams);
    };

    return (
      <Modal visible={isVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{vegetable?.name}</Text>
            <Text style={{ margin: "auto", marginTop: 30, fontSize: 20 }}>
              {calculateTotalGrams()}g
            </Text>
            {isBerry ? (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Picker
                  selectedValue={selectedHundreds}
                  onValueChange={(value) => setSelectedHundreds(value)}
                  style={{ flex: 1 }}
                  itemStyle={{ fontSize: 20, color: "#000" }}
                >
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <Picker.Item key={n} label={`${n * 100}`} value={String(n)} />
                  ))}
                </Picker>
                <Picker
                  selectedValue={selectedTens}
                  onValueChange={(value) => setSelectedTens(value)}
                  style={{ flex: 1 }}
                  itemStyle={{ fontSize: 20, color: "#000" }}
                >
                  {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((n) => (
                    <Picker.Item key={n} label={`${n}`} value={String(n)} />
                  ))}
                </Picker>
                <Text style={{ marginLeft: 20, fontSize: 20 }}>g</Text>
              </View>
            ) : (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Picker
                  selectedValue={selectedInteger}
                  onValueChange={(value) => setSelectedInteger(value)}
                  style={{ flex: 1 }}
                  itemStyle={{ fontSize: 20, color: "#000" }}
                >
                  <Picker.Item label="0" value="0" />
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2" value="2" />
                  <Picker.Item label="3" value="3" />
                  <Picker.Item label="4" value="4" />
                  <Picker.Item label="5" value="5" />
                  <Picker.Item label="6" value="6" />
                  <Picker.Item label="7" value="7" />
                  <Picker.Item label="8" value="8" />
                  <Picker.Item label="9" value="9" />
                </Picker>
                <Picker
                  selectedValue={selectedDecimal}
                  onValueChange={(value) => setSelectedDecimal(value)}
                  style={{ flex: 1 }}
                  itemStyle={{ fontSize: 20, color: "#000" }}
                >
                  <Picker.Item label="-" value="0.0" />
                  <Picker.Item label="1/2" value="0.5" />
                  <Picker.Item label="1/4" value="0.25" />
                  <Picker.Item label="1/8" value="0.125" />
                  <Picker.Item label="1/16" value="0.0625" />
                </Picker>
                <Text style={{ marginLeft: 20, fontSize: 20 }}>kpl</Text>
              </View>
            )}

            <Pressable style={styles.addButton} onPress={handleAddVegetable}>
              <Text style={styles.addButtonText}>Lisää</Text>
            </Pressable>
            <Pressable style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Peruuta</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
    marginTop: 50,
    margin: "auto",
  },
  addButton: {
    backgroundColor: "#37891C",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: theme.spacing.medium,
    shadowColor: "#37891C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  addButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: theme.fontFamily.semiBold,
  },
  cancelButton: {
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
});

export default AddVegetableModal;
