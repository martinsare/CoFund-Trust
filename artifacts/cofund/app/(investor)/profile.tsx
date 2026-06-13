import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { INVESTMENTS, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

const MENU_ITEMS = [
  { icon: "shield" as const, label: "KYC Verification", sub: "Identity verified", badge: "Verified", badgeGreen: true },
  { icon: "bell" as const, label: "Notifications", sub: "Manage alerts" },
  { icon: "lock" as const, label: "Security", sub: "Password & 2FA" },
  { icon: "help-circle" as const, label: "Help & Support", sub: "FAQs and contact" },
  { icon: "file-text" as const, label: "Terms & Privacy", sub: "Legal documents" },
];

export default function InvestorProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalInvested = INVESTMENTS.reduce((s, i) => s + i.amountInvested, 0);
  const completedCount = INVESTMENTS.filter((i) => i.status === "completed").length;
  const initials = (user?.name ?? "U").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await logout(); router.replace("/onboarding"); } },
    ]);
  };

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>

      <LinearGradient
        colors={["#0e3d6e", "#1a5e9a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.verifiedBadge}>
            <Feather name="check" size={10} color="#fff" />
          </View>
        </View>
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.profileStats}>
          <View style={styles.profileStat}>
            <Text style={styles.profileStatVal}>{formatCurrency(totalInvested)}</Text>
            <Text style={styles.profileStatLabel}>Invested</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatVal}>{INVESTMENTS.length}</Text>
            <Text style={styles.profileStatLabel}>Investments</Text>
          </View>
          <View style={styles.profileStatDivider} />
          <View style={styles.profileStat}>
            <Text style={styles.profileStatVal}>{completedCount}</Text>
            <Text style={styles.profileStatLabel}>Completed</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <InfoRow icon="phone" label="Phone" value={user?.phone || "Not set"} colors={colors} />
        <InfoRow icon="map-pin" label="Country" value={user?.country || "Nigeria"} colors={colors} />
        <InfoRow icon="user-check" label="Account Type" value="Retail Investor" colors={colors} last />
      </View>

      <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {MENU_ITEMS.map((item, idx) => (
          <Pressable
            key={item.label}
            style={[styles.menuItem, idx < MENU_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
          >
            <View style={[styles.menuIcon, { backgroundColor: colors.primaryXLight }]}>
              <Feather name={item.icon} size={16} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
            </View>
            {item.badge ? (
              <View style={[styles.greenBadge, { backgroundColor: item.badgeGreen ? colors.accentLight : colors.amberLight }]}>
                <Text style={[styles.greenBadgeText, { color: item.badgeGreen ? colors.accentDark : colors.amber }]}>{item.badge}</Text>
              </View>
            ) : (
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            )}
          </Pressable>
        ))}
      </View>

      <Pressable
        style={[styles.logoutBtn, { backgroundColor: colors.destructiveLight, borderColor: "#fca5a5" }]}
        onPress={handleLogout}
      >
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </Pressable>

      <Text style={[styles.version, { color: colors.mutedForeground }]}>CoFund v1.0 • Together, We Grow</Text>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, colors, last }: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; value: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors>; last?: boolean }) {
  return (
    <View style={[styles.infoRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
      <Feather name={icon} size={15} color={colors.mutedForeground} />
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold", marginBottom: 4 },
  profileCard: { borderRadius: 18, padding: 24, alignItems: "center", gap: 4 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  avatarLarge: { width: 72, height: 72, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "800", fontFamily: "Inter_700Bold" },
  verifiedBadge: { position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: "#2db56e", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#1a5e9a" },
  profileName: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 6, fontFamily: "Inter_700Bold" },
  profileEmail: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "Inter_400Regular" },
  profileStats: { flexDirection: "row", alignItems: "center", marginTop: 16, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8 },
  profileStat: { flex: 1, alignItems: "center" },
  profileStatVal: { color: "#fff", fontSize: 17, fontWeight: "800", fontFamily: "Inter_700Bold" },
  profileStatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2, fontFamily: "Inter_400Regular" },
  profileStatDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  infoCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  infoLabel: { fontSize: 13, flex: 1, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  menuCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  menuSub: { fontSize: 12, marginTop: 1, fontFamily: "Inter_400Regular" },
  greenBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 100 },
  greenBadgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14 },
  logoutText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular" },
});
