import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { NOTIFICATIONS, Notification, NotificationType } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

type NFilter = "all" | NotificationType;

const FILTERS: { id: NFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "opportunity", label: "Opportunities" },
  { id: "investment", label: "Investments" },
  { id: "update", label: "Updates" },
  { id: "return", label: "Returns" },
];

const TYPE_CONFIG: Record<NotificationType, { icon: React.ComponentProps<typeof Feather>["name"]; color: string }> = {
  opportunity: { icon: "trending-up", color: "#1a5e9a" },
  investment: { icon: "briefcase", color: "#2db56e" },
  update: { icon: "info", color: "#e08c1a" },
  return: { icon: "dollar-sign", color: "#7c3aed" },
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<NFilter>("all");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = activeFilter === "all" ? notifications : notifications.filter((n) => n.type === activeFilter);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

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
            <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
            {unreadCount > 0 && (
              <Text style={[styles.sub, { color: colors.mutedForeground }]}>{unreadCount} unread</Text>
            )}
          </View>
          {unreadCount > 0 ? (
            <PressableScale style={[styles.markReadBtn, { borderColor: colors.border }]} onPress={markAllRead}>
              <Text style={[styles.markReadText, { color: colors.primary }]}>Mark all read</Text>
            </PressableScale>
          ) : (
            <View style={{ width: 80 }} />
          )}
        </View>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <PressableScale
              key={f.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === f.id ? colors.primary : colors.card,
                  borderColor: activeFilter === f.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setActiveFilter(f.id)}
            >
              <Text style={[styles.filterText, { color: activeFilter === f.id ? "#fff" : colors.mutedForeground }]}>
                {f.label}
              </Text>
            </PressableScale>
          ))}
        </View>
      </Animated.View>

      <FlatList
        data={filtered}
        keyExtractor={(n) => n.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(60 + index * 70).duration(400)}>
            <NotifRow notification={item} colors={colors} onPress={() => {
              setNotifications((prev) =>
                prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
              );
            }} />
          </Animated.View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bell-off" size={36} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No notifications</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>You're all caught up!</Text>
          </View>
        }
      />
    </View>
  );
}

function NotifRow({ notification, colors, onPress }: {
  notification: Notification;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  onPress: () => void;
}) {
  const cfg = TYPE_CONFIG[notification.type];
  return (
    <PressableScale
      onPress={onPress}
      style={[
        styles.notif,
        {
          backgroundColor: notification.read ? colors.background : colors.card,
          borderLeftColor: notification.read ? colors.borderLight : cfg.color,
          borderBottomColor: colors.borderLight,
        },
      ]}
    >
      <View style={[styles.notifIcon, { backgroundColor: cfg.color + "18" }]}>
        <Feather name={cfg.icon} size={16} color={cfg.color} />
      </View>
      <View style={styles.notifBody}>
        <View style={styles.notifTop}>
          <Text style={[styles.notifTitle, { color: colors.foreground, fontWeight: notification.read ? "600" : "700" }]}>
            {notification.title}
          </Text>
          {!notification.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.notifBody2, { color: colors.mutedForeground }]} numberOfLines={2}>
          {notification.body}
        </Text>
        <Text style={[styles.notifTime, { color: colors.mutedForeground }]}>{notification.time}</Text>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  backBtn: { width: 40, height: 40, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800", fontFamily: "Inter_700Bold" },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  markReadBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 9, borderWidth: 1 },
  markReadText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingBottom: 6 },
  filterChip: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 9, borderWidth: 1.5 },
  filterText: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 20 },
  notif: {
    flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 14,
    borderLeftWidth: 3, paddingLeft: 12, borderBottomWidth: 1, marginBottom: 0,
  },
  notifIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  notifBody: { flex: 1, gap: 3 },
  notifTop: { flexDirection: "row", alignItems: "center", gap: 6 },
  notifTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notifBody2: { fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  notifTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  empty: { alignItems: "center", paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 8 },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
