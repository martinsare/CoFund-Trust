import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Image, Platform, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { useColors } from "@/hooks/useColors";

const FEATURES = [
  {
    icon: "shield" as const,
    label: "5-Stage KYB Verification",
    desc: "Every SME passes rigorous eligibility, KYB, financial, operational and investment-readiness checks",
  },
  {
    icon: "lock" as const,
    label: "Escrow-Protected Funding",
    desc: "Investor capital is held in escrow and released only on verified milestone completion",
  },
  {
    icon: "activity" as const,
    label: "Real-time Monitoring",
    desc: "BRRF risk classification tracks every business — Green to Red — with early-warning alerts",
  },
  {
    icon: "trending-up" as const,
    label: "Structured Returns",
    desc: "Profit share, fixed return, or asset-backed models with transparent reporting to investors",
  },
];

export default function Onboarding() {
  useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#0e3d6e", "#1a5e9a", "#1a7a4a"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingTop: topPad + 24, paddingBottom: bottomPad + 24 }]}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(700)} style={styles.logoBlock}>
          <Image
            source={require("../assets/images/cofund-logo-transparent.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Invest. Build. Partner. Grow.</Text>
          <Text style={styles.subtitle}>
            Africa's trusted private investment &{"\n"}business growth platform
          </Text>
        </Animated.View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Animated.View key={f.icon + f.label} entering={FadeInDown.delay(260 + i * 100).duration(500)}>
              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={15} color="#2db56e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(720).duration(500)} style={styles.actions}>
          <PressableScale style={styles.btnInvest} onPress={() => router.push("/(auth)/register")}>
            <Feather name="trending-up" size={16} color="#fff" />
            <Text style={styles.btnPrimaryText}>Invest</Text>
          </PressableScale>
          <View style={styles.btnRow}>
            <PressableScale style={[styles.btnHalf, { backgroundColor: "rgba(255,255,255,0.12)", borderColor: "rgba(255,255,255,0.25)" }]} onPress={() => router.push("/(auth)/register")}>
              <Feather name="briefcase" size={15} color="#fff" />
              <Text style={styles.btnHalfText}>Raise Capital</Text>
            </PressableScale>
            <PressableScale style={[styles.btnHalf, { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" }]} onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.btnHalfText}>Sign In</Text>
            </PressableScale>
          </View>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(860).duration(400)} style={styles.bottom}>
          Connecting investors with Africa's best SMEs
        </Animated.Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 24 },
  logoBlock: { alignItems: "center", marginBottom: 24 },
  logoImage: { width: 200, height: 160, marginBottom: 10 },
  tagline: { fontSize: 20, fontWeight: "800", color: "#fff", textAlign: "center", letterSpacing: -0.5, fontFamily: "Inter_700Bold", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "rgba(255,255,255,0.65)", textAlign: "center", lineHeight: 19, maxWidth: 280, fontFamily: "Inter_400Regular" },
  features: { gap: 10, marginBottom: 28 },
  featureRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  featureIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(45,181,110,0.15)", alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 13, fontWeight: "600", color: "#fff", marginBottom: 2, fontFamily: "Inter_600SemiBold" },
  featureDesc: { fontSize: 11, color: "rgba(255,255,255,0.58)", lineHeight: 16, fontFamily: "Inter_400Regular" },
  actions: { gap: 10, marginBottom: 20 },
  btnInvest: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#2db56e", borderRadius: 12, paddingVertical: 15 },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  btnRow: { flexDirection: "row", gap: 10 },
  btnHalf: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 13, borderWidth: 1 },
  btnHalfText: { color: "#fff", fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  bottom: { textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular" },
});
