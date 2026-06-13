import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Alert, Image, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { useAuth } from "@/context/AuthContext";
import { INVESTMENTS, formatCurrency } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

const MENU_SECTIONS = [
  {
    title: "Investing",
    items: [
      { icon: "bar-chart-2" as const, label: "Portfolio Analytics", sub: "View performance insights", onPress: (r: typeof router) => r.push("/investor/analytics") },
      { icon: "repeat" as const, label: "Secondary Market", sub: "Buy & sell investment slots", onPress: (r: typeof router) => r.push("/(investor)/market" as any) },
      { icon: "star" as const, label: "CoFund Pro", sub: "Unlock premium features", badge: "New", badgeAmber: true, onPress: (r: typeof router) => r.push("/investor/pro") },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: "shield" as const, label: "KYC Verification", sub: "Tier 1 — Identity verified", badge: "Tier 1", badgeGreen: true, onPress: (r: typeof router) => r.push("/investor/kyc") },
      { icon: "users" as const, label: "Referral Program", sub: "Earn ₦5,000 per referral", onPress: (r: typeof router) => r.push("/investor/referral") },
      { icon: "message-circle" as const, label: "Messages", sub: "Business communications", onPress: (r: typeof router) => r.push("/investor/messages") },
      { icon: "bell" as const, label: "Notifications", sub: "Manage alerts", onPress: (r: typeof router) => r.push("/notifications") },
    ],
  },
  {
    title: "Support",
    items: [
      { icon: "lock" as const, label: "Security", sub: "Password & 2FA", onPress: (_r: typeof router) => {} },
      { icon: "help-circle" as const, label: "Help & Support", sub: "FAQs and contact", onPress: (_r: typeof router) => {} },
      { icon: "file-text" as const, label: "Terms & Privacy", sub: "Legal documents", onPress: (_r: typeof router) => {} },
    ],
  },
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
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
        <PressableScale
          style={[styles.editBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push("/investor/edit-profile" as any)}
        >
          <Feather name="edit-2" size={14} color={colors.foreground} />
          <Text style={[styles.editBtnText, { color: colors.foreground }]}>Edit</Text>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(80).duration(500)}>
        <LinearGradient
          colors={["#0e3d6e", "#1a5e9a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileCard}
        >
          <PressableScale onPress={() => router.push("/investor/edit-profile" as any)} style={styles.avatarWrap}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Feather name="camera" size={10} color="#fff" />
            </View>
            <View style={styles.verifiedBadge}>
              <Feather name="check" size={10} color="#fff" />
            </View>
          </PressableScale>

          <Text style={styles.profileName}>{user?.name}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          {user?.bio ? (
            <Text style={styles.profileBio}>{user.bio}</Text>
          ) : null}

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
      </Animated.View>

      <FadeSlideIn delay={160}>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <InfoRow icon="phone" label="Phone" value={user?.phone || "Not set"} colors={colors} />
          <InfoRow icon="map-pin" label="Country" value={user?.country || "Nigeria"} colors={colors} />
          <InfoRow icon="user-check" label="Account Type" value="Retail Investor" colors={colors} last />
        </View>
      </FadeSlideIn>

      {MENU_SECTIONS.map((section, si) => (
        <FadeSlideIn key={section.title} delay={240 + si * 80}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>{section.title}</Text>
          <View style={[styles.menuCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {section.items.map((item, idx) => (
              <PressableScale
                key={item.label}
                onPress={() => item.onPress(router)}
                style={[styles.menuItem, idx < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.primaryXLight }]}>
                  <Feather name={item.icon} size={16} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                  <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
                </View>
                {item.badge ? (
                  <View style={[styles.badge, {
                    backgroundColor: item.badgeGreen ? colors.accentLight : item.badgeAmber ? colors.amberLight : colors.primaryLight,
                  }]}>
                    <Text style={[styles.badgeText, {
                      color: item.badgeGreen ? colors.accentDark : item.badgeAmber ? colors.amber : colors.primary,
                    }]}>{item.badge}</Text>
                  </View>
                ) : (
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                )}
              </PressableScale>
            ))}
          </View>
        </FadeSlideIn>
      ))}

      <FadeSlideIn delay={560}>
        <PressableScale
          style={[styles.logoutBtn, { backgroundColor: colors.destructiveLight, borderColor: "#fca5a5" }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
        </PressableScale>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>CoFund v2.0 • Together, We Grow</Text>
      </FadeSlideIn>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, colors, last }: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  last?: boolean;
}) {
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
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  editBtnText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  profileCard: { borderRadius: 18, padding: 24, alignItems: "center", gap: 4 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  avatarImg: { width: 80, height: 80, borderRadius: 24, borderWidth: 3, borderColor: "rgba(255,255,255,0.3)" },
  avatarLarge: { width: 80, height: 80, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 28, fontWeight: "800", fontFamily: "Inter_700Bold" },
  avatarEditBadge: {
    position: "absolute", top: -4, right: -4,
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute", bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: "#2db56e",
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#1a5e9a",
  },
  profileName: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 6, fontFamily: "Inter_700Bold" },
  profileEmail: { color: "rgba(255,255,255,0.65)", fontSize: 13, fontFamily: "Inter_400Regular" },
  profileBio: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center", marginTop: 6, lineHeight: 18, paddingHorizontal: 8 },
  profileStats: { flexDirection: "row", alignItems: "center", marginTop: 16, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8, width: "100%" },
  profileStat: { flex: 1, alignItems: "center" },
  profileStatVal: { color: "#fff", fontSize: 17, fontWeight: "800", fontFamily: "Inter_700Bold" },
  profileStatLabel: { color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 2, fontFamily: "Inter_400Regular" },
  profileStatDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.2)" },
  infoCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 10 },
  infoLabel: { fontSize: 13, flex: 1, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Inter_600SemiBold", marginBottom: 5 },
  menuCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  menuSub: { fontSize: 12, marginTop: 1, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 100 },
  badgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14 },
  logoutText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular" },
});
