import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FadeSlideIn, PressableScale } from "@/components/AnimatedPrimitives";
import { AdminThread, AdminThreadCategory, AdminThreadStatus } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";
import { SoundManager } from "@/utils/soundManager";

const CATEGORIES: AdminThreadCategory[] = ["inquiry", "support", "dispute", "update"];
const STATUSES: AdminThreadStatus[] = ["open", "archived", "resolved"];

const CAT_CONFIG: Record<AdminThreadCategory, { color: string; bg: string; label: string; icon: string }> = {
  inquiry: { color: "#1a5e9a", bg: "#ddeaf8", label: "Inquiry", icon: "message-circle" },
  support: { color: "#7c3aed", bg: "#efe4ff", label: "Support", icon: "life-buoy"      },
  dispute: { color: "#e03e3e", bg: "#fde8e8", label: "Dispute", icon: "alert-circle"   },
  update:  { color: "#2db56e", bg: "#d6f5e7", label: "Update",  icon: "bell"           },
};

const STATUS_CONFIG: Record<AdminThreadStatus, { bg: string; text: string }> = {
  open:     { bg: "#ddeaf8", text: "#1a5e9a" },
  archived: { bg: "#f0f0f0", text: "#888"    },
  resolved: { bg: "#d6f5e7", text: "#1a7a4a" },
};

const EMPTY_FORM = {
  subject: "", lastMessage: "", participantNames: "", lastMessageDate: "",
  category: "inquiry" as AdminThreadCategory, status: "open" as AdminThreadStatus,
};

export default function ManageThreads() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;
  const { adminThreads, addAdminThread, updateAdminThread, deleteAdminThread } = useSystemData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  function openAdd() { setEditingId(null); setForm(EMPTY_FORM); setShowForm(true); }

  function openEdit(t: AdminThread) {
    setEditingId(t.id);
    setForm({ subject: t.subject, lastMessage: t.lastMessage, participantNames: t.participantNames.join(", "), lastMessageDate: t.lastMessageDate, category: t.category, status: t.status });
    setShowForm(true);
  }

  function handleSave() {
    if (!form.subject.trim() || !form.participantNames.trim()) {
      Alert.alert("Missing Fields", "Subject and participants are required.");
      return;
    }
    const parts = form.participantNames.split(",").map((p) => p.trim()).filter(Boolean);
    if (editingId) {
      updateAdminThread(editingId, { subject: form.subject, lastMessage: form.lastMessage, participantNames: parts, lastMessageDate: form.lastMessageDate || new Date().toISOString().slice(0, 10), category: form.category, status: form.status });
    } else {
      addAdminThread({ subject: form.subject, lastMessage: form.lastMessage, participantNames: parts, lastMessageDate: form.lastMessageDate || new Date().toISOString().slice(0, 10), category: form.category, status: form.status, unreadCount: 0 });
    }
    SoundManager.success();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowForm(false);
    setEditingId(null);
  }

  function handleDelete(t: AdminThread) {
    Alert.alert("Delete Thread", `Remove the thread "${t.subject}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => { deleteAdminThread(t.id); SoundManager.error(); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } },
    ]);
  }

  function handleStatusChange(t: AdminThread, status: AdminThreadStatus) {
    updateAdminThread(t.id, { status });
    SoundManager.pinClick();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  const openCount = adminThreads.filter((t) => t.status === "open").length;
  const totalUnread = adminThreads.reduce((s, t) => s + t.unreadCount, 0);

  return (
    <ScrollView style={[styles.root, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 100 }]} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.delay(0).duration(450)} style={styles.topRow}>
        <PressableScale style={[styles.backPill, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
          <Feather name="arrow-left" size={16} color={colors.foreground} />
          <Text style={[styles.backPillText, { color: colors.foreground }]}>Settings</Text>
        </PressableScale>
        <PressableScale style={[styles.addBtn, { backgroundColor: "#2db56e" }]} onPress={openAdd}>
          <Feather name="plus" size={15} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </PressableScale>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(40).duration(450)}>
        <Text style={[styles.title, { color: colors.foreground }]}>Message Threads</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{adminThreads.length} threads · {openCount} open · {totalUnread} unread</Text>
      </Animated.View>

      {showForm && (
        <FadeSlideIn delay={0}>
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: "#2db56e" }]}>
            <Text style={[styles.formTitle, { color: colors.foreground }]}>{editingId ? "Edit Thread" : "New Thread"}</Text>
            <Field label="Subject *" value={form.subject} onChange={(v) => setForm((f) => ({ ...f, subject: v }))} colors={colors} />
            <Field label="Participants (comma-separated) *" value={form.participantNames} onChange={(v) => setForm((f) => ({ ...f, participantNames: v }))} colors={colors} />
            <Field label="Last Message" value={form.lastMessage} onChange={(v) => setForm((f) => ({ ...f, lastMessage: v }))} colors={colors} />
            <Field label="Last Message Date (YYYY-MM-DD)" value={form.lastMessageDate} onChange={(v) => setForm((f) => ({ ...f, lastMessageDate: v }))} colors={colors} />
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Category</Text>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <PressableScale key={c} style={[styles.chip, { backgroundColor: form.category === c ? "#2db56e" : colors.borderLight }]} onPress={() => setForm((f) => ({ ...f, category: c }))}>
                  <Text style={[styles.chipText, { color: form.category === c ? "#fff" : colors.mutedForeground }]}>{CAT_CONFIG[c].label}</Text>
                </PressableScale>
              ))}
            </View>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Status</Text>
            <View style={styles.chipRow}>
              {STATUSES.map((s) => (
                <PressableScale key={s} style={[styles.chip, { backgroundColor: form.status === s ? "#2db56e" : colors.borderLight }]} onPress={() => setForm((f) => ({ ...f, status: s }))}>
                  <Text style={[styles.chipText, { color: form.status === s ? "#fff" : colors.mutedForeground }]}>{s}</Text>
                </PressableScale>
              ))}
            </View>
            <View style={styles.formActions}>
              <PressableScale style={[styles.cancelBtn, { backgroundColor: colors.muted }]} onPress={() => setShowForm(false)}>
                <Text style={[styles.cancelBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
              </PressableScale>
              <PressableScale style={[styles.saveBtn, { backgroundColor: "#2db56e" }]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editingId ? "Update" : "Add Thread"}</Text>
              </PressableScale>
            </View>
          </View>
        </FadeSlideIn>
      )}

      {adminThreads.map((t, i) => {
        const cat = CAT_CONFIG[t.category];
        const sc = STATUS_CONFIG[t.status];
        return (
          <FadeSlideIn key={t.id} delay={80 + i * 40}>
            <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.catDot, { backgroundColor: cat.bg }]}>
                <Feather name={cat.icon as any} size={14} color={cat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                  <Text style={[styles.rowTitle, { color: colors.foreground }]} numberOfLines={1}>{t.subject}</Text>
                  {t.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{t.unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.rowParticipants, { color: colors.mutedForeground }]}>{t.participantNames.join(" · ")}</Text>
                <Text style={[styles.rowLastMsg, { color: colors.mutedForeground }]} numberOfLines={1}>{t.lastMessage}</Text>
                <View style={styles.rowBottom}>
                  <View style={[styles.catBadge, { backgroundColor: cat.bg }]}>
                    <Text style={[styles.catText, { color: cat.color }]}>{cat.label}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                    <Text style={[styles.statusText, { color: sc.text }]}>{t.status}</Text>
                  </View>
                  <Text style={[styles.rowDate, { color: colors.mutedForeground }]}>{t.lastMessageDate}</Text>
                </View>
                {t.status === "open" && (
                  <View style={styles.quickActions}>
                    <PressableScale style={[styles.quickBtn, { backgroundColor: "#d6f5e7" }]} onPress={() => handleStatusChange(t, "resolved")}>
                      <Text style={[styles.quickBtnText, { color: "#1a7a4a" }]}>Resolve</Text>
                    </PressableScale>
                    <PressableScale style={[styles.quickBtn, { backgroundColor: "#f0f0f0" }]} onPress={() => handleStatusChange(t, "archived")}>
                      <Text style={[styles.quickBtnText, { color: "#888" }]}>Archive</Text>
                    </PressableScale>
                  </View>
                )}
              </View>
              <View style={styles.rowActions}>
                <PressableScale onPress={() => openEdit(t)} style={[styles.iconBtn, { backgroundColor: "#ddeaf8" }]}>
                  <Feather name="edit-2" size={13} color="#1a5e9a" />
                </PressableScale>
                <PressableScale onPress={() => handleDelete(t)} style={[styles.iconBtn, { backgroundColor: "#fde8e8" }]}>
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

function Field({ label, value, onChange, colors }: { label: string; value: string; onChange: (v: string) => void; colors: any }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} value={value} onChangeText={onChange} placeholderTextColor={colors.mutedForeground} />
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
  catDot: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 2 },
  rowTitle: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", flex: 1 },
  unreadBadge: { backgroundColor: "#e03e3e", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 100 },
  unreadText: { color: "#fff", fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  rowParticipants: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 3 },
  rowLastMsg: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 6, lineHeight: 16 },
  rowBottom: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  catBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 100 },
  catText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 100 },
  statusText: { fontSize: 10, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  rowDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  quickActions: { flexDirection: "row", gap: 6, marginTop: 8 },
  quickBtn: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  quickBtnText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  rowActions: { gap: 6 },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
