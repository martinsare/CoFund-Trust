import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { InvestmentBreakdownItem, ReportTxRow, RevenueDataPoint } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

const PERIODS = ["This Month", "Last Month", "Q1 2025", "All Time"] as const;
type Period = typeof PERIODS[number];

interface PeriodData {
  revenue: string;
  change: string;
  changeUp: boolean;
  chartData: RevenueDataPoint[];
  breakdown: InvestmentBreakdownItem[];
  transactions: ReportTxRow[];
  kpis: { label: string; value: string; icon: string; color: string }[];
}

const PERIOD_DATA: Record<Period, PeriodData> = {
  "This Month": {
    revenue: "₦48,200,000",
    change: "+14.2% vs last month",
    changeUp: true,
    chartData: [
      { month: "Feb", value: 34, label: "₦34M" },
      { month: "Mar", value: 31, label: "₦31M" },
      { month: "Apr", value: 42, label: "₦42M" },
      { month: "May", value: 38, label: "₦38M" },
      { month: "Jun", value: 48, label: "₦48M" },
    ],
    breakdown: [
      { label: "Profit Share",  percent: 42, color: "#1a5e9a" },
      { label: "Fixed Return",  percent: 28, color: "#2db56e" },
      { label: "Asset-Backed",  percent: 18, color: "#c9860d" },
      { label: "Real Estate",   percent: 12, color: "#7c3aed" },
    ],
    transactions: [
      { type: "investment", label: "New investment — Lagos Pharma",       amount: "+₦500,000",    date: "Today 09:14",  icon: "trending-up", color: "#2db56e" },
      { type: "payout",     label: "Payout — Batch #13",                  amount: "-₦12,400,000", date: "Yesterday",    icon: "download",    color: "#e03e3e" },
      { type: "fee",        label: "Platform fee — TechBridge Solutions", amount: "+₦85,000",     date: "Jun 10",       icon: "dollar-sign", color: "#c9860d" },
      { type: "investment", label: "New investment — GreenHouse Agro",    amount: "+₦1,200,000",  date: "Jun 9",        icon: "trending-up", color: "#2db56e" },
      { type: "listing",    label: "SME listing fee — Apex Logistics",    amount: "+₦150,000",    date: "Jun 8",        icon: "package",     color: "#7c3aed" },
    ],
    kpis: [
      { label: "Placement Fees",     value: "₦8.2M",  icon: "tag",     color: "#1a5e9a" },
      { label: "Transaction Fees",   value: "₦22.4M", icon: "repeat",  color: "#2db56e" },
      { label: "Pro Subscriptions",  value: "₦5.1M",  icon: "star",    color: "#7c3aed" },
      { label: "Profit Share",       value: "₦12.5M", icon: "percent", color: "#c9860d" },
    ],
  },
  "Last Month": {
    revenue: "₦38,000,000",
    change: "-9.5% vs prior month",
    changeUp: false,
    chartData: [
      { month: "Jan", value: 28, label: "₦28M" },
      { month: "Feb", value: 34, label: "₦34M" },
      { month: "Mar", value: 31, label: "₦31M" },
      { month: "Apr", value: 42, label: "₦42M" },
      { month: "May", value: 38, label: "₦38M" },
    ],
    breakdown: [
      { label: "Profit Share",  percent: 39, color: "#1a5e9a" },
      { label: "Fixed Return",  percent: 31, color: "#2db56e" },
      { label: "Asset-Backed",  percent: 20, color: "#c9860d" },
      { label: "Real Estate",   percent: 10, color: "#7c3aed" },
    ],
    transactions: [
      { type: "payout",     label: "Payout — Batch #12",                  amount: "-₦9,800,000",  date: "May 29",       icon: "download",    color: "#e03e3e" },
      { type: "investment", label: "New investment — AgriVest Hub",        amount: "+₦2,000,000",  date: "May 27",       icon: "trending-up", color: "#2db56e" },
      { type: "fee",        label: "Platform fee — NovaBuild Ltd",         amount: "+₦72,000",     date: "May 24",       icon: "dollar-sign", color: "#c9860d" },
      { type: "listing",    label: "SME listing fee — Coastal Textiles",   amount: "+₦150,000",    date: "May 20",       icon: "package",     color: "#7c3aed" },
      { type: "investment", label: "New investment — QuickLogistics NG",   amount: "+₦750,000",    date: "May 18",       icon: "trending-up", color: "#2db56e" },
    ],
    kpis: [
      { label: "Placement Fees",     value: "₦6.9M",  icon: "tag",     color: "#1a5e9a" },
      { label: "Transaction Fees",   value: "₦18.1M", icon: "repeat",  color: "#2db56e" },
      { label: "Pro Subscriptions",  value: "₦4.8M",  icon: "star",    color: "#7c3aed" },
      { label: "Profit Share",       value: "₦8.2M",  icon: "percent", color: "#c9860d" },
    ],
  },
  "Q1 2025": {
    revenue: "₦93,000,000",
    change: "+28.4% vs Q4 2024",
    changeUp: true,
    chartData: [
      { month: "Jan", value: 28, label: "₦28M" },
      { month: "Feb", value: 34, label: "₦34M" },
      { month: "Mar", value: 31, label: "₦31M" },
    ],
    breakdown: [
      { label: "Profit Share",  percent: 44, color: "#1a5e9a" },
      { label: "Fixed Return",  percent: 26, color: "#2db56e" },
      { label: "Asset-Backed",  percent: 17, color: "#c9860d" },
      { label: "Real Estate",   percent: 13, color: "#7c3aed" },
    ],
    transactions: [
      { type: "investment", label: "New investment — SolarFarm West",      amount: "+₦5,000,000",  date: "Mar 31",       icon: "trending-up", color: "#2db56e" },
      { type: "payout",     label: "Payout — Batch #10",                   amount: "-₦7,600,000",  date: "Mar 28",       icon: "download",    color: "#e03e3e" },
      { type: "fee",        label: "Q1 subscription sweep",                amount: "+₦14,400,000", date: "Mar 31",       icon: "star",        color: "#7c3aed" },
      { type: "listing",    label: "SME listing — Harvest Plus",           amount: "+₦150,000",    date: "Feb 14",       icon: "package",     color: "#7c3aed" },
      { type: "investment", label: "New investment — BuildRight NG",       amount: "+₦3,200,000",  date: "Jan 22",       icon: "trending-up", color: "#2db56e" },
    ],
    kpis: [
      { label: "Placement Fees",     value: "₦19.5M", icon: "tag",     color: "#1a5e9a" },
      { label: "Transaction Fees",   value: "₦46.2M", icon: "repeat",  color: "#2db56e" },
      { label: "Pro Subscriptions",  value: "₦13.4M", icon: "star",    color: "#7c3aed" },
      { label: "Profit Share",       value: "₦13.9M", icon: "percent", color: "#c9860d" },
    ],
  },
  "All Time": {
    revenue: "₦312,000,000",
    change: "+61.3% YoY growth",
    changeUp: true,
    chartData: [
      { month: "Jan", value: 28, label: "₦28M" },
      { month: "Feb", value: 34, label: "₦34M" },
      { month: "Mar", value: 31, label: "₦31M" },
      { month: "Apr", value: 42, label: "₦42M" },
      { month: "May", value: 38, label: "₦38M" },
      { month: "Jun", value: 48, label: "₦48M" },
    ],
    breakdown: [
      { label: "Profit Share",  percent: 41, color: "#1a5e9a" },
      { label: "Fixed Return",  percent: 29, color: "#2db56e" },
      { label: "Asset-Backed",  percent: 18, color: "#c9860d" },
      { label: "Real Estate",   percent: 12, color: "#7c3aed" },
    ],
    transactions: [
      { type: "investment", label: "Lifetime investments closed",         amount: "+₦2.4B",       date: "Cumulative",   icon: "trending-up", color: "#2db56e" },
      { type: "payout",     label: "Total payouts processed",             amount: "-₦1.8B",       date: "Cumulative",   icon: "download",    color: "#e03e3e" },
      { type: "fee",        label: "Total platform fees collected",       amount: "+₦312M",       date: "Cumulative",   icon: "dollar-sign", color: "#c9860d" },
      { type: "listing",    label: "SME listings — all time",             amount: "+₦18.7M",      date: "87 businesses",icon: "package",     color: "#7c3aed" },
      { type: "fee",        label: "Pro subscription revenue",            amount: "+₦32.1M",      date: "Cumulative",   icon: "star",        color: "#7c3aed" },
    ],
    kpis: [
      { label: "Placement Fees",     value: "₦54.2M",  icon: "tag",     color: "#1a5e9a" },
      { label: "Transaction Fees",   value: "₦156.3M", icon: "repeat",  color: "#2db56e" },
      { label: "Pro Subscriptions",  value: "₦32.1M",  icon: "star",    color: "#7c3aed" },
      { label: "Profit Share",       value: "₦69.4M",  icon: "percent", color: "#c9860d" },
    ],
  },
};

export default function AdminReports() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [period, setPeriod] = useState<Period>("This Month");

  const data = PERIOD_DATA[period];
  const maxVal = Math.max(...data.chartData.map((d) => d.value));

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

      <FadeSlideIn delay={100} key={`hero-${period}`}>
        <LinearGradient colors={["#4c1d95", "#7c3aed"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.revenueCard}>
          <Text style={styles.revLabel}>
            {period === "All Time" ? "Total Platform Revenue" : period === "Q1 2025" ? "Q1 2025 Revenue" : `${period} Revenue`}
          </Text>
          <Text style={styles.revAmount}>{data.revenue}</Text>
          <View style={styles.revChange}>
            <Feather name={data.changeUp ? "arrow-up-right" : "arrow-down-right"} size={14} color={data.changeUp ? "#2db56e" : "#f87171"} />
            <Text style={[styles.revChangeText, { color: data.changeUp ? "#2db56e" : "#f87171" }]}>{data.change}</Text>
          </View>
        </LinearGradient>
      </FadeSlideIn>

      <FadeSlideIn delay={160} key={`chart-${period}`}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.foreground }]}>
            {period === "Q1 2025" ? "Q1 Monthly Breakdown" : period === "All Time" ? "Monthly Revenue (2026)" : `${period} — Monthly Trend`}
          </Text>
          <View style={styles.chart}>
            {data.chartData.map((d, i) => (
              <Animated.View key={`${period}-${d.month}`} style={styles.barCol}>
                <Text style={[styles.barLabel2, { color: colors.mutedForeground }]}>{d.label}</Text>
                <View style={styles.barWrap}>
                  <View
                    style={[styles.bar, {
                      height: `${(d.value / maxVal) * 100}%`,
                      backgroundColor: i === data.chartData.length - 1 ? "#7c3aed" : "#7c3aed44",
                    }]}
                  />
                </View>
                <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{d.month}</Text>
              </Animated.View>
            ))}
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={240} key={`breakdown-${period}`}>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Investment Type Breakdown</Text>
          {data.breakdown.map((item) => (
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

      <FadeSlideIn delay={320} key={`tx-${period}`}>
        <Text style={[styles.transTitle, { color: colors.foreground }]}>
          {period === "All Time" ? "Lifetime Summary" : "Recent Transactions"}
        </Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {data.transactions.map((tx, i) => (
            <View
              key={i}
              style={[styles.txRow, i < data.transactions.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
            >
              <View style={[styles.txIcon, { backgroundColor: tx.color + "18" }]}>
                <Feather name={tx.icon as any} size={14} color={tx.color} />
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

      <FadeSlideIn delay={440} key={`kpi-${period}`}>
        <View style={styles.kpiRow}>
          {data.kpis.map((k) => (
            <View key={k.label} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.kpiIcon, { backgroundColor: k.color + "18" }]}>
                <Feather name={k.icon as any} size={14} color={k.color} />
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
  revChangeText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
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
