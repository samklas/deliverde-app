export default {
  expo: {
    name: "DeliVerde",
    slug: "Deliverde",
    version: "1.0.0",
    orientation: "portrait",
    scheme: "deliverde",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "fi.deliverde.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
      icon: "./assets/images/icon.jpeg",
      usesAppleSignIn: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/icon_android.png",
        backgroundColor: "#ffffff",
      },
      package: "fi.deliverde.app",
      permissions: ["android.permission.RECORD_AUDIO"],
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission:
            "The app accesses your photos to let you choose vegetable images from your library and analyze them with AI.",
          cameraPermission:
            "The app needs camera access to identify vegetables from photos.",
        },
      ],
      [
        "expo-splash-screen",
        {
          ios: {
            image: "./assets/images/Deliverde_splash1.jpeg",
            resizeMode: "cover",
            enableFullScreenImage_legacy: true,
          },
          android: {
            image: "./assets/images/Deliverde_splash1.jpeg",
            resizeMode: "cover",
          },
        },
      ],
      "expo-apple-authentication",
      "@react-native-google-signin/google-signin",
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "d5e813b3-5de7-4c04-a7a5-9b284370f1b7",
      },
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID,
      },
      googleWebClientId: process.env.GOOGLE_WEB_CLIENT_ID,
      googleIosClientId: process.env.GOOGLE_IOS_CLIENT_ID,
      imageAnalysisUrl: process.env.IMAGE_ANALYSIS_URL,
    },
    owner: "smabza",
  },
};
