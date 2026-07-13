import React, { ReactElement, useCallback, useMemo } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AttractionCard from "./AttractionCard";
import { Attraction } from "../types";

const SECTION_BG = "#0F2E1F";
const GOLD = "#E8B830";
const H_PADDING = 16;
const GAP = 9;
const NUM_COLUMNS = 3;

interface Props {
  attractions: Attraction[];
  loading?: boolean;
  error?: string | null;
  onPressCard: (attraction: Attraction) => void;
  onToggleFavorite?: (id: number, favorited: boolean) => void;
  onSeeAll?: () => void;
  ListHeaderComponent?: ReactElement | null;
  emptyMessage?: string;
}

export default function AttractionsSection({
  attractions,
  loading,
  error,
  onPressCard,
  onToggleFavorite,
  onSeeAll,
  ListHeaderComponent,
  emptyMessage = "No attractions found.",
}: Props) {
  const cardWidth = useMemo(() => {
    const screenWidth = Dimensions.get("window").width;
    return (screenWidth - H_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;
  }, []);

  const renderItem: ListRenderItem<Attraction> = useCallback(
    ({ item }) => (
      <AttractionCard
        attraction={item}
        width={cardWidth}
        onPress={() => onPressCard(item)}
        onToggleFavorite={onToggleFavorite}
      />
    ),
    [cardWidth, onPressCard, onToggleFavorite]
  );

  const sectionHeader = (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Popular Attractions</Text>
      <TouchableOpacity onPress={onSeeAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    </View>
  );

  const listHeader = (
    <>
      {ListHeaderComponent}
      <View style={styles.sectionWrap}>
        {sectionHeader}
        {loading ? (
          <ActivityIndicator color={GOLD} style={styles.loader} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : null}
      </View>
    </>
  );

  return (
    <FlatList
      data={loading || error ? [] : attractions}
      keyExtractor={(item) => String(item.id)}
      numColumns={NUM_COLUMNS}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.content}
      style={styles.list}
      ListHeaderComponent={listHeader}
      ListEmptyComponent={
        !loading && !error ? (
          <Text style={styles.empty}>{emptyMessage}</Text>
        ) : null
      }
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: SECTION_BG,
  },
  content: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 24,
  },
  sectionWrap: {
    backgroundColor: SECTION_BG,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: GOLD,
  },
  row: {
    gap: GAP,
  },
  loader: {
    marginVertical: 32,
  },
  error: {
    color: "#fca5a5",
    textAlign: "center",
    marginVertical: 24,
    paddingHorizontal: 8,
  },
  empty: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    marginTop: 32,
    marginBottom: 16,
  },
});
