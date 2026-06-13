import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { useAppData } from "@/context/AppDataContext";
import { useColors } from "@/hooks/useColors";

const REFERRAL_CODE = "ADEBAYO-2026";

export default function ReferralScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { MOCK_REFERRAL_HISTORY: HISTORY, REFERRAL_HOW_IT_WORKS: HOW_IT_WORKS } = useAppData();
  const [copied, setCopied] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalEarned = HISTORY.filter((h) => h.status === "invested").reduce((s, h) => s + h.earned, 0);
  const referred = HISTORY.length;
  const converted = HISTORY.filter((h) => h.status === "invested").length;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    Share.share({
      message: `Join CoFund and invest in vetted African SMEs! Use my referral code: ${REFERRAL_CODE}\nhttps://cofund.africa/ref/${REFERRAL_CODE}`,
    });
  };

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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Referral Program</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(500)}>
        <LinearGradient
          colors={["#0e3d6e", "#2db56e"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroEarning}>₦{(totalEarned / 1000).toFixed(0)}K</Text>
          <Text style={styles.heroLabel}>Total Earned</Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{referred}</Text>
              <Text style={styles.heroStatLabel}>Referred</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{converted}</Text>
              <Text style={styles.heroStatLabel}>Invested</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>₦5K</Text>
              <Text style={styles.heroStatLabel}>Per Referral</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <FadeSlideIn delay={180}>
        <View style={[styles.codeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.codeTitle, { color: colors.mutedForeground }]}>Your Referral Code</Text>
          <View style={styles.codeRow}>
            <Text style={[styles.code, { color: colors.foreground }]}>{REFERRAL_CODE}</Text>
            <PressableScale
              style={[styles.copyBtn, { backgroundColor: copied ? colors.accentLight : colors.primaryLight }]}
              onPress={handleCopy}
            >
              <Feather name={copied ? "check" : "copy"} size={14} color={copied ? colors.accentDark : colors.primary} />
              <Text style={[styles.copyText, { color: copied ? colors.accentDark : colors.primary }]}>
                {copied ? "Copied!" : "Copy"}
              </Text>
            </PressableScale>
          </View>
          <PressableScale style={[styles.shareBtn, { backgroundColor: colors.primary }]} onPress={handleShare}>
            <Feather name="share-2" size={15} color="#fff" />
            <Text style={styles.shareBtnText}>Share with Friends</Text>
          </PressableScale>
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={260}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>How it works</Text>
        <View style={styles.howRow}>
          {HOW_IT_WORKS.map((h, i) => (
            <View key={h.step} style={[styles.howCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.howStep, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.howStepText, { color: colors.primary }]}>{h.step}</Text>
              </View>
              <Text style={[styles.howLabel, { color: colors.foreground }]}>{h.label}</Text>
              <Text style={[styles.howDesc, { color: colors.mutedForeground }]}>{h.desc}</Text>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={360}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Referral History</Text>
        <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {HISTORY.map((h, idx) => (
            <View
              key={h.id}
              style={[styles.historyRow, idx < HISTORY.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
            >
              <View style={[styles.historyAvatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.historyAvatarText, { color: colors.primary }]}>{h.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.historyName, { color: colors.foreground }]}>{h.name}</Text>
                <Text style={[styles.historyDate, { color: colors.mutedForeground }]}>Joined {h.joined}</Text>
              </View>
              {h.status === "invested" ? (
                <View style={[styles.earnedBadge, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.earnedText, { color: colors.accentDark }]}>+₦{(h.earned / 1000).toFixed(0)}K</Text>
                </View>
              ) : (
                <View style={[styles.pendingBadge, { backgroundColor: colors.amberLight }]}>
                  <Text style={[styles.pendingText, { color: colors.amber }]}>Pending</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  hero: { borderRadius: 18, padding: 24, gap: 8, alignItems: "center" },
  heroEarning: { color: "#fff", fontSize: 40, fontWeight: "800", letterSpacing: -1.5, fontFamily: "Inter_700Bold" },
  heroLabel: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "Inter_400Regular" },
  heroStats: { flexDirection: "row", alignItems: "center", marginTop: 8, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, gap: 0 },
  heroStat: { flex: 1, alignItems: "center" },
  heroStatVal: { color: "#fff", fontSize: 17, fontWeight: "800", fontFamily: "Inter_700Bold" },
  heroStatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_400Regular" },
  heroStatDivider: { width: 1, height: 28, backgroundColor: "rgba(255,255,255,0.2)" },
  codeCard: { borderRadius: 14, borderWidth: 1, padding: 18, gap: 12 },
  codeTitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "Inter_600SemiBold" },
  codeRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  code: { fontSize: 22, fontWeight: "800", letterSpacing: 1, fontFamily: "Inter_700Bold" },
  copyBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 9 },
  copyText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  shareBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 10, paddingVertical: 13 },
  shareBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 5 },
  howRow: { flexDirection: "row", gap: 10 },
  howCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, gap: 6 },
  howStep: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  howStepText: { fontSize: 14, fontWeight: "800", fontFamily: "Inter_700Bold" },
  howLabel: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  howDesc: { fontSize: 11, lineHeight: 15, fontFamily: "Inter_400Regular" },
  historyCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  historyRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  historyAvatar: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  historyAvatarText: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  historyName: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  earnedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  earnedText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  pendingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  pendingText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
});
