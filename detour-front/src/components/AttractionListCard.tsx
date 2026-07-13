import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Attraction } from "../types";
import { colors, radius } from "../theme";

interface Props {
  attraction: Attraction;
  onPress: () => void;
  onToggleFavorite?: (id: number, favorited: boolean) => void;
}

export default function AttractionListCard({
  attraction,
  onPress,
  onToggleFavorite,
}: Props) {
  const [favorited, setFavorited] = useState(attraction.isFavorited ?? false);

  useEffect(() => {
    setFavorited(attraction.isFavorited ?? false);
  }, [attraction.id, attraction.isFavorited]);

  const rating =
    attraction.averageRating != null
      ? Number(attraction.averageRating).toFixed(1)
      : null;
  const reviewCount = attraction.reviewCount ?? 0;

  const handleFavoritePress = () => {
    const next = !favorited;
    setFavorited(next);
    onToggleFavorite?.(attraction.id, next);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      {/* Full-bleed image, no card border/box — Airbnb/Booking.com listing style */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: attraction.imageUrl }} style={styles.image} resizeMode="cover" />
        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleFavoritePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.8}
        >
          <Ionicons
            name={favorited ? "heart" : "heart-outline"}
            size={20}
            color={favorited ? "#FF385C" : "#fff"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        {/* Row 1: title + rating, like Airbnb's location/rating line */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {attraction.title}
          </Text>
          {rating && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={13} color={colors.text} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>

        <Text style={styles.subtitle} numberOfLines={1}>
          {attraction.category} · {attraction.region}
        </Text>

        {reviewCount > 0 && (
          <Text style={styles.reviews} numberOfLines={1}>
            {reviewCount} review{reviewCount === 1 ? "" : "s"}
          </Text>
        )}

        {attraction.basePrice != null && (
          <Text style={styles.priceRow}>
            <Text style={styles.priceAmount}>
              GHS {Number(attraction.basePrice).toFixed(0)}
            </Text>
            <Text style={styles.pricePeriod}> / person</Text>
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 32,
  },
  imageWrap: {
    aspectRatio: 4 / 3,
    width: "100%",
    borderRadius: radius.md,
    overflow: "hidden",
    position: "relative",
    backgroundColor: colors.border,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  info: {
    paddingTop: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  reviews: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  priceRow: {
    marginTop: 6,
  },
  priceAmount: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  pricePeriod: {
    fontSize: 15,
    color: colors.text,
  },
});
