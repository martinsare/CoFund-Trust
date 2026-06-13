import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { DisputeStatus } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";

const FILTERS: { id: DisputeStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "under_review", label: "Under Review" },
  { id: "escalated", label: "Escalated" },
  { id: "resolved", label: "Resolved" },
];

export default function AdminDisputes() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { disputes, updateDispute } = useSystemData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [filter, setFilter] = useState<DisputeStatus | "all">("all");

  const filtered = useMemo(
    () => disputes.filter((dispute) => filter === "all" || dispute.status === filter),
    [disputes, filter]
  );

  const counts = {
    open: disputes.filter((d) => d.status === "open").length,
    review: disputes.filter((d) => d.status === "under_review").length,
    escalated: disputes.filter((d) => d.status === "escalated").length,
    resolved: disputes.filter((d) => d.status === "resolved").length,
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Disputes</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Investor concerns, business responses, and admin resolution.</Text>
        </View>
        <PressableScale style={[styles.createBtn, { backgroundColor: "#7c3aed" }]} onPress={() => router.push("/(admin)/create-business")}>
          <Feather name="plus" size={14} color="#fff" />
          <Text style={styles.createBtnText}>Create Business</Text>
        </PressableScale>
      </Animated.View>

      <FadeSlideIn delay={80}>
        <View style={styles.statsRow}>
          {[
            { label: "Open", value: counts.open, bg: "#fde8e8", text: "#e03e3e" },
            { label: "Review", value: counts.review, bg: "#fef3dc", text: "#9a5800" },
            { label: "Escalated", value: counts.escalated, bg: "#fde8d0", text: "#a63400" },
            { label: "Resolved", value: counts.resolved, bg: "#d6f5e7", text: "#1a7a4a" },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg }]}>
              <Text style={[styles.statVal, { color: item.text }]}>{item.value}</Text>
              <Text style={[styles.statLabel, { color: item.text }]}>{item.label}</Text>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={140}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((item) => (
            <PressableScale
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={[
                styles.filterChip,
                { backgroundColor: filter === item.id ? "#7c3aed" : colors.card, borderColor: filter === item.id ? "#7c3aed" : colors.border },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === item.id ? "#fff" : colors.mutedForeground }]}>{item.label}</Text>
            </PressableScale>
          ))}
        </ScrollView>
      </FadeSlideIn>

      <FadeSlideIn delay={200}>
        <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="alert-circle" size={14} color="#e03e3e" />
          <Text style={[styles.summaryText, { color: colors.foreground }]}>
            Open disputes should be routed to the business owner first, then escalated to the admin review queue if no response is logged.
          </Text>
        </View>
      </FadeSlideIn>

      {filtered.map((dispute, index) => (
        <FadeSlideIn key={dispute.id} delay={260 + index * 60}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reference, { color: colors.mutedForeground }]}>{dispute.reference}</Text>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{dispute.subject}</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{dispute.businessName} • {dispute.investorName}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: dispute.status === "resolved" ? "#d6f5e7" : dispute.status === "open" ? "#fde8e8" : "#fef3dc" }]}>
                <Text style={[styles.statusText, { color: dispute.status === "resolved" ? "#1a7a4a" : dispute.status === "open" ? "#e03e3e" : "#9a5800" }]}>
                  {dispute.status.replace("_", " ")}
                </Text>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Meta icon="tag" label={dispute.category} colors={colors} />
              <Meta icon="flag" label={`Priority ${dispute.priority}`} colors={colors} />
              <Meta icon="paperclip" label={`${dispute.evidenceCount} attachments`} colors={colors} />
              <Meta icon="calendar" label={dispute.createdAt} colors={colors} />
            </View>

            <Text style={[styles.details, { color: colors.mutedForeground }]}>{dispute.details}</Text>
            {dispute.response ? (
              <View style={[styles.responseBox, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
                <Feather name="message-square" size={13} color={colors.primary} />
                <Text style={[styles.responseText, { color: colors.primary }]}>{dispute.response}</Text>
              </View>
            ) : null}

            <View style={styles.actionsRow}>
              <PressableScale
                style={[styles.actionBtn, { backgroundColor: "#ddeaf8", borderColor: "#1a5e9a" }]}
                onPress={() => {
                  updateDispute(dispute.id, { status: "under_review" });
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <Feather name="eye" size={13} color="#1a5e9a" />
                <Text style={[styles.actionText, { color: "#1a5e9a" }]}>Review</Text>
              </PressableScale>
              <PressableScale
                style={[styles.actionBtn, { backgroundColor: "#d6f5e7", borderColor: "#2db56e" }]}
                onPress={() => {
                  updateDispute(dispute.id, { status: "resolved" });
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <Feather name="check" size={13} color="#2db56e" />
                <Text style={[styles.actionText, { color: "#2db56e" }]}>Resolve</Text>
              </PressableScale>
              <PressableScale
                style={[styles.actionBtn, { flex: 1, backgroundColor: "#fde8e8", borderColor: "#e03e3e" }]}
                onPress={() => router.push("/(business)/disputes")}
              >
                <Feather name="external-link" size={13} color="#e03e3e" />
                <Text style={[styles.actionText, { color: "#e03e3e" }]}>Open Business View</Text>
              </PressableScale>
            </View>
          </View>
        </FadeSlideIn>
      ))}

      {!filtered.length ? (
        <View style={styles.empty}>
          <Feather name="check-circle" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No disputes in this filter</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>New investor concerns will show up here automatically.</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Meta({ icon, label, colors }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon} size={11} color={colors.mutedForeground} />
      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2, maxWidth: 240 },
  createBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  createBtnText: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 10, padding: 10, alignItems: "center" },
  statVal: { fontSize: 18, fontWeight: "800", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 10, fontWeight: "500", fontFamily: "Inter_500Medium", marginTop: 1 },
  filterRow: { gap: 8, paddingBottom: 12 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  summary: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 12 },
  summaryText: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  reference: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  cardTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  statusText: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold", textTransform: "capitalize" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  details: { fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  responseBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  responseText: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  actionsRow: { flexDirection: "row", gap: 8, paddingTop: 2 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  actionText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", gap: 8, paddingVertical: 50 },
  emptyTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
});
