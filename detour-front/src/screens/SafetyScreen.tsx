import { Ionicons } from "@expo/vector-icons";
import { CompositeScreenProps, useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { VerifiedGuide } from "../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Safety">,
  NativeStackScreenProps<RootStackParamList>
>;

const GHANA_EMERGENCY = [
  { label: "Police", number: "191", icon: "shield" as const },
  { label: "Fire", number: "192", icon: "flame" as const },
  { label: "Ambulance", number: "193", icon: "medkit" as const },
];

export default function SafetyScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [guides, setGuides] = useState<VerifiedGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const guideData = await api.getVerifiedGuides();
      setGuides(guideData);
    } catch (e: any) {
      setError(e.message || "Could not load safety data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() =>
      Alert.alert("Cannot call", `Dial ${number} manually from your phone.`)
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={28} color="#fff" />
        <Text style={styles.headerTitle}>Safety Center</Text>
        <Text style={styles.headerSub}>Verified guides & emergency help</Text>
      </View>

      <View style={styles.sosCard}>
        <View style={styles.sosIconWrap}>
          <Ionicons name="radio" size={32} color="#fff" />
        </View>
        <Text style={styles.sosTitle}>Emergency SOS</Text>
        <Text style={styles.sosDesc}>
          Records up to 5 minutes of audio and sends your live GPS location to local authorities.
        </Text>
        <Button
          title="Start SOS Recording"
          onPress={() => {
            if (!user) {
              Alert.alert("Log in required", "Please log in to use the SOS feature.", [
                { text: "Cancel", style: "cancel" },
                { text: "Log In", onPress: () => navigation.navigate("Login") },
              ]);
              return;
            }
            navigation.navigate("SOSRecording");
          }}
          style={{ backgroundColor: colors.danger, marginTop: 12 }}
        />
      </View>

      <Text style={styles.sectionTitle}>Quick dial — Ghana emergency</Text>
      <View style={styles.emergencyRow}>
        {GHANA_EMERGENCY.map((item) => (
          <TouchableOpacity key={item.number} style={styles.emergencyBtn} onPress={() => callNumber(item.number)}>
            <Ionicons name={item.icon} size={22} color={colors.danger} />
            <Text style={styles.emergencyLabel}>{item.label}</Text>
            <Text style={styles.emergencyNumber}>{item.number}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Emergency contacts</Text>
        <TouchableOpacity onPress={() => navigation.navigate("EmergencyContacts")}>
          <Text style={styles.link}>Manage</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("EmergencyContacts")}
      >
        <Ionicons name="people-outline" size={22} color={colors.primary} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardTitle}>Your trusted contacts</Text>
          <Text style={styles.cardSub}>
            Add family or friends to notify during an emergency
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Verified transport guides</Text>
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : guides.length === 0 ? (
        <Text style={styles.empty}>No verified guides listed yet.</Text>
      ) : (
        <FlatList
          data={guides}
          keyExtractor={(g) => String(g.id)}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={styles.guideCard}>
              <View style={styles.guideAvatar}>
                <Ionicons name="car" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.guideTop}>
                  <Text style={styles.guideName}>{item.name}</Text>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                    <Text style={styles.verifiedText}>Verified</Text>
                  </View>
                </View>
                <Text style={styles.guideMeta}>
                  {item.transportType} · {item.region}
                  {item.rating != null ? ` · ★ ${item.rating}` : ""}
                </Text>
                {item.licenseNumber ? (
                  <Text style={styles.guideLicense}>License: {item.licenseNumber}</Text>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => callNumber(item.phoneNumber.replace(/\s/g, ""))}>
                <Ionicons name="call" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 32 },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 8 },
  headerSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, textAlign: "center", marginTop: 4 },
  sosCard: {
    backgroundColor: "#fef2f2",
    margin: 16,
    marginTop: -12,
    padding: 20,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "#fecaca",
    alignItems: "center",
  },
  sosIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.danger,
    alignItems: "center",
    justifyContent: "center",
  },
  sosTitle: { fontSize: 18, fontWeight: "700", color: colors.danger, marginTop: 12 },
  sosDesc: { fontSize: 13, color: colors.textMuted, textAlign: "center", marginTop: 6, lineHeight: 18 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 10,
  },
  link: { color: colors.primary, fontWeight: "600", fontSize: 14 },
  emergencyRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginBottom: 20 },
  emergencyBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  emergencyLabel: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  emergencyNumber: { fontSize: 16, fontWeight: "700", color: colors.danger, marginTop: 2 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: { fontSize: 15, fontWeight: "600", color: colors.text },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  guideCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  guideAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
  guideTop: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  guideName: { fontSize: 14, fontWeight: "700", color: colors.text },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 3 },
  verifiedText: { fontSize: 11, color: colors.success, fontWeight: "600" },
  guideMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  guideLicense: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  empty: { color: colors.textMuted, marginHorizontal: 16, marginBottom: 16, fontSize: 13 },
  errorBox: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    backgroundColor: "#fef2f2",
    borderRadius: radius.md,
  },
  errorText: { color: colors.danger, fontWeight: "600" },
});
