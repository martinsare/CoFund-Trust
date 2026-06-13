import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { MARKET_LISTINGS, MarketListing, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

type MarketFilter = "all" | "buy" | "premium" | "discount";

const FILTERS: { id: MarketFilter; label: string }[] = [
  { id: "all", label: "All Listings" },
  { id: "buy", label: "Best Deals" },
  { id: "premium", label: "Premium" },
  { id: "discount", label: "Discounted" },
];

export default function Market() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<MarketFilter>("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = MARKET_LISTINGS.filter((m) => {
    if (filter === "premium") return m.premiumDiscount > 0;
    if (filter === "discount") return m.premiumDiscount < 0;
    if (filter === "buy") return m.premiumDiscount <= 0;
    return true;
  });

  const totalVolume = MARKET_LISTINGS.reduce((s, m) => s + m.askPrice, 0);
  const avgPremium = MARKET_LISTINGS.reduce((s, m) => s + m.premiumDiscount, 0) / MARKET_LISTINGS.length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInDown.delay(0).duration(500)}
        style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background }]}
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Secondary Market</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>Buy & sell active investment slots</Text>
          </View>
          <PressableScale style={[styles.listBtn, { backgroundColor: colors.accent }]}>
            <Feather name="plus" size={14} color="#fff" />
            <Text style={styles.listBtnText}>List</Text>
          </PressableScale>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Listings", value: MARKET_LISTINGS.length.toString() },
            { label: "Volume", value: formatCurrency(totalVolume) },
            { label: "Avg Premium", value: `${avgPremium > 0 ? "+" : ""}${avgPremium.toFixed(1)}%` },
          ].map((s) => (
            <View key={s.label} style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <PressableScale
              key={f.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.id ? colors.primary : colors.card,
                  borderColor: filter === f.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={[styles.filterText, { color: filter === f.id ? "#fff" : colors.mutedForeground }]}>
                {f.label}
              </Text>
            </PressableScale>
          ))}
        </View>
      </Animated.View>

      <FlatList
        data={filtered}
        keyExtractor={(m) => m.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={styles.cardWrap}>
            <MarketCard listing={item} colors={colors} onPress={() => router.push(`/business/${item.businessId}`)} />
          </Animated.View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="repeat" size={36} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No listings match</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Try a different filter</Text>
          </View>
        }
      />
    </View>
  );
}

function MarketCard({ listing, colors, onPress }: { listing: MarketListing; colors: ReturnType<typeof import("@/hooks/useColors").useColors>; onPress: () => void }) {
  const isPremium = listing.premiumDiscount > 0;
  const isDiscount = listing.premiumDiscount < 0;
  const badgeColor = isPremium ? colors.amber : isDiscount ? colors.accent : colors.muted;
  const badgeTextColor = isPremium ? colors.amber : isDiscount ? colors.accentDark : colors.mutedForeground;
  const badgeBg = isPremium ? colors.amberLight : isDiscount ? colors.accentLight : colors.muted;
  const premiumLabel = isPremium ? `+${listing.premiumDiscount}% premium` : isDiscount ? `${listing.premiumDiscount}% discount` : "At par";

  return (
    <PressableScale
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={[styles.cardName, { color: colors.foreground }]}>{listing.businessName}</Text>
            <View style={[styles.sellerBadge, { backgroundColor: listing.sellerType === "institutional" ? colors.primaryLight : colors.muted }]}>
              <Text style={[styles.sellerText, { color: listing.sellerType === "institutional" ? colors.primary : colors.mutedForeground }]}>
                {listing.sellerType === "institutional" ? "Institutional" : "Retail"}
              </Text>
            </View>
          </View>
          <Text style={[styles.cardIndustry, { color: colors.mutedForeground }]}>{listing.industry} · Trust {listing.trustScore}</Text>
        </View>
        <View style={[styles.premiumBadge, { backgroundColor: badgeBg }]}>
          <Text style={[styles.premiumText, { color: badgeTextColor }]}>{premiumLabel}</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <View style={styles.priceItem}>
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Ask Price</Text>
          <Text style={[styles.priceValue, { color: colors.foreground }]}>{formatCurrency(listing.askPrice)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Expected Return</Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>{formatCurrency(listing.expectedReturn)}</Text>
        </View>
        <View style={styles.priceItem}>
          <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>ROI</Text>
          <Text style={[styles.priceValue, { color: colors.accent }]}>{listing.roi}</Text>
        </View>
      </View>

      <View style={[styles.cardFooter, { borderTopColor: colors.borderLight }]}>
        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          <Feather name="clock" size={11} /> {listing.daysToMaturity}d to maturity · {listing.maturityDate}
        </Text>
        <PressableScale style={[styles.buyBtn, { backgroundColor: colors.primary }]} onPress={onPress}>
          <Text style={styles.buyBtnText}>Buy Slot</Text>
        </PressableScale>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  listBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, marginTop: 4 },
  listBtnText: { color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statItem: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 11, alignItems: "center" },
  statValue: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 6 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 9, borderWidth: 1.5 },
  filterText: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 20 },
  cardWrap: { marginTop: 12 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  cardName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  sellerBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  sellerText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  cardIndustry: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  premiumBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  premiumText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  priceRow: { flexDirection: "row" },
  priceItem: { flex: 1 },
  priceLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.3 },
  priceValue: { fontSize: 14, fontWeight: "700", marginTop: 2, fontFamily: "Inter_700Bold" },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderTopWidth: 1, paddingTop: 10 },
  footerText: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  buyBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 9 },
  buyBtnText: { color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 4 },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
