import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Path, Svg } from "react-native-svg";

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

const CHART_W = 280;
const CHART_H = 64;
const PADDING = 8;

const BASE_POINTS = [1.2, 0.8, 2.1, 1.6, 3.0, 2.4, 1.8, 3.5, 2.9, 4.2, 3.8, 2.6, 3.1, 4.0];

function buildPath(points: number[]): string {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = CHART_W - PADDING * 2;
  const h = CHART_H - PADDING * 2;

  const coords = points.map((v, i) => ({
    x: PADDING + (i / (points.length - 1)) * w,
    y: PADDING + h - ((v - min) / range) * h,
  }));

  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 1; i < coords.length; i++) {
    const prev = coords[i - 1];
    const curr = coords[i];
    const cpx = (prev.x + curr.x) / 2;
    d += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }
  return d;
}

function buildFill(points: number[]): string {
  const line = buildPath(points);
  const lastX = PADDING + (CHART_W - PADDING * 2);
  return `${line} L ${lastX} ${CHART_H} L ${PADDING} ${CHART_H} Z`;
}

function LiveChart({ colors }: { colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  const [points, setPoints] = useState(BASE_POINTS);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(withTiming(0.4, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
      false
    );

    const interval = setInterval(() => {
      setPoints((prev) => {
        const last = prev[prev.length - 1];
        const delta = (Math.random() - 0.44) * 0.8;
        const next = Math.max(0.2, Math.min(6, last + delta));
        return [...prev.slice(1), next];
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const linePath = buildPath(points);
  const fillPath = buildFill(points);
  const lastVal = points[points.length - 1];
  const prevVal = points[points.length - 2];
  const isUp = lastVal >= prevVal;
  const chartColor = isUp ? colors.accent : colors.destructive;

  return (
    <View style={[chartStyles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={chartStyles.topRow}>
        <View>
          <Text style={[chartStyles.chartTitle, { color: colors.foreground }]}>Market Activity</Text>
          <Text style={[chartStyles.chartSub, { color: colors.mutedForeground }]}>Avg premium · live</Text>
        </View>
        <View style={chartStyles.liveRight}>
          <View style={chartStyles.liveRow}>
            <Animated.View style={[chartStyles.liveDot, { backgroundColor: chartColor }]} />
            <Text style={[chartStyles.liveText, { color: chartColor }]}>LIVE</Text>
          </View>
          <Text style={[chartStyles.currentVal, { color: isUp ? colors.accent : colors.destructive }]}>
            {isUp ? "+" : ""}{lastVal.toFixed(2)}%
          </Text>
        </View>
      </View>

      <Svg width={CHART_W} height={CHART_H} style={{ marginTop: 4 }}>
        <Path
          d={fillPath}
          fill={chartColor + "18"}
        />
        <Path
          d={linePath}
          stroke={chartColor}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>

      <View style={chartStyles.bottomRow}>
        <Text style={[chartStyles.timeLabel, { color: colors.mutedForeground }]}>14 days ago</Text>
        <Text style={[chartStyles.timeLabel, { color: colors.mutedForeground }]}>Now</Text>
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 14, alignItems: "flex-start" },
  topRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", width: "100%" },
  chartTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  chartSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  liveRight: { alignItems: "flex-end", gap: 2 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  currentVal: { fontSize: 17, fontWeight: "800", fontFamily: "Inter_700Bold" },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 4 },
  timeLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
});

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

        <LiveChart colors={colors} />

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
