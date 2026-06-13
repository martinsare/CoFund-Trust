import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MESSAGE_THREADS } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

interface ChatMessage {
  id: string;
  text: string;
  fromBusiness: boolean;
  time: string;
}

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  mt1: [
    { id: "1", text: "Hello! We wanted to update all our investors on Q2 performance.", fromBusiness: true, time: "10:00 AM" },
    { id: "2", text: "Revenue is up 18% quarter-on-quarter. Full report attached in the updates section.", fromBusiness: true, time: "10:01 AM" },
    { id: "3", text: "That's great news! When can we expect the next ROI payout?", fromBusiness: false, time: "10:45 AM" },
    { id: "4", text: "Payouts are scheduled for August 15th as per the investment terms. You'll receive a notification.", fromBusiness: true, time: "11:02 AM" },
    { id: "5", text: "Thanks for your continued support! Our Q2 report is attached.", fromBusiness: true, time: "2h ago" },
  ],
  mt2: [
    { id: "1", text: "We're excited to announce we've hit the 70% funding milestone!", fromBusiness: true, time: "Yesterday" },
    { id: "2", text: "The new processing facility groundbreaking is set for July 3rd.", fromBusiness: true, time: "Yesterday" },
    { id: "3", text: "Congratulations! Is there a way to attend the groundbreaking event?", fromBusiness: false, time: "Yesterday" },
    { id: "4", text: "Absolutely. All investors with ₦500K+ will receive an invitation by email. See the latest update.", fromBusiness: true, time: "1d ago" },
  ],
  mt3: [
    { id: "1", text: "Dear investor, your quarterly returns have been processed successfully.", fromBusiness: true, time: "3 days ago" },
    { id: "2", text: "₦42,500 has been credited to your CoFund wallet.", fromBusiness: true, time: "3 days ago" },
    { id: "3", text: "Received, thank you! How is the renovation progressing?", fromBusiness: false, time: "3 days ago" },
    { id: "4", text: "Phase 1 is 100% complete. Phase 2 (rooftop bar & conference) starts August.", fromBusiness: true, time: "3 days ago" },
  ],
  mt4: [
    { id: "1", text: "Great news — your investment has matured successfully!", fromBusiness: true, time: "1 week ago" },
    { id: "2", text: "Final return of ₦264,000 has been sent to your wallet. Thank you for believing in us.", fromBusiness: true, time: "1 week ago" },
    { id: "3", text: "Thank you! It's been a great investment. Will there be a new round?", fromBusiness: false, time: "1 week ago" },
    { id: "4", text: "We're planning a Series B in Q4 2026 for our Kaduna expansion. Watch this space!", fromBusiness: true, time: "1w ago" },
  ],
};

export default function ThreadDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [text, setText] = useState("");

  const thread = MESSAGE_THREADS.find((t) => t.id === id);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES[id ?? ""] ?? []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      text: trimmed,
      fromBusiness: false,
      time: "Just now",
    };
    setMessages((prev) => [...prev, newMsg]);
    setText("");
    setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!thread) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad + 20, alignItems: "center" }]}>
        <Text style={[styles.empty, { color: colors.mutedForeground }]}>Thread not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <Animated.View
        entering={FadeInDown.delay(0).duration(400)}
        style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}
      >
        <Pressable onPress={() => router.back()} style={[styles.backBtn, { borderColor: colors.border }]}>
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </Pressable>
        <View style={[styles.avatar, { backgroundColor: thread.color + "20" }]}>
          <Text style={[styles.avatarText, { color: thread.color }]}>{thread.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.threadName, { color: colors.foreground }]} numberOfLines={1}>{thread.businessName}</Text>
          <Text style={[styles.threadIndustry, { color: colors.mutedForeground }]}>{thread.industry}</Text>
        </View>
        <Pressable style={[styles.infoBtn, { backgroundColor: colors.muted }]}>
          <Feather name="info" size={16} color={colors.mutedForeground} />
        </Pressable>
      </Animated.View>

      {/* Messages */}
      <FlatList
        ref={flatRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={[styles.messageList, { paddingBottom: 12 }]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 40).duration(300)}
            style={[styles.bubbleWrap, item.fromBusiness ? styles.bubbleLeft : styles.bubbleRight]}
          >
            {item.fromBusiness && (
              <View style={[styles.bubbleAvatar, { backgroundColor: thread.color + "20" }]}>
                <Text style={[styles.bubbleAvatarText, { color: thread.color }]}>{thread.initials}</Text>
              </View>
            )}
            <View style={{ maxWidth: "75%" }}>
              <View style={[
                styles.bubble,
                item.fromBusiness
                  ? { backgroundColor: colors.card, borderColor: colors.border }
                  : { backgroundColor: colors.primary },
              ]}>
                <Text style={[
                  styles.bubbleText,
                  { color: item.fromBusiness ? colors.foreground : "#fff" },
                ]}>
                  {item.text}
                </Text>
              </View>
              <Text style={[
                styles.bubbleTime,
                { color: colors.mutedForeground, textAlign: item.fromBusiness ? "left" : "right" },
              ]}>
                {item.time}
              </Text>
            </View>
          </Animated.View>
        )}
        ListHeaderComponent={
          <View style={[styles.dateDivider]}>
            <View style={[styles.dateLine, { backgroundColor: colors.borderLight }]} />
            <Text style={[styles.dateText, { color: colors.mutedForeground, backgroundColor: colors.background }]}>
              Conversation
            </Text>
            <View style={[styles.dateLine, { backgroundColor: colors.borderLight }]} />
          </View>
        }
      />

      {/* Input */}
      <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(bottomPad, 16) }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.foreground, borderColor: colors.border }]}
          placeholder="Type a message…"
          placeholderTextColor={colors.mutedForeground}
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          returnKeyType="default"
        />
        <Pressable
          onPress={send}
          style={[styles.sendBtn, { backgroundColor: text.trim() ? colors.primary : colors.muted }]}
        >
          <Feather name="send" size={16} color={text.trim() ? "#fff" : colors.mutedForeground} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  avatar: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  threadName: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  threadIndustry: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  infoBtn: { width: 32, height: 32, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  messageList: { paddingHorizontal: 16, paddingTop: 12 },
  dateDivider: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  dateLine: { flex: 1, height: 1 },
  dateText: { fontSize: 11, fontFamily: "Inter_400Regular", paddingHorizontal: 4 },
  bubbleWrap: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end", gap: 6 },
  bubbleLeft: { justifyContent: "flex-start" },
  bubbleRight: { justifyContent: "flex-end" },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  bubbleAvatarText: { fontSize: 10, fontWeight: "700", fontFamily: "Inter_700Bold" },
  bubble: { borderRadius: 14, paddingHorizontal: 13, paddingVertical: 9, borderWidth: 1 },
  bubbleText: { fontSize: 14, lineHeight: 20, fontFamily: "Inter_400Regular" },
  bubbleTime: { fontSize: 10, fontFamily: "Inter_400Regular", marginTop: 3, paddingHorizontal: 4 },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
    minHeight: 44,
  },
  sendBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  empty: { fontSize: 15, fontFamily: "Inter_400Regular" },
});
