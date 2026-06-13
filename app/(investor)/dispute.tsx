import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { useAppData } from "@/context/AppDataContext";
import { INVESTMENTS } from "@/constants/mockData";
import { useAuth } from "@/context/AuthContext";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";

export default function InvestorDispute() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { businessId, investmentId } = useLocalSearchParams<{ businessId?: string; investmentId?: string }>();
  const { user } = useAuth();
  const { businesses, disputes, submitDispute } = useSystemData();
  const { DISPUTE_CATEGORIES: CATEGORIES } = useAppData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const relatedInvestments = useMemo(
    () => (businessId ? INVESTMENTS.filter((investment) => investment.businessId === businessId) : INVESTMENTS),
    [businessId]
  );
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(businessId ?? relatedInvestments[0]?.businessId ?? businesses[0]?.id ?? "");
  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string>(investmentId ?? relatedInvestments[0]?.id ?? "");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [subject, setSubject] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedBusiness = businesses.find((b) => b.id === selectedBusinessId) ?? businesses[0];
  const businessInvestments = INVESTMENTS.filter((investment) => investment.businessId === selectedBusiness?.id);
  const selectedInvestment = selectedInvestmentId ? INVESTMENTS.find((investment) => investment.id === selectedInvestmentId) : undefined;
  const selectedInvestmentLabel = selectedInvestment ? `${selectedInvestment.businessName} • ${selectedInvestment.investmentDate}` : "";
  const myDisputes = disputes.filter((dispute) => dispute.investorId === (user?.id ?? "demo_investor"));

  const submit = async () => {
    if (!selectedBusiness || !subject.trim() || !details.trim()) {
      Alert.alert("Missing Fields", "Choose a business and add a short summary plus the details of the concern.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const created = submitDispute({
      businessId: selectedBusiness.id,
      businessName: selectedBusiness.name,
      investorId: user?.id ?? "demo_investor",
      investorName: user?.name ?? "Investor",
      category,
      subject: subject.trim(),
      details: details.trim(),
      investmentId: selectedInvestmentId || undefined,
      evidenceCount: 0,
    });
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Concern submitted", `${created.reference} is now in the admin review queue.`, [
      { text: "Back to Portfolio", onPress: () => router.back() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 8, paddingBottom: bottomPad + 40 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Raise Concern</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>Send a dispute or issue report to the business and admin team.</Text>
          </View>
          <PressableScale style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={() => router.back()}>
            <Feather name="x" size={16} color={colors.foreground} />
          </PressableScale>
        </View>

        <View style={[styles.notice, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.noticeText, { color: colors.primary }]}>
            The dispute is created immediately for admin review. Evidence attachments can be connected later if you want document storage.
          </Text>
        </View>

        <Section title="Choose Investment" colors={colors}>
          <PickerField
            label="Business"
            options={businesses.map((business) => business.name)}
            selected={selectedBusiness?.name ?? ""}
            onSelect={(value) => {
              const business = businesses.find((item) => item.name === value);
              if (!business) return;
              setSelectedBusinessId(business.id);
              const firstInvestment = INVESTMENTS.find((investment) => investment.businessId === business.id);
              setSelectedInvestmentId(firstInvestment?.id ?? "");
            }}
            colors={colors}
          />
          <PickerField
            label="Investment"
            options={businessInvestments.length ? businessInvestments.map((investment) => `${investment.businessName} • ${investment.investmentDate}`) : ["No linked investment"]}
            selected={selectedInvestmentLabel}
            onSelect={(value) => {
              const investment = businessInvestments.find((item) => `${item.businessName} • ${item.investmentDate}` === value);
              if (investment) setSelectedInvestmentId(investment.id);
            }}
            colors={colors}
          />
        </Section>

        <Section title="Concern Details" colors={colors}>
          <PickerField label="Category" options={CATEGORIES} selected={category} onSelect={setCategory} colors={colors} />
          <Field label="Subject *" icon="alert-circle" value={subject} onChange={setSubject} placeholder="Short summary of the issue" colors={colors} />
          <Field
            label="Details *"
            icon="file-text"
            value={details}
            onChange={setDetails}
            placeholder="Explain what happened, expected timeline, and any supporting facts."
            multiline
            colors={colors}
          />
        </Section>

        <View style={[styles.helper, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="shield" size={14} color={colors.accent} />
          <Text style={[styles.helperText, { color: colors.foreground }]}>
            Logged disputes are visible to the business and admin panel. Right now, this is enough to trace the concern through the full flow.
          </Text>
        </View>

        <Pressable onPress={submit} disabled={loading}>
          <View style={[styles.submitBtn, { backgroundColor: "#e03e3e" }]}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="send" size={16} color="#fff" />
                <Text style={styles.submitText}>Submit Concern</Text>
              </>
            )}
          </View>
        </Pressable>

        <View style={[styles.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.historyTitle, { color: colors.foreground }]}>Your Recent Disputes</Text>
          {myDisputes.length ? (
            myDisputes.slice(0, 3).map((dispute) => (
              <View key={dispute.id} style={styles.historyRow}>
                <View style={[styles.historyDot, { backgroundColor: dispute.status === "resolved" ? "#2db56e" : "#e03e3e" }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historySubject, { color: colors.foreground }]}>{dispute.subject}</Text>
                  <Text style={[styles.historyMeta, { color: colors.mutedForeground }]}>
                    {dispute.reference} • {dispute.status.replace("_", " ")}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.historyEmpty, { color: colors.mutedForeground }]}>No disputes submitted yet.</Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>{children}</View>
    </View>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  multiline,
  colors,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border }, multiline && { alignItems: "flex-start", paddingTop: 12 }]}>
        <Feather name={icon} size={15} color={colors.mutedForeground} style={multiline ? { marginTop: 2 } : {}} />
        <TextInput
          style={[styles.input, { color: colors.foreground }, multiline && { minHeight: 80, textAlignVertical: "top" }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChange}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

function PickerField({
  label,
  options,
  selected,
  onSelect,
  colors,
}: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <PressableScale
            key={option}
            style={[styles.chip, { backgroundColor: selected === option ? colors.primary : colors.background, borderColor: selected === option ? colors.primary : colors.border }]}
            onPress={() => onSelect(option)}
          >
            <Text style={[styles.chipText, { color: selected === option ? "#fff" : colors.mutedForeground }]}>{option}</Text>
          </PressableScale>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 6 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 14, lineHeight: 20, fontFamily: "Inter_400Regular", marginTop: 2 },
  backBtn: { width: 38, height: 38, borderRadius: 11, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 13, borderRadius: 10, borderWidth: 1, marginVertical: 8 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  section: { gap: 8, marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 10 },
  sectionCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "Inter_600SemiBold" },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
  chipText: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium" },
  helper: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 4 },
  helperText: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  submitBtn: { borderRadius: 12, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 6 },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  historyCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10, marginTop: 6 },
  historyTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold" },
  historyRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  historyDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  historySubject: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  historyMeta: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  historyEmpty: { fontSize: 13, fontFamily: "Inter_400Regular" },
});
