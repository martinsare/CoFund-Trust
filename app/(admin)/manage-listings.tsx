import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { AdminListing, AdminListingStatus, AdminListingType, formatCurrency } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";
import { SoundManager } from "@/utils/soundManager";

const LISTING_TYPES: AdminListingType[] = ["equity", "debt", "revenue_share", "asset_backed"];
const LISTING_STATUSES: AdminListingStatus[] = ["active", "pending_review", "closed", "paused"];

const TYPE_LABELS: Record<AdminListingType, string> = { equity: "Equity", debt: "Debt", revenue_share: "Rev Share", asset_backed: "Asset-Backed" };
const STATUS_CONFIG: Record<AdminListingStatus, { bg: string; text: string; label: string }> = {
  active:         { bg: "#d6f5e7", text: "#1a7a4a", label: "Active"       },
  pending_review: { bg: "#fef3dc", text: "#9a5800", label: "Under Review" },
  closed:         { bg: "#f0f0f0", text: "#888",    label: "Closed"       },
  paused:         { bg: "#fde8d0", text: "#a63400", label: "Paused"       },
};

const EMPTY_FORM = {
  businessName: "", industry: "", minInvestment: "", fundingGoal: "", listedDate: "", expiryDate: "",
  listingType: "equity" as AdminListingType, status: "pending_review" as AdminListingStatus,
};

export default function ManageListings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { adminListings, addAdminListing, updateAdminListing, deleteAdminListing } = useSystemData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openAdd() { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }

  function openEdit(l: AdminListing) {
    setEditingId(l.id);
    setForm({ businessName: l.businessName, industry: l.industry, minInvestment: String(l.minInvestment), fundingGoal: String(l.fundingGoal), listedDate: l.listedDate, expiryDate: l.expiryDate, listingType: l.listingType, status: l.status });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.businessName.trim() || !form.industry.trim() || !form.fundingGoal.trim()) {
      Alert.alert("Missing Fields", "Business name, industry and funding goal are required.");
      return;
    }
    const goal = parseFloat(form.fundingGoal);
    const min = parseFloat(form.minInvestment) || 0;
    if (isNaN(goal) || goal <= 0) { Alert.alert("Invalid Goal", "Enter a valid funding goal."); return; }

    if (editingId) {
      updateAdminListing(editingId, { businessName: form.businessName, industry: form.industry, minInvestment: min, fundingGoal: goal, listedDate: form.listedDate, expiryDate: form.expiryDate, listingType: form.listingType, status: form.status });
    } else {
      addAdminListing({ businessId: `biz-${Date.now()}`, businessName: form.businessName, industry: form.industry, listingType: form.listingType, minInvestment: min, fundingGoal: goal, amountRaised: 0, status: form.status, listedDate: form.listedDate || new Date().toISOString().slice(0, 10), expiryDate: form.expiryDate || "" });
    }
    SoundManager.success();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
    setEditingId(null);
  }

  function handleDelete(l: AdminListing) {
    Alert.alert("Delete Listing", `Remove the listing for "${l.businessName}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteAdminListing(l.id); SoundManager.error(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  }

  const activeCount = adminListings.filter((l) => l.status === "active").length;

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.delay(0).duration(450)} style={styles.topRow}>
        <PressableScale style={[styles.backPill, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color={colors.foreground} />
          <Text style={[styles.backPillText, { color: colors.foreground }]}>Settings</Text>
        </PressableScale>
        <PressableScale style={[styles.addBtn, { backgroundColor: "#7c3aed" }]} onPress={openAdd}>
          <Feather name="plus" size={15} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(450)}>
        <Text style={[styles.title, { color: colors.foreground }]}>Market Listings</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{adminListings.length} total · {activeCount} active</Text>
      </Animated.View>

      {showForm && (
        <FadeSlideIn delay={0}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: "#7c3aed" }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>{editingId ? "Edit Listing" : "New Listing"}</Text>
            <Field label="Business Name *" value={form.businessName} onChange={(v) => setForm((f) => ({ ...f, businessName: v }))} colors={colors} />
            <Field label="Industry *" value={form.industry} onChange={(v) => setForm((f) => ({ ...f, industry: v }))} colors={colors} />
            <Field label="Funding Goal (₦) *" value={form.fundingGoal} onChange={(v) => setForm((f) => ({ ...f, fundingGoal: v }))} colors={colors} keyboardType="numeric" />
            <Field label="Min Investment (₦)" value={form.minInvestment} onChange={(v) => setForm((f) => ({ ...f, minInvestment: v }))} colors={colors} keyboardType="numeric" />
            <Field label="Listed Date (YYYY-MM-DD)" value={form.listedDate} onChange={(v) => setForm((f) => ({ ...f, listedDate: v }))} colors={colors} />
            <Field label="Expiry Date (YYYY-MM-DD)" value={form.expiryDate} onChange={(v) => setForm((f) => ({ ...f, expiryDate: v }))} colors={colors} />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Listing Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {LISTING_TYPES.map((t) => (
                <PressableScale key={t} style={[styles.chip, { backgroundColor: form.listingType === t ? "#7c3aed" : colors.borderLight }]} onPress={() => setForm((f) => ({ ...f, listingType: t }))}>
                  <Text style={[styles.chipText, { color: form.listingType === t ? "#fff" : colors.mutedForeground }]}>{TYPE_LABELS[t]}</Text>
                </PressableScale>
              ))}
            </ScrollView>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {LISTING_STATUSES.map((s) => (
                <PressableScale key={s} style={[styles.chip, { backgroundColor: form.status === s ? "#7c3aed" : colors.borderLight }]} onPress={() => setForm((f) => ({ ...f, status: s }))}>
                  <Text style={[styles.chipText, { color: form.status === s ? "#fff" : colors.mutedForeground }]}>{STATUS_CONFIG[s].label}</Text>
                </PressableScale>
              ))}
            </ScrollView>
            <View style={styles.formActions}>
              <PressableScale style={[styles.cancelBtn, { backgroundColor: colors.muted }]} onPress={() => setShowForm(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </PressableScale>
              <PressableScale style={[styles.saveBtn, { backgroundColor: "#7c3aed" }]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editingId ? "Update" : "Add Listing"}</Text>
              </PressableScale>
            </View>
          </View>
        </FadeSlideIn>
      )}

      {adminListings.map((l, i) => {
        const sc = STATUS_CONFIG[l.status];
        const progress = l.fundingGoal > 0 ? Math.min(l.amountRaised / l.fundingGoal, 1) : 0;
        return (
          <FadeSlideIn key={l.id} delay={80 + i * 40}>
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]}>{l.businessName}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
                  </View>
                </View>
                <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{l.industry} · {TYPE_LABELS[l.listingType]}</Text>
                <View style={[styles.progressTrack, { backgroundColor: colors.borderLight }]}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
                </View>
                <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
                  {formatCurrency(l.amountRaised)} / {formatCurrency(l.fundingGoal)} · Min: {formatCurrency(l.minInvestment)}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <PressableScale onPress={() => openEdit(l)} style={[styles.iconBtn, { backgroundColor: "#ddeaf8" }]}>
                  <Feather name="edit-2" size={13} color="#1a5e9a" />
                </PressableScale>
                <PressableScale onPress={() => handleDelete(l)} style={[styles.iconBtn, { backgroundColor: "#fde8e8" }]}>
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

function Field({ label, value, onChange, colors, keyboardType }: { label: string; value: string; onChange: (v: string) => void; colors: any; keyboardType?: any }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} value={value} onChangeText={onChange} keyboardType={keyboardType} placeholderTextColor={colors.mutedForeground} />
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
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
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
  row: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  rowTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  rowTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold", flex: 1, marginRight: 8 },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  progressTrack: { height: 4, borderRadius: 100, overflow: "hidden", marginBottom: 6 },
  progressFill: { height: "100%", backgroundColor: "#7c3aed", borderRadius: 100 },
  rowMeta: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  statusText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  rowActions: { gap: 6 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
