import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { MESSAGE_THREADS, MessageThread } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

export default function Messages() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const totalUnread = MESSAGE_THREADS.reduce((s, t) => s + t.unread, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInDown.delay(0).duration(500)}
        style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </Pressable>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Messages</Text>
            {totalUnread > 0 && (
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>{totalUnread} unread</Text>
            )}
          </View>
          <Pressable style={[styles.composeBtn, { backgroundColor: colors.primary }]}>
            <Feather name="edit-2" size={15} color="#fff" />
          </Pressable>
        </View>
      </Animated.View>

      <FlatList
        data={MESSAGE_THREADS}
        keyExtractor={(t) => t.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(80 + index * 80).duration(400)}>
            <ThreadRow thread={item} colors={colors} onPress={() => {}} />
          </Animated.View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="message-circle" size={36} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No messages yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Messages from businesses you've invested in appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}

function ThreadRow({ thread, colors, onPress }: { thread: MessageThread; colors: ReturnType<typeof import("@/hooks/useColors").useColors>; onPress: () => void }) {
  const hasUnread = thread.unread > 0;
  return (
    <PressableScale onPress={onPress} style={[styles.thread, { borderBottomColor: colors.borderLight }]}>
      <View style={[styles.threadAvatar, { backgroundColor: thread.color + "20" }]}>
        <Text style={[styles.threadInitials, { color: thread.color }]}>{thread.initials}</Text>
      </View>
      <View style={styles.threadBody}>
        <View style={styles.threadTop}>
          <Text style={[styles.threadName, { color: colors.foreground, fontWeight: hasUnread ? "700" : "600" }]}>
            {thread.businessName}
          </Text>
          <Text style={[styles.threadTime, { color: colors.mutedForeground }]}>{thread.timestamp}</Text>
        </View>
        <View style={styles.threadBottom}>
          <Text
            style={[styles.threadMsg, { color: hasUnread ? colors.foreground : colors.mutedForeground, fontWeight: hasUnread ? "500" : "400" }]}
            numberOfLines={1}
          >
            {thread.lastMessage}
          </Text>
          {hasUnread && (
            <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.unreadText}>{thread.unread}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.threadIndustry, { color: colors.mutedForeground }]}>{thread.industry}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  composeBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  list: { paddingHorizontal: 20 },
  thread: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 14, gap: 12, borderBottomWidth: 1 },
  threadAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  threadInitials: { fontSize: 15, fontWeight: "800", fontFamily: "Inter_700Bold" },
  threadBody: { flex: 1, gap: 3 },
  threadTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  threadName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  threadTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  threadBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  threadMsg: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1, marginRight: 8 },
  threadIndustry: { fontSize: 11, fontFamily: "Inter_400Regular" },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  unreadText: { fontSize: 10, color: "#fff", fontWeight: "700", fontFamily: "Inter_700Bold" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 8 },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20, fontFamily: "Inter_400Regular" },
});
