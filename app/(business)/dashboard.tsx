import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Dimensions, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { useAuth } from "@/context/AuthContext";
import { BrfrStatus, KYB_STAGES, formatCurrency } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";

const GRID_CARD_W = (Dimensions.get("window").width - 40 - 10) / 2; // 40 = h-padding, 10 = gap

const BRFR_CONFIG: Record<BrfrStatus, { label: string; color: string; bg: string; dot: string; note: string }> = {
  green:  { label: "Healthy",   color: "#1a7a4a", bg: "#d6f5e7", dot: "#2db56e", note: "Business operating normally. No concerns flagged." },
  yellow: { label: "Watch",     color: "#9a5800", bg: "#fef3dc", dot: "#e08c1a", note: "Minor issues detected. Increased monitoring active." },
  orange: { label: "At Risk",   color: "#a63400", bg: "#fde8d0", dot: "#e06030", note: "Formal review in progress. Recovery plan may be required." },
  red:    { label: "Critical",  color: "#a30000", bg: "#fde8e8", dot: "#e03e3e", note: "Recovery Committee intervention active. Investors notified." },
};

export default function BusinessDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { currentBusiness, disputes } = useSystemData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const business = currentBusiness;
  const initials  = (user?.name ?? "B").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const isPending = !business || business.verificationStatus === "pending";

  if (!business) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: 32 }]}>
        <View style={{ paddingTop: Platform.OS === "web" ? 67 : insets.top }} />
        <View style={[{ width: 72, height: 72, borderRadius: 20, backgroundColor: "#fef3dc", alignItems: "center", justifyContent: "center", marginBottom: 20 }]}>
          <Feather name="clock" size={34} color="#e08c1a" />
        </View>
        <Text style={[styles.name, { color: colors.foreground, textAlign: "center", marginBottom: 8 }]}>Application Submitted</Text>
        <Text style={[{ fontSize: 14, color: colors.mutedForeground, textAlign: "center", lineHeight: 22, maxWidth: 300 }]}>
          Your business application is being set up. This usually takes just a moment. If this persists, please contact support.
        </Text>
      </View>
    );
  }

  const progress  = business.fundingGoal > 0 ? business.amountRaised / business.fundingGoal : 0;
  const remaining = business.fundingGoal - business.amountRaised;
  const brfr      = BRFR_CONFIG[business.brfrStatus];
  const kybStageLabel = KYB_STAGES[business.kybStage - 1];
  const openDisputes = disputes.filter((dispute) => dispute.businessId === business.id && (dispute.status === "open" || dispute.status === "escalated")).length;

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

      {isPending && (
        <Animated.View entering={FadeInDown.delay(60).duration(500)} style={[styles.pendingBanner, { backgroundColor: "#fef3dc", borderColor: "#e08c1a" }]}>
          <Feather name="clock" size={16} color="#9a5800" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.pendingTitle, { color: "#9a5800" }]}>Application Under Review</Text>
            <Text style={[styles.pendingSub, { color: "#9a5800" }]}>
              Your KYB verification is in progress (Stage {business.kybStage}/5). CoFund typically completes reviews within 3–5 business days. You'll be notified once approved.
            </Text>
          </View>
        </Animated.View>
      )}

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

      <FadeSlideIn delay={160}>
        <View style={[styles.kybCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.kybHeader}>
            <View>
              <Text style={[styles.kybTitle, { color: colors.foreground }]}>KYB Verification Stage</Text>
              <Text style={[styles.kybStageLabel, { color: colors.primary }]}>
                Stage {business.kybStage}/5 — {kybStageLabel}
              </Text>
            </View>
            {business.kybStage === 5 ? (
              <View style={[styles.kybComplete, { backgroundColor: "#d6f5e7" }]}>
                <Feather name="check-circle" size={13} color="#1a7a4a" />
                <Text style={[styles.kybCompleteText, { color: "#1a7a4a" }]}>Complete</Text>
              </View>
            ) : (
              <View style={[styles.kybComplete, { backgroundColor: "#fef3dc" }]}>
                <Feather name="clock" size={13} color="#9a5800" />
                <Text style={[styles.kybCompleteText, { color: "#9a5800" }]}>In Progress</Text>
              </View>
            )}
          </View>
          <View style={styles.kybTrack}>
            {[1, 2, 3, 4, 5].map((s) => (
              <View key={s} style={styles.kybStepWrap}>
                <View style={[
                  styles.kybSegment,
                  { backgroundColor: s < business.kybStage ? "#2db56e" : s === business.kybStage ? "#1a5e9a" : colors.borderLight },
                ]} />
                <Text style={[styles.kybStepNum, { color: s <= business.kybStage ? colors.foreground : colors.mutedForeground }]}>{s}</Text>
              </View>
            ))}
          </View>
          <View style={styles.kybStageNames}>
            {KYB_STAGES.map((label, idx) => (
              <Text
                key={label}
                style={[styles.kybStageName, { color: idx + 1 <= business.kybStage ? colors.foreground : colors.mutedForeground }]}
                numberOfLines={2}
              >
                {label}
              </Text>
            ))}
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={220}>
        <View style={[styles.brfrCard, { backgroundColor: brfr.bg, borderColor: brfr.dot + "40" }]}>
          <View style={styles.brfrTop}>
            <View style={[styles.brfrDot, { backgroundColor: brfr.dot }]} />
            <Text style={[styles.brfrStatus, { color: brfr.color }]}>BRRF Status: {brfr.label}</Text>
            <PressableScale style={[styles.brfrLink, { backgroundColor: "rgba(255,255,255,0.45)" }]} onPress={() => router.push("/(business)/disputes")}>
              <Feather name="alert-circle" size={12} color={brfr.color} />
              <Text style={[styles.brfrLinkText, { color: brfr.color }]}>{openDisputes} dispute{openDisputes === 1 ? "" : "s"}</Text>
            </PressableScale>
          </View>
          <Text style={[styles.brfrNote, { color: brfr.color }]}>{brfr.note}</Text>
        </View>
      </FadeSlideIn>

      <View style={styles.statsGrid}>
        {[
          { icon: "users" as const,       label: "Total Investors",   value: business.investorCount.toString(), color: colors.primary },
          { icon: "trending-up" as const, label: "ROI Offered",       value: business.expectedRoi,              color: colors.accent },
          { icon: "clock" as const,       label: "Duration",          value: business.duration,                 color: colors.gold },
          { icon: "bar-chart-2" as const, label: "Revenue Range",     value: business.revenueRange,             color: colors.purple },
        ].map((s, i) => (
          <FadeSlideIn key={s.label} delay={280 + i * 60} style={{ width: GRID_CARD_W }}>
            <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
                <Feather name={s.icon} size={14} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: colors.foreground }]} numberOfLines={1}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </View>
          </FadeSlideIn>
        ))}
      </View>

      <FadeSlideIn delay={500}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Milestone Tracker</Text>
        </View>
        {business.milestones.map((m, i) => {
          const statusColor = m.status === "completed" ? "#2db56e" : m.status === "active" ? "#1a5e9a" : colors.mutedForeground;
          const statusBg    = m.status === "completed" ? "#d6f5e7" : m.status === "active" ? "#ddeaf8" : colors.muted;
          return (
            <FadeSlideIn key={m.id} delay={540 + i * 60}>
              <View style={[styles.milestoneCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.milestoneDot, { backgroundColor: statusColor }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.milestoneTop}>
                    <Text style={[styles.milestoneTitle, { color: colors.foreground }]}>{m.title}</Text>
                    <View style={[styles.milestoneBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.milestoneBadgeText, { color: statusColor }]}>
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.milestoneDesc, { color: colors.mutedForeground }]}>{m.description}</Text>
                  <View style={styles.milestoneMeta}>
                    <Feather name="calendar" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.milestoneDate, { color: colors.mutedForeground }]}>{m.dueDate}</Text>
                    <Text style={[styles.milestoneDotSep, { color: colors.mutedForeground }]}>·</Text>
                    <Feather name="lock" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.milestoneAmt, { color: colors.foreground }]}>{formatCurrency(m.amount)}</Text>
                    <Text style={[styles.milestoneEscrow, { color: colors.mutedForeground }]}> in escrow</Text>
                  </View>
                </View>
              </View>
            </FadeSlideIn>
          );
        })}
      </FadeSlideIn>

      <FadeSlideIn delay={700}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
        </View>
        <View style={styles.actionsGrid}>
          {[
            { icon: "file-plus" as const,    label: "New Request", sub: "Create funding round", color: colors.primary, onPress: () => router.push("/(business)/create") },
            { icon: "message-square" as const,label: "Post Update", sub: "Share progress",       color: colors.accent,  onPress: () => router.push("/(business)/updates") },
            { icon: "bar-chart-2" as const,  label: "Analytics",   sub: "View performance",     color: colors.gold,    onPress: () => router.push("/(business)/analytics") },
            { icon: "users" as const,        label: "Investors",   sub: "Your backers",          color: colors.purple,  onPress: () => router.push("/(business)/investors" as any) },
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

      <FadeSlideIn delay={820}>
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
        {business.updates.length === 0 && (
          <View style={[styles.updateCard, { backgroundColor: colors.card, borderColor: colors.border, justifyContent: "center", paddingVertical: 20 }]}>
            <Text style={[styles.updateContent, { color: colors.mutedForeground, textAlign: "center" }]}>No updates posted yet. Share your progress with investors.</Text>
          </View>
        )}
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  greeting: { fontSize: 12, fontFamily: "Inter_400Regular" },
  name: { fontSize: 18, fontWeight: "800", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  pendingBanner: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  pendingTitle: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 3 },
  pendingSub: { fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 15, fontFamily: "Inter_700Bold" },
  fundingCard: { borderRadius: 18, padding: 20, marginBottom: 14, gap: 14 },
  fundingTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  fundingLabel: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  fundingAmount: { color: "#fff", fontSize: 26, fontWeight: "800", letterSpacing: -1, fontFamily: "Inter_700Bold" },
  trustBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 100 },
  trustText: { color: "#fff", fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  progressTrack: { height: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 100 },
  fundingStats: { flexDirection: "row", justifyContent: "space-between" },
  fundingStatVal: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  fundingStatLabel: { color: "rgba(255,255,255,0.65)", fontSize: 10, fontFamily: "Inter_400Regular" },
  kybCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, gap: 12 },
  kybHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  kybTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  kybStageLabel: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  kybComplete: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  kybCompleteText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  kybTrack: { flexDirection: "row", gap: 6 },
  kybStepWrap: { flex: 1, alignItems: "center", gap: 4 },
  kybSegment: { width: "100%", height: 5, borderRadius: 100 },
  kybStepNum: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  kybStageNames: { flexDirection: "row", gap: 6 },
  kybStageName: { flex: 1, fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 13 },
  brfrCard: { borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 14, gap: 6 },
  brfrTop: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  brfrDot: { width: 8, height: 8, borderRadius: 4 },
  brfrStatus: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  brfrLink: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 100 },
  brfrLinkText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  brfrNote: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  statCard: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 4 },
  statIcon: { width: 28, height: 28, borderRadius: 9, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  statVal: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  seeAll: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  milestoneCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  milestoneDot: { width: 9, height: 9, borderRadius: 5, marginTop: 5 },
  milestoneTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 3 },
  milestoneTitle: { flex: 1, fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  milestoneBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, marginLeft: 8 },
  milestoneBadgeText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  milestoneDesc: { fontSize: 12, lineHeight: 16, fontFamily: "Inter_400Regular", marginBottom: 5 },
  milestoneMeta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  milestoneDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  milestoneDotSep: { fontSize: 11 },
  milestoneAmt: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  milestoneEscrow: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  actionCard: { width: GRID_CARD_W, borderRadius: 12, borderWidth: 1, padding: 14, gap: 6 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  actionSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  updateCard: { flexDirection: "row", alignItems: "flex-start", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  updateDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  updateTitle: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  updateContent: { fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  updateDate: { fontSize: 11, marginTop: 4, fontFamily: "Inter_400Regular" },
});
