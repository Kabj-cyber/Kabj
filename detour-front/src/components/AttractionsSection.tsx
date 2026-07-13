import React, { ReactElement, useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AttractionListCard from "./AttractionListCard";
import { Attraction } from "../types";
import { colors } from "../theme";

const H_PADDING = 16;

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
  const renderItem: ListRenderItem<Attraction> = useCallback(
    ({ item }) => (
      <AttractionListCard
        attraction={item}
        onPress={() => onPressCard(item)}
        onToggleFavorite={onToggleFavorite}
      />
    ),
    [onPressCard, onToggleFavorite]
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
          <ActivityIndicator color={colors.primary} style={styles.loader} />
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
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 24,
  },
  sectionWrap: {
    backgroundColor: colors.background,
    paddingTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  loader: {
    marginVertical: 32,
  },
  error: {
    color: colors.danger,
    textAlign: "center",
    marginVertical: 24,
    paddingHorizontal: 8,
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 32,
    marginBottom: 16,
  },
});
