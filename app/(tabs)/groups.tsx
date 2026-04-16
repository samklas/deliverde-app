import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  Modal,
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
  const [showInfoModal, setShowInfoModal] = useState(false);

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
        <Pressable onPress={() => setShowInfoModal(true)} style={styles.infoLink}>
          <Ionicons name="help-circle-outline" size={18} color="#37891C" />
          <Text style={styles.infoLinkText}>Miten ryhmät toimivat?</Text>
        </Pressable>

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
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={showInfoModal}
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.infoModalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Ionicons name="people" size={32} color="#37891C" />
              <Text style={styles.infoModalTitle}>Miten ryhmät toimivat?</Text>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <Ionicons name="people-outline" size={20} color="#37891C" />
              </View>
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Luo tai liity ryhmään</Text>
                <Text style={styles.infoItemDescription}>Luo oma ryhmä tai liity kaverin ryhmään kutsukoodilla.</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <Ionicons name="leaf-outline" size={20} color="#37891C" />
              </View>
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Kerää pisteitä</Text>
                <Text style={styles.infoItemDescription}>Kirjaa kasviksia ja saavuta päivätavoitteet — pisteesi päivittyvät automaattisesti ryhmän tulostaululle.</Text>
              </View>
            </View>

            <View style={styles.infoItem}>
              <View style={styles.infoItemIcon}>
                <Ionicons name="trophy-outline" size={20} color="#37891C" />
              </View>
              <View style={styles.infoItemContent}>
                <Text style={styles.infoItemTitle}>Kilpaile kavereita vastaan</Text>
                <Text style={styles.infoItemDescription}>Seuraa ryhmän tulostaululta kuka kerää eniten pisteitä kuukauden aikana.</Text>
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
  infoLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  infoLinkText: {
    color: "#37891C",
    fontSize: 14,
    fontFamily: theme.fontFamily.medium,
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 42,
    marginBottom: 8,
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
    textAlign: "center",
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
});

export default GroupsScreen;
