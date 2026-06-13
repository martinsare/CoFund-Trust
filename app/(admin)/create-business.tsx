import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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

import { PressableScale } from "@/components/AnimatedPrimitives";
import { useSystemData } from "@/context/SystemContext";
import { useColors } from "@/hooks/useColors";

const INDUSTRIES = ["Agriculture", "Healthcare", "Logistics", "Technology", "Hospitality", "Real Estate", "Manufacturing", "Retail", "Energy"];
const INVESTMENT_TYPES = ["Profit Share", "Fixed Return", "Asset-Backed", "Asset Leasing", "Working Capital"];
const RISK_LEVELS = ["low", "medium", "high"] as const;

export default function AdminCreateBusiness() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { createBusiness } = useSystemData();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [sector, setSector] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [minInvestment, setMinInvestment] = useState("");
  const [expectedRoi, setExpectedRoi] = useState("");
  const [duration, setDuration] = useState("");
  const [investmentType, setInvestmentType] = useState("");
  const [yearsOperating, setYearsOperating] = useState("");
  const [employeeCount, setEmployeeCount] = useState("");
  const [revenueRange, setRevenueRange] = useState("");
  const [riskLevel, setRiskLevel] = useState<(typeof RISK_LEVELS)[number]>("medium");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name || !industry || !location || !fundingGoal || !minInvestment || !expectedRoi || !duration || !investmentType) {
      Alert.alert("Missing Fields", "Please fill the required business fields before continuing.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const created = createBusiness({
      name,
      industry,
      sector: sector || industry,
      location,
      description,
      fundingGoal: Number(fundingGoal.replace(/,/g, "")),
      minInvestment: Number(minInvestment.replace(/,/g, "")),
      expectedRoi,
      duration,
      investmentType,
      yearsOperating: Number(yearsOperating || "1"),
      employeeCount: Number(employeeCount || "0"),
      revenueRange: revenueRange || "Pending submission",
      trustScore: 50,
      riskLevel,
      daysLeft: 90,
    });
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Business Created", `${created.name} is now available for admin review and investor browsing.`, [
      { text: "Go to Businesses", onPress: () => router.replace("/(admin)/businesses") },
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
        <Text style={[styles.title, { color: colors.foreground }]}>Manual Intake</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>Admin-assisted onboarding for special cases (e.g. enterprise partners or migrated accounts).</Text>

        <View style={[styles.notice, { backgroundColor: "#fef3dc", borderColor: "#e08c1a" }]}>
          <Feather name="info" size={14} color="#9a5800" />
          <Text style={[styles.noticeText, { color: "#9a5800" }]}>
            Most businesses register themselves via "Raise Capital" on the app. Only use this for admin-assisted onboarding where the business cannot self-register.
          </Text>
        </View>

        <Section title="Business Identity" colors={colors}>
          <Field label="Business Name *" icon="briefcase" value={name} onChange={setName} placeholder="e.g. Lagos Pharma Distributors" colors={colors} />
          <PickerField label="Industry *" options={INDUSTRIES} selected={industry} onSelect={setIndustry} colors={colors} />
          <Field label="Sector" icon="layers" value={sector} onChange={setSector} placeholder="e.g. Healthcare" colors={colors} />
          <Field label="Location *" icon="map-pin" value={location} onChange={setLocation} placeholder="City, State" colors={colors} />
        </Section>

        <Section title="Investment Details" colors={colors}>
          <PickerField label="Investment Type *" options={INVESTMENT_TYPES} selected={investmentType} onSelect={setInvestmentType} colors={colors} />
          <Field label="Funding Goal (₦) *" icon="dollar-sign" value={fundingGoal} onChange={setFundingGoal} placeholder="e.g. 25,000,000" keyboardType="numeric" colors={colors} />
          <Field label="Minimum Investment (₦) *" icon="minimize-2" value={minInvestment} onChange={setMinInvestment} placeholder="e.g. 100,000" keyboardType="numeric" colors={colors} />
          <Field label="Expected ROI *" icon="trending-up" value={expectedRoi} onChange={setExpectedRoi} placeholder="e.g. 22-28%" colors={colors} />
          <Field label="Duration *" icon="clock" value={duration} onChange={setDuration} placeholder="e.g. 18 months" colors={colors} />
          <PickerField
            label="Risk Level"
            options={["low", "medium", "high"]}
            selected={riskLevel}
            onSelect={(value) => setRiskLevel(value as (typeof RISK_LEVELS)[number])}
            colors={colors}
          />
        </Section>

        <Section title="Business Context" colors={colors}>
          <Field label="Years Operating" icon="calendar" value={yearsOperating} onChange={setYearsOperating} placeholder="e.g. 3" keyboardType="numeric" colors={colors} />
          <Field label="Employee Count" icon="users" value={employeeCount} onChange={setEmployeeCount} placeholder="e.g. 48" keyboardType="numeric" colors={colors} />
          <Field label="Revenue Range" icon="bar-chart-2" value={revenueRange} onChange={setRevenueRange} placeholder="e.g. ₦180M-₦240M/yr" colors={colors} />
          <Field
            label="Business Summary"
            icon="align-left"
            value={description}
            onChange={setDescription}
            placeholder="Describe the business model, traction, and what investors are funding."
            multiline
            colors={colors}
          />
        </Section>

        <Pressable onPress={submit} disabled={loading}>
          <View style={[styles.submitBtn, { backgroundColor: "#7c3aed" }]}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="plus" size={16} color="#fff" />
                <Text style={styles.submitText}>Create Business</Text>
              </>
            )}
          </View>
        </Pressable>
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
  keyboardType,
  multiline,
  colors,
}: {
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
  onSelect: (v: string) => void;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => (
          <PressableScale
            key={option}
            style={[
              styles.chip,
              { borderColor: selected === option ? colors.accent : colors.border, backgroundColor: selected === option ? colors.accentLight : colors.background },
            ]}
            onPress={() => {
              onSelect(option);
              Haptics.selectionAsync();
            }}
          >
            <Text style={[styles.chipText, { color: selected === option ? colors.accentDark : colors.mutedForeground }]}>{option}</Text>
          </PressableScale>
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
  submitBtn: { borderRadius: 12, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 16 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
