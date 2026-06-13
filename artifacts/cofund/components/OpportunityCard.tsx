import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Business, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

interface Props {
  business: Business;
  onPress: () => void;
}

export function OpportunityCard({ business, onPress }: Props) {
  const colors = useColors();
  const progress = business.amountRaised / business.fundingGoal;

  const riskConfig: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: colors.accentLight, text: colors.accentDark, label: "Low Risk" },
    medium: { bg: colors.amberLight, text: colors.amber, label: "Medium Risk" },
    high: { bg: colors.destructiveLight, text: colors.destructive, label: "High Risk" },
  };
  const rc = riskConfig[business.riskLevel];

  const typeColors: Record<string, string> = {
    "Profit Share": colors.primary,
    "Fixed Return": colors.purple,
    "Asset-Backed": colors.gold,
    "Asset Leasing": colors.amber,
    "Working Capital": colors.accent,
  };
  const typeColor = typeColors[business.investmentType] ?? colors.primary;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[styles.topBand, { backgroundColor: typeColor }]} />
      <View style={styles.body}>
        <View style={styles.row1}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>{business.name}</Text>
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={11} color={colors.mutedForeground} />
              <Text style={[styles.meta, { color: colors.mutedForeground }]}>{business.location}</Text>
            </View>
          </View>
          <View style={[styles.trustBadge, { backgroundColor: colors.primary }]}>
            <Feather name="shield" size={10} color="#fff" />
            <Text style={styles.trustNum}>{business.trustScore}</Text>
          </View>
        </View>

        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: colors.primaryXLight }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{business.industry}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: rc.bg }]}>
            <Text style={[styles.tagText, { color: rc.text }]}>{rc.label}</Text>
          </View>
          {business.daysLeft <= 14 && (
            <View style={[styles.tag, { backgroundColor: colors.destructiveLight }]}>
              <Feather name="clock" size={10} color={colors.destructive} />
              <Text style={[styles.tagText, { color: colors.destructive }]}>{business.daysLeft}d left</Text>
            </View>
          )}
        </View>

        <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
          <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={[styles.raised, { color: colors.foreground }]}>{formatCurrency(business.amountRaised)} raised</Text>
          <Text style={[styles.percent, { color: colors.mutedForeground }]}>{Math.round(progress * 100)}% of {formatCurrency(business.fundingGoal)}</Text>
        </View>

        <View style={[styles.metrics, { borderTopColor: colors.borderLight }]}>
          <Metric label="ROI" value={business.expectedRoi} color={colors.accent} />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <Metric label="Duration" value={business.duration} color={colors.foreground} />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <Metric label="Min." value={formatCurrency(business.minInvestment)} color={colors.foreground} />
          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
          <Metric label="Investors" value={business.investorCount.toString()} color={colors.foreground} />
        </View>
      </View>
    </Pressable>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  topBand: { height: 4 },
  body: { padding: 16, gap: 10 },
  row1: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  name: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 3 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  meta: { fontSize: 12, fontFamily: "Inter_400Regular" },
  trustBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8 },
  trustNum: { color: "#fff", fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  tagText: { fontSize: 11, fontWeight: "500", fontFamily: "Inter_500Medium" },
  progressTrack: { height: 5, borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 100 },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  raised: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  percent: { fontSize: 11, fontFamily: "Inter_400Regular" },
  metrics: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingTop: 10 },
  metric: { flex: 1, alignItems: "center" },
  metricValue: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  metricLabel: { fontSize: 10, color: "#6a7a96", marginTop: 1, fontFamily: "Inter_400Regular" },
  divider: { width: 1, height: 24 },
});
