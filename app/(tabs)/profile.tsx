import { auth } from "@/firebaseConfig";
import userStore from "@/stores/userStore";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Alert,
  Pressable,
  Share,
  ScrollView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { storage, setLevelForCurrentUser, getInviteCodeForCurrentUser, isAnonymousUser, deleteAccount } from "@/services";
import { STORAGE_KEYS } from "@/constants";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import DailyGoalModal from "@/components/DailyGoalModal";
import React from "react";

export default function Tab() {
  const [username, setUsername] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const { avatarId, dailyTarget } = userStore;
  const router = useRouter();

  const handleLogout = async () => {
    const isAnonymous = isAnonymousUser();

    Alert.alert(
      isAnonymous ? "Vahvista uloskirjautuminen" : "Vahvista uloskirjautuminen",
      isAnonymous
        ? "Olet kirjautunut anonyymisti. Jos kirjaudut ulos, kaikki tietosi poistetaan pysyvästi. Haluatko jatkaa?"
        : "Oletko varma, että haluat kirjautua ulos?",
      [
        {
          text: "Kyllä",
          onPress: async () => {
            try {
              if (isAnonymous) {
                // Delete account and data for anonymous users
                await deleteAccount();
              }
              await storage.clearUserData();
              auth.signOut();
            } catch (error) {
              console.error("Error logging out:", error);
            }
          },
        },
        {
          text: "Ei",
          onPress: () => {},
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };

  const handleAccountDeleted = () => {
    setDeleteModalVisible(false);
    router.replace("/login");
  };

  const handleSaveGoal = async (level: string, target: number) => {
    await setLevelForCurrentUser(level);
    userStore.setDailyTarget(target);
  };

  const loadUsername = async () => {
    const storedUsername = await storage.get(STORAGE_KEYS.USERNAME);
    if (storedUsername) {
      setUsername(storedUsername);
    }
  };

  const loadInviteCode = async () => {
    const code = await getInviteCodeForCurrentUser();
    setInviteCode(code);
  };

  const shareInviteCode = async () => {
    if (inviteCode) {
      try {
        await Share.share({
          message: `Liity mukaan DeliVerdeen! Käytä kutsukoodiani: ${inviteCode}`,
        });
      } catch (error) {
        console.error("Error sharing invite code:", error);
      }
    }
  };

  const getAvatar = () => {
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

  useEffect(() => {
    loadUsername();
    loadInviteCode();
  }, []);

  return (
      
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <Image source={getAvatar()} style={styles.avatar} />
            <Text style={styles.username}>{username}</Text>
          </View>

<Pressable
            style={[styles.box, styles.goalBox]}
            onPress={() => setGoalModalVisible(true)}
          >
            <Text style={styles.sectionTitle}>Päivän tavoite</Text>
            <View style={styles.boxContent}>
              <Text style={styles.goalText}>Syö {dailyTarget}g vihanneksia</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
            </View>
          </Pressable>


          <Pressable
            style={styles.box}
            onPress={() => setInfoModalVisible(true)}
          >
            <View style={styles.boxContent}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Näin DeliVerde toimii</Text>
              <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} />
            </View>
          </Pressable>

<Pressable
            style={styles.box}
            onPress={() => router.push("/feedback")}
          >
            <View style={styles.boxContent}>
              <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Lähetä palautetta</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
            </View>
          </Pressable>

          <View style={styles.logoutContainer}>
            <Pressable style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Kirjaudu ulos</Text>
            </Pressable>
            <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
              <Text style={styles.deleteText}>Poista tili</Text>
            </Pressable>
          </View>
          <DeleteAccountModal
          visible={deleteModalVisible}
          onClose={() => setDeleteModalVisible(false)}
          onDeleted={handleAccountDeleted}
        />

        <DailyGoalModal
          visible={goalModalVisible}
          currentTarget={dailyTarget}
          onClose={() => setGoalModalVisible(false)}
          onSave={handleSaveGoal}
        />

        <Modal
          animationType="slide"
          transparent={true}
          visible={infoModalVisible}
          onRequestClose={() => setInfoModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.modalTitle}>Näin DeliVerde toimii</Text>
                <Text style={styles.modalSubtitle}>Tervetuloa!</Text>
                {[
                  { title: "Seuraa kasvisten kulutusta", description: "Kirjaa syömäsi kasvikset ja kerää pisteitä jokaisesta 100 grammasta." },
                  { title: "Saavuta päivittäinen tavoite", description: "Valitse oma kasvistavoitteesi ja ansaitse bonuspisteitä kun saavutat sen." },
                  { title: "Kilpaile kavereita vastaan", description: "Vertaa pisteitäsi muihin ja nouse tulostaulun kärkeen." },
                  { title: "Löydä uusia reseptejä", description: "Selaa reseptejä ja saa inspiraatiota kasvispitoiseen ruokavalioon." },
                ].map((item, index) => (
                  <View key={index} style={styles.infoItem}>
                    <View style={styles.infoNumber}>
                      <Text style={styles.infoNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.infoItemContent}>
                      <Text style={styles.infoItemTitle}>{item.title}</Text>
                      <Text style={styles.infoItemDescription}>{item.description}</Text>
                    </View>
                  </View>
                ))}
                <Pressable style={styles.modalCloseButton} onPress={() => setInfoModalVisible(false)}>
                  <Text style={styles.modalCloseButtonText}>Sulje</Text>
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>

</ScrollView>

        
      
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 30,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: theme.spacing.medium,
  },
  profileHeader: {
    alignItems: "center",
    marginTop: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  username: {
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: theme.fontFamily.semiBold,
    marginBottom: 15,
    color: theme.colors.primary,
  },
  boxContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalText: {
    fontFamily: theme.fontFamily.regular,
    fontSize: 16,
  },
  helpText: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    marginTop: 10,
  },
  goalBox: {
    marginTop: 50,
  },
  box: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoutContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  logoutButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  logoutText: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.medium,
  },
  deleteButton: {
    borderWidth: 2,
    borderColor: theme.colors.error,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  deleteText: {
    color: theme.colors.error,
    fontFamily: theme.fontFamily.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.medium,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  infoNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#37891C",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    marginTop: 2,
  },
  infoNumberText: {
    color: "white",
    fontSize: 15,
    fontFamily: theme.fontFamily.bold,
  },
  infoItemContent: {
    flex: 1,
  },
  infoItemTitle: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  infoItemDescription: {
    fontSize: 14,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
    lineHeight: 20,
  },
  modalCloseButton: {
    backgroundColor: "#37891C",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  modalCloseButtonText: {
    color: "white",
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
  },
});
