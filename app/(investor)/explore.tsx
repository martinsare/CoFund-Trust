import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OpportunityCard } from "@/components/OpportunityCard";
import { Business } from "@/constants/mockData";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";

type Filter = "all" | "low" | "closing" | "high_roi" | "new";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "low", label: "Low Risk" },
  { id: "high_roi", label: "High ROI" },
  { id: "closing", label: "Closing Soon" },
  { id: "new", label: "New" },
];

export default function Explore() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { businesses } = useSystemData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const filtered = useMemo(() => {
    let list: Business[] = businesses;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.industry.toLowerCase().includes(q) ||
          b.location.toLowerCase().includes(q)
      );
    }
    if (filter === "low") list = list.filter((b) => b.riskLevel === "low");
    if (filter === "closing") list = list.filter((b) => b.daysLeft <= 14);
    if (filter === "high_roi") list = list.filter((b) => parseInt(b.expectedRoi) >= 25);
    if (filter === "new") list = list.filter((b) => b.investorCount < 20);
    return list;
  }, [businesses, query, filter]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Animated.View
        entering={FadeInDown.delay(0).duration(500)}
        style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background }]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Explore</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          {businesses.length} verified opportunities
        </Text>

        <View style={[styles.searchWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search businesses, industries…"
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </Pressable>
          )}
        </View>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor: filter === f.id ? colors.primary : colors.card,
                  borderColor: filter === f.id ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                setFilter(f.id);
                Haptics.selectionAsync();
              }}
            >
              <Text style={[styles.filterText, { color: filter === f.id ? "#fff" : colors.mutedForeground }]}>
                {f.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>

      <FlatList
        data={filtered}
        keyExtractor={(b) => b.id}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 80).duration(400)} style={styles.cardWrap}>
            <OpportunityCard business={item} onPress={() => router.push(`/business/${item.id}`)} />
          </Animated.View>
        )}
        contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="search" size={36} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              Try a different search or filter
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold", marginBottom: 2 },
  sub: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 14 },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  filters: { flexDirection: "row", gap: 8, paddingBottom: 6 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 9, borderWidth: 1.5 },
  filterText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  list: { paddingHorizontal: 20 },
  cardWrap: { marginTop: 12 },
  empty: { alignItems: "center", paddingTop: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 4 },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular" },
});
