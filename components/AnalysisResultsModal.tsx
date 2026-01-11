import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from "react-native";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Vegetable } from "@/types/vegetable";
import { VegetableAnalysisResult, MatchedVegetable } from "@/types/vision";
import { matchVegetableToDatabase } from "@/utils/vegetableMatcher";
import { observer } from "mobx-react-lite";
import userStore from "@/stores/userStore";
import { setDailyTotalForCurrentUser } from "@/services";

type Props = {
  isVisible: boolean;
  analysisResults: VegetableAnalysisResult[];
  vegetables: Vegetable[];
  onClose: () => void;
  setLastUsed: React.Dispatch<React.SetStateAction<Vegetable[]>>;
};

const AnalysisResultsModal = observer(
  ({ isVisible, analysisResults, vegetables, onClose, setLastUsed }: Props) => {
    const [matchedVegetables, setMatchedVegetables] = useState<
      MatchedVegetable[]
    >([]);
    const { dailyTotal, setDailyTotal } = userStore;

    useEffect(() => {
      if (analysisResults.length > 0 && vegetables.length > 0) {
        const matched = analysisResults.map((result) => {
          const match = matchVegetableToDatabase(result.name, vegetables);
          return {
            analysisResult: result,
            matchedVegetable: match.vegetable,
            matchConfidence: match.matchConfidence,
            selected: match.vegetable !== null,
            editedQuantity: result.estimatedQuantity,
          };
        });
        setMatchedVegetables(matched);
      }
    }, [analysisResults, vegetables]);

    const toggleSelection = (index: number) => {
      setMatchedVegetables((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, selected: !item.selected } : item
        )
      );
    };

    const updateQuantity = (index: number, quantity: string) => {
      const numQuantity = parseFloat(quantity) || 0;
      setMatchedVegetables((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, editedQuantity: numQuantity } : item
        )
      );
    };

    const calculateTotalGrams = (): number => {
      return matchedVegetables.reduce((total, item) => {
        if (item.selected && item.matchedVegetable) {
          return (
            total + item.matchedVegetable.averageWeight * item.editedQuantity
          );
        }
        return total;
      }, 0);
    };

    const handleAddSelected = async () => {
      const totalGrams = calculateTotalGrams();
      const newDailyTotal = dailyTotal + Math.round(totalGrams);

      setDailyTotal(newDailyTotal);
      setDailyTotalForCurrentUser(newDailyTotal);

      // Update last used vegetables
      const selectedVegetables = matchedVegetables
        .filter((item) => item.selected && item.matchedVegetable)
        .map((item) => item.matchedVegetable as Vegetable);

      setLastUsed((prev) => {
        let updated = [...prev];
        for (const veg of selectedVegetables) {
          const exists = updated.find((item) => item.id === veg.id);
          if (!exists) {
            updated = [veg, ...updated];
          }
        }
        return updated.slice(0, 5);
      });

      onClose();
    };

    const selectedCount = matchedVegetables.filter(
      (item) => item.selected && item.matchedVegetable
    ).length;

    return (
      <Modal visible={isVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tunnistetut vihannekset</Text>

            <ScrollView style={styles.scrollView}>
              {matchedVegetables.map((item, index) => (
                <View key={index} style={styles.vegetableRow}>
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() =>
                      item.matchedVegetable && toggleSelection(index)
                    }
                    disabled={!item.matchedVegetable}
                  >
                    <Ionicons
                      name={
                        item.selected && item.matchedVegetable
                          ? "checkbox"
                          : "square-outline"
                      }
                      size={24}
                      color={
                        item.matchedVegetable
                          ? theme.colors.primary
                          : theme.colors.text
                      }
                      style={{ opacity: item.matchedVegetable ? 1 : 0.3 }}
                    />
                  </TouchableOpacity>

                  <View style={styles.vegetableInfo}>
                    <Text
                      style={[
                        styles.vegetableName,
                        !item.matchedVegetable && styles.unrecognizedName,
                      ]}
                    >
                      {item.matchedVegetable?.name ||
                        `${item.analysisResult.name} (ei tunnistettu)`}
                    </Text>
                    {item.matchedVegetable && (
                      <Text style={styles.confidenceText}>
                        {Math.round(item.matchConfidence * 100)}% varmuus
                      </Text>
                    )}
                  </View>

                  {item.matchedVegetable && (
                    <View style={styles.quantityContainer}>
                      <TextInput
                        style={styles.quantityInput}
                        value={String(item.editedQuantity)}
                        onChangeText={(text) => updateQuantity(index, text)}
                        keyboardType="numeric"
                        selectTextOnFocus
                      />
                      <Text style={styles.unitText}>kpl</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            {selectedCount > 0 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>
                  Yhteensä: {Math.round(calculateTotalGrams())}g
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Peruuta</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  selectedCount === 0 && styles.disabledButton,
                ]}
                onPress={handleAddSelected}
                disabled={selectedCount === 0}
              >
                <Text style={styles.addButtonText}>
                  Lisää valitut ({selectedCount})
                </Text>
              </TouchableOpacity>
            </View>
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
    width: "90%",
    maxHeight: "80%",
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
    marginBottom: theme.spacing.medium,
    textAlign: "center",
  },
  scrollView: {
    maxHeight: 300,
  },
  vegetableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  checkboxContainer: {
    padding: theme.spacing.small,
  },
  vegetableInfo: {
    flex: 1,
    marginLeft: theme.spacing.small,
  },
  vegetableName: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: "500",
  },
  unrecognizedName: {
    color: "#999",
    fontStyle: "italic",
  },
  confidenceText: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityInput: {
    width: 50,
    height: 36,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: theme.borderRadius.small,
    textAlign: "center",
    fontSize: 16,
  },
  unitText: {
    marginLeft: theme.spacing.small,
    color: theme.colors.text,
  },
  totalContainer: {
    paddingVertical: theme.spacing.medium,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    marginTop: theme.spacing.small,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: theme.spacing.medium,
    gap: theme.spacing.small,
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.medium,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  cancelButtonText: {
    color: theme.colors.error,
    fontWeight: "500",
  },
  addButton: {
    flex: 1,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    alignItems: "center",
  },
  addButtonText: {
    color: theme.colors.onPrimary,
    fontWeight: "bold",
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default AnalysisResultsModal;
