import leaderboardStore from "@/stores/leaderboardStore";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { observer } from "mobx-react-lite";
import {
  Modal,
  Pressable,
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { auth } from "@/firebaseConfig";
import React, { useState, useEffect } from "react";
import { getUserGroups, getGroupLeaderboard, getGroupLeaderboardEntries } from "@/services";
import { GroupSummary, GroupLeaderboard as GroupLeaderboardType, GroupLeaderboardEntry } from "@/types/groups";

type TabType = "general" | "groups";

const LeaderboardModal = observer(() => {
  const { isVisible, setIsVisible, users } = leaderboardStore;
  const currentUserId = auth.currentUser?.uid;
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Groups tab state
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groupLeaderboard, setGroupLeaderboard] = useState<GroupLeaderboardType | null>(null);
  const [groupEntries, setGroupEntries] = useState<GroupLeaderboardEntry[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [showGroupPicker, setShowGroupPicker] = useState(false);

  if (!users[0].username) return null;

  const loadGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const userGroups = await getUserGroups();
      setGroups(userGroups);
      if (userGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(userGroups[0].id);
      }
    } catch (error) {
      console.error("Error loading groups:", error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupLeaderboard(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadGroupLeaderboard = async (groupId: string) => {
    setIsLoadingLeaderboard(true);
    try {
      const leaderboard = await getGroupLeaderboard(groupId);
      setGroupLeaderboard(leaderboard);
      if (leaderboard) {
        const entries = await getGroupLeaderboardEntries(groupId, leaderboard.id);
        setGroupEntries(entries);
      }
    } catch (error) {
      console.error("Error loading group leaderboard:", error);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  // Find current user's position
  const currentUserIndex = users.findIndex(
    (user) => user.uid === currentUserId
  );
  const isCurrentUserInTop10 = currentUserIndex < 10;

  // Group leaderboard current user position
  const groupUserIndex = groupEntries.findIndex((e) => e.uid === currentUserId);
  const isGroupUserInTop10 = groupUserIndex >= 0 && groupUserIndex < 10;

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const renderTabBar = () => (
    <View style={styles.tabButtons}>
      <Pressable
        style={[styles.tabButton, activeTab === "general" && styles.activeTab]}
        onPress={() => setActiveTab("general")}
      >
        <Text style={[styles.tabText, activeTab === "general" && styles.activeText]}>
          Kaikki
        </Text>
      </Pressable>
      <Pressable
        style={[styles.tabButton, activeTab === "groups" && styles.activeTab]}
        onPress={() => {
          setActiveTab("groups");
          if (groups.length === 0) loadGroups();
        }}
      >
        <Text style={[styles.tabText, activeTab === "groups" && styles.activeText]}>
          Omat ryhmät
        </Text>
      </Pressable>
    </View>
  );

  const renderGroupSelector = () => {
    if (groups.length === 0) return null;

    return (
      <View style={styles.groupList}>
        {selectedGroup && (
          <View style={[styles.groupCard, styles.selectedGroupCard]}>
            <View style={styles.groupIconContainer}>
              <Ionicons name="people" size={24} color="#37891C" />
            </View>
            <View style={styles.groupCardContent}>
              <Text style={styles.groupCardName} numberOfLines={1}>
                {selectedGroup.name}
              </Text>
              <Text style={styles.groupCardMembers}>
                {selectedGroup.memberCount} {selectedGroup.memberCount === 1 ? "jäsen" : "jäsentä"}
              </Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color="#37891C" />
          </View>
        )}

        {groups.length > 1 && (
          <Pressable
            style={styles.changeGroupButton}
            onPress={() => setShowGroupPicker(!showGroupPicker)}
          >
            <Ionicons name={showGroupPicker ? "chevron-up" : "swap-horizontal"} size={18} color="#37891C" />
            <Text style={styles.changeGroupText}>
              {showGroupPicker ? "Piilota" : "Vaihda ryhmää"}
            </Text>
          </Pressable>
        )}

        {showGroupPicker &&
          groups
            .filter((g) => g.id !== selectedGroupId)
            .map((group) => (
              <Pressable
                key={group.id}
                style={styles.groupCard}
                onPress={() => {
                  setSelectedGroupId(group.id);
                  setShowGroupPicker(false);
                }}
              >
                <View style={styles.groupIconContainer}>
                  <Ionicons name="people" size={24} color="#37891C" />
                </View>
                <View style={styles.groupCardContent}>
                  <Text style={styles.groupCardName} numberOfLines={1}>
                    {group.name}
                  </Text>
                  <Text style={styles.groupCardMembers}>
                    {group.memberCount} {group.memberCount === 1 ? "jäsen" : "jäsentä"}
                  </Text>
                </View>
              </Pressable>
            ))}
      </View>
    );
  };

  const renderGroupsTab = () => {
    if (isLoadingGroups) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#37891C" />
        </View>
      );
    }

    if (groups.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Ei ryhmiä</Text>
          <Text style={styles.emptySubtext}>
            Liity ryhmään nähdäksesi ryhmän tulostaulun
          </Text>
        </View>
      );
    }

    if (isLoadingLeaderboard) {
      return (
        <>
          {renderGroupSelector()}
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#37891C" />
          </View>
        </>
      );
    }

    if (!groupLeaderboard || groupEntries.length === 0) {
      return (
        <>
          {renderGroupSelector()}
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ei tulostaulua</Text>
          </View>
        </>
      );
    }

    return (
      <>
        {renderGroupSelector()}

        {groupUserIndex !== -1 && (
          <View style={styles.currentUserCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>#{groupUserIndex + 1}</Text>
            </View>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserLabel}>Oma sijoitus</Text>
              <Text style={styles.currentUserPoints}>
                {groupEntries[groupUserIndex].points} pistettä
              </Text>
            </View>
          </View>
        )}

        <View style={styles.divider} />

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {groupEntries.slice(0, 10).map((entry, index) => (
            <View
              key={entry.uid}
              style={[
                styles.leaderboardRow,
                entry.uid === currentUserId && styles.currentUserHighlight,
              ]}
            >
              <Text style={styles.leaderboardPosition}>
                {index + 1}. {entry.username}
              </Text>
              <Text style={styles.leaderboardScore}>{entry.points} pistettä</Text>
            </View>
          ))}
          {!isGroupUserInTop10 && groupUserIndex !== -1 && (
            <View>
              <View style={styles.divider} />
              <View style={[styles.leaderboardRow, styles.currentUserHighlight]}>
                <Text style={styles.leaderboardPosition}>
                  {groupUserIndex + 1}. {groupEntries[groupUserIndex].username}
                </Text>
                <Text style={styles.leaderboardScore}>
                  {groupEntries[groupUserIndex].points} pistettä
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </>
    );
  };

  return (
    <Modal
      animationType="slide"
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.closeButtonRow}>
          <Pressable onPress={() => setIsVisible(false)} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#666" />
          </Pressable>
        </View>
        {renderTabBar()}
        <View style={styles.modalContent}>
          {activeTab === "groups" ? (
            renderGroupsTab()
          ) : (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle} numberOfLines={2} adjustsFontSizeToFit>Kuukauden salaattisankarit</Text>
              </View>
              {/* Highlight current user's position */}
              <View style={styles.currentUserCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankNumber}>#{currentUserIndex + 1}</Text>
                </View>
                <View style={styles.currentUserInfo}>
                  <Text style={styles.currentUserLabel}>Oma sijoitus</Text>
                  <Text style={styles.currentUserPoints}>{users[currentUserIndex]?.points} pistettä</Text>
                </View>
              </View>
              <Pressable onPress={() => setShowInfoModal(true)} style={styles.infoLink}>
                <Ionicons name="help-circle-outline" size={18} color="#37891C" />
                <Text style={styles.infoLinkText}>Mistä voin saada pisteitä?</Text>
              </Pressable>
              <View style={styles.divider} />
              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {users.slice(0, 10).map((user, index) => (
                  <View
                    key={index}
                    style={[
                      styles.leaderboardRow,
                      user.uid === currentUserId && styles.currentUserHighlight,
                    ]}
                  >
                    <Text style={styles.leaderboardPosition}>
                      {index + 1}. {user.username}
                    </Text>
                    <Text style={styles.leaderboardScore}>
                      {user.points} pistettä
                    </Text>
                  </View>
                ))}
                {!isCurrentUserInTop10 && currentUserIndex !== -1 && (
                  <View>
                    <View style={styles.divider} />
                    <View
                      style={[styles.leaderboardRow, styles.currentUserHighlight]}
                    >
                      <Text style={styles.leaderboardPosition}>
                        {currentUserIndex + 1}. {users[currentUserIndex].username}
                      </Text>
                      <Text style={styles.leaderboardScore}>
                        {users[currentUserIndex].points} pistettä
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </View>

      {/* Points Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showInfoModal}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Ionicons name="trophy" size={32} color="#37891C" />
              <Text style={styles.infoModalTitle}>Näin saat pisteitä</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <Ionicons name="leaf" size={20} color="#37891C" />
              </View>
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Kirjaa kasviksia</Text>
                <Text style={styles.infoItemDescription}>Saat 1 pisteen jokaisesta kirjatusta 100g kasviksia</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <Ionicons name="flame" size={20} color="#37891C" />
              </View>
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Saavuta päivätavoite</Text>
                <Text style={styles.infoItemDescription}>Saat 5 bonuspistettä kun saavutat päivittäisen tavoitteesi</Text>
              </View>
            </View>

            <Pressable onPress={() => setShowInfoModal(false)} style={styles.infoModalButton}>
              <Text style={styles.infoModalButtonText}>Selvä!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Modal>
  );
});

export default LeaderboardModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: 60,
  },
  closeButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
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
  activeText: {
    fontFamily: theme.fontFamily.semiBold,
  },
  tabText: {
    fontSize: 16,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.primary,
  },
  modalContent: {
    flex: 1,
    backgroundColor: theme.colors.background,
    width: "100%",
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  modalTitle: {
    fontSize: theme.fonts.title.fontSize,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
    padding: theme.spacing.small,
  },
  leaderboardPosition: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.primary,
  },
  leaderboardName: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.text,
  },
  leaderboardScore: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  podiumUsername: {
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  podiumPoints: {
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  box: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
  },
  currentUserHighlight: {
    backgroundColor: "rgba(12, 76, 37, 0.1)",
    borderRadius: theme.borderRadius.medium,
    fontWeight: "bold",
  },
  currentUserCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(55, 137, 28, 0.08)",
    borderRadius: 16,
    padding: 16,
    marginBottom: theme.spacing.medium,
    borderLeftWidth: 4,
    borderLeftColor: "#37891C",
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#37891C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  rankNumber: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.bold,
  },
  currentUserInfo: {
    flex: 1,
  },
  currentUserLabel: {
    fontSize: 13,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    marginBottom: 2,
  },
  currentUserPoints: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: theme.spacing.medium,
  },
  infoLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.small,
  },
  infoLinkText: {
    color: "#37891C",
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    marginLeft: 6,
  },
  infoModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.large,
  },
  infoModalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 340,
  },
  infoModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  infoModalTitle: {
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    marginTop: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  infoItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(55, 137, 28, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 15,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  infoItemDescription: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    lineHeight: 18,
  },
  infoModalButton: {
    backgroundColor: "#37891C",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  infoModalButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
  groupList: {
    marginBottom: 16,
    marginTop: 16,
  },
  groupCard: {
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
  selectedGroupCard: {
    borderWidth: 2,
    borderColor: "#37891C",
  },
  groupIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(55, 137, 28, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  groupCardContent: {
    flex: 1,
  },
  groupCardName: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  groupCardMembers: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  changeGroupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  changeGroupText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    color: "#37891C",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: theme.fontFamily.semiBold,
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
    textAlign: "center",
  },
});
