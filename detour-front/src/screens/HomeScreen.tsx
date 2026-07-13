import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import AttractionListCard from "../components/AttractionListCard";
import { useAuth } from "../context/AuthContext";
import { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { Attraction } from "../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getAttractions();
      setAttractions(data);
    } catch (e: any) {
      setError(e.message || "Could not reach the DeTour backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = attractions.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.region.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(" ")[0] || "Explorer"} 👋</Text>
          <Text style={styles.question}>Where to today?</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("MainTabs", { screen: "Safety" })}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search attractions, regions, categories..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Ionicons name="cloud-offline-outline" size={20} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorHint}>
            Make sure your Spring Boot API is running and BASE_URL in src/api/client.ts points to it.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              {search ? `Results for "${search}"` : "Recommended for you"}
            </Text>
          }
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>No attractions found. Add some via your backend.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <AttractionListCard
              attraction={item}
              onPress={() => navigation.navigate("AttractionDetail", { attraction: item })}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  greeting: { color: "#fff", fontSize: 20, fontWeight: "700" },
  question: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 2 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginTop: -20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: radius.md,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text, marginLeft: 8 },
  list: { padding: 20, paddingTop: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12 },
  empty: { textAlign: "center", color: colors.textMuted, marginTop: 40 },
  errorBox: {
    margin: 20,
    padding: 16,
    backgroundColor: "#fef2f2",
    borderRadius: radius.md,
    alignItems: "center",
    gap: 6,
  },
  errorText: { color: colors.danger, fontWeight: "600", textAlign: "center", marginTop: 4 },
  errorHint: { color: colors.textMuted, fontSize: 12, textAlign: "center", marginTop: 4 },
});
