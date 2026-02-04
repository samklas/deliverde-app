import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import { theme } from "@/theme";
import { getUserGroups } from "@/services";
import groupsStore from "@/stores/groupsStore";
import GroupCard from "@/components/groups/GroupCard";
import { MAX_USER_GROUPS } from "@/constants";

const GroupsScreen = observer(() => {
  const router = useRouter();
  const { groups, isLoading, setGroups, setIsLoading } = groupsStore;
  const [refreshing, setRefreshing] = useState(false);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const userGroups = await getUserGroups();
      setGroups(userGroups);
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  const canCreateOrJoinGroup = groups.length < MAX_USER_GROUPS;

  return (
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
        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, !canCreateOrJoinGroup && styles.buttonDisabled]}
            onPress={() => router.push("/groups/create" as any)}
            disabled={!canCreateOrJoinGroup}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Luo ryhmä</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.joinButton, !canCreateOrJoinGroup && styles.buttonDisabled]}
            onPress={() => router.push("/groups/join" as any)}
            disabled={!canCreateOrJoinGroup}
          >
            <Ionicons name="enter" size={24} color="#37891C" />
            <Text style={[styles.actionButtonText, styles.joinButtonText]}>
              Liity koodilla
            </Text>
          </Pressable>
        </View>

        {!canCreateOrJoinGroup && (
          <Text style={styles.limitText}>
            Olet jo {MAX_USER_GROUPS} ryhmän jäsen (maksimi)
          </Text>
        )}

        {/* Groups list */}
        {isLoading && groups.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#37891C" />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>Ei ryhmiä vielä</Text>
            <Text style={styles.emptyText}>
              Luo oma ryhmä tai liity kaverin ryhmään kutsukoodilla!
            </Text>
          </View>
        ) : (
          <View style={styles.groupsList}>
            <Text style={styles.sectionTitle}>
              Omat ryhmät ({groups.length}/{MAX_USER_GROUPS})
            </Text>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => router.push(`/groups/${group.id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
});

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
    paddingBottom: 32,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#37891C",
    padding: 14,
    borderRadius: 14,
    gap: 8,
  },
  joinButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#37891C",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 15,
    fontFamily: theme.fontFamily.semiBold,
  },
  joinButtonText: {
    color: "#37891C",
  },
  limitText: {
    textAlign: "center",
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: theme.fontFamily.semiBold,
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  groupsList: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
});

export default GroupsScreen;
