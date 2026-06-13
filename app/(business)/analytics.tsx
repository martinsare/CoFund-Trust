import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn } from "@/components/AnimatedPrimitives";
import { BUSINESSES, BUSINESS_MONTHLY, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

export default function BusinessAnalytics() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const business = BUSINESSES[0];
  const maxRaised = Math.max(...BUSINESS_MONTHLY.map((d) => d.raised));
  const maxInvestors = Math.max(...BUSINESS_MONTHLY.map((d) => d.investors));
  const progress = business.amountRaised / business.fundingGoal;
  const completionRate = Math.round(progress * 100);
  const avgPerInvestor = Math.round(business.amountRaised / business.investorCount);

  const ENGAGEMENT = [
    { label: "Profile Views", value: "1,247", change: "+18%", up: true },
    { label: "Enquiries", value: "89", change: "+12%", up: true },
    { label: "Documents Downloaded", value: "342", change: "+5%", up: true },
    { label: "Avg. Investment", value: formatCurrency(avgPerInvestor), change: "+3%", up: true },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Analytics</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Campaign performance</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(500)}>
        <LinearGradient
          colors={["#1a7a4a", "#2db56e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.summaryCard}
        >
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryLabel}>Completion Rate</Text>
              <Text style={styles.summaryBig}>{completionRate}%</Text>
            </View>
            <View style={styles.summaryRight}>
              <Text style={styles.summarySmallLabel}>Raised</Text>
              <Text style={styles.summarySmallVal}>{formatCurrency(business.amountRaised)}</Text>
              <Text style={styles.summarySmallLabel}>of {formatCurrency(business.fundingGoal)}</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.summaryFooter}>
            <Text style={styles.summaryFooterText}>{business.daysLeft} days remaining · {business.investorCount} investors</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.metricsGrid}>
        {ENGAGEMENT.map((m, i) => (
          <FadeSlideIn key={m.label} delay={160 + i * 60} style={{ width: "47%" }}>
            <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>{m.value}</Text>
              <View style={styles.metricRow}>
                <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{m.label}</Text>
                <View style={[styles.changeBadge, { backgroundColor: m.up ? colors.accentLight : colors.destructiveLight }]}>
                  <Text style={[styles.changeText, { color: m.up ? colors.accentDark : colors.destructive }]}>{m.change}</Text>
                </View>
              </View>
            </View>
          </FadeSlideIn>
        ))}
      </View>

      <FadeSlideIn delay={440}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Funding Progress</Text>
          <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>Monthly capital raised (Jan–Jun)</Text>
          <View style={styles.barChart}>
            {BUSINESS_MONTHLY.map((item, i) => {
              const barH = Math.max(6, (item.raised / maxRaised) * 100);
              return (
                <Animated.View
                  key={item.month}
                  entering={FadeInUp.delay(480 + i * 70).duration(400)}
                  style={styles.barWrap}
                >
                  <View style={[styles.bar, { height: barH, backgroundColor: colors.accent }]} />
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{item.month}</Text>
                </Animated.View>
              );
            })}
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={600}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Investor Growth</Text>
          <Text style={[styles.chartSub, { color: colors.mutedForeground }]}>Cumulative investors month by month</Text>
          <View style={styles.barChart}>
            {BUSINESS_MONTHLY.map((item, i) => {
              const barH = Math.max(6, (item.investors / maxInvestors) * 100);
              return (
                <Animated.View
                  key={item.month}
                  entering={FadeInUp.delay(640 + i * 70).duration(400)}
                  style={styles.barWrap}
                >
                  <View style={[styles.bar, { height: barH, backgroundColor: colors.primary }]} />
                  <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{item.month}</Text>
                </Animated.View>
              );
            })}
          </View>
          <View style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.legendText, { color: colors.mutedForeground }]}>Investors</Text>
            <Text style={[styles.legendVal, { color: colors.foreground }]}>{business.investorCount} total</Text>
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={740}>
        <View style={[styles.insightCard, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
          <Feather name="info" size={16} color={colors.primary} />
          <Text style={[styles.insightText, { color: colors.foreground }]}>
            Your campaign is <Text style={{ fontWeight: "700", color: colors.primary }}>on track</Text> to meet its funding goal.
            {" "}With {business.daysLeft} days left, you need just{" "}
            <Text style={{ fontWeight: "700" }}>{formatCurrency(business.fundingGoal - business.amountRaised)}</Text> more.
          </Text>
        </View>
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  titleRow: { gap: 2 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryCard: { borderRadius: 18, padding: 20, gap: 12 },
  summaryTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  summaryLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryBig: { color: "#fff", fontSize: 42, fontWeight: "800", letterSpacing: -2, fontFamily: "Inter_700Bold" },
  summaryRight: { alignItems: "flex-end" },
  summarySmallLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_400Regular" },
  summarySmallVal: { color: "#fff", fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 100 },
  summaryFooter: {},
  summaryFooterText: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  metricValue: { fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold" },
  metricRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  metricLabel: { fontSize: 11, fontFamily: "Inter_400Regular", flex: 1 },
  changeBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 100 },
  changeText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 18, gap: 4 },
  chartTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  chartSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 14 },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 110, gap: 6 },
  barWrap: { flex: 1, alignItems: "center", gap: 6, justifyContent: "flex-end" },
  bar: { width: "80%", borderRadius: 4 },
  barLabel: { fontSize: 10, fontFamily: "Inter_500Medium" },
  legendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  legendVal: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  insightCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  insightText: { flex: 1, fontSize: 13, lineHeight: 20, fontFamily: "Inter_400Regular" },
});
