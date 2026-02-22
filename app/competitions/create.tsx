import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { createCompetition, getUserGroups } from "@/services";
import { GroupSummary } from "@/types/groups";

export default function CreateCompetitionScreen() {
  const router = useRouter();
  const { groupId: preselectedGroupId } = useLocalSearchParams<{
    groupId?: string;
  }>();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [ownedGroups, setOwnedGroups] = useState<GroupSummary[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(
    preselectedGroupId || null
  );
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);

  useEffect(() => {
    loadOwnedGroups();
  }, []);

  const loadOwnedGroups = async () => {
    try {
      const groups = await getUserGroups();
      const owned = groups.filter((g) => g.role === "owner");
      setOwnedGroups(owned);
      if (owned.length === 1 && !preselectedGroupId) {
        setSelectedGroupId(owned[0].id);
      }
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Virhe", "Anna kilpailulle nimi");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert("Virhe", "Nimen pitää olla vähintään 2 merkkiä");
      return;
    }

    if (!selectedGroupId) {
      Alert.alert("Virhe", "Valitse ryhmä kilpailuun");
      return;
    }

    setIsLoading(true);
    try {
      const competitionId = await createCompetition(
        trimmedName,
        description.trim() || undefined,
        selectedGroupId
      );

      router.replace(`/competitions/${competitionId}` as any);
    } catch (error) {
      console.error("Error creating competition:", error);
      Alert.alert(
        "Virhe",
        error instanceof Error
          ? error.message
          : "Kilpailun luominen epäonnistui"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.iconContainer}>
          <Ionicons name="trophy" size={48} color="#37891C" />
        </View>

        <Text style={styles.title}>Luo kilpailu</Text>
        <Text style={styles.subtitle}>
          Luo kilpailu ja kutsu muita ryhmiä mukaan kilpailemaan!
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Kilpailun nimi *</Text>
          <TextInput
            style={styles.input}
            placeholder="Kilpailun nimi..."
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            maxLength={40}
          />

          <Text style={styles.label}>Kuvaus (valinnainen)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Kerro kilpailusta..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Valitse ryhmä *</Text>
          {isLoadingGroups ? (
            <ActivityIndicator
              size="small"
              color="#37891C"
              style={{ marginVertical: 16 }}
            />
          ) : ownedGroups.length === 0 ? (
            <Text style={styles.noGroupsText}>
              Sinulla ei ole ryhmiä joiden omistaja olet. Luo ensin ryhmä.
            </Text>
          ) : (
            <View style={styles.groupPicker}>
              {ownedGroups.map((group) => (
                <Pressable
                  key={group.id}
                  style={[
                    styles.groupOption,
                    selectedGroupId === group.id && styles.groupOptionSelected,
                  ]}
                  onPress={() => setSelectedGroupId(group.id)}
                >
                  <Ionicons
                    name="people"
                    size={20}
                    color={
                      selectedGroupId === group.id ? "#37891C" : "#999"
                    }
                  />
                  <Text
                    style={[
                      styles.groupOptionText,
                      selectedGroupId === group.id &&
                        styles.groupOptionTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {group.name}
                  </Text>
                  {selectedGroupId === group.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color="#37891C"
                    />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Pressable
          style={[
            styles.createButton,
            (isLoading || !selectedGroupId) && styles.buttonDisabled,
          ]}
          onPress={handleCreate}
          disabled={isLoading || !selectedGroupId}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.createButtonText}>Luo kilpailu</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 32,
    paddingBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(55, 137, 28, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  noGroupsText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
    textAlign: "center",
    paddingVertical: 16,
  },
  groupPicker: {
    gap: 8,
    marginBottom: 8,
  },
  groupOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 10,
  },
  groupOptionSelected: {
    borderColor: "#37891C",
    backgroundColor: "rgba(55, 137, 28, 0.05)",
  },
  groupOptionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  groupOptionTextSelected: {
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.primary,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#37891C",
    padding: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#37891C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: theme.fontFamily.semiBold,
  },
});
