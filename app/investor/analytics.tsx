import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn } from "@/components/AnimatedPrimitives";
import { INVESTMENTS, PORTFOLIO_GROWTH, SECTOR_ALLOCATIONS, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

export default function InvestorAnalytics() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalInvested = INVESTMENTS.reduce((s, i) => s + i.amountInvested, 0);
  const totalExpected = INVESTMENTS.reduce((s, i) => s + i.expectedReturn, 0);
  const totalProfit = totalExpected - totalInvested;
  const avgRoi = (totalProfit / totalInvested * 100).toFixed(1);
  const maxPortfolioVal = Math.max(...PORTFOLIO_GROWTH.map((d) => d.value));

  const bestInvestment = INVESTMENTS.reduce((best, inv) =>
    parseInt(inv.roi) > parseInt(best.roi) ? inv : best
  );

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Portfolio Analytics</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <View style={styles.keyMetrics}>
        {[
          { label: "Total Invested", value: formatCurrency(totalInvested), icon: "trending-up" as const, color: colors.primary },
          { label: "Expected Profit", value: formatCurrency(totalProfit), icon: "dollar-sign" as const, color: colors.accent },
          { label: "Avg ROI", value: `${avgRoi}%`, icon: "percent" as const, color: colors.gold },
          { label: "Investments", value: INVESTMENTS.length.toString(), icon: "briefcase" as const, color: colors.purple },
        ].map((m, i) => (
          <FadeSlideIn key={m.label} delay={80 + i * 60} style={{ width: "47%" }}>
            <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.metricIcon, { backgroundColor: m.color + "18" }]}>
                <Feather name={m.icon} size={14} color={m.color} />
              </View>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>{m.value}</Text>
              <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
            </View>
          </FadeSlideIn>
        ))}
      </View>

      <FadeSlideIn delay={320}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Portfolio Growth</Text>
          <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>Jan–Jun 2026</Text>
          <View style={styles.barChart}>
            {PORTFOLIO_GROWTH.map((item, i) => {
              const barHeight = Math.max(6, (item.value / maxPortfolioVal) * 100);
              return (
                <Animated.View
                  key={item.month}
                  entering={FadeInUp.delay(400 + i * 80).duration(400)}
                  style={styles.barWrap}
                >
                  <Text style={[styles.barValue, { color: colors.mutedForeground }]}>
                    {item.value > 0 ? formatCurrency(item.value) : ""}
                  </Text>
                  <View style={[styles.bar, { height: barHeight, backgroundColor: colors.primary }]} />
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{item.month}</Text>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={520}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Sector Allocation</Text>
          <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>By invested amount</Text>
          <View style={styles.sectors}>
            {SECTOR_ALLOCATIONS.map((s, i) => (
              <Animated.View key={s.sector} entering={FadeInDown.delay(560 + i * 60).duration(400)}>
                <View style={styles.sectorRow}>
                  <View style={[styles.sectorDot, { backgroundColor: s.color }]} />
                  <Text style={[styles.sectorName, { color: colors.foreground }]}>{s.sector}</Text>
                  <Text style={[styles.sectorAmount, { color: colors.mutedForeground }]}>{formatCurrency(s.amount)}</Text>
                  <Text style={[styles.sectorPct, { color: colors.foreground }]}>{s.percentage}%</Text>
                </View>
                <View style={[styles.sectorTrack, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.sectorFill, { width: `${s.percentage}%`, backgroundColor: s.color }]} />
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={720}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Best Performer</Text>
          <View style={styles.bestRow}>
            <View style={[styles.bestIcon, { backgroundColor: colors.accentLight }]}>
              <Feather name="award" size={20} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bestName, { color: colors.foreground }]}>{bestInvestment.businessName}</Text>
              <Text style={[styles.bestMeta, { color: colors.mutedForeground }]}>{bestInvestment.industry}</Text>
            </View>
            <View>
              <Text style={[styles.bestRoi, { color: colors.accent }]}>{bestInvestment.roi}</Text>
              <Text style={[styles.bestLabel, { color: colors.mutedForeground }]}>ROI</Text>
            </View>
          </View>
        </View>
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  keyMetrics: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 5 },
  metricIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  metricValue: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 18, gap: 4 },
  chartTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  chartSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 16 },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 130, gap: 6 },
  barWrap: { flex: 1, alignItems: "center", gap: 4, justifyContent: "flex-end" },
  barValue: { fontSize: 8, fontFamily: "Inter_400Regular", textAlign: "center" },
  bar: { width: "80%", borderRadius: 4 },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  sectors: { gap: 14 },
  sectorRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 5 },
  sectorDot: { width: 10, height: 10, borderRadius: 5 },
  sectorName: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  sectorAmount: { fontSize: 12, fontFamily: "Inter_400Regular" },
  sectorPct: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", minWidth: 36, textAlign: "right" },
  sectorTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  sectorFill: { height: "100%", borderRadius: 3 },
  bestRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 8 },
  bestIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bestName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  bestMeta: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  bestRoi: { fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold", textAlign: "right" },
  bestLabel: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "right" },
});
