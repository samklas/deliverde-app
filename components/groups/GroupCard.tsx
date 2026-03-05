import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { GroupSummary } from "@/types/groups";

type Props = {
  group: GroupSummary;
  onPress: () => void;
};

const GroupCard = ({ group, onPress }: Props) => {
  const getRoleLabel = (role: string) => {
    switch (role) {
      case "owner":
        return "Omistaja";
      case "admin":
        return "Ylläpitäjä";
      default:
        return "Jäsen";
    }
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.iconContainer}>
        <Ionicons name="people" size={24} color="#37891C" />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {group.name}
        </Text>
        <View style={styles.details}>
          <Text style={styles.memberCount}>
            {group.memberCount} {group.memberCount === 1 ? "jäsen" : "jäsentä"}
          </Text>
          <Text style={styles.role}>{getRoleLabel(group.role)}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(55, 137, 28, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  details: {
    flexDirection: "row",
    alignItems: "center",
  },
  memberCount: {
    fontSize: 13,
    fontFamily: theme.fontFamily.regular,
    color: "#666",
  },
  role: {
    fontSize: 13,
    fontFamily: theme.fontFamily.medium,
    color: "#37891C",
    marginLeft: 12,
  },
});

export default GroupCard;
