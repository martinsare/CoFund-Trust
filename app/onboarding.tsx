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
    label: "Verified Businesses",
    desc: "Every SME is rigorously screened before listing",
  },
  {
    icon: "trending-up" as const,
    label: "Structured Returns",
    desc: "Profit share, fixed return, or asset-backed models",
  },
  {
    icon: "activity" as const,
    label: "Real-time Monitoring",
    desc: "Milestone-based fund release with live dashboards",
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
        style={[styles.gradient, { paddingTop: topPad + 32, paddingBottom: bottomPad + 24 }]}
      >
        <Animated.View entering={FadeInDown.delay(0).duration(700)} style={styles.logoBlock}>
          <Image
            source={require("../assets/images/cofund-logo-transparent.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>
            Africa's trust-first investment platform{"\n"}connecting vetted SMEs with investors
          </Text>
        </Animated.View>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Animated.View key={f.icon} entering={FadeInDown.delay(300 + i * 120).duration(500)}>
              <View style={styles.featureRow}>
                <View style={styles.featureIcon}>
                  <Feather name={f.icon} size={16} color="#2db56e" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureDesc}>{f.desc}</Text>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInUp.delay(680).duration(500)} style={styles.actions}>
          <PressableScale style={styles.btnPrimary} onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </PressableScale>
          <PressableScale style={styles.btnSecondary} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.btnSecondaryText}>Sign In</Text>
          </PressableScale>
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(800).duration(400)} style={styles.bottom}>
          Connecting investors with Africa's best SMEs
        </Animated.Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  gradient: { flex: 1, paddingHorizontal: 28 },
  logoBlock: { alignItems: "center", marginBottom: 36 },
  logoImage: {
    width: 220,
    height: 180,
    marginBottom: 12,
  },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.70)", textAlign: "center", lineHeight: 21, maxWidth: 300, fontFamily: "Inter_400Regular" },
  features: { gap: 14, marginBottom: 40 },
  featureRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 14,
    backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
  },
  featureIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "rgba(45,181,110,0.15)", alignItems: "center", justifyContent: "center" },
  featureLabel: { fontSize: 14, fontWeight: "600", color: "#fff", marginBottom: 2, fontFamily: "Inter_600SemiBold" },
  featureDesc: { fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 17, fontFamily: "Inter_400Regular" },
  actions: { gap: 12, marginBottom: 28 },
  btnPrimary: { backgroundColor: "#2db56e", borderRadius: 12, paddingVertical: 16, alignItems: "center" },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  btnSecondary: {
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 12, paddingVertical: 15,
    alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  btnSecondaryText: { color: "#fff", fontSize: 16, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  bottom: { textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Inter_400Regular" },
});
