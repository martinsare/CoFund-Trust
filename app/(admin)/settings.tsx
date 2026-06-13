import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function AdminSettings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [autoApproveKyc, setAutoApproveKyc] = useState(false);
  const [notifyOnInvestment, setNotifyOnInvestment] = useState(true);
  const [emailReports, setEmailReports] = useState(true);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Sign out of admin panel?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: async () => { await logout(); router.replace("/onboarding"); } },
    ]);
  };

  const PLATFORM_SETTINGS = [
    {
      label: "Maintenance Mode",
      sub: "Temporarily disable public access to the platform",
      value: maintenanceMode,
      onChange: (v: boolean) => {
        if (v) Alert.alert("Enable Maintenance Mode?", "This will prevent users from accessing CoFund until disabled.", [
          { text: "Cancel", style: "cancel" },
          { text: "Enable", style: "destructive", onPress: () => setMaintenanceMode(true) },
        ]);
        else setMaintenanceMode(false);
      },
      danger: true,
    },
    {
      label: "Auto-Approve Tier 1 KYC",
      sub: "Automatically approve basic identity verification",
      value: autoApproveKyc,
      onChange: setAutoApproveKyc,
      danger: false,
    },
    {
      label: "Notify on New Investment",
      sub: "Receive admin alerts when large investments are made",
      value: notifyOnInvestment,
      onChange: setNotifyOnInvestment,
      danger: false,
    },
    {
      label: "Weekly Email Reports",
      sub: "Send platform performance reports every Monday",
      value: emailReports,
      onChange: setEmailReports,
      danger: false,
    },
  ];

  const ADMIN_INFO = [
    { label: "Admin Name", value: user?.name ?? "—", icon: "user" as const },
    { label: "Email", value: user?.email ?? "—", icon: "mail" as const },
    { label: "Role", value: "Super Admin", icon: "shield" as const },
    { label: "Last Login", value: "Today, 09:00 AM", icon: "clock" as const },
  ];

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(500)} style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
      </Animated.View>

      <FadeSlideIn delay={80}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 0, marginBottom: 0 }]}>Admin Profile</Text>
          <PressableScale
            style={[styles.editBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/(admin)/edit-profile" as any)}
          >
            <Feather name="edit-2" size={13} color={colors.foreground} />
            <Text style={[styles.editBtnText, { color: colors.foreground }]}>Edit</Text>
          </PressableScale>
        </View>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {ADMIN_INFO.map((info, i) => (
            <View key={info.label} style={[styles.infoRow, i < ADMIN_INFO.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
              <View style={[styles.infoIcon, { backgroundColor: "#f3effe" }]}>
                <Feather name={info.icon} size={14} color="#7c3aed" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{info.label}</Text>
                <Text style={[styles.infoValue, { color: colors.foreground }]}>{info.value}</Text>
              </View>
            </View>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={160}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Platform Controls</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PLATFORM_SETTINGS.map((s, i) => (
            <View key={s.label} style={[styles.toggleRow, i < PLATFORM_SETTINGS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[styles.toggleLabel, { color: s.danger && s.value ? "#e03e3e" : colors.foreground }]}>{s.label}</Text>
                <Text style={[styles.toggleSub, { color: colors.mutedForeground }]}>{s.sub}</Text>
              </View>
              <Switch
                value={s.value}
                onValueChange={s.onChange}
                trackColor={{ true: s.danger ? "#e03e3e" : "#7c3aed", false: colors.border }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={240}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Platform Management</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "percent" as const, label: "Fee Structure", sub: "Manage platform fees and commission rates", color: "#c9860d", onPress: () => Alert.alert("Fee Structure", "This needs your fee schedule and commission policy before we can build a live editor.") },
            { icon: "shield" as const, label: "Trust Score Algorithm", sub: "Configure scoring weights and thresholds", color: "#1a5e9a", onPress: () => Alert.alert("Trust Score", "This needs your scoring formula and rule weights before we can build the editor.") },
            { icon: "mail" as const, label: "Email Templates", sub: "Investor and SME notification templates", color: "#2db56e", onPress: () => Alert.alert("Email Templates", "This needs your template copy and delivery provider setup.") },
            { icon: "lock" as const, label: "Security Settings", sub: "2FA, session limits, and access controls", color: "#7c3aed", onPress: () => Alert.alert("Security Settings", "This needs your auth policy and 2FA provider details.") },
            { icon: "database" as const, label: "Data & Backups", sub: "Export platform data and manage backups", color: "#e08c1a", onPress: () => Alert.alert("Data & Backups", "This needs backup storage and export requirements before it can be made live.") },
          ].map((item, i, arr) => (
            <PressableScale
              key={item.label}
              style={[styles.menuItem, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={item.onPress}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
                <Feather name={item.icon} size={16} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </PressableScale>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={300}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Data Tables</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "repeat" as const,       label: "Wallet Transactions", sub: "Add, edit and delete financial records",       color: "#1a5e9a", route: "/(admin)/manage-transactions" },
            { icon: "list" as const,          label: "Market Listings",     sub: "Manage active and pending SME listings",        color: "#7c3aed", route: "/(admin)/manage-listings"    },
            { icon: "alert-circle" as const,  label: "Disputes",            sub: "Review, update and remove dispute records",     color: "#e03e3e", route: "/(admin)/disputes"           },
            { icon: "message-square" as const,label: "Message Threads",     sub: "Manage investor and SME message threads",       color: "#2db56e", route: "/(admin)/manage-threads"    },
          ].map((item, i, arr) => (
            <PressableScale
              key={item.label}
              style={[styles.menuItem, i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + "18" }]}>
                <Feather name={item.icon} size={16} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{item.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
            </PressableScale>
          ))}
        </View>
      </FadeSlideIn>

      <FadeSlideIn delay={380}>
        <PressableScale
          style={[styles.logoutBtn, { backgroundColor: "#fde8e8", borderColor: "#fca5a5" }]}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={16} color="#e03e3e" />
          <Text style={[styles.logoutText, { color: "#e03e3e" }]}>Sign Out of Admin Panel</Text>
        </PressableScale>
        <Text style={[styles.version, { color: colors.mutedForeground }]}>CoFund Admin v2.0 · Together, We Grow</Text>
      </FadeSlideIn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 0 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Inter_600SemiBold", marginBottom: 8, marginTop: 16 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  editBtnText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  card: { borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  infoIcon: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  infoLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  infoValue: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  toggleRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  toggleSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  menuSub: { fontSize: 12, marginTop: 1, fontFamily: "Inter_400Regular" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingVertical: 14, marginTop: 20 },
  logoutText: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  version: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 12 },
});
