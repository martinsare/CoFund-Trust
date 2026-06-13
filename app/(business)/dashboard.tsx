import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { useAuth } from "@/context/AuthContext";
import { BUSINESSES, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

export default function BusinessDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const business = BUSINESSES[0];
  const progress = business.amountRaised / business.fundingGoal;
  const remaining = business.fundingGoal - business.amountRaised;
  const initials = (user?.name ?? "B").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.navRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Business Dashboard</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.businessName ?? business.name}</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).duration(500)}>
        <LinearGradient
          colors={["#1a7a4a", "#2db56e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fundingCard}
        >
          <View style={styles.fundingTop}>
            <View>
              <Text style={styles.fundingLabel}>Funding Goal</Text>
              <Text style={styles.fundingAmount}>{formatCurrency(business.fundingGoal)}</Text>
            </View>
            <View style={styles.trustBadge}>
              <Feather name="shield" size={12} color="#fff" />
              <Text style={styles.trustText}>Trust {business.trustScore}</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.fundingStats}>
            <View>
              <Text style={styles.fundingStatVal}>{formatCurrency(business.amountRaised)}</Text>
              <Text style={styles.fundingStatLabel}>Raised ({Math.round(progress * 100)}%)</Text>
            </View>
            <View>
              <Text style={styles.fundingStatVal}>{formatCurrency(remaining)}</Text>
              <Text style={styles.fundingStatLabel}>Remaining</Text>
            </View>
            <View>
              <Text style={styles.fundingStatVal}>{business.daysLeft}d</Text>
              <Text style={styles.fundingStatLabel}>Days Left</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.statsGrid}>
        {[
          { icon: "users" as const, label: "Total Investors", value: business.investorCount.toString(), color: colors.primary },
          { icon: "trending-up" as const, label: "ROI Offered", value: business.expectedRoi, color: colors.accent },
          { icon: "clock" as const, label: "Duration", value: business.duration, color: colors.gold },
          { icon: "tag" as const, label: "Type", value: business.investmentType, color: colors.purple },
        ].map((s, i) => (
          <FadeSlideIn key={s.label} delay={200 + i * 60} style={{ width: "47%" }}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
                <Feather name={s.icon} size={14} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: colors.foreground }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          </FadeSlideIn>
        ))}
      </View>

      <FadeSlideIn delay={440}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        </View>
        <View style={styles.actionsGrid}>
          {[
            { icon: "file-plus" as const, label: "New Request", sub: "Create funding round", color: colors.primary, onPress: () => router.push("/(business)/create") },
            { icon: "message-square" as const, label: "Post Update", sub: "Share progress", color: colors.accent, onPress: () => router.push("/(business)/updates") },
            { icon: "bar-chart-2" as const, label: "Analytics", sub: "View performance", color: colors.gold, onPress: () => router.push("/(business)/analytics") },
            { icon: "users" as const, label: "Investors", sub: "Your backers", color: colors.purple, onPress: () => {} },
          ].map((a) => (
            <PressableScale
              key={a.label}
              style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={a.onPress}
            >
              <View style={[styles.actionIcon, { backgroundColor: a.color + "18" }]}>
                <Feather name={a.icon} size={18} color={a.color} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>{a.label}</Text>
              <Text style={[styles.actionSub, { color: colors.mutedForeground }]}>{a.sub}</Text>
            </PressableScale>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={540}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Updates</Text>
          <PressableScale onPress={() => router.push("/(business)/updates")}>
            <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
          </PressableScale>
        </View>
        {business.updates.slice(0, 2).map((u) => (
          <View key={u.id} style={[styles.updateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.updateDot, { backgroundColor: u.type === "milestone" ? colors.accent : u.type === "report" ? colors.primary : colors.amber }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.updateTitle, { color: colors.foreground }]}>{u.title}</Text>
              <Text style={[styles.updateContent, { color: colors.mutedForeground }]} numberOfLines={2}>{u.content}</Text>
              <Text style={[styles.updateDate, { color: colors.mutedForeground }]}>{u.date}</Text>
            </View>
          </View>
        ))}
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular" },
  name: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 15, fontFamily: "Inter_700Bold" },
  fundingCard: { borderRadius: 18, padding: 20, marginBottom: 16, gap: 14 },
  fundingTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  fundingLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  fundingAmount: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -1, fontFamily: "Inter_700Bold" },
  trustBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  trustText: { color: "#fff", fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 100 },
  fundingStats: { flexDirection: "row", justifyContent: "space-between" },
  fundingStatVal: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  fundingStatLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, fontFamily: "Inter_400Regular" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 5 },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statVal: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  actionCard: { width: "47%", borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  actionSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  updateCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  updateDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  updateTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  updateContent: { fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  updateDate: { fontSize: 11, marginTop: 4, fontFamily: "Inter_400Regular" },
});
