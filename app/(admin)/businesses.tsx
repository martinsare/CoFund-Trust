import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { BUSINESSES, BrfrStatus, KYB_STAGES } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

type Filter = "All" | "Verified" | "Pending KYB" | "At Risk";

const FILTER_OPTIONS: Filter[] = ["All", "Verified", "Pending KYB", "At Risk"];

const BRFR_CONFIG: Record<BrfrStatus, { label: string; color: string; bg: string; dot: string }> = {
  green:  { label: "Healthy",     color: "#1a7a4a", bg: "#d6f5e7", dot: "#2db56e" },
  yellow: { label: "Watch",       color: "#9a5800", bg: "#fef3dc", dot: "#e08c1a" },
  orange: { label: "At Risk",     color: "#a63400", bg: "#fde8d0", dot: "#e06030" },
  red:    { label: "Critical",    color: "#a30000", bg: "#fde8e8", dot: "#e03e3e" },
};

export default function AdminBusinesses() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = BUSINESSES.filter((b) => {
    const matchSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.industry.toLowerCase().includes(search.toLowerCase());
    if (filter === "Verified") return matchSearch && b.verificationStatus === "verified";
    if (filter === "Pending KYB") return matchSearch && b.verificationStatus !== "verified";
    if (filter === "At Risk") return matchSearch && (b.brfrStatus === "orange" || b.brfrStatus === "red");
    return matchSearch;
  });

  const verifiedCount = BUSINESSES.filter((b) => b.verificationStatus === "verified").length;
  const pendingCount  = BUSINESSES.filter((b) => b.verificationStatus !== "verified").length;
  const atRiskCount   = BUSINESSES.filter((b) => b.brfrStatus === "orange" || b.brfrStatus === "red").length;
  const watchCount    = BUSINESSES.filter((b) => b.brfrStatus === "yellow").length;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Businesses</Text>
        <View style={[styles.totalBadge, { backgroundColor: "#f3effe" }]}>
          <Text style={[styles.totalText, { color: "#7c3aed" }]}>{BUSINESSES.length} total</Text>
        </View>
      </Animated.View>

      <FadeSlideIn delay={80}>
        <View style={styles.summaryRow}>
          {[
            { label: "Verified",    value: verifiedCount, color: "#1a7a4a", bg: "#d6f5e7" },
            { label: "Pending KYB", value: pendingCount,  color: "#9a5800", bg: "#fef3dc" },
            { label: "Watch",       value: watchCount,    color: "#a63400", bg: "#fde8d0" },
            { label: "At Risk",     value: atRiskCount,   color: "#a30000", bg: "#fde8e8" },
          ].map((s) => (
            <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.summaryVal, { color: s.color }]}>{s.value}</Text>
              <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={120}>
        <View style={[styles.brfrKey, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.brfrKeyTitle, { color: colors.mutedForeground }]}>BRRF Status</Text>
          <View style={styles.brfrKeyRow}>
            {(Object.entries(BRFR_CONFIG) as [BrfrStatus, typeof BRFR_CONFIG["green"]][]).map(([key, cfg]) => (
              <View key={key} style={styles.brfrKeyItem}>
                <View style={[styles.brfrDot, { backgroundColor: cfg.dot }]} />
                <Text style={[styles.brfrKeyLabel, { color: colors.mutedForeground }]}>{cfg.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={160}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search businesses…"
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <PressableScale onPress={() => setSearch("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </PressableScale>
          ) : null}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={200}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTER_OPTIONS.map((f) => (
            <PressableScale
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                { backgroundColor: filter === f ? "#7c3aed" : colors.card, borderColor: filter === f ? "#7c3aed" : colors.border },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#fff" : colors.mutedForeground }]}>{f}</Text>
            </PressableScale>
          ))}
        </ScrollView>
      </FadeSlideIn>

      {filtered.map((b, i) => {
        const brfr = BRFR_CONFIG[b.brfrStatus];
        return (
          <FadeSlideIn key={b.id} delay={260 + i * 60}>
            <PressableScale style={[styles.bizCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.bizTop}>
                <View style={[styles.bizAvatar, { backgroundColor: brfr.dot }]}>
                  <Text style={styles.bizAvatarText}>{b.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bizName, { color: colors.foreground }]}>{b.name}</Text>
                  <Text style={[styles.bizIndustry, { color: colors.mutedForeground }]}>{b.industry} · {b.location}</Text>
                </View>
                <View style={styles.badges}>
                  <VerBadge status={b.verificationStatus} colors={colors} />
                  <View style={[styles.brfrBadge, { backgroundColor: brfr.bg }]}>
                    <View style={[styles.brfrDot, { backgroundColor: brfr.dot }]} />
                    <Text style={[styles.brfrBadgeText, { color: brfr.color }]}>{brfr.label}</Text>
                  </View>
                </View>
              </View>

              <KybStageBar stage={b.kybStage} colors={colors} />

              <View style={[styles.bizProgress, { backgroundColor: colors.borderLight }]}>
                <View style={[styles.bizProgressFill, { width: `${(b.amountRaised / b.fundingGoal) * 100}%`, backgroundColor: "#2db56e" }]} />
              </View>

              <View style={styles.bizBottom}>
                <View style={styles.bizMeta}>
                  <Feather name="shield" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.bizMetaText, { color: colors.mutedForeground }]}>Trust {b.trustScore}</Text>
                </View>
                <View style={styles.bizMeta}>
                  <Feather name="users" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.bizMetaText, { color: colors.mutedForeground }]}>{b.investorCount} investors</Text>
                </View>
                <View style={styles.bizMeta}>
                  <Feather name="trending-up" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.bizMetaText, { color: colors.mutedForeground }]}>{b.expectedRoi} ROI</Text>
                </View>
                <View style={styles.bizMeta}>
                  <Feather name="users" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.bizMetaText, { color: colors.mutedForeground }]}>{b.employeeCount} staff</Text>
                </View>
              </View>

              {b.verificationStatus !== "verified" && (
                <View style={styles.actionRow}>
                  <PressableScale style={[styles.actionBtn, { backgroundColor: "#d6f5e7", borderColor: "#2db56e" }]}>
                    <Feather name="check" size={13} color="#2db56e" />
                    <Text style={[styles.actionBtnText, { color: "#2db56e" }]}>Approve</Text>
                  </PressableScale>
                  <PressableScale style={[styles.actionBtn, { backgroundColor: "#fde8e8", borderColor: "#e03e3e" }]}>
                    <Feather name="x" size={13} color="#e03e3e" />
                    <Text style={[styles.actionBtnText, { color: "#e03e3e" }]}>Reject</Text>
                  </PressableScale>
                  <PressableScale style={[styles.actionBtn, { flex: 1, backgroundColor: "#ddeaf8", borderColor: "#1a5e9a" }]}>
                    <Feather name="file-text" size={13} color="#1a5e9a" />
                    <Text style={[styles.actionBtnText, { color: "#1a5e9a" }]}>Review Docs</Text>
                  </PressableScale>
                </View>
              )}

              {(b.brfrStatus === "orange" || b.brfrStatus === "red") && (
                <View style={[styles.brfrAlert, { backgroundColor: "#fde8d0", borderColor: "#e06030" }]}>
                  <Feather name="alert-triangle" size={13} color="#a63400" />
                  <Text style={[styles.brfrAlertText, { color: "#a63400" }]}>
                    BRRF flag active — increased monitoring required. Recovery plan pending.
                  </Text>
                </View>
              )}
            </PressableScale>
          </FadeSlideIn>
        );
      })}

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Feather name="briefcase" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No businesses found</Text>
        </View>
      )}
    </ScrollView>
  );
}

function KybStageBar({ stage, colors }: { stage: number; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={styles.kybWrap}>
      <Text style={[styles.kybLabel, { color: colors.mutedForeground }]}>
        KYB Stage {stage}/5 — {KYB_STAGES[stage - 1]}
      </Text>
      <View style={styles.kybTrack}>
        {[1, 2, 3, 4, 5].map((s) => (
          <View
            key={s}
            style={[
              styles.kybSegment,
              {
                backgroundColor:
                  s < stage ? "#2db56e" : s === stage ? "#1a5e9a" : colors.borderLight,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

function VerBadge({ status, colors }: { status: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    verified: { bg: "#d6f5e7", text: "#1a7a4a", label: "Verified" },
    pending:  { bg: "#fef3dc", text: "#9a5800", label: "Pending" },
    partial:  { bg: "#ddeaf8", text: "#1a5e9a", label: "Partial" },
  };
  const s = map[status] ?? { bg: "#ddeaf8", text: "#1a5e9a", label: "Review" };
  return (
    <View style={[styles.verBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.verText, { color: s.text }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold", flex: 1 },
  totalBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  totalText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  summaryCard: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  summaryVal: { fontSize: 18, fontWeight: "800", fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 10, fontWeight: "500", fontFamily: "Inter_500Medium", marginTop: 1 },
  brfrKey: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12 },
  brfrKeyTitle: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  brfrKeyRow: { flex: 1, flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  brfrKeyItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  brfrKeyLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterRow: { gap: 8, paddingBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  bizCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  bizTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  bizAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  bizAvatarText: { color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: "Inter_700Bold" },
  bizName: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  bizIndustry: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  badges: { gap: 4, alignItems: "flex-end" },
  verBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  verText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  brfrBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  brfrDot: { width: 7, height: 7, borderRadius: 4 },
  brfrBadgeText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  kybWrap: { gap: 5 },
  kybLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  kybTrack: { flexDirection: "row", gap: 4 },
  kybSegment: { flex: 1, height: 4, borderRadius: 100 },
  bizProgress: { height: 4, borderRadius: 100, overflow: "hidden" },
  bizProgressFill: { height: "100%", borderRadius: 100 },
  bizBottom: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  bizMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  bizMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actionRow: { flexDirection: "row", gap: 8, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#f0f6fd" },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  brfrAlert: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 8, borderWidth: 1 },
  brfrAlertText: { flex: 1, fontSize: 12, lineHeight: 16, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
