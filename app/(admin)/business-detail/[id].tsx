import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { BrfrStatus, KYB_STAGES, formatCurrency } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";
import { SoundManager } from "@/utils/soundManager";

const BRFR_CONFIG: Record<BrfrStatus, { label: string; color: string; bg: string; dot: string }> = {
  green:  { label: "Healthy",  color: "#1a7a4a", bg: "#d6f5e7", dot: "#2db56e" },
  yellow: { label: "Watch",    color: "#9a5800", bg: "#fef3dc", dot: "#e08c1a" },
  orange: { label: "At Risk",  color: "#a63400", bg: "#fde8d0", dot: "#e06030" },
  red:    { label: "Critical", color: "#a30000", bg: "#fde8e8", dot: "#e03e3e" },
};

const MILESTONE_COLORS: Record<string, { bg: string; text: string }> = {
  completed: { bg: "#d6f5e7", text: "#1a7a4a" },
  active:    { bg: "#ddeaf8", text: "#1a5e9a" },
  pending:   { bg: "#f5f5f5", text: "#888" },
};

export default function AdminBusinessDetail() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { id } = useLocalSearchParams<{ id: string }>();
  const { businesses, updateBusiness } = useSystemData();

  const business = businesses.find((b) => b.id === id);

  if (!business) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="briefcase" size={34} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Business not found</Text>
        <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>This record is no longer available.</Text>
        <PressableScale style={[styles.backBtn, { backgroundColor: "#7c3aed" }]} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </PressableScale>
      </View>
    );
  }

  const brfr = BRFR_CONFIG[business.brfrStatus];
  const progress = Math.min(business.amountRaised / business.fundingGoal, 1);

  function advanceKyb() {
    if (business!.kybStage >= 5) {
      Alert.alert("Already Complete", "This business has completed all KYB stages.");
      return;
    }
    const nextStage = (business!.kybStage + 1) as 1 | 2 | 3 | 4 | 5;
    Alert.alert(
      "Advance KYB Stage",
      `Move ${business!.name} from Stage ${business!.kybStage} to Stage ${nextStage} — ${KYB_STAGES[nextStage - 1]}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Advance",
          onPress: () => {
            updateBusiness(business!.id, { kybStage: nextStage });
            SoundManager.success();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function approveVerification() {
    Alert.alert(
      "Approve Business",
      `Fully verify ${business!.name} and mark KYB as complete?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: () => {
            updateBusiness(business!.id, { verificationStatus: "verified", kybStage: 5 });
            SoundManager.success();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }

  function sendBack() {
    Alert.alert(
      "Send Back",
      `Return ${business!.name} for additional documentation?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send Back",
          style: "destructive",
          onPress: () => {
            const prev = Math.max((business!.kybStage - 1), 1) as 1 | 2 | 3 | 4 | 5;
            updateBusiness(business!.id, { verificationStatus: "partial", kybStage: prev });
            SoundManager.error();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  }

  function changeBrfr(status: BrfrStatus) {
    updateBusiness(business!.id, { brfrStatus: status });
    SoundManager.pinClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  const verMap: Record<string, { bg: string; text: string; label: string }> = {
    verified: { bg: "#d6f5e7", text: "#1a7a4a", label: "Verified" },
    partial:  { bg: "#ddeaf8", text: "#1a5e9a", label: "Partial KYB" },
    pending:  { bg: "#fef3dc", text: "#9a5800", label: "Pending" },
  };
  const ver = verMap[business.verificationStatus] ?? verMap.pending;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Top row */}
      <Animated.View entering={FadeInDown.delay(0).duration(450)} style={styles.topRow}>
        <PressableScale
          style={[styles.backPill, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={16} color={colors.foreground} />
          <Text style={[styles.backPillText, { color: colors.foreground }]}>Businesses</Text>
        </PressableScale>
        <View style={[styles.statusBadge, { backgroundColor: ver.bg }]}>
          <Text style={[styles.statusText, { color: ver.text }]}>{ver.label}</Text>
        </View>
      </Animated.View>

      {/* Hero */}
      <Animated.View entering={FadeInDown.delay(60).duration(450)} style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: brfr.dot }]}>
          <Text style={styles.avatarText}>{business.name.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.heroName, { color: colors.foreground }]}>{business.name}</Text>
          <Text style={[styles.heroSub, { color: colors.mutedForeground }]}>{business.industry} · {business.location}</Text>
          <View style={styles.heroBadgeRow}>
            <View style={[styles.brfrBadge, { backgroundColor: brfr.bg }]}>
              <View style={[styles.brfrDot, { backgroundColor: brfr.dot }]} />
              <Text style={[styles.brfrBadgeText, { color: brfr.color }]}>{brfr.label}</Text>
            </View>
            <View style={[styles.trustBadge, { backgroundColor: colors.muted }]}>
              <Feather name="shield" size={11} color={colors.mutedForeground} />
              <Text style={[styles.trustText, { color: colors.mutedForeground }]}>Trust {business.trustScore}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Stats */}
      <FadeSlideIn delay={120}>
        <View style={styles.statsGrid}>
          {[
            { label: "Raised",     value: formatCurrency(business.amountRaised), icon: "trending-up" as const, tone: "#1a5e9a", bg: "#ddeaf8" },
            { label: "Goal",       value: formatCurrency(business.fundingGoal),   icon: "target" as const,      tone: "#7c3aed", bg: "#efe4ff" },
            { label: "Investors",  value: String(business.investorCount),         icon: "users" as const,       tone: "#2db56e", bg: "#d6f5e7" },
            { label: "Days Left",  value: String(business.daysLeft),              icon: "clock" as const,       tone: "#c9860d", bg: "#fff3db" },
          ].map((s) => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
              <Feather name={s.icon} size={14} color={s.tone} />
              <Text style={[styles.statVal, { color: s.tone }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: s.tone }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      {/* Funding progress */}
      <FadeSlideIn delay={160}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Funding Progress</Text>
            <Text style={[styles.sectionVal, { color: colors.accent }]}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.progressMeta}>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{formatCurrency(business.amountRaised)} raised</Text>
            <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{formatCurrency(business.fundingGoal)} goal</Text>
          </View>
          <View style={styles.infoGrid}>
            <InfoRow label="Investment type" value={business.investmentType} colors={colors} />
            <InfoRow label="Expected ROI"    value={business.expectedRoi}    colors={colors} />
            <InfoRow label="Duration"        value={business.duration}       colors={colors} />
            <InfoRow label="Min investment"  value={formatCurrency(business.minInvestment)} colors={colors} />
            <InfoRow label="Revenue range"   value={business.revenueRange}   colors={colors} />
            <InfoRow label="Employees"       value={String(business.employeeCount)} colors={colors} />
          </View>
        </View>
      </FadeSlideIn>

      {/* KYB Management */}
      <FadeSlideIn delay={200}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>KYB Status</Text>
          <Text style={[styles.kybStageLine, { color: colors.mutedForeground }]}>
            Stage {business.kybStage}/5 — {KYB_STAGES[business.kybStage - 1]}
          </Text>
          <View style={styles.kybTrack}>
            {[1, 2, 3, 4, 5].map((s) => (
              <View
                key={s}
                style={[styles.kybSegment, {
                  backgroundColor: s < business.kybStage ? "#2db56e" : s === business.kybStage ? "#1a5e9a" : colors.borderLight,
                }]}
              />
            ))}
          </View>
          <View style={styles.kybStageNames}>
            {KYB_STAGES.map((name, i) => (
              <Text key={name} style={[styles.kybStageName, { color: i + 1 <= business.kybStage ? colors.foreground : colors.mutedForeground }]} numberOfLines={2}>
                {name}
              </Text>
            ))}
          </View>
          {business.verificationStatus !== "verified" && (
            <View style={styles.actionRow}>
              <PressableScale style={[styles.actionBtn, { backgroundColor: "#d6f5e7", borderColor: "#2db56e" }]} onPress={approveVerification}>
                <Feather name="check-circle" size={13} color="#2db56e" />
                <Text style={[styles.actionBtnText, { color: "#2db56e" }]}>Full Approve</Text>
              </PressableScale>
              <PressableScale style={[styles.actionBtn, { backgroundColor: "#ddeaf8", borderColor: "#1a5e9a" }]} onPress={advanceKyb}>
                <Feather name="arrow-right" size={13} color="#1a5e9a" />
                <Text style={[styles.actionBtnText, { color: "#1a5e9a" }]}>Advance Stage</Text>
              </PressableScale>
              <PressableScale style={[styles.actionBtn, { backgroundColor: "#fde8e8", borderColor: "#e03e3e" }]} onPress={sendBack}>
                <Feather name="corner-down-left" size={13} color="#e03e3e" />
                <Text style={[styles.actionBtnText, { color: "#e03e3e" }]}>Send Back</Text>
              </PressableScale>
            </View>
          )}
          {business.verificationStatus === "verified" && (
            <View style={[styles.verifiedBanner, { backgroundColor: "#d6f5e7" }]}>
              <Feather name="check-circle" size={14} color="#1a7a4a" />
              <Text style={[styles.verifiedText, { color: "#1a7a4a" }]}>Business fully verified — all KYB stages complete</Text>
            </View>
          )}
        </View>
      </FadeSlideIn>

      {/* BRFR Management */}
      <FadeSlideIn delay={240}>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>BRRF Status</Text>
          <Text style={[styles.sectionCopy, { color: colors.mutedForeground }]}>
            Current: <Text style={{ fontWeight: "700", color: brfr.color }}>{brfr.label}</Text>
            {" — "}tap to change
          </Text>
          <View style={styles.brfrBtnRow}>
            {(Object.entries(BRFR_CONFIG) as [BrfrStatus, typeof BRFR_CONFIG["green"]][]).map(([key, cfg]) => (
              <PressableScale
                key={key}
                style={[
                  styles.brfrBtn,
                  { backgroundColor: cfg.bg, borderColor: cfg.dot, borderWidth: business.brfrStatus === key ? 2 : 1, opacity: business.brfrStatus === key ? 1 : 0.6 },
                ]}
                onPress={() => changeBrfr(key)}
              >
                <View style={[styles.brfrDot, { backgroundColor: cfg.dot }]} />
                <Text style={[styles.brfrBtnText, { color: cfg.color }]}>{cfg.label}</Text>
                {business.brfrStatus === key && <Feather name="check" size={11} color={cfg.color} />}
              </PressableScale>
            ))}
          </View>
        </View>
      </FadeSlideIn>

      {/* Milestones */}
      {business.milestones.length > 0 && (
        <FadeSlideIn delay={280}>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Milestones</Text>
            {business.milestones.map((m) => {
              const mc = MILESTONE_COLORS[m.status] ?? MILESTONE_COLORS.pending;
              return (
                <View key={m.id} style={[styles.milestoneRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.milestoneBadge, { backgroundColor: mc.bg }]}>
                    <Text style={[styles.milestoneBadgeText, { color: mc.text }]}>{m.status}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.milestoneTitle, { color: colors.foreground }]}>{m.title}</Text>
                    <Text style={[styles.milestoneSub, { color: colors.mutedForeground }]}>{m.description}</Text>
                    <Text style={[styles.milestoneMeta, { color: colors.mutedForeground }]}>
                      Due {m.dueDate} · {formatCurrency(m.amount)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </FadeSlideIn>
      )}

      {/* Recent Updates */}
      {business.updates.length > 0 && (
        <FadeSlideIn delay={320}>
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Updates</Text>
            {business.updates.slice(0, 3).map((u) => (
              <View key={u.id} style={[styles.updateRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.updateDot, { backgroundColor: u.type === "milestone" ? "#2db56e" : u.type === "report" ? "#1a5e9a" : "#e08c1a" }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.updateTitle, { color: colors.foreground }]}>{u.title}</Text>
                  <Text style={[styles.updateContent, { color: colors.mutedForeground }]} numberOfLines={2}>{u.content}</Text>
                  <Text style={[styles.updateDate, { color: colors.mutedForeground }]}>{u.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </FadeSlideIn>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  emptyCopy: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular" },
  backBtn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999, marginTop: 6 },
  backBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  backPill: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  backPillText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  hero: { flexDirection: "row", gap: 14, borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 14 },
  avatar: { width: 54, height: 54, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "800", fontFamily: "Inter_700Bold" },
  heroName: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  heroSub: { fontSize: 13, marginTop: 2, fontFamily: "Inter_400Regular" },
  heroBadgeRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  brfrBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  brfrDot: { width: 7, height: 7, borderRadius: 4 },
  brfrBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  trustBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  trustText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard: { width: "47%", borderRadius: 14, padding: 12, gap: 5 },
  statVal: { fontSize: 17, fontWeight: "800", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  section: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 12 },
  sectionVal: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sectionCopy: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular", marginBottom: 12 },
  progressTrack: { height: 7, borderRadius: 100, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", backgroundColor: "#2db56e", borderRadius: 100 },
  progressMeta: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  infoGrid: { gap: 0 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(120,120,120,0.15)" },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right", flexShrink: 1 },
  kybStageLine: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  kybTrack: { flexDirection: "row", gap: 4, marginBottom: 6 },
  kybSegment: { flex: 1, height: 5, borderRadius: 100 },
  kybStageNames: { flexDirection: "row", gap: 4, marginBottom: 14 },
  kybStageName: { flex: 1, fontSize: 9, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 13 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  verifiedBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10 },
  verifiedText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", flex: 1 },
  brfrBtnRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  brfrBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  brfrBtnText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  milestoneRow: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: "flex-start" },
  milestoneBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, alignSelf: "flex-start", marginTop: 2 },
  milestoneBadgeText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  milestoneTitle: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 2 },
  milestoneSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 3, lineHeight: 17 },
  milestoneMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  updateRow: { flexDirection: "row", gap: 12, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, alignItems: "flex-start" },
  updateDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  updateTitle: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  updateContent: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, marginBottom: 3 },
  updateDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
