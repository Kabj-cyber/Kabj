import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";

const DISABLED_ITEMS = [
  { icon: "language-outline", label: "Language Preference" },
  { icon: "bookmark-outline", label: "Saved Places" },
  { icon: "star-outline", label: "Reviews" },
] as const;

export default function ProfileScreen() {
  const { user, setUser } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  if (!user) {
    return (
      <View style={styles.center}>
        <Ionicons name="person-circle-outline" size={48} color={colors.textMuted} />
        <Text style={styles.notLoggedIn}>You're browsing as a guest.</Text>
        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginBtnText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          setUser(null);
          navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color="#fff" />
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Item icon="call-outline" label="Phone" value={user.phoneNumber || "Not provided"} />
        <Item icon="person-outline" label="User ID" value={String(user.id)} />
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => navigation.navigate("EmergencyContacts")}
        >
          <Ionicons name="people-outline" size={20} color={colors.primary} />
          <Text style={styles.rowLabel}>Emergency Contacts</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.row}>
          <Ionicons name="card-outline" size={20} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Payment Methods</Text>
            <Text style={styles.paymentSub}>MTN MoMo · Vodafone Cash · Card</Text>
          </View>
        </View>
        {DISABLED_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.row}
            onPress={() =>
              Alert.alert(
                "Not available yet",
                "There's no backend support for this feature yet."
              )
            }
          >
            <Ionicons name={item.icon} size={20} color={colors.textMuted} />
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color={colors.danger} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function Item({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, alignItems: "center", paddingTop: 70, paddingBottom: 24 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  name: { color: "#fff", fontSize: 18, fontWeight: "700" },
  email: { color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 2 },
  rolePill: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginTop: 10,
  },
  roleText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  section: {
    backgroundColor: colors.card,
    margin: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  rowLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: "500" },
  paymentSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  itemLabel: { fontSize: 11, color: colors.textMuted },
  itemValue: { fontSize: 14, fontWeight: "600", color: colors.text, marginTop: 2 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    margin: 16,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: "#fef2f2",
  },
  logoutText: { color: colors.danger, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: colors.background },
  notLoggedIn: { color: colors.textMuted, fontSize: 14 },
  loginBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.pill },
  loginBtnText: { color: "#fff", fontWeight: "700" },
});
