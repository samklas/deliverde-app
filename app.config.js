export default {
  expo: {
    name: "DeliVerde",
    slug: "Deliverde",
    version: "1.1.2",
    orientation: "portrait",
    scheme: "deliverde",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: false,
      bundleIdentifier: "fi.deliverde.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSCameraUsageDescription:
          "DeliVerde needs camera access to take photos of vegetables for identification.",
        NSPhotoLibraryUsageDescription:
          "DeliVerde needs access to your photo library to select vegetable images for identification.",
      },
      icon: "./assets/images/icon.jpeg",
      usesAppleSignIn: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android_icon_deliverde.png",
      },
      package: "fi.deliverde.app",
      permissions: [],
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
            image: "./assets/images/logo_nav.png",
            resizeMode: "cover",
            backgroundColor: "#37891C",
          },
        },
      ],
      [
        "expo-notifications",
        {
          icon: "./assets/images/logo_nav.png",
          color: "#37891C",
          defaultChannel: "daily-reminder",
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
    githubUrl: "https://github.com/sorsat/deliverde-app",
    support: {
      email: "tilaus@deliverde.fi",
      url: "https://deliverde-shop.myshopify.com/pages/contact",
    },
  },
};
