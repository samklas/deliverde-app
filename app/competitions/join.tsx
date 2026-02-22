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
import { joinCompetition, getUserGroups } from "@/services";
import { GroupSummary } from "@/types/groups";

export default function JoinCompetitionScreen() {
  const router = useRouter();
  const { groupId: preselectedGroupId } = useLocalSearchParams<{
    groupId?: string;
  }>();

  const [code, setCode] = useState("");
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

  const handleCodeChange = (text: string) => {
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

    if (!selectedGroupId) {
      Alert.alert("Virhe", "Valitse ryhmä kilpailuun");
      return;
    }

    setIsLoading(true);
    try {
      const competitionId = await joinCompetition(code, selectedGroupId);
      router.replace(`/competitions/${competitionId}` as any);
    } catch (error) {
      console.error("Error joining competition:", error);
      Alert.alert(
        "Virhe",
        error instanceof Error
          ? error.message
          : "Kilpailuun liittyminen epäonnistui"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || code.length !== 6 || !selectedGroupId;

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
          <Ionicons name="enter" size={48} color="#37891C" />
        </View>

        <Text style={styles.title}>Liity kilpailuun</Text>
        <Text style={styles.subtitle}>
          Saitko kutsukoodin? Syötä se alle ja valitse ryhmä jolla osallistut.
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
          />
          <Text style={styles.codeHint}>Syötä 6-merkkinen koodi</Text>
        </View>

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
                  color={selectedGroupId === group.id ? "#37891C" : "#999"}
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

        <Pressable
          style={[styles.joinButton, isDisabled && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={isDisabled}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text style={styles.joinButtonText}>Liity kilpailuun</Text>
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
  label: {
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    marginBottom: 8,
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
    marginBottom: 24,
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
