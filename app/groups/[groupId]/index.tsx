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
} from "@/services";
import {
  Group,
  GroupMember,
} from "@/types/groups";
import groupsStore from "@/stores/groupsStore";
import GroupMembersList from "@/components/groups/GroupMembersList";

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid;

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isOwner = group?.createdBy === currentUserId;

  const loadGroupData = async () => {
    if (!groupId) return;

    try {
      const [groupData, membersData] = await Promise.all([
        getGroup(groupId),
        getGroupMembers(groupId),
      ]);

      setGroup(groupData);
      setMembers(membersData);
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
      <Stack.Screen options={{ title: "" }} />
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
});
