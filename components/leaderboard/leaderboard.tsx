import { View, Text, StyleSheet, ScrollView, Pressable, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { observer } from "mobx-react-lite";
import leaderboardStore from "@/stores/leaderboardStore";
import { getLeaderboardUsers } from "@/services/users.service";
import { auth } from "@/firebaseConfig";
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";

const LeaderboardTab = observer(() => {
  const { users } = leaderboardStore;
  const currentUserId = auth.currentUser?.uid;
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const fetched = await getLeaderboardUsers();
      leaderboardStore.setUsers(fetched);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadLeaderboard(); }, [loadLeaderboard]));

  const currentUserIndex = users.findIndex((user) => user.uid === currentUserId);
  const isCurrentUserInTop10 = currentUserIndex < 10;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#37891C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
        <Text style={styles.errorText}>Tulostaulun lataus epäonnistui</Text>
        <Pressable style={styles.retryButton} onPress={loadLeaderboard}>
          <Text style={styles.retryText}>Yritä uudelleen</Text>
        </Pressable>
      </View>
    );
  }

  if (!users.length || !users[0]?.username) {
    return (
      <View style={styles.container}>
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
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit>
            Kuukauden salaattisankarit
          </Text>
        </View>

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
              <Text style={styles.leaderboardScore}>{user.points} pistettä</Text>
            </View>
          ))}
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
      </View>

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
    </View>
  );
});

export default LeaderboardTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  content: {
    flex: 1,
    backgroundColor: theme.colors.background,
    width: "100%",
    paddingHorizontal: theme.spacing.large,
    paddingBottom: theme.spacing.large,
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
  errorText: {
    fontSize: 15,
    fontFamily: theme.fontFamily.regular,
    color: "#999",
  },
  retryButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  retryText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.medium,
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
});
