import React, { useState, useCallback } from "react";
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
import { getUserGroups, getCompetitionsForGroup } from "@/services";
import groupsStore from "@/stores/groupsStore";
import GroupCard from "@/components/groups/GroupCard";
import { MAX_USER_GROUPS } from "@/constants";
import { CompetitionSummary } from "@/types/competitions";

const GroupsScreen = observer(() => {
  const router = useRouter();
  const { groups, isLoading, setGroups, setIsLoading } = groupsStore;
  const [refreshing, setRefreshing] = useState(false);
  const [competitions, setCompetitions] = useState<CompetitionSummary[]>([]);
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const userGroups = await getUserGroups();
      setGroups(userGroups);
      return userGroups;
    } catch (error) {
      console.error("Error loading groups:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompetitions = async (groupIds: string[]) => {
    setIsLoadingCompetitions(true);
    try {
      const allCompetitions: CompetitionSummary[] = [];
      const seenIds = new Set<string>();
      for (const groupId of groupIds) {
        const groupCompetitions = await getCompetitionsForGroup(groupId);
        for (const comp of groupCompetitions) {
          if (!seenIds.has(comp.id)) {
            seenIds.add(comp.id);
            allCompetitions.push(comp);
          }
        }
      }
      setCompetitions(allCompetitions);
    } catch (error) {
      console.error("Error loading competitions:", error);
    } finally {
      setIsLoadingCompetitions(false);
    }
  };

  const loadAll = async () => {
    const userGroups = await loadGroups();
    const groupIds = userGroups.map((g) => g.id);
    await loadCompetitions(groupIds);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [])
  );

  const canCreateOrJoinGroup = groups.length < MAX_USER_GROUPS;
  const hasOwnedGroups = groups.some((g) => g.role === "owner");

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
        {/* Groups section */}
        <Text style={styles.sectionTitle}>Omat ryhmät</Text>

        {isLoading && groups.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#37891C" />
          </View>
        ) : groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              Luo oma ryhmä tai liity kaverin ryhmään kutsukoodilla!
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                onPress={() => router.push(`/groups/${group.id}` as any)}
              />
            ))}
          </View>
        )}

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
            style={[styles.actionButton, styles.outlineButton, !canCreateOrJoinGroup && styles.buttonDisabled]}
            onPress={() => router.push("/groups/join" as any)}
            disabled={!canCreateOrJoinGroup}
          >
            <Ionicons name="enter" size={24} color="#37891C" />
            <Text style={[styles.actionButtonText, styles.outlineButtonText]}>
              Liity koodilla
            </Text>
          </Pressable>
        </View>

        {!canCreateOrJoinGroup && (
          <Text style={styles.limitText}>
            Olet jo {MAX_USER_GROUPS} ryhmän jäsen (maksimi)
          </Text>
        )}

        {/* Competitions section */}
        <View style={styles.sectionDivider} />
        <Text style={styles.sectionTitle}>Omat kilpailut</Text>

        {isLoadingCompetitions && competitions.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#37891C" />
          </View>
        ) : competitions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              Luo kilpailu ja kutsu muita ryhmiä mukaan!
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {competitions.map((comp) => (
              <Pressable
                key={comp.id}
                style={styles.competitionCard}
                onPress={() => router.push(`/competitions/${comp.id}` as any)}
              >
                <View style={styles.competitionIconContainer}>
                  <Ionicons name="trophy" size={24} color="#37891C" />
                </View>
                <View style={styles.competitionCardContent}>
                  <Text style={styles.competitionCardName} numberOfLines={1}>
                    {comp.name}
                  </Text>
                  <Text style={styles.competitionCardSub}>
                    {comp.groupCount} {comp.groupCount === 1 ? "ryhmä" : "ryhmää"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color="#999" />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.actionButtons}>
          <Pressable
            style={[styles.actionButton, !hasOwnedGroups && styles.buttonDisabled]}
            onPress={() => router.push("/competitions/create" as any)}
            disabled={!hasOwnedGroups}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.actionButtonText}>Luo kilpailu</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.outlineButton, !hasOwnedGroups && styles.buttonDisabled]}
            onPress={() => router.push("/competitions/join" as any)}
            disabled={!hasOwnedGroups}
          >
            <Ionicons name="enter" size={24} color="#37891C" />
            <Text style={[styles.actionButtonText, styles.outlineButtonText]}>
              Liity koodilla
            </Text>
          </Pressable>
        </View>

        {!hasOwnedGroups && groups.length > 0 && (
          <Text style={styles.limitText}>
            Sinun pitää olla ryhmän omistaja luodaksesi tai liittyäksesi kilpailuun
          </Text>
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 20,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 6,
  },
  outlineButton: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#37891C",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "white",
    fontSize: 14,
    fontFamily: theme.fontFamily.semiBold,
  },
  outlineButtonText: {
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
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
    marginTop: 12,
  },
  list: {
    marginTop: 4,
  },
  competitionCard: {
    flexDirection: "row",
    alignItems: "center",
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
  competitionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(55, 137, 28, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  competitionCardContent: {
    flex: 1,
  },
  competitionCardName: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  competitionCardSub: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
});

export default GroupsScreen;
