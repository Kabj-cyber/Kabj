import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../api/client";
import AttractionsSection from "../components/AttractionsSection";
import { useAuth } from "../context/AuthContext";
import { MainTabsParamList, RootStackParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { Attraction } from "../types";

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, "Explore">,
  NativeStackScreenProps<RootStackParamList>
>;

const REGIONS = [
  "All",
  "Greater Accra",
  "Ashanti",
  "Central",
  "Western",
  "Volta",
  "Eastern",
  "Northern",
];

export default function ExploreScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [activeRegion, setActiveRegion] = useState("All");
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    })();
  }, []);

  const loadAttractions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAttractions({
        lat: coords?.lat,
        lng: coords?.lng,
        userId: user?.id,
      });
      setAttractions(data);
    } catch (e: any) {
      setError(e.message || "Could not load attractions.");
    } finally {
      setLoading(false);
    }
  }, [coords, user?.id]);

  useEffect(() => {
    loadAttractions();
  }, [loadAttractions]);

  const filtered = useMemo(() => {
    if (activeRegion === "All") return attractions;
    return attractions.filter((a) => a.region === activeRegion);
  }, [activeRegion, attractions]);

  const handleToggleFavorite = useCallback(
    async (id: number, favorited: boolean) => {
      setAttractions((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isFavorited: favorited } : a))
      );

      if (!user?.id) return;

      try {
        const result = await api.toggleAttractionFavorite(id, user.id);
        setAttractions((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isFavorited: result.favorited } : a))
        );
      } catch {
        setAttractions((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isFavorited: !favorited } : a))
        );
      }
    },
    [user?.id]
  );

  const regionChips = (
    <View style={styles.topSection}>
      <Text style={styles.header}>Explore Map</Text>
      <FlatList
        horizontal
        data={REGIONS}
        keyExtractor={(r) => r}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.chip, activeRegion === item && styles.chipActive]}
            onPress={() => setActiveRegion(item)}
          >
            <Text style={[styles.chipText, activeRegion === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <AttractionsSection
        attractions={filtered}
        loading={loading}
        error={error}
        ListHeaderComponent={regionChips}
        emptyMessage={`No attractions found for "${activeRegion}".`}
        onPressCard={(item) => navigation.navigate("AttractionDetail", { attraction: item })}
        onToggleFavorite={handleToggleFavorite}
        onSeeAll={() => setActiveRegion("All")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F2E1F" },
  topSection: {
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingBottom: 8,
  },
  header: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  chipsRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 8 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.textMuted, fontSize: 13, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
});
