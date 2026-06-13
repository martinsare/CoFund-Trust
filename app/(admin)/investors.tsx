import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";
import { router } from "expo-router";

export const MOCK_INVESTORS = [
  { id: "1", name: "Adebayo Okafor", email: "investor@cofund.africa", country: "Nigeria", kyc: "Tier 2", invested: 2500000, investments: 4, joined: "Jan 2025", status: "active" },
  { id: "2", name: "Chioma Eze", email: "chioma.eze@gmail.com", country: "Nigeria", kyc: "Tier 1", invested: 850000, investments: 2, joined: "Feb 2025", status: "active" },
  { id: "3", name: "Kwame Mensah", email: "kwame.m@outlook.com", country: "Ghana", kyc: "None", invested: 0, investments: 0, joined: "Mar 2025", status: "pending_kyc" },
  { id: "4", name: "Fatima Al-Hassan", email: "fatima.h@proton.me", country: "Nigeria", kyc: "Tier 1", invested: 1200000, investments: 3, joined: "Jan 2025", status: "active" },
  { id: "5", name: "Emeka Obi", email: "emeka.obi@yahoo.com", country: "Nigeria", kyc: "Tier 2", invested: 5000000, investments: 7, joined: "Nov 2024", status: "active" },
  { id: "6", name: "Amina Yusuf", email: "aminayusuf@gmail.com", country: "Nigeria", kyc: "None", invested: 0, investments: 0, joined: "Apr 2025", status: "suspended" },
];

const FILTER_OPTIONS = ["All", "Active", "Pending KYC", "Suspended"];

export default function AdminInvestors() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const [investors, setInvestors] = useState(MOCK_INVESTORS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = investors.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    if (filter === "Active") return matchSearch && u.status === "active";
    if (filter === "Pending KYC") return matchSearch && u.status === "pending_kyc";
    if (filter === "Suspended") return matchSearch && u.status === "suspended";
    return matchSearch;
  });

  const totalInvested = investors.reduce((s, u) => s + u.invested, 0);
  const activeCount = investors.filter((u) => u.status === "active").length;

  const reviewInvestor = (id: string) => {
    setInvestors((prev) => prev.map((u) => (u.id === id ? { ...u, status: "active", kyc: "Tier 1" } : u)));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Investors</Text>
        <View style={[styles.totalBadge, { backgroundColor: "#ddeaf8" }]}>
          <Text style={[styles.totalText, { color: "#1a5e9a" }]}>{MOCK_INVESTORS.length} total</Text>
        </View>
      </Animated.View>

      <FadeSlideIn delay={80}>
        <View style={styles.summaryRow}>
          {[
            { label: "Active", value: activeCount, color: "#2db56e", bg: "#d6f5e7" },
            { label: "Total Invested", value: formatCurrency(totalInvested), color: "#1a5e9a", bg: "#ddeaf8", small: true },
            { label: "Avg Investment", value: formatCurrency(totalInvested / activeCount), color: "#c9860d", bg: "#fff3db", small: true },
          ].map((s) => (
            <View key={s.label} style={[styles.summaryCard, { backgroundColor: s.bg }]}>
              <Text style={[styles.summaryVal, { color: s.color, fontSize: s.small ? 13 : 20 }]}>{s.value}</Text>
              <Text style={[styles.summaryLabel, { color: s.color }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={140}>
        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search investors…"
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

      <FadeSlideIn delay={180}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTER_OPTIONS.map((f) => (
            <PressableScale
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                { backgroundColor: filter === f ? "#1a5e9a" : colors.card, borderColor: filter === f ? "#1a5e9a" : colors.border },
              ]}
            >
              <Text style={[styles.filterText, { color: filter === f ? "#fff" : colors.mutedForeground }]}>{f}</Text>
            </PressableScale>
          ))}
        </ScrollView>
      </FadeSlideIn>

      {filtered.map((inv, i) => (
        <FadeSlideIn key={inv.id} delay={240 + i * 50}>
          <PressableScale
            style={[styles.investorCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push({ pathname: "/(admin)/investor-detail/[id]", params: { id: inv.id } } as any)}
          >
            <View style={styles.invTop}>
              <View style={[styles.invAvatar, { backgroundColor: inv.status === "active" ? "#1a5e9a" : inv.status === "suspended" ? "#e03e3e" : "#e08c1a" }]}>
                <Text style={styles.invAvatarText}>{inv.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.invName, { color: colors.foreground }]}>{inv.name}</Text>
                <Text style={[styles.invEmail, { color: colors.mutedForeground }]}>{inv.email}</Text>
              </View>
              <StatusBadge status={inv.status} colors={colors} />
            </View>
            <View style={styles.invMeta}>
              <MetaItem icon="map-pin" label={inv.country} colors={colors} />
              <MetaItem icon="shield" label={`KYC ${inv.kyc}`} colors={colors} />
              <MetaItem icon="trending-up" label={formatCurrency(inv.invested)} colors={colors} />
              <MetaItem icon="calendar" label={`Joined ${inv.joined}`} colors={colors} />
            </View>
            <View style={styles.invFooter}>
              <Text style={[styles.invFooterText, { color: colors.mutedForeground }]}>Tap to open full profile</Text>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </View>
            {inv.status === "pending_kyc" && (
              <PressableScale
                style={[styles.kycBtn, { backgroundColor: "#ddeaf8", borderColor: "#1a5e9a" }]}
                onPress={() => reviewInvestor(inv.id)}
              >
                <Feather name="shield" size={13} color="#1a5e9a" />
                <Text style={[styles.kycBtnText, { color: "#1a5e9a" }]}>Review KYC Documents</Text>
              </PressableScale>
            )}
          </PressableScale>
        </FadeSlideIn>
      ))}

      {filtered.length === 0 && (
        <View style={styles.empty}>
          <Feather name="users" size={36} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No investors found</Text>
        </View>
      )}
    </ScrollView>
  );
}

function MetaItem({ icon, label, colors }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={styles.metaItem}>
      <Feather name={icon} size={11} color={colors.mutedForeground} />
      <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function StatusBadge({ status, colors }: { status: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    active: { bg: "#d6f5e7", text: "#1a7a4a", label: "Active" },
    pending_kyc: { bg: "#fef3dc", text: "#9a5800", label: "Pending KYC" },
    suspended: { bg: "#fde8e8", text: "#e03e3e", label: "Suspended" },
  };
  const s = map[status] ?? map.active;
  return (
    <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
      <Text style={[styles.statusText, { color: s.text }]}>{s.label}</Text>
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
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryCard: { flex: 1, borderRadius: 10, padding: 12, alignItems: "center" },
  summaryVal: { fontWeight: "800", fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 11, fontWeight: "500", fontFamily: "Inter_500Medium", marginTop: 2 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filterRow: { gap: 8, paddingBottom: 14 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  investorCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  invTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  invAvatar: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  invAvatarText: { color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: "Inter_700Bold" },
  invName: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  invEmail: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  statusText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  invMeta: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  invFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  invFooterText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  kycBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 9, borderWidth: 1 },
  kycBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  empty: { alignItems: "center", gap: 12, paddingVertical: 60 },
  emptyText: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
