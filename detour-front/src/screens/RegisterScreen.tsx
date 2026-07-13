import { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../api/client";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Register">;

export default function RegisterScreen({ navigation }: Props) {
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing info", "Name, email and password are required.");
      return;
    }
    setLoading(true);
    try {
      const user = await api.register({
        name,
        email,
        password,
        phoneNumber,
        role: "TOURIST",
      });
      setUser(user);
      navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
    } catch (e: any) {
      Alert.alert("Registration failed", e.message || "Could not register. Check your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join DeTour and start exploring</Text>

        <Input label="Full name" value={name} onChangeText={setName} placeholder="Ama Owusu" />
        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
        />
        <Input
          label="Phone number"
          keyboardType="phone-pad"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder="024 123 4567"
        />
        <Input
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
        />

        <Button title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />

        <View style={styles.row}>
          <Text style={styles.muted}>Already have an account? </Text>
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            Log in
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: 24, paddingTop: 60, flexGrow: 1, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "800", color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: 24 },
  row: { flexDirection: "row", justifyContent: "center", marginTop: 18 },
  muted: { color: colors.textMuted },
  link: { color: colors.primary, fontWeight: "700" },
});
