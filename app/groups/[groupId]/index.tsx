import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Share,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { auth } from "@/firebaseConfig";
import {
  getGroup,
  getGroupMembers,
  leaveGroup,
  deleteGroup,
  getCompetitionsForGroup,
} from "@/services";
import {
  Group,
  GroupMember,
} from "@/types/groups";
import { CompetitionSummary } from "@/types/competitions";
import groupsStore from "@/stores/groupsStore";
import GroupMembersList from "@/components/groups/GroupMembersList";

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [competitions, setCompetitions] = useState<CompetitionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCompetitionsModal, setShowCompetitionsModal] = useState(false);

  const isOwner = group?.createdBy === currentUserId;

  const loadGroupData = async () => {
    if (!groupId) return;

    try {
      const [groupData, membersData, competitionsData] = await Promise.all([
        getGroup(groupId),
        getGroupMembers(groupId),
        getCompetitionsForGroup(groupId),
      ]);

      setGroup(groupData);
      setMembers(membersData);
      setCompetitions(competitionsData);
    } catch (error) {
      console.error("Error loading group:", error);
      Alert.alert("Virhe", "Ryhmän tietojen lataaminen epäonnistui");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroupData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadGroupData();
    }, [groupId])
  );

  const handleShareCode = async () => {
    if (group?.inviteCode) {
      try {
        await Share.share({
          message: `Liity ryhmääni "${group.name}" DeliVerdessä! Käytä kutsukoodia: ${group.inviteCode}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      "Poistu ryhmästä",
      "Haluatko varmasti poistua tästä ryhmästä?",
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poistu",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveGroup(groupId!);
              groupsStore.removeGroup(groupId!);
              router.replace("/groups" as any);
            } catch (error) {
              Alert.alert(
                "Virhe",
                error instanceof Error ? error.message : "Poistuminen epäonnistui"
              );
            }
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      "Poista ryhmä",
      "Haluatko varmasti poistaa tämän ryhmän? Tätä ei voi perua.",
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poista",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteGroup(groupId!);
              groupsStore.removeGroup(groupId!);
              router.replace("/groups" as any);
            } catch (error) {
              Alert.alert(
                "Virhe",
                error instanceof Error ? error.message : "Poistaminen epäonnistui"
              );
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#37891C" />
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Ryhmää ei löytynyt</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Takaisin</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: group.name }} />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#37891C"
            />
          }
        >
          {/* Group info card */}
          <View style={styles.infoCard}>
            <Text style={styles.groupName}>{group.name}</Text>
            {group.description ? (
              <Text style={styles.description}>{group.description}</Text>
            ) : null}
          </View>

          {/* Invite code card */}
          <Pressable style={styles.inviteCard} onPress={handleShareCode}>
            <View style={styles.inviteContent}>
              <Text style={styles.inviteLabel}>Kutsukoodi</Text>
              <Text style={styles.inviteCode}>{group.inviteCode}</Text>
            </View>
            <View style={styles.shareButton}>
              <Ionicons name="share-outline" size={22} color="#37891C" />
            </View>
          </Pressable>

          {/* Competitions section */}
          {isOwner && (
            <View style={styles.competitionsSection}>
              <Pressable
                style={styles.competitionsCard}
                onPress={() => {
                  if (competitions.length === 1) {
                    router.push(
                      `/competitions/${competitions[0].id}` as any
                    );
                  } else if (competitions.length > 1) {
                    setShowCompetitionsModal(true);
                  }
                }}
              >
                <View style={styles.competitionsIconContainer}>
                  <Ionicons name="trophy" size={24} color="#37891C" />
                </View>
                <View style={styles.competitionsCardContent}>
                  <Text style={styles.competitionsCardTitle}>Kilpailut</Text>
                  <Text style={styles.competitionsCardCount}>
                    {competitions.length}{" "}
                    {competitions.length === 1 ? "kilpailu" : "kilpailua"}
                  </Text>
                </View>
                {competitions.length > 0 && (
                  <Ionicons name="chevron-forward" size={22} color="#999" />
                )}
              </Pressable>
              <View style={styles.competitionsActions}>
                <Pressable
                  style={styles.competitionsActionBtn}
                  onPress={() =>
                    router.push(
                      `/competitions/create?groupId=${groupId}` as any
                    )
                  }
                >
                  <Ionicons name="add-circle-outline" size={18} color="#37891C" />
                  <Text style={styles.competitionsActionText}>Luo</Text>
                </Pressable>
                <Pressable
                  style={styles.competitionsActionBtn}
                  onPress={() =>
                    router.push(
                      `/competitions/join?groupId=${groupId}` as any
                    )
                  }
                >
                  <Ionicons name="enter-outline" size={18} color="#37891C" />
                  <Text style={styles.competitionsActionText}>Liity</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* Competitions list modal */}
          {showCompetitionsModal && (
            <View style={styles.competitionsModal}>
              <View style={styles.competitionsModalHeader}>
                <Text style={styles.competitionsModalTitle}>Kilpailut</Text>
                <Pressable onPress={() => setShowCompetitionsModal(false)}>
                  <Ionicons name="close" size={24} color="#666" />
                </Pressable>
              </View>
              {competitions.map((comp) => (
                <Pressable
                  key={comp.id}
                  style={styles.competitionsModalItem}
                  onPress={() => {
                    setShowCompetitionsModal(false);
                    router.push(`/competitions/${comp.id}` as any);
                  }}
                >
                  <Ionicons name="trophy" size={20} color="#37891C" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.competitionsModalItemName}>
                      {comp.name}
                    </Text>
                    <Text style={styles.competitionsModalItemCount}>
                      {comp.groupCount} ryhmää
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </Pressable>
              ))}
            </View>
          )}

          {/* Members section */}
          <View style={styles.section}>
            <GroupMembersList members={members} currentUserId={currentUserId} />
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {isOwner ? (
              <Pressable style={styles.deleteButton} onPress={handleDeleteGroup}>
                <Text style={styles.deleteButtonText}>Poista ryhmä</Text>
              </Pressable>
            ) : (
              <Pressable style={styles.leaveButton} onPress={handleLeaveGroup}>
                <Text style={styles.leaveButtonText}>Poistu ryhmästä</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: "#37891C",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: theme.fontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  infoCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  groupName: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
  },
  description: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
  inviteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inviteContent: {
    flex: 1,
  },
  inviteLabel: {
    fontSize: 13,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    marginBottom: 4,
  },
  inviteCode: {
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
    color: "#37891C",
    letterSpacing: 2,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(55, 137, 28, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 16,
  },
  actions: {
    marginTop: 16,
    alignItems: "center",
  },
  leaveButton: {
    borderWidth: 2,
    borderColor: theme.colors.error,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  leaveButtonText: {
    color: theme.colors.error,
    fontSize: 15,
    fontFamily: theme.fontFamily.medium,
  },
  deleteButton: {
    borderWidth: 2,
    borderColor: theme.colors.error,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  deleteButtonText: {
    color: theme.colors.error,
    fontSize: 15,
    fontFamily: theme.fontFamily.medium,
  },
  competitionsSection: {
    marginBottom: 16,
  },
  competitionsCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  competitionsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(55, 137, 28, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  competitionsCardContent: {
    flex: 1,
  },
  competitionsCardTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  competitionsCardCount: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  competitionsActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  competitionsActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(55, 137, 28, 0.08)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    gap: 6,
  },
  competitionsActionText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    color: "#37891C",
  },
  competitionsModal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  competitionsModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  competitionsModalTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  competitionsModalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  competitionsModalItemName: {
    fontSize: 15,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.primary,
  },
  competitionsModalItemCount: {
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
  },
});
