import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { INVESTMENTS, Investment, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

type StatusFilter = "all" | "active" | "completed" | "pending";

export default function Portfolio() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = statusFilter === "all" ? INVESTMENTS : INVESTMENTS.filter((i) => i.status === statusFilter);
  const totalInvested = INVESTMENTS.reduce((s, i) => s + i.amountInvested, 0);
  const totalExpected = INVESTMENTS.reduce((s, i) => s + i.expectedReturn, 0);
  const activeCount = INVESTMENTS.filter((i) => i.status === "active").length;
  const completedCount = INVESTMENTS.filter((i) => i.status === "completed").length;

  const STATUS_FILTERS: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>Portfolio</Text>
          <PressableScale
            style={[styles.analyticsBtn, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }]}
            onPress={() => router.push("/investor/analytics")}
          >
            <Feather name="bar-chart-2" size={14} color={colors.primary} />
            <Text style={[styles.analyticsBtnText, { color: colors.primary }]}>Analytics</Text>
          </PressableScale>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(100).duration(500)} style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Invested</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalInvested)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expected Returns</Text>
              <Text style={styles.summaryValue}>{formatCurrency(totalExpected)}</Text>
            </View>
          </View>
          <View style={styles.summaryRow2}>
            {[
              { val: activeCount, label: "Active" },
              { val: completedCount, label: "Completed" },
              { val: INVESTMENTS.length, label: "Total" },
            ].map((m) => (
              <View key={m.label} style={[styles.mini, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
                <Text style={styles.miniVal}>{m.val}</Text>
                <Text style={styles.miniLabel}>{m.label}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.marketBanner}>
          <View style={[styles.marketBannerInner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.marketIcon, { backgroundColor: colors.accentLight }]}>
              <Feather name="repeat" size={16} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.marketTitle, { color: colors.foreground }]}>Secondary Market</Text>
              <Text style={[styles.marketSub, { color: colors.mutedForeground }]}>Buy & sell active investment slots</Text>
            </View>
            <PressableScale onPress={() => router.push("/(investor)/market")}>
              <Text style={[styles.marketCta, { color: colors.accent }]}>Browse →</Text>
            </PressableScale>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.filters}>
          {STATUS_FILTERS.map((f) => (
            <PressableScale
              key={f.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: statusFilter === f.id ? colors.primary : colors.card,
                  borderColor: statusFilter === f.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setStatusFilter(f.id)}
            >
              <Text style={[styles.filterText, { color: statusFilter === f.id ? "#fff" : colors.mutedForeground }]}>
                {f.label}
              </Text>
            </PressableScale>
          ))}
        </Animated.View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 100).duration(400)}>
            <InvestmentCard inv={item} colors={colors} onPress={() => router.push(`/business/${item.businessId}`)} />
          </Animated.View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="briefcase" size={36} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No investments yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Browse opportunities to start investing</Text>
            <PressableScale
              style={[styles.exploreBtn, { backgroundColor: colors.primary }]}
              onPress={() => router.push("/(investor)/explore")}
            >
              <Text style={styles.exploreBtnText}>Explore Opportunities</Text>
            </PressableScale>
          </View>
        }
      />
    </View>
  );
}

function InvestmentCard({ inv, colors, onPress }: { inv: Investment; colors: ReturnType<typeof import("@/hooks/useColors").useColors>; onPress: () => void }) {
  const sc = {
    active: { bg: colors.accentLight, text: colors.accentDark },
    pending: { bg: colors.amberLight, text: colors.amber },
    completed: { bg: colors.primaryLight, text: colors.primary },
    defaulted: { bg: colors.destructiveLight, text: colors.destructive },
    cancelled: { bg: colors.muted, text: colors.mutedForeground },
  }[inv.status] ?? { bg: colors.accentLight, text: colors.accentDark };

  return (
    <PressableScale style={[styles.invCard, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={onPress}>
      <View style={styles.invHeader}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.invName, { color: colors.foreground }]}>{inv.businessName}</Text>
          <Text style={[styles.invIndustry, { color: colors.mutedForeground }]}>{inv.industry}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</Text>
        </View>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
        <View style={[styles.progressFill, { width: `${inv.progress * 100}%`, backgroundColor: inv.status === "completed" ? colors.accent : colors.primary }]} />
      </View>
      <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{Math.round(inv.progress * 100)}% to maturity</Text>
      <View style={styles.invMetrics}>
        <Metric label="Invested" value={formatCurrency(inv.amountInvested)} colors={colors} />
        <Metric label="Expected Return" value={formatCurrency(inv.expectedReturn)} highlight colors={colors} />
        <Metric label="ROI" value={inv.roi} accent colors={colors} />
      </View>
      <View style={[styles.invFooter, { borderTopColor: colors.borderLight }]}>
        <Text style={[styles.invDate, { color: colors.mutedForeground }]}>Invested {inv.investmentDate}</Text>
        <Text style={[styles.invDate, { color: colors.mutedForeground }]}>Matures {inv.maturityDate}</Text>
      </View>
    </PressableScale>
  );
}

function Metric({ label, value, highlight, accent, colors }: { label: string; value: string; highlight?: boolean; accent?: boolean; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: accent ? colors.accent : highlight ? colors.primary : colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 4 },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  analyticsBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9, borderWidth: 1 },
  analyticsBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  summaryCard: { borderRadius: 16, padding: 20, marginBottom: 12, gap: 14 },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  summaryItem: { flex: 1 },
  summaryLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: "Inter_400Regular" },
  summaryValue: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2, fontFamily: "Inter_700Bold" },
  summaryDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 16 },
  summaryRow2: { flexDirection: "row", gap: 8 },
  mini: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  miniVal: { color: "#fff", fontSize: 17, fontWeight: "800", fontFamily: "Inter_700Bold" },
  miniLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: "Inter_400Regular" },
  marketBanner: { marginBottom: 12 },
  marketBannerInner: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  marketIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  marketTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  marketSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  marketCta: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  filters: { flexDirection: "row", gap: 8, paddingBottom: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9, borderWidth: 1.5 },
  filterText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 20 },
  invCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 12, gap: 10 },
  invHeader: { flexDirection: "row", alignItems: "flex-start" },
  invName: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  invIndustry: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  progressTrack: { height: 5, borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 100 },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  invMetrics: { flexDirection: "row" },
  metric: { flex: 1 },
  metricLabel: { fontSize: 10, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.3 },
  metricValue: { fontSize: 14, fontWeight: "700", marginTop: 2, fontFamily: "Inter_700Bold" },
  invFooter: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, paddingTop: 8 },
  invDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular" },
  exploreBtn: { marginTop: 12, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  exploreBtnText: { color: "#fff", fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
