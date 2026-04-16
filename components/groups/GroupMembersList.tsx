import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { theme } from "@/theme";
import { GroupMember } from "@/types/groups";

type Props = {
  members: GroupMember[];
  currentUserId?: string;
};

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
  if (avatarId === "4") {
    return require("../../assets/images/avatar5.png");
  }
  return require("../../assets/images/avatar2.jpg");
};

const getRoleLabel = (role: string) => {
  switch (role) {
    case "owner":
      return "Omistaja";
    case "admin":
      return "Ylläpitäjä";
    default:
      return "";
  }
};

const GroupMembersList = ({ members, currentUserId }: Props) => {
  // Sort members: owner first, then admins, then by username
  const sortedMembers = [...members].sort((a, b) => {
    const roleOrder = { owner: 0, admin: 1, member: 2 };
    const roleA = roleOrder[a.role] ?? 2;
    const roleB = roleOrder[b.role] ?? 2;
    if (roleA !== roleB) return roleA - roleB;
    return a.username.localeCompare(b.username);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jäsenet ({members.length})</Text>
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {sortedMembers.map((member) => (
          <View
            key={member.uid}
            style={[
              styles.memberRow,
              member.uid === currentUserId && styles.currentUserRow,
            ]}
          >
            <Image source={getAvatar(member.avatarId)} style={styles.avatar} />
            <View style={styles.memberInfo}>
              <Text style={styles.username}>
                {member.username}
                {member.uid === currentUserId && " (sinä)"}
              </Text>
              {member.role !== "member" && (
                <Text style={styles.role}>{getRoleLabel(member.role)}</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 16,
  },
  list: {
    maxHeight: 300,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 4,
  },
  currentUserRow: {
    backgroundColor: "rgba(55, 137, 28, 0.08)",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  username: {
    fontSize: 15,
    fontFamily: theme.fontFamily.medium,
    color: "#2d3436",
  },
  role: {
    fontSize: 12,
    fontFamily: theme.fontFamily.regular,
    color: "#37891C",
    marginTop: 2,
  },
});

export default GroupMembersList;
