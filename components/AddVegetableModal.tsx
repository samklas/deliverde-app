import React, { useState } from "react";
import { Modal, View, Text, Button, StyleSheet } from "react-native";
import { theme } from "@/theme";
import { Vegetable } from "@/types/vegetable";
import { Picker } from "@react-native-picker/picker";
import { observer } from "mobx-react-lite";
import challengeStore from "@/stores/challengeStore";

type Props = {
  isVisible: boolean;
  vegetable: Vegetable | undefined;
  onClose: () => void;
  setTotal: (dailyTotal: number) => void;
  setLastUsed: React.Dispatch<React.SetStateAction<Vegetable[]>>;
  lastUsed: Vegetable[];
};

const AddVegetableModal = observer(
  ({ isVisible, vegetable, onClose, setTotal, setLastUsed }: Props) => {
    const [selectedInteger, setSelectedInteger] = useState("0");
    const [selectedDecimal, setSelectedDecimal] = useState("0");
    const { dailyTotal, setDailyTotal } = challengeStore;

    const handleAddVegetable = async () => {
      //setTotal((total) => total + calculateTotalGrams());
      setDailyTotal(dailyTotal + calculateTotalGrams());

      if (vegetable) {
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
      onClose();
    };

    const calculateTotalGrams = () => {
      if (vegetable) {
        const integerGrams =
          vegetable.averageWeight * parseInt(selectedInteger);
        const decimalGrams =
          vegetable.averageWeight * parseFloat(selectedDecimal);
        return integerGrams + decimalGrams;
      }

      return 0;
    };

    return (
      <Modal visible={isVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{vegetable?.name}</Text>
            <Text style={{ margin: "auto", marginTop: 30, fontSize: 20 }}>
              {calculateTotalGrams()}g
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Picker
                selectedValue={selectedInteger}
                onValueChange={(value, index) => setSelectedInteger(value)}
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
                onValueChange={(value, index) => setSelectedDecimal(value)}
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

            <Button title="Lisää" onPress={handleAddVegetable} />
            <Button title="Peruuta" onPress={onClose} color="red" />
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
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: theme.spacing.small,
    marginTop: 50,
    margin: "auto",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: theme.spacing.small,
    marginBottom: theme.spacing.large,
    borderRadius: theme.borderRadius.small,
  },
});

export default AddVegetableModal;
