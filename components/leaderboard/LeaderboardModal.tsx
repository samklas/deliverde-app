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
          <Pressable
            onPress={() => setIsVisible(false)}
            style={{ position: "absolute", right: 20 }}
          >
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </Pressable>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kuukauden salaattisankarit</Text>
          </View>
          <ScrollView>
            <View
              style={[
                {
                  height: 300,
                  marginTop: 20,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexDirection: "row",
                },
                styles.box,
              ]}
            >
              <View
                style={[
                  {
                    width: 120,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  // users[1].uid === currentUserId && styles.currentUserHighlight,
                ]}
              >
                <Ionicons name="trophy" size={32} color="silver" />
                <Image
                  source={getAvatar(users[1].avatarId)}
                  style={{ height: 100, width: "100%" }}
                  contentFit="contain"
                />
                <Text style={styles.podiumUsername}>
                  {users[1].username}
                </Text>
                <Text style={styles.podiumPoints}>
                  {users[1].points} pistettä
                </Text>
              </View>
              <View
                style={[
                  {
                    width: 120,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingBottom: 50,
                  },
                  // users[0].uid === currentUserId && styles.currentUserHighlight,
                ]}
              >
                <Ionicons name="trophy" size={32} color="gold" />
                <Image
                  source={getAvatar(users[0].avatarId)}
                  style={{ height: 100, width: "100%" }}
                  contentFit="contain"
                />
                <Text style={styles.podiumUsername}>
                  {users[0].username}
                </Text>
                <Text style={styles.podiumPoints}>
                  {users[0].points} pistettä
                </Text>
              </View>
              <View
                style={[
                  {
                    width: 120,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                  // users[2].uid === currentUserId && styles.currentUserHighlight,
                ]}
              >
                <Ionicons name="trophy" size={32} color="brown" />
                <Image
                  source={getAvatar(users[2].avatarId)}
                  style={{ height: 100, width: "100%" }}
                  contentFit="contain"
                />
                <Text style={styles.podiumUsername}>
                  {users[2].username}
                </Text>
                <Text style={styles.podiumPoints}>
                  {users[2].points} pistettä
                </Text>
              </View>
            </View>
            {/* Map users by position between 4-10*/}
            {users.slice(3, 10).map((user, index) => (
              <View
                key={index}
                style={[
                  styles.leaderboardRow,
                  user.uid === currentUserId && styles.currentUserHighlight,
                ]}
              >
                <Text style={styles.leaderboardPosition}>
                  {index + 4}. {user.username}
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
        </View>
      </View>
    </Modal>
  );
});

export default LeaderboardModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    marginTop: 15,
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
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: theme.spacing.medium,
  },
});
