import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { useAuth } from "@/context/AuthContext";
import { INVESTMENTS, formatCurrency } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";

const PLATFORM_STATS = [
  { label: "Total Users", value: "1,248", icon: "users" as const, color: "#7c3aed", change: "+12 this week" },
  { label: "Active Businesses", value: "87", icon: "briefcase" as const, color: "#1a5e9a", change: "+4 this week" },
  { label: "Total Invested", value: "₦2.4B", icon: "trending-up" as const, color: "#2db56e", change: "+₦180M this month" },
  { label: "Platform Revenue", value: "₦48.2M", icon: "dollar-sign" as const, color: "#c9860d", change: "+₦6.1M this month" },
];

const PENDING_ACTIONS = [
  { type: "kyb", label: "GreenHouse Agro Ltd", sub: "Stage 2 KYB — director IDs & BVN submitted, awaiting AML screen", icon: "shield" as const, color: "#e08c1a", route: "/(admin)/businesses" as const },
  { type: "kyb", label: "TechBridge Solutions", sub: "Stage 1 eligibility review — CAC cert received", icon: "file-text" as const, color: "#e08c1a", route: "/(admin)/businesses" as const },
  { type: "brfr", label: "TechHub Coworking Network", sub: "BRRF: Orange — missed Q1 milestone, recovery plan requested", icon: "alert-triangle" as const, color: "#e06030", route: "/(admin)/businesses" as const },
  { type: "payout", label: "Investor Payout Batch #14", sub: "₦12.4M scheduled for escrow release — approve now", icon: "dollar-sign" as const, color: "#2db56e", route: "/(admin)/reports" as const },
  { type: "dispute", label: "Dispute: INV-0042", sub: "Investor raised concern on Lagos Pharma milestone 3", icon: "alert-circle" as const, color: "#e03e3e", route: "/(admin)/disputes" as const },
];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, logout } = useAuth();
  const { businesses, disputes } = useSystemData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalFunded = businesses.reduce((s, b) => s + b.amountRaised, 0);
  const verifiedCount = businesses.filter((b) => b.verificationStatus === "verified").length;
  const greenCount = businesses.filter((b) => b.brfrStatus === "green").length;
  const yellowCount = businesses.filter((b) => b.brfrStatus === "yellow").length;
  const orangeCount = businesses.filter((b) => b.brfrStatus === "orange").length;
  const redCount = businesses.filter((b) => b.brfrStatus === "red").length;
  const pendingKybCount = businesses.filter((b) => b.verificationStatus !== "verified").length;
  const openDisputes = disputes.filter((d) => d.status === "open" || d.status === "escalated").length;

  const handleLogout = () => {
    Alert.alert("Sign Out", "Sign out of admin panel?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await logout(); router.replace("/onboarding"); } },
    ]);
  };

  const quickCardWidth = Math.floor((width - 40 - 12) / 2);

  const pendingActions = PENDING_ACTIONS.map((action) =>
    action.type === "dispute"
      ? { ...action, sub: `${openDisputes} active concern${openDisputes === 1 ? "" : "s"} currently waiting on review.` }
      : action
  );

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.navRow}>
        <View>
          <Text style={[styles.eyebrow, { color: "#7c3aed" }]}>ADMIN PANEL</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>CoFund Control</Text>
        </View>
        <View style={styles.navRight}>
          <PressableScale
            style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/notifications")}
          >
            <Feather name="bell" size={18} color={colors.foreground} />
            <View style={[styles.badge, { backgroundColor: "#7c3aed" }]}>
              <Text style={styles.badgeText}>5</Text>
            </View>
          </PressableScale>
          <PressableScale onPress={handleLogout} style={[styles.avatarBtn, { backgroundColor: "#7c3aed" }]}>
            <Text style={styles.avatarText}>{(user?.name ?? "A").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</Text>
          </PressableScale>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(500)}>
        <LinearGradient
          colors={["#4c1d95", "#7c3aed"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Platform Health</Text>
              <Text style={styles.heroValue}>Excellent</Text>
            </View>
            <View style={styles.heroStatusBadge}>
              <View style={styles.heroDot} />
              <Text style={styles.heroStatusText}>All systems operational</Text>
            </View>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{verifiedCount}</Text>
              <Text style={styles.heroStatLabel}>Verified</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{pendingKybCount}</Text>
              <Text style={styles.heroStatLabel}>Pending KYB</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{INVESTMENTS.length}</Text>
              <Text style={styles.heroStatLabel}>Investments</Text>
            </View>
            <View style={styles.heroStatDiv} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{formatCurrency(totalFunded)}</Text>
              <Text style={styles.heroStatLabel}>Total Funded</Text>
            </View>
          </View>
          <View style={styles.heroDeco}>
            <Feather name="shield" size={90} color="rgba(255,255,255,0.05)" />
          </View>
        </LinearGradient>
      </Animated.View>

      <FadeSlideIn delay={160}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>BRRF Risk Classification</Text>
          <PressableScale onPress={() => router.push("/(admin)/businesses")}>
            <Text style={[styles.seeAll, { color: "#7c3aed" }]}>View all</Text>
          </PressableScale>
        </View>
        <View style={[styles.brfrCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.brfrNote, { color: colors.mutedForeground }]}>
            Business Recovery & Resolution Framework — real-time health of all active businesses
          </Text>
          <View style={styles.brfrRow}>
            {[
              { label: "Healthy", count: greenCount, dot: "#2db56e", bg: "#d6f5e7", text: "#1a7a4a" },
              { label: "Watch", count: yellowCount, dot: "#e08c1a", bg: "#fef3dc", text: "#9a5800" },
              { label: "At Risk", count: orangeCount, dot: "#e06030", bg: "#fde8d0", text: "#a63400" },
              { label: "Critical", count: redCount, dot: "#e03e3e", bg: "#fde8e8", text: "#a30000" },
            ].map((item) => (
              <View key={item.label} style={[styles.brfrItem, { backgroundColor: item.bg }]}>
                <View style={[styles.brfrDot, { backgroundColor: item.dot }]} />
                <Text style={[styles.brfrCount, { color: item.text }]}>{item.count}</Text>
                <Text style={[styles.brfrLabel, { color: item.text }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </FadeSlideIn>

      <View style={styles.statsGrid}>
        {PLATFORM_STATS.map((s, i) => (
          <FadeSlideIn key={s.label} delay={220 + i * 60} style={styles.statWrap}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
                <Feather name={s.icon} size={15} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              <Text style={[styles.statChange, { color: s.color }]}>{s.change}</Text>
            </View>
          </FadeSlideIn>
        ))}
      </View>

      <FadeSlideIn delay={460}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pending Actions</Text>
          <View style={[styles.countBadge, { backgroundColor: "#fde8e8" }]}>
            <Text style={[styles.countText, { color: "#e03e3e" }]}>{pendingActions.length}</Text>
          </View>
        </View>
        {pendingActions.map((a, i) => (
          <FadeSlideIn key={i} delay={520 + i * 60}>
            <PressableScale
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(a.route)}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + "18" }]}>
                <Feather name={a.icon} size={16} color={a.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
                <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>{a.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </PressableScale>
          </FadeSlideIn>
        ))}
      </FadeSlideIn>

      <FadeSlideIn delay={760}>
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        </View>
        <View style={styles.quickGrid}>
          {[
            { icon: "shield" as const, label: "KYB Review", sub: "Business approvals", color: "#2db56e", onPress: () => router.push("/(admin)/businesses") },
            { icon: "users" as const, label: "Users", sub: "Investor management", color: "#1a5e9a", onPress: () => router.push("/(admin)/investors") },
            { icon: "alert-circle" as const, label: "Disputes", sub: "Active concerns", color: "#e03e3e", onPress: () => router.push("/(admin)/disputes") },
            { icon: "settings" as const, label: "Platform", sub: "Settings & rules", color: "#7c3aed", onPress: () => router.push("/(admin)/settings") },
          ].map((q) => (
            <PressableScale
              key={q.label}
              style={[
                styles.quickCard,
                {
                  width: quickCardWidth,
                  height: 166,
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={q.onPress}
            >
              <View style={[styles.quickIcon, { backgroundColor: q.color + "18" }]}>
                <Feather name={q.icon} size={20} color={q.color} />
              </View>
              <View style={styles.quickCopy}>
                <Text style={[styles.quickLabel, { color: colors.foreground }]} numberOfLines={1}>
                  {q.label}
                </Text>
                <Text style={[styles.quickSub, { color: colors.mutedForeground }]} numberOfLines={2}>
                  {q.sub}
                </Text>
              </View>
            </PressableScale>
          ))}
        </View>
        <View style={[styles.disputeSummary, { backgroundColor: "#fff7f7", borderColor: "#fca5a5" }]}>
          <View style={[styles.disputeDot, { backgroundColor: "#e03e3e" }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.disputeSummaryTitle}>{openDisputes} active dispute{openDisputes === 1 ? "" : "s"}</Text>
            <Text style={styles.disputeSummaryText}>Need review from admin and business owners.</Text>
          </View>
          <PressableScale style={styles.disputeAction} onPress={() => router.push("/(admin)/disputes")}>
            <Feather name="arrow-right" size={13} color="#e03e3e" />
          </PressableScale>
        </View>
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  eyebrow: { fontSize: 10, fontWeight: "700", letterSpacing: 1.2, fontFamily: "Inter_700Bold" },
  name: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  navRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifBtn: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 10, color: "#fff", fontWeight: "700", fontFamily: "Inter_700Bold" },
  avatarBtn: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: "Inter_700Bold" },
  heroCard: { borderRadius: 18, padding: 22, marginBottom: 16, overflow: "hidden" },
  heroTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 },
  heroLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  heroValue: { color: "#fff", fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  heroStatusBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(45,181,110,0.2)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2db56e" },
  heroStatusText: { color: "#fff", fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  heroStats: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, padding: 14 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatVal: { color: "#fff", fontSize: 14, fontWeight: "800", fontFamily: "Inter_700Bold" },
  heroStatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 9, marginTop: 2, fontFamily: "Inter_400Regular" },
  heroStatDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },
  heroDeco: { position: "absolute", right: -10, bottom: -20 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  brfrCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16, gap: 12 },
  brfrNote: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  brfrRow: { flexDirection: "row", gap: 8 },
  brfrItem: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center", gap: 4 },
  brfrDot: { width: 8, height: 8, borderRadius: 4 },
  brfrCount: { fontSize: 18, fontWeight: "800", fontFamily: "Inter_700Bold" },
  brfrLabel: { fontSize: 10, fontWeight: "500", fontFamily: "Inter_500Medium" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statWrap: { width: "47%" },
  statCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 4 },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  statVal: { fontSize: 18, fontWeight: "800", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statChange: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginTop: 2 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  countText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  actionCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  actionIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  actionSub: { fontSize: 12, marginTop: 2, fontFamily: "Inter_400Regular" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 14 },
  quickCard: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 16, alignItems: "flex-start", justifyContent: "flex-start", gap: 12, marginBottom: 12 },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickCopy: { width: "100%", gap: 2, alignItems: "flex-start" },
  quickLabel: { fontSize: 14, lineHeight: 18, fontWeight: "700", textAlign: "left", fontFamily: "Inter_700Bold" },
  quickSub: { fontSize: 11, lineHeight: 15, textAlign: "left", fontFamily: "Inter_400Regular" },
  disputeSummary: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
  disputeDot: { width: 10, height: 10, borderRadius: 5 },
  disputeSummaryTitle: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", color: "#991b1b" },
  disputeSummaryText: { fontSize: 11, lineHeight: 15, fontFamily: "Inter_400Regular", color: "#7f1d1d" },
  disputeAction: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#ffe4e6", alignItems: "center", justifyContent: "center" },
});
