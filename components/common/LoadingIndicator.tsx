import { theme } from "@/theme";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";

const LoadingIndicator = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={styles.loadingText}>Ladataan...</Text>
    </View>
  );
};

export default LoadingIndicator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: theme.spacing.small,
    color: theme.colors.primary,
    fontSize: theme.fonts.regular.fontSize,
  },
});
