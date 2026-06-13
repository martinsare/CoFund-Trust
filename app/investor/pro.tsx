import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { useColors } from "@/hooks/useColors";

const BENEFITS = [
  { icon: "zap" as const, label: "Early Access", desc: "Get 24-hour early access to new investment listings" },
  { icon: "bar-chart-2" as const, label: "Advanced Analytics", desc: "Deep portfolio analysis with risk scores and projections" },
  { icon: "repeat" as const, label: "Priority Market", desc: "First pick on Secondary Market listings at par value" },
  { icon: "shield" as const, label: "Investment Insurance", desc: "Up to ₦2M coverage on eligible investments" },
  { icon: "headphones" as const, label: "Dedicated Support", desc: "Priority chat & phone support with 2-hour response SLA" },
];

const PLANS = [
  { id: "monthly", label: "Monthly", price: 5000, period: "/month", saving: null, popular: false },
  { id: "quarterly", label: "Quarterly", price: 12000, period: "/3 months", saving: "Save 20%", popular: true },
  { id: "annual", label: "Annual", price: 40000, period: "/year", saving: "Save 33%", popular: false },
];

export default function CoFundPro() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
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

      <Animated.View entering={FadeInDown.delay(200).duration(500)}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>What's included</Text>
        <View style={[styles.benefitsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {BENEFITS.map((b, i) => (
            <View
              key={b.label}
              style={[styles.benefitRow, i < BENEFITS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}
            >
              <View style={[styles.benefitIcon, { backgroundColor: "#7c3aed18" }]}>
                <Feather name={b.icon} size={16} color="#7c3aed" />
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
        <View style={styles.plans}>
          {PLANS.map((plan, index) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <Animated.View
                key={plan.id}
                entering={FadeInDown.delay(340 + index * 60).duration(400)}
              >
                <PressableScale
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: isSelected ? "#7c3aed" : colors.card,
                      borderColor: isSelected ? "#7c3aed" : plan.popular ? "#7c3aed40" : colors.border,
                      borderWidth: isSelected ? 2 : plan.popular ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPlan(plan.id)}
                >
                  <View style={styles.planLeft}>
                    <View style={styles.planLabelRow}>
                      <Text style={[styles.planLabel, { color: isSelected ? "rgba(255,255,255,0.85)" : colors.foreground }]}>
                        {plan.label}
                      </Text>
                      {plan.popular && (
                        <View style={[styles.popularBadge, { backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "#fbbf2420" }]}>
                          <Text style={[styles.popularText, { color: isSelected ? "#fff" : "#fbbf24" }]}>Popular</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.planPeriod, { color: isSelected ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>
                      Billed{plan.period}
                    </Text>
                  </View>

                  <View style={styles.planRight}>
                    {plan.saving && (
                      <View style={[styles.savingBadge, { backgroundColor: isSelected ? "rgba(255,255,255,0.15)" : colors.accentLight }]}>
                        <Text style={[styles.savingText, { color: isSelected ? "#fff" : colors.accentDark }]}>{plan.saving}</Text>
                      </View>
                    )}
                    <View style={styles.planPriceRow}>
                      <Text style={[styles.planCurrency, { color: isSelected ? "rgba(255,255,255,0.75)" : colors.mutedForeground }]}>₦</Text>
                      <Text style={[styles.planPrice, { color: isSelected ? "#fff" : colors.foreground }]}>
                        {(plan.price / 1000).toFixed(0)}K
                      </Text>
                    </View>
                  </View>

                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Feather name="check" size={12} color="#7c3aed" />
                    </View>
                  )}
                </PressableScale>
              </Animated.View>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(520).duration(500)}>
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
  sectionTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: -8 },
  benefitsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  benefitRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  benefitIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  benefitLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  benefitDesc: { fontSize: 12, marginTop: 1, fontFamily: "Inter_400Regular" },
  plans: { gap: 10 },
  planCard: {
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
  },
  planLeft: { flex: 1, gap: 3 },
  planLabelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planLabel: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  planPeriod: { fontSize: 12, fontFamily: "Inter_400Regular" },
  planRight: { alignItems: "flex-end", gap: 4 },
  planPriceRow: { flexDirection: "row", alignItems: "flex-end", gap: 1 },
  planCurrency: { fontSize: 13, fontFamily: "Inter_500Medium", marginBottom: 2 },
  planPrice: { fontSize: 24, fontWeight: "800", fontFamily: "Inter_700Bold", lineHeight: 28 },
  popularBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  popularText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  savingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  savingText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  checkCircle: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginLeft: 10 },
  subscribeBtn: { borderRadius: 14, overflow: "hidden" },
  subscribeBtnInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16 },
  subscribeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  disclaimer: { textAlign: "center", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: -8 },
});
