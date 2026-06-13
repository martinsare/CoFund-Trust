import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { BUSINESSES, BrfrStatus, KYB_STAGES, formatCurrency } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";

const BRFR_CONFIG: Record<BrfrStatus, { label: string; color: string; bg: string; dot: string }> = {
  green:  { label: "Healthy",  color: "#1a7a4a", bg: "#d6f5e7", dot: "#2db56e" },
  yellow: { label: "Watch",    color: "#9a5800", bg: "#fef3dc", dot: "#e08c1a" },
  orange: { label: "At Risk",  color: "#a63400", bg: "#fde8d0", dot: "#e06030" },
  red:    { label: "Critical", color: "#a30000", bg: "#fde8e8", dot: "#e03e3e" },
};

export default function BusinessDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateWallet } = useAuth();
  const { businesses } = useSystemData();
  const [investModal, setInvestModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const business = businesses.find((b) => b.id === id) ?? businesses[0] ?? BUSINESSES[0];
  const progress = business.amountRaised / business.fundingGoal;
  const brfr = BRFR_CONFIG[business.brfrStatus];

  const riskColors: Record<string, { bg: string; text: string; label: string }> = {
    low:    { bg: colors.accentLight,     text: colors.accentDark,  label: "Low Risk" },
    medium: { bg: colors.amberLight,      text: colors.amber,       label: "Medium Risk" },
    high:   { bg: colors.destructiveLight,text: colors.destructive, label: "High Risk" },
  };
  const rc = riskColors[business.riskLevel];

  const verColors: Record<string, { bg: string; text: string }> = {
    verified: { bg: colors.accentLight, text: colors.accentDark },
    partial:  { bg: colors.amberLight,  text: colors.amber },
    pending:  { bg: colors.muted,       text: colors.mutedForeground },
  };
  const vc = verColors[business.verificationStatus];

  const platformFee   = Math.round(parseFloat(amount.replace(/,/g, "") || "0") * 0.01);
  const investAmount  = parseFloat(amount.replace(/,/g, "") || "0");
  const minRoi        = parseInt(business.expectedRoi.split("–")[0]);
  const expectedReturn = Math.round(investAmount * (1 + minRoi / 100));

  const handleInvest = async () => {
    const numAmount = parseFloat(amount.replace(/,/g, "") || "0");
    if (!numAmount || numAmount < business.minInvestment) {
      Alert.alert("Invalid Amount", `Minimum investment is ${formatCurrency(business.minInvestment)}.`);
      return;
    }
    if (numAmount > (user?.walletBalance ?? 0)) {
      Alert.alert("Insufficient Balance", "Your wallet balance is too low for this investment.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    await updateWallet(-numAmount - platformFee);
    setLoading(false);
    setInvestModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Investment Confirmed!",
      `Your investment of ${formatCurrency(numAmount)} in ${business.name} has been confirmed. Funds are held in escrow pending business confirmation.`,
      [{ text: "View Portfolio", onPress: () => router.push("/(investor)/portfolio") }, { text: "OK" }]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </Pressable>

        <LinearGradient
          colors={["#0e3d6e", "#1a5e9a"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={[styles.industryBadge, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Feather name="layers" size={12} color="#fff" />
              <Text style={styles.industryText}>{business.industry}</Text>
            </View>
            <View style={styles.trustScore}>
              <Text style={styles.trustNum}>{business.trustScore}</Text>
              <Text style={styles.trustLabel}>Trust</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{business.name}</Text>
          <View style={styles.heroMeta}>
            <Feather name="map-pin" size={12} color="rgba(255,255,255,0.65)" />
            <Text style={styles.heroMetaText}>{business.location}</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.heroMetaText}>{business.yearsOperating} yrs operating</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.heroMetaText}>{business.employeeCount} staff</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={styles.fundingRow}>
            <View>
              <Text style={styles.fundingAmt}>{formatCurrency(business.amountRaised)}</Text>
              <Text style={styles.fundingLbl}>raised of {formatCurrency(business.fundingGoal)}</Text>
            </View>
            <View style={styles.daysLeft}>
              <Text style={styles.daysNum}>{business.daysLeft}</Text>
              <Text style={styles.daysLbl}>days left</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: vc.bg }]}>
            <Feather name="shield" size={12} color={vc.text} />
            <Text style={[styles.badgeText, { color: vc.text }]}>
              {business.verificationStatus.charAt(0).toUpperCase() + business.verificationStatus.slice(1)}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: rc.bg }]}>
            <Feather name="alert-triangle" size={12} color={rc.text} />
            <Text style={[styles.badgeText, { color: rc.text }]}>{rc.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: brfr.bg }]}>
            <View style={[styles.brfrDot, { backgroundColor: brfr.dot }]} />
            <Text style={[styles.badgeText, { color: brfr.color }]}>BRRF: {brfr.label}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.muted }]}>
            <Feather name="users" size={12} color={colors.mutedForeground} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>{business.investorCount} investors</Text>
          </View>
        </View>

        <Section title="About" colors={colors}>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{business.description}</Text>
          <View style={[styles.revenueRow, { borderTopColor: colors.borderLight }]}>
            <View style={styles.revItem}>
              <Feather name="bar-chart-2" size={13} color={colors.primary} />
              <Text style={[styles.revLabel, { color: colors.mutedForeground }]}>Revenue</Text>
              <Text style={[styles.revValue, { color: colors.foreground }]}>{business.revenueRange}</Text>
            </View>
            <View style={[styles.revDivider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.revItem}>
              <Feather name="users" size={13} color={colors.primary} />
              <Text style={[styles.revLabel, { color: colors.mutedForeground }]}>Employees</Text>
              <Text style={[styles.revValue, { color: colors.foreground }]}>{business.employeeCount}</Text>
            </View>
            <View style={[styles.revDivider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.revItem}>
              <Feather name="clock" size={13} color={colors.primary} />
              <Text style={[styles.revLabel, { color: colors.mutedForeground }]}>Operating</Text>
              <Text style={[styles.revValue, { color: colors.foreground }]}>{business.yearsOperating} yrs</Text>
            </View>
          </View>
        </Section>

        <Section title="KYB Verification — Stage Progress" colors={colors}>
          <View style={styles.kybTrack}>
            {[1, 2, 3, 4, 5].map((s) => (
              <View key={s} style={styles.kybStep}>
                <View style={[
                  styles.kybBubble,
                  { backgroundColor: s < business.kybStage ? "#2db56e" : s === business.kybStage ? "#1a5e9a" : colors.borderLight },
                ]}>
                  {s < business.kybStage ? (
                    <Feather name="check" size={10} color="#fff" />
                  ) : (
                    <Text style={[styles.kybNum, { color: s === business.kybStage ? "#fff" : colors.mutedForeground }]}>{s}</Text>
                  )}
                </View>
                <Text style={[styles.kybStepLabel, { color: s <= business.kybStage ? colors.foreground : colors.mutedForeground }]} numberOfLines={2}>
                  {KYB_STAGES[s - 1]}
                </Text>
              </View>
            ))}
          </View>
          <Text style={[styles.kybCurrent, { color: colors.primary }]}>
            Current: Stage {business.kybStage} — {KYB_STAGES[business.kybStage - 1]}
          </Text>
        </Section>

        <Section title="Milestone Tracker" colors={colors}>
          {business.milestones.map((m, idx) => {
            const statusColor = m.status === "completed" ? "#2db56e" : m.status === "active" ? "#1a5e9a" : colors.mutedForeground;
            const statusBg    = m.status === "completed" ? "#d6f5e7" : m.status === "active" ? "#ddeaf8" : colors.muted;
            const isLast = idx === business.milestones.length - 1;
            return (
              <View key={m.id} style={styles.milestoneRow}>
                <View style={styles.milestoneLeft}>
                  <View style={[styles.milestoneBubble, { backgroundColor: statusColor }]}>
                    {m.status === "completed"
                      ? <Feather name="check" size={10} color="#fff" />
                      : m.status === "active"
                        ? <View style={styles.activeDot} />
                        : <View style={[styles.activeDot, { backgroundColor: colors.mutedForeground }]} />}
                  </View>
                  {!isLast && <View style={[styles.milestoneLine, { backgroundColor: statusColor + "40" }]} />}
                </View>
                <View style={[styles.milestoneBody, isLast && { marginBottom: 0 }]}>
                  <View style={styles.milestoneHeader}>
                    <Text style={[styles.milestoneTitle, { color: colors.foreground }]}>{m.title}</Text>
                    <View style={[styles.milestoneBadge, { backgroundColor: statusBg }]}>
                      <Text style={[styles.milestoneBadgeText, { color: statusColor }]}>
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.milestoneDesc, { color: colors.mutedForeground }]}>{m.description}</Text>
                  <View style={styles.milestoneMeta}>
                    <View style={styles.milestoneMetaItem}>
                      <Feather name="calendar" size={11} color={colors.mutedForeground} />
                      <Text style={[styles.milestoneMetaText, { color: colors.mutedForeground }]}>{m.dueDate}</Text>
                    </View>
                    <View style={styles.milestoneMetaItem}>
                      <Feather name="lock" size={11} color="#2db56e" />
                      <Text style={[styles.milestoneMetaText, { color: colors.foreground, fontWeight: "600" }]}>{formatCurrency(m.amount)}</Text>
                      <Text style={[styles.milestoneMetaText, { color: colors.mutedForeground }]}> escrow</Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </Section>

        <Section title="Investment Terms" colors={colors}>
          {[
            { label: "Investment Type", value: business.investmentType },
            { label: "Expected ROI",    value: business.expectedRoi,                    accent: true },
            { label: "Duration",        value: business.duration },
            { label: "Minimum",         value: formatCurrency(business.minInvestment) },
            { label: "Funding Goal",    value: formatCurrency(business.fundingGoal) },
            { label: "Cat. / Risk",     value: `${business.riskCategory} · ${business.riskLevel}` },
          ].map((row, idx, arr) => (
            <View key={row.label} style={[styles.termRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.termLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
              <Text style={[styles.termValue, { color: row.accent ? colors.accent : colors.foreground }]}>{row.value}</Text>
            </View>
          ))}
        </Section>

        <Section title="Investor Protection" colors={colors}>
          {[
            { icon: "shield" as const,     text: "Funds held in escrow until each verified milestone is achieved" },
            { icon: "eye" as const,        text: "Real-time BRRF monitoring — early-warning system active for all funded businesses" },
            { icon: "file-text" as const,  text: "Legal governance agreement with enforced reporting obligations" },
            { icon: "bar-chart-2" as const,text: "Monthly/quarterly performance reports submitted to all investors" },
            { icon: "alert-triangle" as const, text: "If business underperforms, CoFund's BRRF triggers structured recovery — not abandonment" },
          ].map((item) => (
            <View key={item.text} style={styles.protectionRow}>
              <View style={[styles.protectionIcon, { backgroundColor: colors.accentLight }]}>
                <Feather name={item.icon} size={14} color={colors.accentDark} />
              </View>
              <Text style={[styles.protectionText, { color: colors.foreground }]}>{item.text}</Text>
            </View>
          ))}
        </Section>

        {business.updates.length > 0 && (
          <Section title="Business Updates" colors={colors}>
            {business.updates.map((u) => (
              <View key={u.id} style={styles.updateRow}>
                <View style={[styles.updateDot, { backgroundColor: u.type === "milestone" ? colors.accent : u.type === "report" ? colors.primary : colors.amber }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.updateTitle, { color: colors.foreground }]}>{u.title}</Text>
                  <Text style={[styles.updateContent, { color: colors.mutedForeground }]}>{u.content}</Text>
                  <Text style={[styles.updateDate, { color: colors.mutedForeground }]}>{u.date}</Text>
                </View>
              </View>
            ))}
          </Section>
        )}
      </ScrollView>

      <View style={[styles.investBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        <View>
          <Text style={[styles.investBarLabel, { color: colors.mutedForeground }]}>Min. Investment</Text>
          <Text style={[styles.investBarAmt, { color: colors.foreground }]}>{formatCurrency(business.minInvestment)}</Text>
        </View>
        <Pressable onPress={() => setInvestModal(true)} style={{ flex: 1, maxWidth: 200 }}>
          <LinearGradient
            colors={["#1a5e9a", "#2db56e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.investBtn}
          >
            <Feather name="trending-up" size={16} color="#fff" />
            <Text style={styles.investBtnText}>Invest Now</Text>
          </LinearGradient>
        </Pressable>
      </View>

      <Modal visible={investModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setInvestModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Platform.OS === "ios" ? 12 : insets.top + 12 }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Invest in {business.name}</Text>
            <Pressable onPress={() => setInvestModal(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={[styles.walletRow, { backgroundColor: colors.primaryXLight, borderRadius: 10, padding: 12 }]}>
              <Feather name="credit-card" size={15} color={colors.primary} />
              <Text style={[styles.walletLabel, { color: colors.primary }]}>
                Wallet: <Text style={{ fontWeight: "700" }}>{formatCurrency(user?.walletBalance ?? 0)}</Text>
              </Text>
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground }]}>Investment Amount (₦)</Text>
            <View style={[styles.amountWrap, { borderColor: colors.border }]}>
              <Text style={[styles.nairaSign, { color: colors.mutedForeground }]}>₦</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.foreground }]}
                placeholder={`Min. ${formatCurrency(business.minInvestment)}`}
                placeholderTextColor={colors.mutedForeground}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.summary, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { label: "Investment Amount", value: formatCurrency(investAmount || 0) },
                { label: "Platform Fee (1%)", value: `-${formatCurrency(platformFee)}` },
                { label: "Expected ROI",      value: business.expectedRoi },
                { label: "Expected Return",   value: formatCurrency(expectedReturn || 0), accent: true },
              ].map((row, idx, arr) => (
                <View key={row.label} style={[styles.sumRow, idx < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
                  <Text style={[styles.sumLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                  <Text style={[styles.sumValue, { color: row.accent ? colors.accent : colors.foreground }]}>{row.value}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.warningBox, { backgroundColor: colors.amberLight, borderRadius: 10, padding: 12 }]}>
              <Feather name="alert-triangle" size={14} color={colors.amber} />
              <Text style={[styles.warningText, { color: colors.amber }]}>
                All investments carry risk. Funds are held in escrow and released on verified milestones. Past performance does not guarantee future results.
              </Text>
            </View>

            <Pressable onPress={handleInvest} disabled={loading}>
              <LinearGradient
                colors={["#1a5e9a", "#2db56e"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Feather name="lock" size={16} color="#fff" />
                    <Text style={styles.confirmText}>Confirm &amp; Lock in Escrow</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: 14, alignSelf: "flex-start" },
  heroCard: { borderRadius: 18, padding: 20, marginBottom: 12, gap: 10 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  industryBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  industryText: { color: "#fff", fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  trustScore: { alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  trustNum: { color: "#fff", fontSize: 18, fontWeight: "800", fontFamily: "Inter_700Bold" },
  trustLabel: { color: "rgba(255,255,255,0.65)", fontSize: 9, fontFamily: "Inter_400Regular" },
  heroName: { color: "#fff", fontSize: 22, fontWeight: "800", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 5, flexWrap: "wrap" },
  heroMetaText: { color: "rgba(255,255,255,0.65)", fontSize: 12, fontFamily: "Inter_400Regular" },
  dot: { color: "rgba(255,255,255,0.4)" },
  progressTrack: { height: 7, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 100, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#fff", borderRadius: 100 },
  fundingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  fundingAmt: { color: "#fff", fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  fundingLbl: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_400Regular" },
  daysLeft: { alignItems: "center" },
  daysNum: { color: "#fff", fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  daysLbl: { color: "rgba(255,255,255,0.6)", fontSize: 11, fontFamily: "Inter_400Regular" },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 7, marginBottom: 14 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
  badgeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  brfrDot: { width: 7, height: 7, borderRadius: 4 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 8 },
  sectionCard: { borderRadius: 14, borderWidth: 1, padding: 16 },
  desc: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular", marginBottom: 12 },
  revenueRow: { flexDirection: "row", borderTopWidth: 1, paddingTop: 12 },
  revItem: { flex: 1, alignItems: "center", gap: 4 },
  revLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  revValue: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold", textAlign: "center" },
  revDivider: { width: 1 },
  kybTrack: { flexDirection: "row", gap: 4, marginBottom: 10 },
  kybStep: { flex: 1, alignItems: "center", gap: 6 },
  kybBubble: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  kybNum: { fontSize: 11, fontWeight: "700", fontFamily: "Inter_700Bold" },
  kybStepLabel: { fontSize: 9, textAlign: "center", fontFamily: "Inter_400Regular", lineHeight: 12 },
  kybCurrent: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginTop: 4 },
  milestoneRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
  milestoneLeft: { alignItems: "center", width: 22 },
  milestoneBubble: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#fff" },
  milestoneLine: { width: 2, flex: 1, marginTop: 4, minHeight: 20, borderRadius: 1 },
  milestoneBody: { flex: 1, marginBottom: 4 },
  milestoneHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  milestoneTitle: { flex: 1, fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  milestoneBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, marginLeft: 6 },
  milestoneBadgeText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  milestoneDesc: { fontSize: 12, lineHeight: 16, fontFamily: "Inter_400Regular", marginBottom: 6 },
  milestoneMeta: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  milestoneMetaItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  milestoneMetaText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  termRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  termLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  termValue: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  protectionRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 8 },
  protectionIcon: { width: 30, height: 30, borderRadius: 9, alignItems: "center", justifyContent: "center", marginTop: 1 },
  protectionText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  updateRow: { flexDirection: "row", gap: 12, paddingVertical: 8 },
  updateDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  updateTitle: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 3 },
  updateContent: { fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  updateDate: { fontSize: 11, marginTop: 3, fontFamily: "Inter_400Regular" },
  investBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, gap: 14 },
  investBarLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  investBarAmt: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  investBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 14 },
  investBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  modalTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalContent: { padding: 20, gap: 14 },
  walletRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  walletLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "Inter_600SemiBold" },
  amountWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  nairaSign: { fontSize: 18, fontWeight: "600", marginRight: 4, fontFamily: "Inter_600SemiBold" },
  amountInput: { flex: 1, fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  summary: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  sumRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 11 },
  sumLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sumValue: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  warningBox: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  confirmBtn: { borderRadius: 12, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  confirmText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
