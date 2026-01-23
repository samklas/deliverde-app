import leaderboardStore from "@/stores/leaderboardStore";
import { theme } from "@/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { observer } from "mobx-react-lite";
import {
  Modal,
  Pressable,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { auth } from "@/firebaseConfig";
import React from "react";

const LeaderboardModal = observer(() => {
  const { isVisible, setIsVisible, users } = leaderboardStore;
  const currentUserId = auth.currentUser?.uid;

  const getAvatar = (avatarId: string) => {
    if (avatarId === "1") {
      return require("../../assets/images/avatar2.jpg");
    }
    if (avatarId === "2") {
      return require("../../assets/images/avatar3.jpg");
    }
    if (avatarId === "3") {
      return require("../../assets/images/avatar4.jpg");
    }
  };

  if (!users[0].username) return null;

  // Find current user's position
  const currentUserIndex = users.findIndex(
    (user) => user.uid === currentUserId
  );
  const isCurrentUserInTop10 = currentUserIndex < 10;

  return (
    <Modal
      animationType="slide"
      visible={isVisible}
      onRequestClose={() => setIsVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kuukauden salaattisankarit</Text>
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
            <Ionicons name="trophy-outline" size={24} color="#37891C" />
          </View>
          <View style={styles.divider} />
          <ScrollView> 
            {/* Map users by position between 1-10*/}
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
            {/* Show current user's position if outside top 10 */}
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
          <Pressable onPress={() => setIsVisible(false)} style={styles.doneButton}>
          <Text style={styles.doneButtonText}>Sulje</Text>
        </Pressable>
        </View>
       
      </View>
    </Modal>
  );
});

export default LeaderboardModal;

const styles = StyleSheet.create({
  modalContainer: {
    //flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 60,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    width: "100%",
    margin: 50,
    padding: theme.spacing.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
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
  doneButton: {
    backgroundColor: "#37891C",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: theme.spacing.medium,
    marginTop: 60,
    width: "100%",
  },
  doneButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
  },
});
