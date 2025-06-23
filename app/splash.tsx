import { Text, View, ImageBackground, Image } from "react-native";

export default function Splash() {
  return (
    <ImageBackground
      source={require("../assets/images/salad.jpg")}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      resizeMode="cover"
    >
      <Image
        source={require("../assets/images/logo_nav.png")}
        style={{
          width: 200,
          height: 150,
          justifyContent: "center",
          alignItems: "center",
        }}
      ></Image>
    </ImageBackground>
  );
}
