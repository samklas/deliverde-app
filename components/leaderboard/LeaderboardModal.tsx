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

const LeaderboardModal = observer(() => {
  const { isVisible, setIsVisible, users } = leaderboardStore;

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
            <Text style={styles.modalTitle}>Tulostaulukko</Text>
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
                    //margin: 5,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Ionicons name="trophy" size={32} color="silver" />
                <Image
                  source={getAvatar(users[1].avatarId)}
                  style={{ height: 100, width: "100%" }}
                  contentFit="contain"
                />
                <Text
                  style={{ fontWeight: "bold", color: theme.colors.primary }}
                >
                  {users[1].username}
                </Text>
                <Text style={{ color: "#666" }}>
                  {users[1].points} pistettä
                </Text>
              </View>
              <View
                style={{
                  width: 120,
                  //margin: 5,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  paddingBottom: 50,
                }}
              >
                <Ionicons name="trophy" size={32} color="gold" />
                <Image
                  source={getAvatar(users[0].avatarId)}
                  style={{ height: 100, width: "100%" }}
                  contentFit="contain"
                />
                <Text
                  style={{ fontWeight: "bold", color: theme.colors.primary }}
                >
                  {users[0].username}
                </Text>
                <Text style={{ color: "#666" }}>
                  {users[0].points} pistettä
                </Text>
              </View>
              <View
                style={{
                  width: 120,
                  //margin: 5,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="trophy" size={32} color="brown" />
                <Image
                  source={getAvatar(users[2].avatarId)}
                  style={{ height: 100, width: "100%" }}
                  contentFit="contain"
                />
                <Text
                  style={{ fontWeight: "bold", color: theme.colors.primary }}
                >
                  {users[2].username}
                </Text>
                <Text style={{ color: "#666" }}>
                  {users[2].points} pistettä
                </Text>
              </View>
            </View>
            {/* Map users by position between 4-10*/}
            {users.slice(3, 10).map((user, index) => (
              <View key={index} style={styles.leaderboardRow}>
                <Text style={styles.leaderboardPosition}>
                  {index + 4}. {user.username}
                </Text>
                <Text style={styles.leaderboardScore}>
                  {user.points} pistettä
                </Text>
              </View>
            ))}
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
    // height: "80%",
    //borderRadius: theme.borderRadius.large,
    margin: 50,
    padding: theme.spacing.large,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.medium,
    marginTop: 20,
  },
  modalTitle: {
    fontSize: theme.fonts.title.fontSize,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  leaderboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.small,
    padding: theme.spacing.small,
  },
  leaderboardPosition: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.primary,
  },
  leaderboardName: {
    fontSize: theme.fonts.regular.fontSize,
    color: theme.colors.text,
  },
  leaderboardScore: {
    fontSize: theme.fonts.regular.fontSize,
    color: "#666",
  },
  box: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.medium,
    marginBottom: theme.spacing.medium,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
