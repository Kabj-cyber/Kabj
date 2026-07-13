import React, { useEffect, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Attraction } from "../types";

const GOLD = "#E8B830";

interface Props {
  attraction: Attraction;
  width: number;
  onPress: () => void;
  onToggleFavorite?: (id: number, favorited: boolean) => void;
}

function GradientOverlay() {
  return (
    <View style={styles.gradientOverlay} pointerEvents="none">
      <View style={[styles.gradientLayer, { height: "25%", opacity: 0.15 }]} />
      <View style={[styles.gradientLayer, { height: "40%", opacity: 0.35 }]} />
      <View style={[styles.gradientLayer, { height: "55%", opacity: 0.55 }]} />
      <View style={[styles.gradientLayer, { height: "70%", opacity: 0.75 }]} />
    </View>
  );
}

export default function AttractionCard({
  attraction,
  width,
  onPress,
  onToggleFavorite,
}: Props) {
  const [favorited, setFavorited] = useState(attraction.isFavorited ?? false);
  const cardHeight = width * 1.1;

  useEffect(() => {
    setFavorited(attraction.isFavorited ?? false);
  }, [attraction.id, attraction.isFavorited]);

  const rating =
    attraction.averageRating != null
      ? Number(attraction.averageRating).toFixed(1)
      : null;
  const reviewCount = attraction.reviewCount ?? 0;
  const distance =
    attraction.distanceKm != null
      ? `${Number(attraction.distanceKm).toFixed(1)} km`
      : null;

  let metaText = "";
  if (rating) {
    metaText = `${rating} (${reviewCount})`;
    if (distance) metaText += ` • ${distance}`;
  } else if (distance) {
    metaText = distance;
  }

  const handleFavoritePress = () => {
    const next = !favorited;
    setFavorited(next);
    onToggleFavorite?.(attraction.id, next);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { width, height: cardHeight }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {attraction.imageUrl ? (
        <Image source={{ uri: attraction.imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback]}>
          <Ionicons name="image-outline" size={22} color="rgba(255,255,255,0.5)" />
        </View>
      )}

      <GradientOverlay />

      <TouchableOpacity
        style={styles.heartButton}
        onPress={handleFavoritePress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.8}
      >
        <Ionicons
          name={favorited ? "heart" : "heart-outline"}
          size={16}
          color="#fff"
        />
      </TouchableOpacity>

      <View style={styles.textStack}>
        <Text style={styles.name} numberOfLines={2}>
          {attraction.title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {attraction.region}
        </Text>
        {metaText.length > 0 && (
          <View style={styles.metaRow}>
            {rating && <Ionicons name="star" size={11} color={GOLD} style={styles.starIcon} />}
            <Text style={styles.metaText}>{metaText}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 9,
    backgroundColor: "#1a3d2a",
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    backgroundColor: "#1a3d2a",
    alignItems: "center",
    justifyContent: "center",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  gradientLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#000",
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  textStack: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
  },
  name: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 18,
  },
  location: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 12,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  starIcon: {
    marginRight: 1,
  },
  metaText: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    flexShrink: 1,
  },
});
