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

type Tab = "groups" | "competitions";

const GroupsScreen = observer(() => {
  const router = useRouter();
  const { groups, isLoading, setGroups, setIsLoading } = groupsStore;
  const [activeTab, setActiveTab] = useState<Tab>("groups");
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

  const renderGroupsTab = () => {
    if (isLoading && groups.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#37891C" />
        </View>
      );
    }

    return (
      <>
        {groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={56} color="#ccc" />
            <Text style={styles.emptyTitle}>Ei ryhmiä vielä</Text>
            <Text style={styles.emptyText}>
              Luo oma ryhmä tai liity kaverin ryhmään kutsukoodilla.
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

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, !canCreateOrJoinGroup && styles.btnDisabled]}
            onPress={() => router.push("/groups/create" as any)}
            disabled={!canCreateOrJoinGroup}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.actionBtnText}>Luo ryhmä</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnOutline, !canCreateOrJoinGroup && styles.btnDisabled]}
            onPress={() => router.push("/groups/join" as any)}
            disabled={!canCreateOrJoinGroup}
          >
            <Ionicons name="enter-outline" size={20} color="#37891C" />
            <Text style={[styles.actionBtnText, styles.actionBtnOutlineText]}>
              Liity koodilla
            </Text>
          </Pressable>
        </View>

        {!canCreateOrJoinGroup && (
          <Text style={styles.hintText}>
            Olet jo {MAX_USER_GROUPS} ryhmän jäsen (maksimi)
          </Text>
        )}
      </>
    );
  };

  const renderCompetitionsTab = () => {
    if (isLoadingCompetitions && competitions.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#37891C" />
        </View>
      );
    }

    return (
      <>
        {competitions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={56} color="#ccc" />
            <Text style={styles.emptyTitle}>Ei kilpailuja vielä</Text>
            <Text style={styles.emptyText}>
              Luo kilpailu ja kutsu muita ryhmiä mukaan kutsukoodilla.
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
                <View style={styles.competitionIcon}>
                  <Ionicons name="trophy" size={22} color="#37891C" />
                </View>
                <View style={styles.competitionContent}>
                  <Text style={styles.competitionName} numberOfLines={1}>
                    {comp.name}
                  </Text>
                  <Text style={styles.competitionSub}>
                    {comp.groupCount} {comp.groupCount === 1 ? "ryhmä" : "ryhmää"}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionBtn, !hasOwnedGroups && styles.btnDisabled]}
            onPress={() => router.push("/competitions/create" as any)}
            disabled={!hasOwnedGroups}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.actionBtnText}>Luo kilpailu</Text>
          </Pressable>
          <Pressable
            style={[styles.actionBtn, styles.actionBtnOutline, !hasOwnedGroups && styles.btnDisabled]}
            onPress={() => router.push("/competitions/join" as any)}
            disabled={!hasOwnedGroups}
          >
            <Ionicons name="enter-outline" size={20} color="#37891C" />
            <Text style={[styles.actionBtnText, styles.actionBtnOutlineText]}>
              Liity koodilla
            </Text>
          </Pressable>
        </View>

        {!hasOwnedGroups && groups.length > 0 && (
          <Text style={styles.hintText}>
            Sinun täytyy olla ryhmän omistaja luodaksesi tai liittyäksesi kilpailuun
          </Text>
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabButtons}>
        <Pressable
          style={[styles.tabButton, activeTab === "groups" && styles.activeTab]}
          onPress={() => setActiveTab("groups")}
        >
          <Text style={[styles.tabText, activeTab === "groups" && styles.activeText]}>
            Ryhmät
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tabButton, activeTab === "competitions" && styles.activeTab]}
          onPress={() => setActiveTab("competitions")}
        >
          <Text style={[styles.tabText, activeTab === "competitions" && styles.activeText]}>
            Kilpailut
          </Text>
        </Pressable>
      </View>

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
        {activeTab === "groups" ? renderGroupsTab() : renderCompetitionsTab()}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabButtons: {
    flexDirection: "row",
  },
  tabButton: {
    flex: 1,
    padding: 15,
    alignItems: "center",
    backgroundColor: theme.colors.background,
    elevation: 3,
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: "#37891C",
  },
  tabText: {
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.primary,
  },
  activeText: {
    fontFamily: theme.fontFamily.semiBold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: theme.fontFamily.semiBold,
    color: "#aaa",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#bbb",
    textAlign: "center",
    lineHeight: 21,
  },
  list: {
    marginBottom: 8,
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
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  competitionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(55, 137, 28, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  competitionContent: {
    flex: 1,
  },
  competitionName: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 3,
  },
  competitionSub: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#37891C",
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  actionBtnOutline: {
    backgroundColor: "white",
    borderWidth: 1.5,
    borderColor: "#37891C",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    color: "white",
    fontSize: 14,
    fontFamily: theme.fontFamily.semiBold,
  },
  actionBtnOutlineText: {
    color: "#37891C",
  },
  hintText: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: "#aaa",
    marginTop: 8,
    lineHeight: 18,
  },
});

export default GroupsScreen;
