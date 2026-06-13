import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { useAppData } from "@/context/AppDataContext";
import { useColors } from "@/hooks/useColors";

export default function CoFundPro() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { PRO_BENEFITS: BENEFITS, PRO_PLANS: PLANS } = useAppData();
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const selectedPlanData = PLANS.find((p) => p.id === selectedPlan)!;

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
        <View style={{ width: 40 }} />
      </Animated.View>

      <Animated.View entering={ZoomIn.delay(80).duration(500).springify()}>
        <LinearGradient
          colors={["#3b0764", "#7c3aed", "#1a5e9a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.proBadge}>
            <Feather name="star" size={18} color="#fbbf24" />
            <Text style={styles.proBadgeText}>CoFund Pro</Text>
          </View>
          <Text style={styles.heroTitle}>Invest Smarter,{"\n"}Earn More</Text>
          <Text style={styles.heroSub}>
            Unlock premium tools and priority access that give you the edge in African SME investing.
          </Text>
          <View style={styles.heroDeco}>
            <Feather name="star" size={120} color="rgba(255,255,255,0.04)" />
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).duration(500)}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What's included</Text>
        <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {BENEFITS.map((b, i) => (
            <View
              key={b.label}
              style={[styles.benefitRow, i < BENEFITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
            >
              <View style={[styles.benefitIcon, { backgroundColor: "#7c3aed18" }]}>
                <Feather name={b.icon as any} size={16} color="#7c3aed" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.benefitLabel, { color: colors.foreground }]}>{b.label}</Text>
                <Text style={[styles.benefitDesc, { color: colors.mutedForeground }]}>{b.desc}</Text>
              </View>
              <Feather name="check" size={16} color={colors.accent} />
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(340).duration(500)}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Choose a plan</Text>
        <View style={[styles.plansCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {PLANS.map((plan, i) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <PressableScale
                key={plan.id}
                style={[
                  styles.planRow,
                  i < PLANS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                  isSelected && { backgroundColor: "#7c3aed0d" },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {/* Radio indicator */}
                <View style={[
                  styles.radio,
                  { borderColor: isSelected ? "#7c3aed" : colors.border },
                ]}>
                  {isSelected && <View style={styles.radioFill} />}
                </View>

                {/* Label + period */}
                <View style={styles.planMid}>
                  <View style={styles.planNameRow}>
                    <Text style={[styles.planName, { color: isSelected ? "#7c3aed" : colors.foreground }]}>
                      {plan.label}
                    </Text>
                    {plan.popular && (
                      <View style={styles.popularBadge}>
                        <Text style={styles.popularText}>Popular</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>
                    Billed{plan.period}
                  </Text>
                </View>

                {/* Price + saving */}
                <View style={styles.planPriceCol}>
                  {plan.saving && (
                    <View style={[styles.savingBadge, { backgroundColor: isSelected ? "#7c3aed18" : colors.accentLight }]}>
                      <Text style={[styles.savingText, { color: isSelected ? "#7c3aed" : colors.accentDark }]}>
                        {plan.saving}
                      </Text>
                    </View>
                  )}
                  <Text style={[styles.planPrice, { color: isSelected ? "#7c3aed" : colors.foreground }]}>
                    ₦{(plan.price / 1000).toFixed(0)}K
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(460).duration(500)}>
        <PressableScale style={styles.subscribeBtn}>
          <LinearGradient
            colors={["#7c3aed", "#1a5e9a"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.subscribeBtnInner}
          >
            <Feather name="star" size={16} color="#fff" />
            <Text style={styles.subscribeBtnText}>
              Subscribe · ₦{(selectedPlanData.price / 1000).toFixed(0)}K{selectedPlanData.period}
            </Text>
          </LinearGradient>
        </PressableScale>
        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
          Cancel anytime · No hidden fees · Secure via Paystack
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  hero: { borderRadius: 20, padding: 28, overflow: "hidden", gap: 10 },
  proBadge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(251,191,36,0.15)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, alignSelf: "flex-start" },
  proBadgeText: { color: "#fbbf24", fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold", lineHeight: 34 },
  heroSub: { color: "rgba(255,255,255,0.65)", fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular" },
  heroDeco: { position: "absolute", right: -30, top: -30 },
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 5 },
  benefitsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  benefitRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  benefitIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  benefitLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  benefitDesc: { fontSize: 12, marginTop: 1, fontFamily: "Inter_400Regular" },
  plansCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  planRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  radioFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#7c3aed",
  },
  planMid: { flex: 1, gap: 2 },
  planNameRow: { flexDirection: "row", alignItems: "center", gap: 7, flexWrap: "nowrap" },
  planName: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  planPeriod: { fontSize: 12, fontFamily: "Inter_400Regular" },
  planPriceCol: { alignItems: "flex-end", gap: 4, flexShrink: 0 },
  planPrice: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  popularBadge: { backgroundColor: "#fbbf2420", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 100 },
  popularText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold", color: "#fbbf24" },
  savingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  savingText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  subscribeBtn: { borderRadius: 14, overflow: "hidden" },
  subscribeBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  subscribeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  disclaimer: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 8 },
});
