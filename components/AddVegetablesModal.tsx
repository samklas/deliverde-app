import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from "react-native";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Vegetable } from "@/types/vegetable";
import { VegetableAnalysisResult } from "@/types/vision";
import AddVegetableModal from "@/components/AddVegetableModal";
import ImageAnalysisModal from "@/components/ImageAnalysisModal";
import AnalysisResultsModal from "@/components/AnalysisResultsModal";

type Props = {
  isVisible: boolean;
  onClose: () => void;
  vegetables: Vegetable[];
  lastUsedVegetables: Vegetable[];
  setLastUsedVegetables: React.Dispatch<React.SetStateAction<Vegetable[]>>;
};

const AddVegetablesModal = ({
  isVisible,
  onClose,
  vegetables,
  lastUsedVegetables,
  setLastUsedVegetables,
}: Props) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVegetable, setSelectedVegetable] = useState<Vegetable>();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isImageAnalysisVisible, setIsImageAnalysisVisible] = useState(false);
  const [isResultsVisible, setIsResultsVisible] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<
    VegetableAnalysisResult[]
  >([]);

  const filteredVegetables = vegetables.filter((veg) =>
    veg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectVegetable = (veg: Vegetable) => {
    setSelectedVegetable(veg);
    setIsAddModalVisible(true);
  };

  const closeAddModal = () => {
    setIsAddModalVisible(false);
    setSearchQuery("");
  };

  const handleAnalysisComplete = (results: VegetableAnalysisResult[]) => {
    setAnalysisResults(results);
    setIsImageAnalysisVisible(false);
    setIsResultsVisible(true);
  };

  const closeResultsModal = () => {
    setIsResultsVisible(false);
    setAnalysisResults([]);
  };

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Lisää vihanneksia</Text>
            </View>

            <Text style={styles.description}>
              Etsi haluamasi vihannes tai tunnista kuvasta.
            </Text>

            {/* Search section */}
            <View style={styles.searchSection}>
              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Etsi vihanneksia..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#666"
                />
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() => setIsImageAnalysisVisible(true)}
                >
                  <Ionicons
                    name="camera"
                    size={24}
                    color={theme.colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Results container */}
            <View style={styles.resultsContainer}>
              {searchQuery.length > 0 ? (
                <ScrollView style={styles.scrollView}>
                  {filteredVegetables.map((veg) => (
                    <TouchableOpacity
                      key={veg.id}
                      style={styles.vegItem}
                      onPress={() => handleSelectVegetable(veg)}
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
                        onPress={() => handleSelectVegetable(veg)}
                      >
                        <Text style={styles.vegName}>{veg.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Done button */}
            <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
              <Text style={styles.doneButtonText}>Valmis</Text>
            </TouchableOpacity>

            <AddVegetableModal
              isVisible={isAddModalVisible}
              vegetable={selectedVegetable}
              onClose={closeAddModal}
              setLastUsed={setLastUsedVegetables}
              lastUsed={lastUsedVegetables}
            />

            <ImageAnalysisModal
              isVisible={isImageAnalysisVisible}
              onClose={() => setIsImageAnalysisVisible(false)}
              onAnalysisComplete={handleAnalysisComplete}
            />

            <AnalysisResultsModal
              isVisible={isResultsVisible}
              analysisResults={analysisResults}
              vegetables={vegetables}
              onClose={closeResultsModal}
              setLastUsed={setLastUsedVegetables}
            />
          </View>
        </View>
    
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.medium,
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.medium,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  description: {
    marginBottom: theme.spacing.medium,
    color: theme.colors.text,
  },
  searchSection: {
    marginBottom: theme.spacing.medium,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    fontSize: 16,
    color: "#2d3436",
    backgroundColor: "#f5f9f7",
  },
  cameraButton: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: "white",
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
  doneButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: theme.spacing.medium,
    marginTop: theme.spacing.medium,
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AddVegetablesModal;
