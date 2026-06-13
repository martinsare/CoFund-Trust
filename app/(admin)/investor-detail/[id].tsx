import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Alert, Dimensions, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { MOCK_INVESTORS, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";
import { SoundManager } from "@/utils/soundManager";

const CARD_W = (Dimensions.get("window").width - 40 - 10) / 2;

type InvestorStatus = "active" | "pending_kyc" | "suspended";
type KycTier = "Tier 1" | "Tier 2" | "Tier 3" | "Pending";

export default function InvestorDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const params = useLocalSearchParams<{ id?: string }>();

  const base = MOCK_INVESTORS.find((item) => item.id === params.id);

  const [status, setStatus]   = useState<InvestorStatus>((base?.status ?? "pending_kyc") as InvestorStatus);
  const [kycTier, setKycTier] = useState<KycTier>((base?.kyc ?? "Pending") as KycTier);

  if (!base) {
    return (
      <View style={[styles.root, styles.center, { backgroundColor: colors.background }]}>
        <Feather name="user-x" size={34} color={colors.mutedForeground} />
        <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Investor not found</Text>
        <Text style={[styles.emptyCopy, { color: colors.mutedForeground }]}>That investor record is no longer available.</Text>
        <PressableScale style={[styles.backButton, { backgroundColor: "#1a5e9a" }]} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go back</Text>
        </PressableScale>
      </View>
    );
  }

  const statusConfig: Record<InvestorStatus, { bg: string; text: string; label: string }> = {
    active:      { bg: "#d6f5e7", text: "#1a7a4a", label: "Active" },
    pending_kyc: { bg: "#fef3dc", text: "#9a5800", label: "Pending KYC" },
    suspended:   { bg: "#fde8e8", text: "#e03e3e", label: "Suspended" },
  };
  const sc = statusConfig[status];

  const stats = [
    { label: "Total invested", value: formatCurrency(base.invested),    icon: "trending-up" as const, tone: "#1a5e9a", bg: "#ddeaf8" },
    { label: "Investments",    value: String(base.investments),          icon: "briefcase" as const,   tone: "#c9860d", bg: "#fff3db" },
    { label: "KYC tier",       value: kycTier,                          icon: "shield" as const,      tone: "#2db56e", bg: "#d6f5e7" },
    { label: "Joined",         value: base.joined,                      icon: "calendar" as const,    tone: "#7c3aed", bg: "#efe4ff" },
  ];

  function handleReviewKyc() {
    Alert.alert(
      "Review KYC",
      `Set verified KYC tier for ${base!.name}`,
      [
        {
          text: "Approve Tier 1",
          onPress: () => {
            setKycTier("Tier 1");
            if (status === "pending_kyc") setStatus("active");
            SoundManager.success();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
        {
          text: "Approve Tier 2",
          onPress: () => {
            setKycTier("Tier 2");
            if (status === "pending_kyc") setStatus("active");
            SoundManager.success();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
        {
          text: "Approve Tier 3",
          onPress: () => {
            setKycTier("Tier 3");
            if (status === "pending_kyc") setStatus("active");
            SoundManager.success();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
        {
          text: "Request More Docs",
          onPress: () => {
            setStatus("pending_kyc");
            SoundManager.pinClick();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert("Requested", `${base!.name} has been notified to submit additional documents.`);
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }

  function handleSuspendToggle() {
    if (status === "suspended") {
      Alert.alert(
        "Reactivate Account",
        `Reactivate ${base!.name}'s account and restore access?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reactivate",
            onPress: () => {
              setStatus("active");
              SoundManager.success();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    } else {
      Alert.alert(
        "Suspend Account",
        `Suspend ${base!.name}'s account? They will lose access until reactivated.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Suspend",
            style: "destructive",
            onPress: () => {
              setStatus("suspended");
              SoundManager.error();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            },
          },
        ]
      );
    }
  }

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(450)} style={styles.topRow}>
        <PressableScale
          style={[styles.backPill, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={16} color={colors.foreground} />
          <Text style={[styles.backPillText, { color: colors.foreground }]}>Back</Text>
        </PressableScale>
        <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(60).duration(450)} style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: status === "active" ? "#1a5e9a" : status === "suspended" ? "#e03e3e" : "#e08c1a" }]}>
          <Text style={styles.avatarText}>{base.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.name, { color: colors.foreground }]}>{base.name}</Text>
          <Text style={[styles.email, { color: colors.mutedForeground }]}>{base.email}</Text>
          <Text style={[styles.country, { color: colors.mutedForeground }]}>{base.country}</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(120).duration(450)} style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg, width: CARD_W }]}>
            <Feather name={item.icon} size={15} color={item.tone} />
            <Text style={[styles.statValue, { color: item.tone }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: item.tone }]}>{item.label}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).duration(450)} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Verification</Text>
        <InfoRow label="KYC tier"       value={kycTier}                        colors={colors} />
        <InfoRow label="Account state"  value={status.replace("_", " ")}       colors={colors} />
        <InfoRow label="Profile access" value="Admin review enabled"            colors={colors} />
        <InfoRow label="Country"        value={base.country}                   colors={colors} />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(240).duration(450)} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Admin Actions</Text>
        <Text style={[styles.sectionCopy, { color: colors.mutedForeground }]}>
          Approve KYC tiers or manage this investor's account status.
        </Text>
        <View style={styles.actionRow}>
          <PressableScale
            style={[styles.primaryAction, { backgroundColor: "#1a5e9a" }]}
            onPress={handleReviewKyc}
          >
            <Feather name="shield" size={14} color="#fff" />
            <Text style={styles.primaryActionText}>Review KYC</Text>
          </PressableScale>
          <PressableScale
            style={[
              styles.secondaryAction,
              status === "suspended"
                ? { backgroundColor: "#d6f5e7", borderColor: "#2db56e" }
                : { backgroundColor: "#fde8e8", borderColor: "#f3b4b4" },
            ]}
            onPress={handleSuspendToggle}
          >
            <Feather name={status === "suspended" ? "user-check" : "slash"} size={14} color={status === "suspended" ? "#1a7a4a" : "#e03e3e"} />
            <Text style={[styles.secondaryActionText, { color: status === "suspended" ? "#1a7a4a" : "#e03e3e" }]}>
              {status === "suspended" ? "Reactivate" : "Suspend"}
            </Text>
          </PressableScale>
        </View>

        {status === "suspended" && (
          <View style={[styles.suspendedBanner, { backgroundColor: "#fde8e8" }]}>
            <Feather name="alert-circle" size={14} color="#e03e3e" />
            <Text style={[styles.suspendedText, { color: "#a30000" }]}>
              This account is currently suspended. The investor cannot log in or make investments.
            </Text>
          </View>
        )}
        {kycTier !== "Pending" && status === "active" && (
          <View style={[styles.approvedBanner, { backgroundColor: "#d6f5e7" }]}>
            <Feather name="check-circle" size={14} color="#1a7a4a" />
            <Text style={[styles.approvedText, { color: "#1a7a4a" }]}>
              {kycTier} approved — investor has full access matching their tier.
            </Text>
          </View>
        )}
      </Animated.View>
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
  backButton: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 999 },
  backButtonText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  backPill: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  backPillText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  hero: { flexDirection: "row", gap: 14, borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 14 },
  avatar: { width: 58, height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  heroCopy: { flex: 1, justifyContent: "center" },
  name: { fontSize: 22, fontWeight: "800", fontFamily: "Inter_700Bold" },
  email: { fontSize: 13, marginTop: 3, fontFamily: "Inter_400Regular" },
  country: { fontSize: 13, marginTop: 3, fontFamily: "Inter_500Medium" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard: { borderRadius: 16, padding: 14, gap: 7 },
  statValue: { fontSize: 17, fontWeight: "800", fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  section: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800", fontFamily: "Inter_700Bold", marginBottom: 10 },
  sectionCopy: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular", marginBottom: 14 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "rgba(120,120,120,0.2)" },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "right", flexShrink: 1 },
  actionRow: { flexDirection: "row", gap: 10, marginTop: 6, marginBottom: 12 },
  primaryAction: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 14 },
  primaryActionText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  secondaryAction: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, borderWidth: 1, paddingHorizontal: 14 },
  secondaryActionText: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  suspendedBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10 },
  suspendedText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  approvedBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 10, borderRadius: 10 },
  approvedText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
});
