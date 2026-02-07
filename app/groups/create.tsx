import React, { useState } from "react";
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
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { createGroup } from "@/services";
import groupsStore from "@/stores/groupsStore";

export default function CreateGroupScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert("Virhe", "Anna ryhmälle nimi");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert("Virhe", "Nimen pitää olla vähintään 2 merkkiä");
      return;
    }

    setIsLoading(true);
    try {
      const groupId = await createGroup(trimmedName, description.trim());

      // Refresh groups list
      groupsStore.addGroup({
        id: groupId,
        name: trimmedName,
        memberCount: 1,
        role: "owner",
      });

      router.replace(`/groups/${groupId}` as any);
    } catch (error) {
      console.error("Error creating group:", error);
      Alert.alert(
        "Virhe",
        error instanceof Error ? error.message : "Ryhmän luominen epäonnistui"
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
          <Ionicons name="people" size={48} color="#37891C" />
        </View>

        <Text style={styles.title}>Luo uusi ryhmä</Text>
        <Text style={styles.subtitle}>
          Luo ryhmä kavereidesi kanssa ja kilpailkaa keskenänne!
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Ryhmän nimi *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ryhmän nimi..."
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            maxLength={30}
            autoFocus={false}
          />

          <Text style={styles.label}>Kuvaus (valinnainen)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Kerro ryhmästä..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
          />
        </View>

        <Pressable
          style={[styles.createButton, isLoading && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="add-circle" size={22} color="white" />
              <Text style={styles.createButtonText}>Luo ryhmä</Text>
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
    opacity: 0.7,
  },
  createButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: theme.fontFamily.semiBold,
  },
});
