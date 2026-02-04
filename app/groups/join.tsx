import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { joinGroup, getGroup } from "@/services";
import groupsStore from "@/stores/groupsStore";

export default function JoinGroupScreen() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeChange = (text: string) => {
    // Only allow alphanumeric characters and limit to 6 characters
    const sanitized = text.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (sanitized.length <= 6) {
      setCode(sanitized);
    }
  };

  const handleJoin = async () => {
    if (code.length !== 6) {
      Alert.alert("Virhe", "Syötä 6-merkkinen kutsukoodi");
      return;
    }

    setIsLoading(true);
    try {
      const groupId = await joinGroup(code);
      const group = await getGroup(groupId);

      if (group) {
        groupsStore.addGroup({
          id: groupId,
          name: group.name,
          memberCount: group.memberCount,
          role: "member",
        });
      }

      router.replace(`/groups/${groupId}` as any);
    } catch (error) {
      console.error("Error joining group:", error);
      Alert.alert(
        "Virhe",
        error instanceof Error ? error.message : "Ryhmään liittyminen epäonnistui"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconContainer}>
          <Ionicons name="enter" size={48} color="#37891C" />
        </View>

        <Text style={styles.title}>Liity ryhmään</Text>
        <Text style={styles.subtitle}>
          Saitko kaveriltasi kutsukoodin? Syötä se alle liittyäksesi ryhmään.
        </Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Kutsukoodi</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="ABC123"
            placeholderTextColor="#999"
            value={code}
            onChangeText={handleCodeChange}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={6}
            autoFocus
          />
          <Text style={styles.codeHint}>Syötä 6-merkkinen koodi</Text>
        </View>

        <Pressable
          style={[
            styles.joinButton,
            (isLoading || code.length !== 6) && styles.buttonDisabled,
          ]}
          onPress={handleJoin}
          disabled={isLoading || code.length !== 6}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text style={styles.joinButtonText}>Liity ryhmään</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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
  codeCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  codeLabel: {
    fontSize: 14,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  codeInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontFamily: theme.fontFamily.semiBold,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    textAlign: "center",
    letterSpacing: 8,
  },
  codeHint: {
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
  joinButton: {
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
  joinButtonText: {
    color: "white",
    fontSize: 17,
    fontFamily: theme.fontFamily.semiBold,
  },
});
