import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { observer } from "mobx-react-lite";
import leaderboardStore from "@/stores/leaderboardStore";
import { auth } from "@/firebaseConfig";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getUserGroups, getCompetitionsForGroup, getCompetitionRankings } from "@/services";
import { CompetitionSummary, CompetitionGroupRanking } from "@/types/competitions";

type TabType = "general" | "competitions";

const LeaderboardTab = observer(() => {
  const { users } = leaderboardStore;
  const currentUserId = auth.currentUser?.uid;
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("general");

  // Competitions tab state
  const [competitions, setCompetitions] = useState<CompetitionSummary[]>([]);
  const [isLoadingCompetitions, setIsLoadingCompetitions] = useState(false);
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [competitionRankings, setCompetitionRankings] = useState<CompetitionGroupRanking[]>([]);
  const [modalCompetition, setModalCompetition] = useState<CompetitionSummary | null>(null);
  const [isLoadingCompetitionRankings, setIsLoadingCompetitionRankings] = useState(false);
  const [myGroupIds, setMyGroupIds] = useState<string[]>([]);

  // Load competitions when tab is active
  useFocusEffect(
    useCallback(() => {
      if (activeTab === "competitions") {
        loadCompetitions();
      }
    }, [activeTab])
  );

  const loadCompetitions = async () => {
    setIsLoadingCompetitions(true);
    try {
      const userGroups = await getUserGroups();
      const groupIds = userGroups.map((g) => g.id);
      setMyGroupIds(groupIds);

      const allCompetitions: CompetitionSummary[] = [];
      const seenIds = new Set<string>();
      for (const group of userGroups) {
        const groupCompetitions = await getCompetitionsForGroup(group.id);
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

  const openCompetitionModal = async (comp: CompetitionSummary) => {
    setModalCompetition(comp);
    setCompetitionRankings([]);
    setShowCompetitionModal(true);
    setIsLoadingCompetitionRankings(true);
    try {
      const rankings = await getCompetitionRankings(comp.id, myGroupIds);
      setCompetitionRankings(rankings);
    } catch (error) {
      console.error("Error loading competition rankings:", error);
    } finally {
      setIsLoadingCompetitionRankings(false);
    }
  };

  // Find current user's position
  const currentUserIndex = users.findIndex(
    (user) => user.uid === currentUserId
  );
  const isCurrentUserInTop10 = currentUserIndex < 10;

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
        style={[styles.tabButton, activeTab === "competitions" && styles.activeTab]}
        onPress={() => {
          setActiveTab("competitions");
          if (competitions.length === 0) loadCompetitions();
        }}
      >
        <Text style={[styles.tabText, activeTab === "competitions" && styles.activeText]}>
          Kilpailut
        </Text>
      </Pressable>
    </View>
  );

  const renderCompetitionsTab = () => {
    if (isLoadingCompetitions) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#37891C" />
        </View>
      );
    }

    if (competitions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Ei kilpailuja</Text>
          <Text style={styles.emptySubtext}>
            Luo kilpailu tai liity kilpailuun Ryhmät-sivulta
          </Text>
        </View>
      );
    }

    return (
      <ScrollView style={{ flex: 1, marginTop: 8, overflow: "visible" }} contentContainerStyle={{ paddingBottom: 8 }} showsVerticalScrollIndicator={false}>
        {competitions.map((comp) => (
          <Pressable
            key={comp.id}
            style={styles.competitionCard}
            onPress={() => openCompetitionModal(comp)}
          >
            <View style={styles.competitionIconContainer}>
              <Ionicons name="trophy" size={24} color="#37891C" />
            </View>
            <View style={styles.competitionCardContent}>
              <Text style={styles.competitionCardName} numberOfLines={1}>
                {comp.name}
              </Text>
              <Text style={styles.competitionCardMembers}>
                {comp.groupCount} {comp.groupCount === 1 ? "ryhmä" : "ryhmää"}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </Pressable>
        ))}
      </ScrollView>
    );
  };

  if (activeTab === "general" && (!users.length || !users[0]?.username)) {
    return (
      <View style={styles.container}>
        {renderTabBar()}
        <View style={styles.content}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Ladataan tulostaulua...</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderTabBar()}
      <View style={styles.content}>
        {activeTab === "competitions" ? (
          <>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle-outline" size={16} color="#888" />
              <Text style={styles.infoBannerText}>
                Voit luoda tai liittyä kilpailuun Ryhmät-sivulta
              </Text>
            </View>
            {renderCompetitionsTab()}
          </>
        ) : (
          <>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>Kuukauden salaattisankarit</Text>
            </View>
        {/* Highlight current user's position */}
        {currentUserIndex !== -1 && (
          <View style={styles.currentUserCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankNumber}>#{currentUserIndex + 1}</Text>
            </View>
            <View style={styles.currentUserInfo}>
              <Text style={styles.currentUserLabel}>Oma sijoitus</Text>
              <Text style={styles.currentUserPoints}>
                {users[currentUserIndex]?.points} pistettä
              </Text>
            </View>
          </View>
        )}
        <Pressable onPress={() => setShowInfoModal(true)} style={styles.infoLink}>
          <Ionicons name="help-circle-outline" size={18} color="#37891C" />
          <Text style={styles.infoLinkText}>Mistä voin saada pisteitä?</Text>
        </Pressable>
        <View style={styles.divider} />
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Map users by position between 1-10 */}
          {users.slice(0, 10).map((user, index) => (
            <View
              key={user.uid || index}
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
          {/* Show current user's position if outside top 10 */}
          {!isCurrentUserInTop10 && currentUserIndex !== -1 && (
            <View>
              <View style={styles.divider} />
              <View style={[styles.leaderboardRow, styles.currentUserHighlight]}>
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
                <Text style={styles.infoItemDescription}>Saat 3 bonuspistettä kun saavutat päivittäisen tavoitteesi</Text>
              </View>
            </View>

            <Pressable onPress={() => setShowInfoModal(false)} style={styles.infoModalButton}>
              <Text style={styles.infoModalButtonText}>Selvä!</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Competition Rankings Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCompetitionModal}
        onRequestClose={() => setShowCompetitionModal(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={[styles.infoModalContent, { maxWidth: 400, maxHeight: "80%" }]}>
            <View style={styles.competitionModalHeader}>
              <Text style={styles.competitionModalTitle} numberOfLines={1}>
                {modalCompetition?.name ?? ""}
              </Text>
              <Pressable onPress={() => setShowCompetitionModal(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </Pressable>
            </View>

            {isLoadingCompetitionRankings ? (
              <View style={styles.modalLoadingContainer}>
                <ActivityIndicator size="large" color="#37891C" />
              </View>
            ) : competitionRankings.length === 0 ? (
              <View style={styles.modalLoadingContainer}>
                <Text style={styles.emptyText}>Ei vielä tuloksia</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* My group position card */}
                {(() => {
                  const myGroupIndex = competitionRankings.findIndex((r) => r.myGroup);
                  if (myGroupIndex === -1) return null;
                  const myGroup = competitionRankings[myGroupIndex];
                  return (
                    <View style={styles.currentUserCard}>
                      <View style={styles.rankBadge}>
                        <Text style={styles.rankNumber}>#{myGroupIndex + 1}</Text>
                      </View>
                      <View style={styles.currentUserInfo}>
                        <Text style={styles.currentUserLabel}>Oma ryhmä</Text>
                        <Text style={styles.currentUserPoints}>
                          {myGroup.averagePoints} pistettä
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                <View style={styles.divider} />

                {competitionRankings.map((ranking, index) => (
                  <View
                    key={ranking.groupId}
                    style={[
                      styles.leaderboardRow,
                      ranking.myGroup && styles.currentUserHighlight,
                    ]}
                  >
                    <Text style={styles.leaderboardPosition}>
                      {index + 1}. {ranking.groupName}
                    </Text>
                    <Text style={styles.leaderboardScore}>
                      {ranking.averagePoints} pistettä
                    </Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
});

export default LeaderboardTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    width: "100%",
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.large,
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
  competitionCardMembers: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
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
  leaderboardScore: {
    fontSize: theme.fonts.regular.fontSize,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  currentUserHighlight: {
    backgroundColor: "rgba(12, 76, 37, 0.1)",
    borderRadius: theme.borderRadius.medium,
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
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    marginBottom: 4,
  },
  infoBannerText: {
    color: "#888",
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    marginLeft: 8,
    flex: 1,
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
    marginTop: 4,
    marginBottom: 4,
    textAlign: "center",
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
  competitionModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  competitionModalTitle: {
    fontSize: 20,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    flex: 1,
    marginRight: 12,
  },
  modalLoadingContainer: {
    paddingVertical: 48,
    justifyContent: "center",
    alignItems: "center",
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
