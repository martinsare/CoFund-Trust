import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
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

import { useColors } from "@/hooks/useColors";

const INVESTMENT_TYPES = ["Profit Share", "Fixed Return", "Asset-Backed", "Asset Leasing", "Working Capital"];
const INDUSTRIES = ["Agriculture", "Healthcare", "Logistics", "Technology", "Hospitality", "Real Estate", "Manufacturing", "Retail", "Energy"];
const DURATIONS = ["6 months", "12 months", "18 months", "24 months", "30 months", "36 months"];

export default function CreateFundingRequest() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");
  const [minInvestment, setMinInvestment] = useState("");
  const [expectedRoi, setExpectedRoi] = useState("");
  const [duration, setDuration] = useState("");
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !industry || !investmentType || !fundingAmount || !purpose) {
      Alert.alert("Missing Fields", "Please fill in all required fields before submitting.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Submitted!", "Your funding request has been submitted for review. CoFund will contact you within 3–5 business days.", [{ text: "OK" }]);
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
        <Text style={[styles.title, { color: colors.foreground }]}>Funding Request</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Submit your business for CoFund verification and listing</Text>

        <View style={[styles.notice, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
          <Feather name="info" size={14} color={colors.primary} />
          <Text style={[styles.noticeText, { color: colors.primary }]}>
            All submissions undergo thorough due diligence and security partner screening before listing.
          </Text>
        </View>

        <Section title="Business Information" colors={colors}>
          <Field label="Project Title *" icon="file-text" value={title} onChange={setTitle} placeholder="e.g. Branch Expansion – Ibadan" colors={colors} />
          <PickerField label="Industry *" options={INDUSTRIES} selected={industry} onSelect={setIndustry} colors={colors} />
          <Field label="Business Description" icon="align-left" value={description} onChange={setDescription} placeholder="Describe your business and track record…" multiline colors={colors} />
        </Section>

        <Section title="Investment Terms" colors={colors}>
          <PickerField label="Investment Type *" options={INVESTMENT_TYPES} selected={investmentType} onSelect={setInvestmentType} colors={colors} />
          <Field label="Funding Amount (₦) *" icon="dollar-sign" value={fundingAmount} onChange={setFundingAmount} placeholder="e.g. 25,000,000" keyboardType="numeric" colors={colors} />
          <Field label="Minimum Investment (₦) *" icon="minimize-2" value={minInvestment} onChange={setMinInvestment} placeholder="e.g. 100,000" keyboardType="numeric" colors={colors} />
          <Field label="Expected ROI *" icon="trending-up" value={expectedRoi} onChange={setExpectedRoi} placeholder="e.g. 22-28%" colors={colors} />
          <PickerField label="Duration *" options={DURATIONS} selected={duration} onSelect={setDuration} colors={colors} />
        </Section>

        <Section title="Project Details" colors={colors}>
          <Field
            label="Funding Purpose *"
            icon="target"
            value={purpose}
            onChange={setPurpose}
            placeholder="How will the funds be used? What milestones will you achieve?"
            multiline
            colors={colors}
          />
        </Section>

        <Section title="Documents (Required)" colors={colors}>
          {[
            { label: "CAC Certificate", icon: "file", required: true },
            { label: "Bank Statement (6 months)", icon: "credit-card", required: true },
            { label: "Government ID", icon: "user", required: true },
            { label: "Financial Statements", icon: "bar-chart-2", required: false },
          ].map((d) => (
            <Pressable key={d.label} style={[styles.docRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={[styles.docIcon, { backgroundColor: colors.primaryXLight }]}>
                <Feather name={d.icon as any} size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.docLabel, { color: colors.foreground }]}>{d.label}</Text>
                <Text style={[styles.docSub, { color: colors.mutedForeground }]}>{d.required ? "Required" : "Optional"}</Text>
              </View>
              <Pressable style={[styles.uploadBtn, { backgroundColor: colors.primaryXLight }]}>
                <Feather name="upload" size={14} color={colors.primary} />
                <Text style={[styles.uploadText, { color: colors.primary }]}>Upload</Text>
              </Pressable>
            </Pressable>
          ))}
        </Section>

        <Pressable onPress={handleSubmit} disabled={loading}>
          <LinearGradient
            colors={["#1a7a4a", "#2db56e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitBtn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="send" size={16} color="#fff" />
                <Text style={styles.submitText}>Submit for Review</Text>
              </>
            )}
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
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

function Field({ label, icon, value, onChange, placeholder, keyboardType, multiline, colors }: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric";
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
          keyboardType={keyboardType ?? "default"}
          multiline={multiline}
        />
      </View>
    </View>
  );
}

function PickerField({ label, options, selected, onSelect, colors }: {
  label: string;
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.chips}>
        {options.map((o) => (
          <Pressable
            key={o}
            style={[styles.chip, { borderColor: selected === o ? colors.accent : colors.border, backgroundColor: selected === o ? colors.accentLight : colors.background }]}
            onPress={() => { onSelect(o); Haptics.selectionAsync(); }}
          >
            <Text style={[styles.chipText, { color: selected === o ? colors.accentDark : colors.mutedForeground }]}>{o}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 4 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold", marginBottom: 4 },
  sub: { fontSize: 14, lineHeight: 20, fontFamily: "Inter_400Regular", marginBottom: 12 },
  notice: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 13, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  noticeText: { flex: 1, fontSize: 13, lineHeight: 18, fontFamily: "Inter_400Regular" },
  section: { gap: 8, marginBottom: 4 },
  sectionTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginTop: 12 },
  sectionCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "Inter_600SemiBold" },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  input: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
  chipText: { fontSize: 12, fontWeight: "500", fontFamily: "Inter_500Medium" },
  docRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 10, borderWidth: 1, padding: 12 },
  docIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  docLabel: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  docSub: { fontSize: 11, fontFamily: "Inter_400Regular" },
  uploadBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8 },
  uploadText: { fontSize: 12, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  submitBtn: { borderRadius: 12, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
