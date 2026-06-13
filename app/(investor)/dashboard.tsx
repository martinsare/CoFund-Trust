import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { OpportunityCard } from "@/components/OpportunityCard";
import { useAuth } from "@/context/AuthContext";
import { BUSINESSES, INVESTMENTS, NOTIFICATIONS, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

const QUICK_ACTIONS = [
  { icon: "message-circle" as const, label: "Messages", color: "#1a5e9a", route: "/investor/messages" as const },
  { icon: "repeat" as const, label: "Market", color: "#2db56e", route: "/(investor)/market" as const },
  { icon: "bar-chart-2" as const, label: "Analytics", color: "#e08c1a", route: "/investor/analytics" as const },
  { icon: "star" as const, label: "Go Pro", color: "#7c3aed", route: "/investor/pro" as const },
];

export default function InvestorDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const unread = NOTIFICATIONS.filter((n) => !n.read).length;
  const totalInvested = INVESTMENTS.reduce((s, i) => s + i.amountInvested, 0);
  const activeCount = INVESTMENTS.filter((i) => i.status === "active").length;
  const expectedReturns = INVESTMENTS.reduce((s, i) => s + i.expectedReturn, 0);
  const featured = BUSINESSES.slice(0, 2);
  const initials = (user?.name ?? "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.navRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name?.split(" ")[0] ?? "Investor"}</Text>
        </View>
        <View style={styles.navRight}>
          <PressableScale
            style={[styles.notifBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/notifications")}
          >
            <Feather name="bell" size={18} color={colors.foreground} />
            {unread > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.destructive }]}>
                <Text style={styles.badgeText}>{unread}</Text>
              </View>
            )}
          </PressableScale>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).duration(500)}>
        <LinearGradient
          colors={["#0e3d6e", "#1a5e9a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.walletCard}
        >
          <Text style={styles.walletLabel}>Wallet Balance</Text>
          <Text style={styles.walletAmount}>{formatCurrency(user?.walletBalance ?? 0)}</Text>
          <View style={styles.walletActions}>
            <PressableScale style={styles.walletBtn}>
              <Feather name="plus" size={14} color="#fff" />
              <Text style={styles.walletBtnText}>Fund Wallet</Text>
            </PressableScale>
            <PressableScale style={[styles.walletBtn, { backgroundColor: "rgba(255,255,255,0.08)" }]}>
              <Feather name="download" size={14} color="#fff" />
              <Text style={styles.walletBtnText}>Withdraw</Text>
            </PressableScale>
          </View>
          <View style={styles.walletDeco}>
            <Feather name="shield" size={80} color="rgba(255,255,255,0.04)" />
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.statsRow}>
        {[
          { label: "Invested", value: formatCurrency(totalInvested), icon: "trending-up" as const, accent: colors.primary },
          { label: "Active", value: `${activeCount}`, icon: "activity" as const, accent: colors.accent },
          { label: "Expected", value: formatCurrency(expectedReturns), icon: "dollar-sign" as const, accent: colors.gold },
        ].map((s, i) => (
          <FadeSlideIn key={s.label} delay={200 + i * 80} style={{ flex: 1 }}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.accent + "18" }]}>
                <Feather name={s.icon} size={14} color={s.accent} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          </FadeSlideIn>
        ))}
      </View>

      <FadeSlideIn delay={350}>
        <View style={styles.quickActionsRow}>
          {QUICK_ACTIONS.map((a) => (
            <PressableScale
              key={a.label}
              style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => router.push(a.route as any)}
            >
              <View style={[styles.qaIcon, { backgroundColor: a.color + "18" }]}>
                <Feather name={a.icon} size={18} color={a.color} />
              </View>
              <Text style={[styles.qaLabel, { color: colors.foreground }]}>{a.label}</Text>
            </PressableScale>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={430}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured Opportunities</Text>
          <PressableScale onPress={() => router.push("/(investor)/explore")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </PressableScale>
        </View>
      </FadeSlideIn>
      {featured.map((b, i) => (
        <FadeSlideIn key={b.id} delay={500 + i * 80} style={{ marginBottom: 12 }}>
          <OpportunityCard business={b} onPress={() => router.push(`/business/${b.id}`)} />
        </FadeSlideIn>
      ))}

      <FadeSlideIn delay={640}>
        <View style={[styles.sectionHeader, { marginTop: 8 }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Investments</Text>
          <PressableScale onPress={() => router.push("/(investor)/portfolio")}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
          </PressableScale>
        </View>
      </FadeSlideIn>
      {INVESTMENTS.slice(0, 2).map((inv, i) => (
        <FadeSlideIn key={inv.id} delay={700 + i * 80}>
          <PressableScale
            style={[styles.invCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/business/${inv.businessId}`)}
          >
            <View style={styles.invTop}>
              <View style={[styles.invDot, { backgroundColor: inv.status === "active" ? colors.accent : inv.status === "completed" ? colors.primary : colors.amber }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.invName, { color: colors.foreground }]}>{inv.businessName}</Text>
                <Text style={[styles.invIndustry, { color: colors.mutedForeground }]}>{inv.industry}</Text>
              </View>
              <View>
                <Text style={[styles.invAmount, { color: colors.foreground }]}>{formatCurrency(inv.amountInvested)}</Text>
                <Text style={[styles.invRoi, { color: colors.accent }]}>{inv.roi} ROI</Text>
              </View>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.borderLight }]}>
              <View style={[styles.progressFill, { width: `${inv.progress * 100}%`, backgroundColor: colors.accent }]} />
            </View>
            <View style={styles.invBottom}>
              <Text style={[styles.invMeta, { color: colors.mutedForeground }]}>Matures {inv.maturityDate}</Text>
              <StatusBadge status={inv.status} colors={colors} />
            </View>
          </PressableScale>
        </FadeSlideIn>
      ))}
    </ScrollView>
  );
}

function StatusBadge({ status, colors }: { status: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: colors.accentLight, text: colors.accentDark, label: "Active" },
    pending: { bg: colors.amberLight, text: colors.amber, label: "Pending" },
    completed: { bg: colors.primaryLight, text: colors.primary, label: "Completed" },
    defaulted: { bg: colors.destructiveLight, text: colors.destructive, label: "Defaulted" },
  };
  const s = map[status] ?? map.active;
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontWeight: "800", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  navRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifBtn: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  badge: { position: "absolute", top: -3, right: -3, width: 16, height: 16, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 10, color: "#fff", fontWeight: "700", fontFamily: "Inter_700Bold" },
  avatar: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: "Inter_700Bold" },
  walletCard: { borderRadius: 18, padding: 22, marginBottom: 16, overflow: "hidden" },
  walletLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_500Medium" },
  walletAmount: { color: "#fff", fontSize: 34, fontWeight: "800", letterSpacing: -1, marginTop: 4, marginBottom: 16, fontFamily: "Inter_700Bold" },
  walletActions: { flexDirection: "row", gap: 10 },
  walletBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(45,181,110,0.25)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9 },
  walletBtnText: { color: "#fff", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  walletDeco: { position: "absolute", right: -12, bottom: -20 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { borderRadius: 12, borderWidth: 1, padding: 13, gap: 5 },
  statIcon: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statValue: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  quickActionsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  quickAction: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 13, alignItems: "center", gap: 8 },
  qaIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", textAlign: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  invCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 10, gap: 10 },
  invTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  invDot: { width: 8, height: 8, borderRadius: 4 },
  invName: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  invIndustry: { fontSize: 12, fontFamily: "Inter_400Regular" },
  invAmount: { fontSize: 14, fontWeight: "700", textAlign: "right", fontFamily: "Inter_700Bold" },
  invRoi: { fontSize: 12, fontWeight: "600", textAlign: "right", fontFamily: "Inter_600SemiBold" },
  progressBar: { height: 5, borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 100 },
  invBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  invMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 100 },
  statusText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
