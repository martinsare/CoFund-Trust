import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { BUSINESSES, INVESTMENTS, formatCurrency } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";

export default function BusinessInvestors() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentBusiness } = useSystemData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const business = currentBusiness ?? BUSINESSES[0];
  const backers = INVESTMENTS.filter((inv) => inv.businessId === business.id);
  const totalRaised = backers.reduce((sum, inv) => sum + inv.amountInvested, 0);

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Investors</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>{backers.length} active backers</Text>
        </View>
        <PressableScale style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color={colors.foreground} />
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(500)}>
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Raised from Backers</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]}>{formatCurrency(totalRaised)}</Text>
            </View>
            <View style={[styles.summaryBadge, { backgroundColor: "#ddeaf8" }]}>
              <Text style={[styles.summaryBadgeText, { color: "#1a5e9a" }]}>{business.trustScore} Trust</Text>
            </View>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(totalRaised / business.fundingGoal) * 100}%`, backgroundColor: "#2db56e" }]} />
          </View>
          <Text style={[styles.summaryFoot, { color: colors.mutedForeground }]}>
            Funding goal progress for {business.name}
          </Text>
        </View>
      </Animated.View>

      <FadeSlideIn delay={160}>
        <View style={styles.listHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Current Backers</Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>{formatCurrency(business.amountRaised)} committed</Text>
        </View>
      </FadeSlideIn>

      {backers.map((inv, i) => (
        <FadeSlideIn key={inv.id} delay={220 + i * 60}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardTop}>
              <View style={[styles.avatar, { backgroundColor: "#2db56e" }]}>
                <Text style={styles.avatarText}>{inv.businessName.slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{inv.businessName}</Text>
                <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>{inv.industry}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: inv.status === "active" ? "#d6f5e7" : "#fef3dc" }]}>
                <Text style={[styles.statusText, { color: inv.status === "active" ? "#1a7a4a" : "#9a5800" }]}>{inv.status}</Text>
              </View>
            </View>
            <View style={styles.metaRow}>
              <Meta icon="trending-up" label={formatCurrency(inv.amountInvested)} colors={colors} />
              <Meta icon="calendar" label={inv.investmentDate} colors={colors} />
              <Meta icon="percent" label={inv.roi} colors={colors} />
              <Meta icon="clock" label={inv.maturityDate} colors={colors} />
            </View>
          </View>
        </FadeSlideIn>
      ))}

      {!backers.length && (
        <View style={styles.empty}>
          <Feather name="users" size={34} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No backers yet</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>This screen will fill once investor records are connected.</Text>
        </View>
      )}
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
  content: { paddingHorizontal: 20, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  backBtn: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  summaryTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 24, fontWeight: "800", fontFamily: "Inter_700Bold", marginTop: 2 },
  summaryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  summaryBadgeText: { fontSize: 12, fontWeight: "700", fontFamily: "Inter_700Bold" },
  progressTrack: { height: 8, borderRadius: 100, backgroundColor: "#e9eef5", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 100 },
  summaryFoot: { fontSize: 12, fontFamily: "Inter_400Regular" },
  listHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  sectionSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 12, fontWeight: "800", fontFamily: "Inter_700Bold" },
  cardTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", gap: 8, paddingVertical: 60 },
  emptyText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  emptySub: { fontSize: 13, textAlign: "center", fontFamily: "Inter_400Regular" },
});
