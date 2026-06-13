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
import { BUSINESSES } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

export default function BusinessProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const business = BUSINESSES[0];
  const initials = (user?.name ?? "B").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

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
        colors={["#1a7a4a", "#2db56e"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.profileCard}
      >
        <View style={styles.avatarWrap}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={[styles.verBadge, { backgroundColor: business.verificationStatus === "verified" ? colors.primary : colors.amber }]}>
            <Feather name={business.verificationStatus === "verified" ? "check" : "clock"} size={10} color="#fff" />
          </View>
        </View>
        <Text style={styles.profileName}>{user?.name}</Text>
        <Text style={styles.profileBiz}>{user?.businessName ?? business.name}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={[styles.verStatus, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="shield" size={13} color="#fff" />
          <Text style={styles.verText}>
            {business.verificationStatus === "verified" ? "Verified Business" : "Verification Pending"}
          </Text>
        </View>
      </LinearGradient>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.cardTitle, { color: colors.foreground }]}>Business Details</Text>
        {[
          { label: "Industry", value: business.industry },
          { label: "Location", value: business.location },
          { label: "Years Operating", value: `${business.yearsOperating} years` },
          { label: "Investment Type", value: business.investmentType },
          { label: "Risk Category", value: `Category ${business.riskCategory}` },
        ].map((row, idx, arr) => (
          <View key={row.label} style={[styles.row, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
            <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
            <Text style={[styles.rowValue, { color: colors.foreground }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { icon: "settings" as const, label: "Business Settings", sub: "Update business info" },
          { icon: "bell" as const, label: "Notifications", sub: "Investor alerts" },
          { icon: "lock" as const, label: "Security", sub: "Password & 2FA" },
          { icon: "help-circle" as const, label: "Help & Support", sub: "Contact CoFund team" },
        ].map((item, idx, arr) => (
          <Pressable key={item.label} style={[styles.menuItem, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
            <View style={[styles.menuIcon, { backgroundColor: colors.accentLight }]}>
              <Feather name={item.icon} size={16} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 14 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold", marginBottom: 4 },
  profileCard: { borderRadius: 18, padding: 24, alignItems: "center", gap: 4 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  avatarLarge: { width: 72, height: 72, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "800", fontFamily: "Inter_700Bold" },
  verBadge: { position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#2db56e" },
  profileName: { color: "#fff", fontSize: 19, fontWeight: "700", marginTop: 6, fontFamily: "Inter_700Bold" },
  profileBiz: { color: "rgba(255,255,255,0.85)", fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  profileEmail: { color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "Inter_400Regular" },
  verStatus: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 100, marginTop: 8 },
  verText: { color: "#fff", fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  cardTitle: { fontSize: 14, fontWeight: "700", padding: 14, paddingBottom: 8, fontFamily: "Inter_700Bold" },
  row: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11 },
  rowLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  rowValue: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  menuSub: { fontSize: 12, marginTop: 1, fontFamily: "Inter_400Regular" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14 },
  logoutText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular" },
});
