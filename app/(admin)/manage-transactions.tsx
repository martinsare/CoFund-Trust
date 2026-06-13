import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { AdminTxStatus, AdminTxType } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";
import { SoundManager } from "@/utils/soundManager";

const TX_TYPES: AdminTxType[] = ["investment", "payout", "fee", "refund", "listing_fee"];
const TX_STATUSES: AdminTxStatus[] = ["pending", "completed", "failed"];

const TYPE_CONFIG: Record<AdminTxType, { label: string; color: string; icon: string }> = {
  investment:  { label: "Investment",   color: "#2db56e", icon: "trending-up"      },
  payout:      { label: "Payout",       color: "#e03e3e", icon: "download"         },
  fee:         { label: "Platform Fee", color: "#c9860d", icon: "dollar-sign"      },
  refund:      { label: "Refund",       color: "#1a5e9a", icon: "corner-down-left" },
  listing_fee: { label: "Listing Fee",  color: "#7c3aed", icon: "package"          },
};

const STATUS_CONFIG: Record<AdminTxStatus, { bg: string; text: string }> = {
  completed: { bg: "#d6f5e7", text: "#1a7a4a" },
  pending:   { bg: "#fef3dc", text: "#9a5800" },
  failed:    { bg: "#fde8e8", text: "#e03e3e" },
};

const EMPTY_FORM = {
  businessName: "", investorName: "", description: "", amount: "", date: "",
  type: "investment" as AdminTxType, status: "pending" as AdminTxStatus,
};

export default function ManageTransactions() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { adminTransactions, addAdminTransaction, deleteAdminTransaction } = useSystemData();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  function handleAdd() {
    if (!form.businessName.trim() || !form.description.trim() || !form.amount.trim() || !form.date.trim()) {
      Alert.alert("Missing Fields", "Business name, description, amount and date are all required.");
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) { Alert.alert("Invalid Amount", "Enter a valid positive number."); return; }

    addAdminTransaction({
      businessId: `biz-${Date.now()}`,
      businessName: form.businessName,
      investorName: form.investorName || undefined,
      description: form.description,
      amount: amt,
      date: form.date,
      type: form.type,
      status: form.status,
    });
    SoundManager.success();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
    setForm(EMPTY_FORM);
  }

  function handleDelete(id: string, label: string) {
    Alert.alert(
      "Remove Transaction",
      `Remove "${label}"?\n\nThis permanently removes the record. Use a corrective entry (refund/reversal) instead of deleting if the original was valid.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            deleteAdminTransaction(id);
            SoundManager.error();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ],
    );
  }

  const totalNet = adminTransactions.reduce(
    (s, t) => s + (t.type === "payout" || t.type === "refund" ? -t.amount : t.amount),
    0,
  );

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).duration(450)} style={styles.topRow}>
        <PressableScale style={[styles.backPill, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color={colors.foreground} />
          <Text style={[styles.backPillText, { color: colors.foreground }]}>Settings</Text>
        </PressableScale>
        <PressableScale style={[styles.addBtn, { backgroundColor: "#1a5e9a" }]} onPress={() => { setForm(EMPTY_FORM); setShowForm(true); }}>
          <Feather name="plus" size={15} color="#fff" />
          <Text style={styles.addBtnText}>Record</Text>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(450)}>
        <Text style={[styles.title, { color: colors.foreground }]}>Wallet Transactions</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {adminTransactions.length} records · Net ₦{(totalNet / 1_000_000).toFixed(1)}M
        </Text>
        <View style={[styles.noticeBanner, { backgroundColor: "#f0f5ff", borderColor: "#c7d9f7" }]}>
          <Feather name="lock" size={12} color="#1a5e9a" />
          <Text style={[styles.noticeText, { color: "#1a5e9a" }]}>
            Records are append-only. To correct an error, record a new reversal or refund entry.
          </Text>
        </View>
      </Animated.View>

      {showForm && (
        <FadeSlideIn delay={0}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: "#1a5e9a" }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>New Transaction Record</Text>
            <Field label="Business Name *" value={form.businessName} onChange={(v) => setForm((f) => ({ ...f, businessName: v }))} colors={colors} />
            <Field label="Investor / Party Name" value={form.investorName} onChange={(v) => setForm((f) => ({ ...f, investorName: v }))} colors={colors} />
            <Field label="Description *" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} colors={colors} />
            <Field label="Amount (₦) *" value={form.amount} onChange={(v) => setForm((f) => ({ ...f, amount: v }))} colors={colors} keyboardType="numeric" />
            <Field label="Date (YYYY-MM-DD) *" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} colors={colors} />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {TX_TYPES.map((t) => (
                <PressableScale
                  key={t}
                  style={[styles.chip, { backgroundColor: form.type === t ? "#1a5e9a" : colors.borderLight }]}
                  onPress={() => setForm((f) => ({ ...f, type: t }))}
                >
                  <Text style={[styles.chipText, { color: form.type === t ? "#fff" : colors.mutedForeground }]}>
                    {TYPE_CONFIG[t].label}
                  </Text>
                </PressableScale>
              ))}
            </ScrollView>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Status</Text>
            <View style={styles.chipRow}>
              {TX_STATUSES.map((s) => (
                <PressableScale
                  key={s}
                  style={[styles.chip, { backgroundColor: form.status === s ? "#1a5e9a" : colors.borderLight }]}
                  onPress={() => setForm((f) => ({ ...f, status: s }))}
                >
                  <Text style={[styles.chipText, { color: form.status === s ? "#fff" : colors.mutedForeground }]}>{s}</Text>
                </PressableScale>
              ))}
            </View>
            <View style={styles.formActions}>
              <PressableScale style={[styles.cancelBtn, { backgroundColor: colors.muted }]} onPress={() => setShowForm(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </PressableScale>
              <PressableScale style={[styles.saveBtn, { backgroundColor: "#1a5e9a" }]} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Record Transaction</Text>
              </PressableScale>
            </View>
          </View>
        </FadeSlideIn>
      )}

      {adminTransactions.map((tx, i) => {
        const tc = TYPE_CONFIG[tx.type];
        const sc = STATUS_CONFIG[tx.status];
        const isIncome = tx.type !== "payout" && tx.type !== "refund";
        return (
          <FadeSlideIn key={tx.id} delay={80 + i * 40}>
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.rowIcon, { backgroundColor: tc.color + "18" }]}>
                <Feather name={tc.icon as any} size={15} color={tc.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{tx.description}</Text>
                <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>
                  {tx.businessName}{tx.investorName ? ` · ${tx.investorName}` : ""}
                </Text>
                <View style={styles.rowMeta}>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{tx.status}</Text>
                  </View>
                  <Text style={[styles.rowDate, { color: colors.mutedForeground }]}>{tx.date}</Text>
                </View>
              </View>
              <View style={styles.rowRight}>
                <Text style={[styles.rowAmount, { color: isIncome ? "#2db56e" : "#e03e3e" }]}>
                  {isIncome ? "+" : "-"}₦{(tx.amount / 1000).toFixed(0)}K
                </Text>
                <PressableScale onPress={() => handleDelete(tx.id, tx.description)} style={[styles.iconBtn, { backgroundColor: "#fde8e8" }]}>
                  <Feather name="trash-2" size={13} color="#e03e3e" />
                </PressableScale>
              </View>
            </View>
          </FadeSlideIn>
        );
      })}
    </ScrollView>
  );
}

function Field({ label, value, onChange, colors, keyboardType }: {
  label: string; value: string; onChange: (v: string) => void; colors: any; keyboardType?: any;
}) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        placeholderTextColor={colors.mutedForeground}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  backPill: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  backPillText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addBtnText: { color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  title: { fontSize: 26, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: -0.6, marginBottom: 4 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 10 },
  noticeBanner: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 16 },
  noticeText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 17 },
  formCard: { borderRadius: 16, borderWidth: 2, padding: 16, marginBottom: 16 },
  formTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  chipRow: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100 },
  chipText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  formActions: { flexDirection: "row", gap: 10, marginTop: 6 },
  cancelBtn: { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: "center" },
  cancelBtnText: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  saveBtn: { flex: 2, paddingVertical: 11, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  row: { flexDirection: "row", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10, alignItems: "flex-start" },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowTitle: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 6 },
  rowMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  statusText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  rowDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  rowRight: { alignItems: "flex-end", gap: 8 },
  rowAmount: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
