import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

import { UserRole, useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Ethiopia"];

export default function Register() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const [role, setRole] = useState<UserRole>("investor");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [businessName, setBusinessName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const handleRegister = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (role === "business" && !businessName.trim()) {
      setError("Please enter your business name.");
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, phone, password, country, role, businessName });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (role === "investor") router.replace("/(investor)/dashboard");
      else router.replace("/(business)/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const RoleCard = ({ r, label, icon, desc }: { r: UserRole; label: string; icon: "trending-up" | "briefcase"; desc: string }) => (
    <Pressable
      style={[
        styles.roleCard,
        {
          borderColor: role === r ? colors.primary : colors.border,
          backgroundColor: role === r ? colors.primaryXLight : colors.card,
        },
      ]}
      onPress={() => { setRole(r); Haptics.selectionAsync(); }}
    >
      <View style={[styles.roleIcon, { backgroundColor: role === r ? colors.primaryLight : colors.muted }]}>
        <Feather name={icon} size={20} color={role === r ? colors.primary : colors.mutedForeground} />
      </View>
      <Text style={[styles.roleLabel, { color: role === r ? colors.primary : colors.foreground }]}>{label}</Text>
      <Text style={[styles.roleDesc, { color: colors.mutedForeground }]}>{desc}</Text>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 16, paddingBottom: bottomPad + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.primary} />
        </Pressable>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Create Account</Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>Join CoFund — Africa's trust-first investment platform</Text>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>I AM A</Text>
        <View style={styles.roleRow}>
          <RoleCard r="investor" label="Investor" icon="trending-up" desc="Fund vetted SMEs" />
          <RoleCard r="business" label="Business Owner" icon="briefcase" desc="Raise growth capital" />
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Field label="Full Name" icon="user" value={name} onChange={setName} placeholder="Adebayo Okafor" colors={colors} />
          <Field label="Phone Number" icon="phone" value={phone} onChange={setPhone} placeholder="080XXXXXXXX" keyboardType="phone-pad" colors={colors} />
          <Field label="Email Address" icon="mail" value={email} onChange={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} />
          <View style={styles.fieldGap}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.inputWrap, { borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Min. 8 characters"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
              />
              <Pressable onPress={() => setShowPw((v) => !v)}>
                <Feather name={showPw ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          </View>

          {role === "business" && (
            <Field label="Business Name" icon="briefcase" value={businessName} onChange={setBusinessName} placeholder="Your business name" colors={colors} />
          )}

          <View style={styles.fieldGap}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Country</Text>
            <View style={[styles.countryWrap, { backgroundColor: colors.muted, borderRadius: 10 }]}>
              {COUNTRIES.map((c) => (
                <Pressable
                  key={c}
                  style={[
                    styles.countryChip,
                    { borderColor: country === c ? colors.primary : colors.border, backgroundColor: country === c ? colors.primaryXLight : colors.card },
                  ]}
                  onPress={() => setCountry(c)}
                >
                  <Text style={[styles.countryText, { color: country === c ? colors.primary : colors.mutedForeground }]}>{c}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {error ? (
            <View style={[styles.errBox, { backgroundColor: colors.destructiveLight }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}
        </View>

        <Pressable onPress={handleRegister} disabled={loading}>
          <LinearGradient
            colors={["#1a5e9a", "#2db56e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btn}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </LinearGradient>
        </Pressable>

        <Pressable onPress={() => router.push("/(auth)/login")}>
          <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, icon, value, onChange, placeholder, keyboardType, autoCapitalize, colors,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words";
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.fieldGap}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputWrap, { borderColor: colors.border }]}>
        <Feather name={icon} size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          value={value}
          onChangeText={onChange}
          keyboardType={keyboardType ?? "default"}
          autoCapitalize={autoCapitalize}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  back: { marginBottom: 24, alignSelf: "flex-start", padding: 4 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.8, fontFamily: "Inter_700Bold" },
  sub: { fontSize: 14, marginTop: 6, lineHeight: 20, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 11, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 10, fontFamily: "Inter_600SemiBold" },
  roleRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  roleCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  roleIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  roleLabel: { fontSize: 13, fontWeight: "700", fontFamily: "Inter_700Bold" },
  roleDesc: { fontSize: 11, textAlign: "center", fontFamily: "Inter_400Regular" },
  card: { borderRadius: 16, borderWidth: 1, padding: 20, gap: 16, marginBottom: 20 },
  fieldGap: { gap: 6 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "Inter_600SemiBold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  countryWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 10 },
  countryChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
  countryText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  errBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10 },
  errText: { fontSize: 13, flex: 1, fontFamily: "Inter_400Regular" },
  btn: { borderRadius: 12, paddingVertical: 16, alignItems: "center", marginBottom: 20 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  switchText: { textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular" },
});
