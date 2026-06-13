import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BUSINESSES, BusinessUpdate, UpdateType } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

const UPDATE_TYPES: { id: UpdateType; label: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { id: "milestone", label: "Milestone", icon: "flag" },
  { id: "report", label: "Report", icon: "bar-chart-2" },
  { id: "update", label: "Update", icon: "message-circle" },
];

export default function BusinessUpdates() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [updates, setUpdates] = useState<BusinessUpdate[]>(BUSINESSES[0].updates);
  const [showModal, setShowModal] = useState(false);
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  const [updateType, setUpdateType] = useState<UpdateType>("update");

  const typeColors: Record<UpdateType, { bg: string; text: string }> = {
    milestone: { bg: colors.accentLight, text: colors.accentDark },
    report: { bg: colors.primaryLight, text: colors.primary },
    update: { bg: colors.amberLight, text: colors.amber },
  };

  const handlePost = () => {
    if (!updateTitle.trim() || !updateContent.trim()) {
      Alert.alert("Missing Fields", "Please enter a title and content.");
      return;
    }
    const newUpdate: BusinessUpdate = {
      id: Date.now().toString(),
      title: updateTitle.trim(),
      content: updateContent.trim(),
      date: new Date().toISOString().split("T")[0],
      type: updateType,
    };
    setUpdates([newUpdate, ...updates]);
    setUpdateTitle("");
    setUpdateContent("");
    setUpdateType("update");
    setShowModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8 }]}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Updates</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>{updates.length} posted updates</Text>
          </View>
          <Pressable onPress={() => setShowModal(true)}>
            <LinearGradient colors={["#1a7a4a", "#2db56e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postBtn}>
              <Feather name="plus" size={16} color="#fff" />
              <Text style={styles.postBtnText}>Post Update</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={updates}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => {
          const tc = typeColors[item.type];
          return (
            <View style={[styles.updateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.updateTop}>
                <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
                  <Text style={[styles.typeText, { color: tc.text }]}>
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </Text>
                </View>
                <Text style={[styles.updateDate, { color: colors.mutedForeground }]}>{item.date}</Text>
              </View>
              <Text style={[styles.updateTitle, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.updateContent, { color: colors.mutedForeground }]}>{item.content}</Text>
            </View>
          );
        }}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!!updates.length}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-square" size={36} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No updates yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Keep investors informed with regular updates</Text>
          </View>
        }
      />

      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowModal(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Platform.OS === "ios" ? 12 : insets.top + 12 }]}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Post Update</Text>
            <Pressable onPress={() => setShowModal(false)}>
              <Feather name="x" size={22} color={colors.mutedForeground} />
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Update Type</Text>
            <View style={styles.typeRow}>
              {UPDATE_TYPES.map((t) => (
                <Pressable
                  key={t.id}
                  style={[styles.typeChip, { borderColor: updateType === t.id ? colors.accent : colors.border, backgroundColor: updateType === t.id ? colors.accentLight : colors.card }]}
                  onPress={() => { setUpdateType(t.id); Haptics.selectionAsync(); }}
                >
                  <Feather name={t.icon} size={14} color={updateType === t.id ? colors.accentDark : colors.mutedForeground} />
                  <Text style={[styles.typeChipText, { color: updateType === t.id ? colors.accentDark : colors.mutedForeground }]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 14 }]}>Title *</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="Update title…"
              placeholderTextColor={colors.mutedForeground}
              value={updateTitle}
              onChangeText={setUpdateTitle}
            />

            <Text style={[styles.label, { color: colors.mutedForeground, marginTop: 14 }]}>Content *</Text>
            <TextInput
              style={[styles.textarea, { borderColor: colors.border, color: colors.foreground, backgroundColor: colors.card }]}
              placeholder="Share what's happening with your business, milestones achieved, or financial highlights…"
              placeholderTextColor={colors.mutedForeground}
              value={updateContent}
              onChangeText={setUpdateContent}
              multiline
              textAlignVertical="top"
            />

            <Pressable onPress={handlePost}>
              <LinearGradient colors={["#1a7a4a", "#2db56e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.postBtn2}>
                <Feather name="send" size={16} color="#fff" />
                <Text style={styles.postBtnText}>Post Update</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  postBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  postBtnText: { color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  list: { paddingHorizontal: 20 },
  updateCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 12, gap: 8 },
  updateTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  typeBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 100 },
  typeText: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  updateDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  updateTitle: { fontSize: 15, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  updateContent: { fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 4 },
  emptySub: { fontSize: 14, textAlign: "center", fontFamily: "Inter_400Regular" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: "700", fontFamily: "Inter_700Bold" },
  modalContent: { padding: 20, gap: 4 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "Inter_600SemiBold", marginBottom: 8 },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  typeChipText: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  input: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular" },
  textarea: { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, minHeight: 120, fontFamily: "Inter_400Regular" },
  postBtn2: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 15, marginTop: 16 },
});
