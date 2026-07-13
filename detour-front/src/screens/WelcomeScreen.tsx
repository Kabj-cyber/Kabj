import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Button from "../components/Button";
import { colors } from "../theme";
import { RootStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.logoCircle}>
          <Ionicons name="star" size={28} color={colors.accent} />
        </View>
        <Text style={styles.brand}>DeTour</Text>
        <Text style={styles.tagline}>Discover Ghana.{"\n"}Live the Culture.</Text>
      </View>

      <View style={styles.footer}>
        <Button title="Get Started" variant="accent" onPress={() => navigation.navigate("Register")} />
        <Button title="Guest" variant="accent" onPress={() => navigation.navigate("MainTabs")}
          style={{ marginTop: 12, borderColor: "#fff" }}
        />
        <Text style={styles.builtBy}>Built for Ghana</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primary, justifyContent: "space-between" },
  hero: { flex: 1, alignItems: "center", justifyContent: "center" },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  brand: { color: "#fff", fontSize: 32, fontWeight: "800", marginBottom: 10 },
  tagline: { color: "rgba(255,255,255,0.85)", fontSize: 16, textAlign: "center", lineHeight: 22 },
  footer: { padding: 24, paddingBottom: 40 },
  builtBy: { color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: 16, fontSize: 12 },
});
