import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { api } from "../api/client";
import { MainTabsParamList } from "../navigation/types";
import { colors, radius } from "../theme";
import { Facility, FacilityCategory } from "../types";

type Props = BottomTabScreenProps<MainTabsParamList, "FacilitiesMap">;

const DEFAULT_RADIUS_KM = 50;

const ACCRA_FALLBACK: Region = {
  latitude: 5.6037,
  longitude: -0.187,
  latitudeDelta: 0.35,
  longitudeDelta: 0.35,
};

const CATEGORY_FILTERS: { label: string; value: FacilityCategory | null }[] = [
  { label: "All", value: null },
  { label: "Hotels", value: "HOTEL" },
  { label: "Guesthouses", value: "GUESTHOUSE" },
  { label: "Rest Stops", value: "REST_STOP" },
  { label: "Fuel", value: "FUEL_STATION" },
  { label: "EV Charging", value: "EV_CHARGING" },
  { label: "Hospitals", value: "HOSPITAL" },
  { label: "ATMs", value: "ATM" },
  { label: "Restaurants", value: "RESTAURANT" },
];

const CATEGORY_META: Record<
  FacilityCategory,
  { color: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  HOTEL: { color: colors.primary, icon: "bed" },
  GUESTHOUSE: { color: colors.success, icon: "home" },
  REST_STOP: { color: colors.warning, icon: "car" },
  FUEL_STATION: { color: colors.danger, icon: "flash" },
  EV_CHARGING: { color: "#2563eb", icon: "battery-charging" },
  HOSPITAL: { color: "#be123c", icon: "medkit" },
  ATM: { color: colors.textMuted, icon: "card" },
  RESTAURANT: { color: colors.accent, icon: "restaurant" },
};

function openDirections(facility: Facility) {
  const { latitude, longitude, name } = facility;
  const label = encodeURIComponent(name);
  const url =
    Platform.OS === "android"
      ? `google.navigation:q=${latitude},${longitude}`
      : `maps://?daddr=${latitude},${longitude}&q=${label}`;
  Linking.openURL(url).catch(() => {
    Linking.openURL(`geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`);
  });
}

export default function FacilitiesMapScreen(_props: Props) {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selected, setSelected] = useState<Facility | null>(null);
  const [activeCategory, setActiveCategory] = useState<FacilityCategory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const loadFacilities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFacilities({
        lat: coords?.lat,
        lng: coords?.lng,
        category: activeCategory ?? undefined,
        radiusKm: coords ? DEFAULT_RADIUS_KM : undefined,
      });
      setFacilities(data);
      setSelected(null);
    } catch (e: any) {
      setError(e.message || "Could not load facilities.");
    } finally {
      setLoading(false);
    }
  }, [activeCategory, coords]);

  useEffect(() => {
    loadFacilities();
  }, [loadFacilities]);

  const mapRegion = useMemo<Region>(() => {
    if (coords) {
      return {
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: 0.25,
        longitudeDelta: 0.25,
      };
    }
    return ACCRA_FALLBACK;
  }, [coords]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={mapRegion}
        region={coords ? mapRegion : undefined}
        showsUserLocation
        showsMyLocationButton
        onPress={() => setSelected(null)}
      >
        {facilities.map((facility) => {
          const meta = CATEGORY_META[facility.category];
          return (
            <Marker
              key={facility.id}
              coordinate={{
                latitude: Number(facility.latitude),
                longitude: Number(facility.longitude),
              }}
              onPress={(e) => {
                e.stopPropagation();
                setSelected(facility);
              }}
            >
              <View style={[styles.markerBubble, { backgroundColor: meta.color }]}>
                <Ionicons name={meta.icon} size={16} color="#fff" />
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View style={styles.filterBar}>
        <Text style={styles.header}>Nearby Facilities</Text>
        <FlatList
          horizontal
          data={CATEGORY_FILTERS}
          keyExtractor={(item) => item.label}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, activeCategory === item.value && styles.chipActive]}
              onPress={() => setActiveCategory(item.value)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeCategory === item.value && styles.chipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadFacilities}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {selected && (
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View
              style={[
                styles.detailIcon,
                { backgroundColor: CATEGORY_META[selected.category].color },
              ]}
            >
              <Ionicons
                name={CATEGORY_META[selected.category].icon}
                size={18}
                color="#fff"
              />
            </View>
            <View style={styles.detailTitleBlock}>
              <Text style={styles.detailName}>{selected.name}</Text>
              <Text style={styles.detailCategory}>
                {selected.category.replace(/_/g, " ")}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelected(null)} hitSlop={8}>
              <Ionicons name="close" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.detailRow}>{selected.address}</Text>
          {selected.phoneNumber ? (
            <Text style={styles.detailRow}>{selected.phoneNumber}</Text>
          ) : null}
          {selected.distanceKm != null ? (
            <Text style={styles.detailDistance}>{selected.distanceKm} km away</Text>
          ) : null}

          <TouchableOpacity
            style={styles.directionsBtn}
            onPress={() => openDirections(selected)}
          >
            <Ionicons name="navigate" size={18} color="#fff" />
            <Text style={styles.directionsBtnText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  map: { ...StyleSheet.absoluteFillObject },
  filterBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  markerBubble: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  loadingOverlay: {
    position: "absolute",
    bottom: 24,
    alignSelf: "center",
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: radius.md,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  errorBanner: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: { color: colors.danger, flex: 1, marginRight: 12, fontSize: 14 },
  retryText: { color: colors.primary, fontWeight: "700", fontSize: 14 },
  detailCard: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  detailHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  detailTitleBlock: { flex: 1 },
  detailName: { fontSize: 16, fontWeight: "800", color: colors.text },
  detailCategory: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    textTransform: "capitalize",
  },
  detailRow: { fontSize: 14, color: colors.text, marginBottom: 4 },
  detailDistance: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 12,
  },
  directionsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginTop: 4,
  },
  directionsBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
