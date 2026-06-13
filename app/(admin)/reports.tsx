import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { useColors } from "@/hooks/useColors";

const PERIODS = ["This Month", "Last Month", "Q1 2025", "All Time"];

const REVENUE_DATA = [
  { month: "Jan", value: 28, label: "₦28M" },
  { month: "Feb", value: 34, label: "₦34M" },
  { month: "Mar", value: 31, label: "₦31M" },
  { month: "Apr", value: 42, label: "₦42M" },
  { month: "May", value: 38, label: "₦38M" },
  { month: "Jun", value: 48, label: "₦48M" },
];

const INVESTMENT_BREAKDOWN = [
  { label: "Profit Share", percent: 42, color: "#1a5e9a" },
  { label: "Fixed Return", percent: 28, color: "#2db56e" },
  { label: "Asset-Backed", percent: 18, color: "#c9860d" },
  { label: "Real Estate", percent: 12, color: "#7c3aed" },
];

const RECENT_TRANSACTIONS = [
  { type: "investment", label: "New investment — Lagos Pharma", amount: "+₦500,000", date: "Today 09:14", icon: "trending-up" as const, color: "#2db56e" },
  { type: "payout", label: "Payout — Batch #13", amount: "-₦12,400,000", date: "Yesterday", icon: "download" as const, color: "#e03e3e" },
  { type: "fee", label: "Platform fee — TechBridge Solutions", amount: "+₦85,000", date: "Jun 10", icon: "dollar-sign" as const, color: "#c9860d" },
  { type: "investment", label: "New investment — GreenHouse Agro", amount: "+₦1,200,000", date: "Jun 9", icon: "trending-up" as const, color: "#2db56e" },
  { type: "listing", label: "SME listing fee — Apex Logistics", amount: "+₦150,000", date: "Jun 8", icon: "package" as const, color: "#7c3aed" },
];

export default function AdminReports() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [period, setPeriod] = useState("This Month");

  const maxVal = Math.max(...REVENUE_DATA.map((d) => d.value));

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Reports</Text>
      </Animated.View>

      <FadeSlideIn delay={60}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
          {PERIODS.map((p) => (
            <PressableScale
              key={p}
              onPress={() => setPeriod(p)}
              style={[styles.periodChip, { backgroundColor: period === p ? "#7c3aed" : colors.card, borderColor: period === p ? "#7c3aed" : colors.border }]}
            >
              <Text style={[styles.periodText, { color: period === p ? "#fff" : colors.mutedForeground }]}>{p}</Text>
            </PressableScale>
          ))}
        </ScrollView>
      </FadeSlideIn>

      <FadeSlideIn delay={100}>
        <LinearGradient colors={["#4c1d95", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.revenueCard}>
          <Text style={styles.revLabel}>Platform Revenue</Text>
          <Text style={styles.revAmount}>₦48,200,000</Text>
          <View style={styles.revChange}>
            <Feather name="arrow-up-right" size={14} color="#2db56e" />
            <Text style={styles.revChangeText}>+14.2% vs last month</Text>
          </View>
        </LinearGradient>
      </FadeSlideIn>

      <FadeSlideIn delay={160}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>Monthly Revenue Trend</Text>
          <View style={styles.chart}>
            {REVENUE_DATA.map((d, i) => (
              <Animated.View key={d.month} style={styles.barCol}>
                <Text style={[styles.barLabel2, { color: colors.mutedForeground }]}>{d.label}</Text>
                <View style={styles.barWrap}>
                  <View
                    style={[styles.bar, {
                      height: `${(d.value / maxVal) * 100}%`,
                      backgroundColor: i === REVENUE_DATA.length - 1 ? "#7c3aed" : "#7c3aed44",
                    }]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{d.month}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={240}>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Investment Type Breakdown</Text>
          {INVESTMENT_BREAKDOWN.map((item) => (
            <View key={item.label} style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.breakdownDot, { backgroundColor: item.color }]} />
                <Text style={[styles.breakdownLabel, { color: colors.foreground }]}>{item.label}</Text>
              </View>
              <View style={styles.breakdownRight}>
                <View style={[styles.breakdownBar, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.breakdownFill, { width: `${item.percent}%`, backgroundColor: item.color }]} />
                </View>
                <Text style={[styles.breakdownPct, { color: colors.foreground }]}>{item.percent}%</Text>
              </View>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={320}>
        <Text style={[styles.transTitle, { color: colors.foreground }]}>Recent Transactions</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {RECENT_TRANSACTIONS.map((tx, i) => (
            <View
              key={i}
              style={[styles.txRow, i < RECENT_TRANSACTIONS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
            >
              <View style={[styles.txIcon, { backgroundColor: tx.color + "18" }]}>
                <Feather name={tx.icon} size={14} color={tx.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.txLabel, { color: colors.foreground }]}>{tx.label}</Text>
                <Text style={[styles.txDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
              </View>
              <Text style={[styles.txAmount, { color: tx.amount.startsWith("+") ? "#2db56e" : "#e03e3e" }]}>{tx.amount}</Text>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={440}>
        <View style={styles.kpiRow}>
          {[
            { label: "Placement Fees", value: "₦8.2M", icon: "tag" as const, color: "#1a5e9a" },
            { label: "Transaction Fees", value: "₦22.4M", icon: "repeat" as const, color: "#2db56e" },
            { label: "Pro Subscriptions", value: "₦5.1M", icon: "star" as const, color: "#7c3aed" },
            { label: "Profit Share", value: "₦12.5M", icon: "percent" as const, color: "#c9860d" },
          ].map((k) => (
            <View key={k.label} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.kpiIcon, { backgroundColor: k.color + "18" }]}>
                <Feather name={k.icon} size={14} color={k.color} />
              </View>
              <Text style={[styles.kpiVal, { color: colors.foreground }]}>{k.value}</Text>
              <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
            </View>
          ))}
        </View>
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  periodRow: { gap: 8, paddingBottom: 14 },
  periodChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  periodText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  revenueCard: { borderRadius: 18, padding: 22, marginBottom: 14 },
  revLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  revAmount: { color: "#fff", fontSize: 32, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: -1, marginTop: 6, marginBottom: 10 },
  revChange: { flexDirection: "row", alignItems: "center", gap: 4 },
  revChangeText: { color: "#2db56e", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  chartTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 16 },
  chart: { flexDirection: "row", alignItems: "flex-end", height: 140, gap: 4 },
  barCol: { flex: 1, alignItems: "center", height: "100%", gap: 6 },
  barWrap: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  barLabel2: { fontSize: 9, fontFamily: "Inter_400Regular" },
  sectionCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 14 },
  breakdownRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  breakdownLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  breakdownRight: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  breakdownBar: { flex: 1, height: 6, borderRadius: 100, overflow: "hidden" },
  breakdownFill: { height: "100%", borderRadius: 100 },
  breakdownPct: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", minWidth: 32, textAlign: "right" },
  transTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 10 },
  txRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  txIcon: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  txLabel: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  txDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  txAmount: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  kpiCard: { width: "47%", borderRadius: 12, borderWidth: 1, padding: 14, gap: 5 },
  kpiIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  kpiVal: { fontSize: 16, fontWeight: "800", fontFamily: "Inter_700Bold" },
  kpiLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
