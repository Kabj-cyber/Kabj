import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Attraction } from "../types";
import { colors, radius } from "../theme";

interface Props {
  attraction: Attraction;
  onPress: () => void;
}

export default function AttractionListCard({ attraction, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.imagePlaceholder}>
        <Ionicons name="image-outline" size={28} color={colors.textMuted} />
      </View>
      <View style={styles.info}>
        <Text style={styles.title}>{attraction.title}</Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {attraction.category} · {attraction.region}
        </Text>
        <View style={styles.row}>
          {attraction.popularityCount != null && (
            <View style={styles.badge}>
              <Ionicons name="star" size={12} color={colors.accentDark} />
              <Text style={styles.badgeText}>{attraction.popularityCount}</Text>
            </View>
          )}
          {attraction.basePrice != null && (
            <Text style={styles.price}>GHS {Number(attraction.basePrice).toFixed(0)}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  imagePlaceholder: {
    height: 110,
    backgroundColor: "#eceae3",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { padding: 12 },
  title: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 2 },
  subtitle: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4 },
  badgeText: { fontSize: 12, color: colors.textMuted, marginLeft: 3 },
  price: { fontSize: 13, fontWeight: "700", color: colors.primary },
});
