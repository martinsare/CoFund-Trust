import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { useColors } from "@/hooks/useColors";

const KYC_TIERS = [
  {
    tier: 1,
    label: "Tier 1 — Basic",
    limit: "₦500K/investment",
    status: "verified" as const,
    requirements: ["Valid NIN or BVN", "Email verification", "Phone number"],
    description: "Identity verified. You can invest up to ₦500,000 per opportunity.",
  },
  {
    tier: 2,
    label: "Tier 2 — Enhanced",
    limit: "₦5M/investment",
    status: "in_progress" as const,
    requirements: ["National ID card or Passport", "Utility bill (last 3 months)", "Bank statement"],
    description: "Enhanced due diligence for larger investments up to ₦5 million.",
  },
  {
    tier: 3,
    label: "Tier 3 — Institutional",
    limit: "Unlimited",
    status: "locked" as const,
    requirements: ["CAC registration documents", "Board resolution", "Audited financials (2 years)"],
    description: "Full institutional access with no investment limits.",
  },
];

export default function KYCScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>KYC Verification</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(500)}>
        <View style={[styles.summaryCard, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
          <View style={styles.summaryTop}>
            <View style={[styles.summaryIcon, { backgroundColor: colors.accentLight }]}>
              <Feather name="shield" size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryTitle, { color: colors.foreground }]}>Tier 1 Verified</Text>
              <Text style={[styles.summaryDesc, { color: colors.mutedForeground }]}>Identity confirmed · Invest up to ₦500K</Text>
            </View>
            <View style={[styles.verifiedBadge, { backgroundColor: colors.accentLight }]}>
              <Feather name="check" size={12} color={colors.accent} />
              <Text style={[styles.verifiedText, { color: colors.accentDark }]}>Verified</Text>
            </View>
          </View>
          <View style={styles.progressRow}>
            {[1, 2, 3].map((t) => (
              <View key={t} style={[styles.progressDot, {
                backgroundColor: t === 1 ? colors.accent : t === 2 ? colors.amberLight : colors.borderLight,
                flex: 1,
                height: 5,
                borderRadius: 3,
                marginHorizontal: 2,
              }]} />
            ))}
          </View>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>1 of 3 tiers completed</Text>
        </View>
      </Animated.View>

      {KYC_TIERS.map((tier, i) => {
        const isVerified = tier.status === "verified";
        const isInProgress = tier.status === "in_progress";
        const isLocked = tier.status === "locked";
        const borderColor = isVerified ? colors.accent : isInProgress ? colors.amber : colors.border;
        const headerBg = isVerified ? colors.accentLight : isInProgress ? colors.amberLight : colors.muted;
        const statusColor = isVerified ? colors.accentDark : isInProgress ? colors.amber : colors.mutedForeground;
        const statusIcon = isVerified ? "check-circle" : isInProgress ? "clock" : "lock";
        const statusLabel = isVerified ? "Verified" : isInProgress ? "In Progress" : "Locked";

        return (
          <FadeSlideIn key={tier.tier} delay={160 + i * 100}>
            <View style={[styles.tierCard, { backgroundColor: colors.card, borderColor }]}>
              <View style={[styles.tierHeader, { backgroundColor: headerBg }]}>
                <Text style={[styles.tierLabel, { color: isVerified ? colors.accentDark : isInProgress ? colors.amber : colors.mutedForeground }]}>
                  {tier.label}
                </Text>
                <View style={styles.tierStatus}>
                  <Feather name={statusIcon} size={14} color={statusColor} />
                  <Text style={[styles.tierStatusText, { color: statusColor }]}>{statusLabel}</Text>
                </View>
              </View>
              <View style={styles.tierBody}>
                <Text style={[styles.tierLimit, { color: colors.foreground }]}>
                  Investment limit: <Text style={{ fontWeight: "700" }}>{tier.limit}</Text>
                </Text>
                <Text style={[styles.tierDesc, { color: colors.mutedForeground }]}>{tier.description}</Text>
                <View style={styles.docList}>
                  {tier.requirements.map((req) => (
                    <View key={req} style={styles.docItem}>
                      <Feather
                        name={isVerified ? "check" : "circle"}
                        size={13}
                        color={isVerified ? colors.accent : colors.mutedForeground}
                      />
                      <Text style={[styles.docText, { color: isVerified ? colors.foreground : colors.mutedForeground }]}>{req}</Text>
                    </View>
                  ))}
                </View>
                {isInProgress && (
                  <PressableScale style={[styles.verifyBtn, { backgroundColor: colors.amber }]}>
                    <Feather name="upload" size={14} color="#fff" />
                    <Text style={styles.verifyBtnText}>Upload Documents</Text>
                  </PressableScale>
                )}
              </View>
            </View>
          </FadeSlideIn>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  summaryCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  summaryTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  summaryIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  summaryTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  summaryDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  verifiedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  verifiedText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  progressRow: { flexDirection: "row", gap: 4 },
  progressDot: {},
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  tierCard: { borderRadius: 14, borderWidth: 1.5, overflow: "hidden" },
  tierHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  tierLabel: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  tierStatus: { flexDirection: "row", alignItems: "center", gap: 5 },
  tierStatusText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  tierBody: { padding: 16, gap: 8 },
  tierLimit: { fontSize: 13, fontFamily: "Inter_400Regular" },
  tierDesc: { fontSize: 12, lineHeight: 18, fontFamily: "Inter_400Regular" },
  docList: { gap: 7, marginTop: 4 },
  docItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  docText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  verifyBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 10, paddingVertical: 12, marginTop: 4 },
  verifyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
