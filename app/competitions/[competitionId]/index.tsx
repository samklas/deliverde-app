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
  getCompetition,
  getCompetitionRankings,
  leaveCompetition,
  deleteCompetition,
  getUserGroups,
} from "@/services";
import { Competition } from "@/types/competitions";
import { CompetitionGroupRanking } from "@/types/competitions";

export default function CompetitionDetailScreen() {
  const { competitionId } = useLocalSearchParams<{
    competitionId: string;
  }>();
  const router = useRouter();
  const currentUserId = auth.currentUser?.uid;

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [rankings, setRankings] = useState<CompetitionGroupRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [myGroupIds, setMyGroupIds] = useState<string[]>([]);

  const isCreator = competition?.createdBy === currentUserId;

  // Find the user's group that is in this competition
  const myGroupInCompetition = competition?.groupIds.find((gId) =>
    myGroupIds.includes(gId)
  );

  const loadData = async () => {
    if (!competitionId) return;

    try {
      // Load user's groups to know which are "mine"
      const userGroups = await getUserGroups();
      const userGroupIds = userGroups.map((g) => g.id);
      setMyGroupIds(userGroupIds);

      const [competitionData, rankingsData] = await Promise.all([
        getCompetition(competitionId),
        getCompetitionRankings(competitionId, userGroupIds),
      ]);

      setCompetition(competitionData);
      setRankings(rankingsData);
    } catch (error) {
      console.error("Error loading competition:", error);
      Alert.alert("Virhe", "Kilpailun tietojen lataaminen epäonnistui");
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [competitionId])
  );

  const handleShareCode = async () => {
    if (competition?.inviteCode) {
      try {
        await Share.share({
          message: `Liity kilpailuun "${competition.name}" DeliVerdessä! Käytä kutsukoodia: ${competition.inviteCode}`,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleLeave = () => {
    if (!myGroupInCompetition) return;

    Alert.alert(
      "Poista ryhmä kilpailusta",
      "Haluatko varmasti poistaa ryhmäsi tästä kilpailusta?",
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poista",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveCompetition(competitionId!, myGroupInCompetition);
              router.back();
            } catch (error) {
              Alert.alert(
                "Virhe",
                error instanceof Error
                  ? error.message
                  : "Poistaminen epäonnistui"
              );
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      "Poista kilpailu",
      "Haluatko varmasti poistaa tämän kilpailun? Tätä ei voi perua.",
      [
        { text: "Peruuta", style: "cancel" },
        {
          text: "Poista",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCompetition(competitionId!);
              router.back();
            } catch (error) {
              Alert.alert(
                "Virhe",
                error instanceof Error
                  ? error.message
                  : "Poistaminen epäonnistui"
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

  if (!competition) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Kilpailua ei löytynyt</Text>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Takaisin</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: competition.name }} />
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
          {/* Competition info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <Ionicons name="trophy" size={24} color="#37891C" />
              <Text style={styles.competitionName}>{competition.name}</Text>
            </View>
            {competition.description ? (
              <Text style={styles.description}>{competition.description}</Text>
            ) : null}
            <Text style={styles.groupCount}>
              {competition.groupIds.length}{" "}
              {competition.groupIds.length === 1 ? "ryhmä" : "ryhmää"}
            </Text>
          </View>

          {/* Invite code card — visible to creator */}
          {isCreator && (
            <Pressable style={styles.inviteCard} onPress={handleShareCode}>
              <View style={styles.inviteContent}>
                <Text style={styles.inviteLabel}>Kutsukoodi</Text>
                <Text style={styles.inviteCode}>
                  {competition.inviteCode}
                </Text>
              </View>
              <View style={styles.shareButton}>
                <Ionicons name="share-outline" size={22} color="#37891C" />
              </View>
            </Pressable>
          )}

          {/* Rankings */}
          <Text style={styles.sectionTitle}>Tulokset</Text>
          <Text style={styles.sectionSubtitle}>
            Keskimääräiset pisteet per jäsen
          </Text>

          {rankings.length === 0 ? (
            <View style={styles.emptyRankings}>
              <Text style={styles.emptyText}>Ei vielä tuloksia</Text>
            </View>
          ) : (
            <>
              {rankings.map((ranking, index) => (
                <View
                  key={ranking.groupId}
                  style={[
                    styles.rankingRow,
                    ranking.myGroup && styles.myGroupHighlight,
                  ]}
                >
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.rankingInfo}>
                    <Text style={styles.rankingGroupName} numberOfLines={1}>
                      {ranking.groupName}
                      {ranking.myGroup ? " (sinun)" : ""}
                    </Text>
                    <Text style={styles.rankingMembers}>
                      {ranking.memberCount} jäsentä
                    </Text>
                  </View>
                  <Text style={styles.rankingPoints}>
                    {ranking.averagePoints} p
                  </Text>
                </View>
              ))}
            </>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {isCreator ? (
              <Pressable style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Poista kilpailu</Text>
              </Pressable>
            ) : myGroupInCompetition ? (
              <Pressable style={styles.leaveButton} onPress={handleLeave}>
                <Text style={styles.leaveButtonText}>Poista ryhmäni</Text>
              </Pressable>
            ) : null}
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
  backBtn: {
    backgroundColor: "#37891C",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  backBtnText: {
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
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  competitionName: {
    fontSize: 22,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginTop: 8,
    lineHeight: 20,
  },
  groupCount: {
    fontSize: 13,
    fontFamily: theme.fontFamily.medium,
    color: "#999",
    marginTop: 8,
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
    marginBottom: 12,
  },
  emptyRankings: {
    paddingVertical: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  myGroupHighlight: {
    backgroundColor: "rgba(55, 137, 28, 0.08)",
    borderLeftWidth: 4,
    borderLeftColor: "#37891C",
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#37891C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankNumber: {
    color: "white",
    fontSize: 15,
    fontFamily: theme.fontFamily.bold,
  },
  rankingInfo: {
    flex: 1,
  },
  rankingGroupName: {
    fontSize: 15,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 2,
  },
  rankingMembers: {
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
  },
  rankingPoints: {
    fontSize: 16,
    fontFamily: theme.fontFamily.bold,
    color: "#37891C",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },
  actions: {
    marginTop: 24,
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
