import { useState } from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { theme } from "@/theme";

export default function ImagePickerExample() {
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  return (
    <View style={styles.container}>
      {image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: image }} style={styles.image} />
          <TouchableOpacity
            style={{
              alignItems: "center",
              marginTop: 30,
              marginBottom: 20,
              flex: 1,
              justifyContent: "flex-end",
            }}
            onPress={removeImage}
          >
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: "500",
                borderWidth: 2,
                borderColor: theme.colors.primary,
                borderRadius: 20,
                paddingTop: 10,
                paddingBottom: 10,
                paddingLeft: 20,
                paddingRight: 20,
              }}
            >
              Poista
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            alignItems: "center",
            marginTop: 30,
            marginBottom: 20,
            flex: 1,
            justifyContent: "flex-end",
          }}
          onPress={pickImage}
        >
          <Text
            style={{
              color: theme.colors.primary,
              fontWeight: "500",
              borderWidth: 2,
              borderColor: theme.colors.primary,
              borderRadius: 20,
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 20,
              paddingRight: 20,
            }}
          >
            Lisää kuva
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  imageContainer: {
    width: "100%",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  pickButton: {
    width: "100%",
    padding: 15,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  pickButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  removeButton: {
    padding: 10,

    // backgroundColor: "#ff4444",
    borderRadius: 8,
    borderColor: "#000",
    borderWidth: 1,
    alignItems: "center",
    width: "100%",
  },
  removeButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
