export const theme = {
  colors: {
    primary: "#184B10", // Original primary color
    secondary: "#4cd964", // Original secondary color
    background: "white", // Original background color
    overlay: "rgba(255, 255, 255, 0.9)",
    error: "#b00020", // Default error color
    text: "#333", // Original text color
    onPrimary: "white", // Assuming white text on primary
    onSecondary: "#333", // Assuming dark text on secondary
    onBackground: "#333", // Original text color
    onSurface: "#333", // Original text color
    onError: "white", // Assuming white text on error
  },
  fontFamily: {
    regular: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    semiBold: "Poppins_600SemiBold",
    bold: "Poppins_700Bold",
  },
  fonts: {
    regular: {
      fontSize: 16, // Original body font size
      fontWeight: "normal" as const,
      fontFamily: "Poppins_400Regular",
    },
    subtitle: {
      fontSize: 18, // Original subtitle font size
      fontWeight: "500" as const,
      fontFamily: "Poppins_500Medium",
    },
    title: {
      fontSize: 32, // Original title font size
      fontWeight: "bold" as const,
      fontFamily: "Poppins_700Bold",
    },
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
  },
};
