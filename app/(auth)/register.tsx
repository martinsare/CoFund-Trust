import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInRight, FadeInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PressableScale } from "@/components/AnimatedPrimitives";
import { UserRole, useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "Ethiopia", "Rwanda", "Uganda", "Tanzania", "Cameroon", "Senegal"];

const INVESTMENT_GOALS = ["Grow wealth", "Passive income", "Retirement planning", "Save for future", "Diversify portfolio"];
const RISK_OPTIONS = [
  { label: "Conservative", sub: "Preserve capital, low risk", icon: "shield" as const },
  { label: "Moderate", sub: "Balanced growth & safety", icon: "activity" as const },
  { label: "Aggressive", sub: "High growth, higher risk", icon: "trending-up" as const },
];
const EXPERIENCE_OPTIONS = ["First timer", "1–2 years", "3–5 years", "5+ years"];
const INCOME_RANGES = ["Below ₦100k/mo", "₦100k – ₦500k/mo", "₦500k – ₦1M/mo", "Above ₦1M/mo"];
const FUND_SOURCES = ["Salary / Employment", "Business income", "Inheritance", "Savings", "Investments / Dividends"];

const BUSINESS_TYPES = ["Sole Proprietorship", "Partnership", "Limited Liability (LLC)", "NGO / Non-profit"];
const YEARS_OPERATING = ["Less than 1 year", "1–2 years", "3–5 years", "5+ years"];
const ANNUAL_REVENUE = ["Below ₦1M", "₦1M – ₦5M", "₦5M – ₦20M", "Above ₦20M"];

const TOTAL_STEPS = 5;

export default function Register() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const scrollRef = useRef<ScrollView>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState(1);
  const [forward, setForward] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Role
  const [role, setRole] = useState<UserRole>("investor");

  // Step 2 — Personal info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [country, setCountry] = useState("Nigeria");

  // Step 3 — Security
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  // Step 4a — Investor profile
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [riskTolerance, setRiskTolerance] = useState("");
  const [investmentExperience, setInvestmentExperience] = useState("");
  const [incomeRange, setIncomeRange] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("");
  const [bvn, setBvn] = useState("");

  // Step 4b — Business profile
  const [businessName, setBusinessName] = useState("");
  const [cacNumber, setCacNumber] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [yearsOperating, setYearsOperating] = useState("");
  const [annualRevenue, setAnnualRevenue] = useState("");

  // Step 5 — Terms
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedAge, setAgreedAge] = useState(false);

  const stepLabel = [
    "", "Account Type", "Personal Info", "Security", role === "investor" ? "Investor Profile" : "Business Profile", "Review & Agree",
  ][step];

  const go = (direction: 1 | -1) => {
    setError("");
    if (direction === 1 && !validate()) return;
    setForward(direction === 1);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep((s) => s + direction);
    setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: false }), 50);
  };

  const validate = (): boolean => {
    if (step === 2) {
      if (!name.trim()) { setError("Please enter your full name."); return false; }
      if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email address."); return false; }
      if (!phone.trim() || phone.length < 10) { setError("Please enter a valid phone number."); return false; }
      if (!dob.trim()) { setError("Please enter your date of birth."); return false; }
    }
    if (step === 3) {
      if (password.length < 8) { setError("Password must be at least 8 characters."); return false; }
      if (password !== confirmPw) { setError("Passwords do not match."); return false; }
    }
    if (step === 4 && role === "investor") {
      if (!investmentGoal) { setError("Please select an investment goal."); return false; }
      if (!riskTolerance) { setError("Please select your risk tolerance."); return false; }
      if (!incomeRange) { setError("Please select your income range."); return false; }
      if (!sourceOfFunds) { setError("Please select your source of funds."); return false; }
    }
    if (step === 4 && role === "business") {
      if (!businessName.trim()) { setError("Please enter your business name."); return false; }
      if (!businessType) { setError("Please select your business type."); return false; }
      if (!yearsOperating) { setError("Please select years in operation."); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!agreedTerms || !agreedPrivacy || !agreedAge) {
      setError("Please agree to all terms to continue.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register({
        name, email, phone, password, country, role,
        dateOfBirth: dob,
        bvn: bvn || undefined,
        investmentGoal: investmentGoal || undefined,
        riskTolerance: riskTolerance || undefined,
        investmentExperience: investmentExperience || undefined,
        incomeRange: incomeRange || undefined,
        sourceOfFunds: sourceOfFunds || undefined,
        businessName: businessName || undefined,
        cacNumber: cacNumber || undefined,
        businessType: businessType || undefined,
        yearsOperating: yearsOperating || undefined,
        annualRevenue: annualRevenue || undefined,
        referralCode: referralCode || undefined,
        agreedToTerms: true,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (role === "investor") router.replace("/(investor)/dashboard");
      else router.replace("/(business)/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Fixed header + progress */}
      <View style={[styles.fixedHeader, { paddingTop: topPad + 8, backgroundColor: colors.background }]}>
        <View style={styles.headerRow}>
          <Pressable
            style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => step === 1 ? router.back() : go(-1)}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={[styles.stepLabel, { color: colors.mutedForeground }]}>
              Step {step} of {TOTAL_STEPS}
            </Text>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>{stepLabel}</Text>
          </View>
          <View style={{ width: 38 }} />
        </View>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
          <Animated.View
            style={[styles.progressFill, { backgroundColor: colors.primary, width: `${(step / TOTAL_STEPS) * 100}%` as any }]}
          />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* STEP 1 — Role */}
        {step === 1 && (
          <Animated.View entering={forward ? FadeInRight.duration(300) : FadeInLeft.duration(300)} style={styles.stepContent}>
            <View style={styles.logoBlock}>
              <Image source={require("../../assets/images/cofund-logo-transparent.png")} style={styles.logoImage} resizeMode="contain" />
              <Text style={[styles.stepHeading, { color: colors.foreground }]}>Join CoFund</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Africa's trust-first investment platform</Text>
            </View>

            <Text style={[styles.pickLabel, { color: colors.mutedForeground }]}>I WANT TO</Text>
            <PressableScale
              style={[styles.roleCard, { backgroundColor: role === "investor" ? colors.primaryXLight : colors.card, borderColor: role === "investor" ? colors.primary : colors.border }]}
              onPress={() => { setRole("investor"); Haptics.selectionAsync(); }}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: role === "investor" ? colors.primaryLight : colors.muted }]}>
                <Feather name="trending-up" size={22} color={role === "investor" ? colors.primary : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleTitle, { color: role === "investor" ? colors.primary : colors.foreground }]}>Invest in SMEs</Text>
                <Text style={[styles.roleSub, { color: colors.mutedForeground }]}>Fund vetted African businesses and earn structured returns</Text>
              </View>
              <View style={[styles.radioOuter, { borderColor: role === "investor" ? colors.primary : colors.border }]}>
                {role === "investor" && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
              </View>
            </PressableScale>

            <PressableScale
              style={[styles.roleCard, { backgroundColor: role === "business" ? colors.primaryXLight : colors.card, borderColor: role === "business" ? colors.primary : colors.border }]}
              onPress={() => { setRole("business"); Haptics.selectionAsync(); }}
            >
              <View style={[styles.roleIconWrap, { backgroundColor: role === "business" ? colors.primaryLight : colors.muted }]}>
                <Feather name="briefcase" size={22} color={role === "business" ? colors.primary : colors.mutedForeground} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.roleTitle, { color: role === "business" ? colors.primary : colors.foreground }]}>Raise Capital</Text>
                <Text style={[styles.roleSub, { color: colors.mutedForeground }]}>List your SME and access funding from verified investors</Text>
              </View>
              <View style={[styles.radioOuter, { borderColor: role === "business" ? colors.primary : colors.border }]}>
                {role === "business" && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
              </View>
            </PressableScale>

            <View style={[styles.infoBox, { backgroundColor: colors.accentLight, borderColor: colors.accent }]}>
              <Feather name="info" size={14} color={colors.accentDark} />
              <Text style={[styles.infoText, { color: colors.accentDark }]}>
                {role === "investor"
                  ? "Minimum investment from ₦50,000. KYC required to unlock higher limits."
                  : "Business must be CAC-registered. Approval takes 3–5 business days."}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* STEP 2 — Personal Info */}
        {step === 2 && (
          <Animated.View entering={forward ? FadeInRight.duration(300) : FadeInLeft.duration(300)} style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>About You</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Your details are encrypted and secured</Text>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <InputField label="Full Legal Name" icon="user" value={name} onChange={setName} placeholder="As on your government ID" colors={colors} />
              <Divider colors={colors} />
              <InputField label="Phone Number" icon="phone" value={phone} onChange={setPhone} placeholder="080XXXXXXXX" keyboardType="phone-pad" colors={colors} />
              <Divider colors={colors} />
              <InputField label="Email Address" icon="mail" value={email} onChange={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" colors={colors} />
              <Divider colors={colors} />
              <InputField label="Date of Birth" icon="calendar" value={dob} onChange={setDob} placeholder="DD / MM / YYYY" keyboardType="numbers-and-punctuation" colors={colors} />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Country of Residence</Text>
            <View style={[styles.chipGrid, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {COUNTRIES.map((c) => (
                <Pressable
                  key={c}
                  style={[styles.chip, { borderColor: country === c ? colors.primary : colors.border, backgroundColor: country === c ? colors.primaryXLight : colors.background }]}
                  onPress={() => { setCountry(c); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.chipText, { color: country === c ? colors.primary : colors.foreground }]}>{c}</Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.noteBox, { backgroundColor: colors.muted }]}>
              <Feather name="lock" size={13} color={colors.mutedForeground} />
              <Text style={[styles.noteText, { color: colors.mutedForeground }]}>Your personal data is protected under our Privacy Policy and stored with bank-grade encryption.</Text>
            </View>
          </Animated.View>
        )}

        {/* STEP 3 — Security */}
        {step === 3 && (
          <Animated.View entering={forward ? FadeInRight.duration(300) : FadeInLeft.duration(300)} style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>Secure Your Account</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Choose a strong password to protect your funds</Text>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Password</Text>
                <View style={[styles.inputRow, { borderColor: colors.border }]}>
                  <Feather name="lock" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showPw}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <Pressable onPress={() => setShowPw((v) => !v)}>
                    <Feather name={showPw ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>
                <PasswordStrength pw={password} colors={colors} />
              </View>

              <Divider colors={colors} />

              <View style={styles.fieldWrap}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Confirm Password</Text>
                <View style={[styles.inputRow, { borderColor: confirmPw && confirmPw !== password ? colors.destructive : colors.border }]}>
                  <Feather name="lock" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Re-enter password"
                    placeholderTextColor={colors.mutedForeground}
                    secureTextEntry={!showConfirm}
                    value={confirmPw}
                    onChangeText={setConfirmPw}
                  />
                  <Pressable onPress={() => setShowConfirm((v) => !v)}>
                    <Feather name={showConfirm ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                  </Pressable>
                </View>
                {confirmPw.length > 0 && confirmPw !== password && (
                  <Text style={[styles.pwMismatch, { color: colors.destructive }]}>Passwords don't match</Text>
                )}
              </View>
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Referral Code (Optional)</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <InputField label="" icon="gift" value={referralCode} onChange={setReferralCode} placeholder="Enter referral code for ₦5,000 bonus" colors={colors} />
            </View>

            <View style={[styles.noteBox, { backgroundColor: colors.muted }]}>
              <Feather name="shield" size={13} color={colors.mutedForeground} />
              <Text style={[styles.noteText, { color: colors.mutedForeground }]}>Use uppercase, lowercase, numbers and symbols for a stronger password.</Text>
            </View>
          </Animated.View>
        )}

        {/* STEP 4a — Investor Profile */}
        {step === 4 && role === "investor" && (
          <Animated.View entering={forward ? FadeInRight.duration(300) : FadeInLeft.duration(300)} style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>Investor Profile</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Helps us personalise your investment experience</Text>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Primary Investment Goal</Text>
            <View style={styles.pillGrid}>
              {INVESTMENT_GOALS.map((g) => (
                <Pressable
                  key={g}
                  style={[styles.pill, { borderColor: investmentGoal === g ? colors.primary : colors.border, backgroundColor: investmentGoal === g ? colors.primaryXLight : colors.card }]}
                  onPress={() => { setInvestmentGoal(g); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.pillText, { color: investmentGoal === g ? colors.primary : colors.foreground }]}>{g}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Risk Tolerance</Text>
            <View style={{ gap: 10 }}>
              {RISK_OPTIONS.map((r) => (
                <PressableScale
                  key={r.label}
                  style={[styles.riskCard, { borderColor: riskTolerance === r.label ? colors.primary : colors.border, backgroundColor: riskTolerance === r.label ? colors.primaryXLight : colors.card }]}
                  onPress={() => { setRiskTolerance(r.label); Haptics.selectionAsync(); }}
                >
                  <View style={[styles.riskIcon, { backgroundColor: riskTolerance === r.label ? colors.primaryLight : colors.muted }]}>
                    <Feather name={r.icon} size={16} color={riskTolerance === r.label ? colors.primary : colors.mutedForeground} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.riskLabel, { color: riskTolerance === r.label ? colors.primary : colors.foreground }]}>{r.label}</Text>
                    <Text style={[styles.riskSub, { color: colors.mutedForeground }]}>{r.sub}</Text>
                  </View>
                  <View style={[styles.radioOuter, { borderColor: riskTolerance === r.label ? colors.primary : colors.border }]}>
                    {riskTolerance === r.label && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                </PressableScale>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Investment Experience</Text>
            <View style={styles.pillGrid}>
              {EXPERIENCE_OPTIONS.map((e) => (
                <Pressable
                  key={e}
                  style={[styles.pill, { borderColor: investmentExperience === e ? colors.primary : colors.border, backgroundColor: investmentExperience === e ? colors.primaryXLight : colors.card }]}
                  onPress={() => { setInvestmentExperience(e); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.pillText, { color: investmentExperience === e ? colors.primary : colors.foreground }]}>{e}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Monthly Income Range</Text>
            <View style={styles.pillGrid}>
              {INCOME_RANGES.map((i) => (
                <Pressable
                  key={i}
                  style={[styles.pill, { borderColor: incomeRange === i ? colors.primary : colors.border, backgroundColor: incomeRange === i ? colors.primaryXLight : colors.card }]}
                  onPress={() => { setIncomeRange(i); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.pillText, { color: incomeRange === i ? colors.primary : colors.foreground }]}>{i}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Source of Funds</Text>
            <View style={styles.pillGrid}>
              {FUND_SOURCES.map((s) => (
                <Pressable
                  key={s}
                  style={[styles.pill, { borderColor: sourceOfFunds === s ? colors.primary : colors.border, backgroundColor: sourceOfFunds === s ? colors.primaryXLight : colors.card }]}
                  onPress={() => { setSourceOfFunds(s); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.pillText, { color: sourceOfFunds === s ? colors.primary : colors.foreground }]}>{s}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>BVN / NIN (Optional but recommended)</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <InputField label="" icon="credit-card" value={bvn} onChange={setBvn} placeholder="Enter your 11-digit BVN or NIN" keyboardType="number-pad" colors={colors} />
            </View>
            <View style={[styles.noteBox, { backgroundColor: colors.amberLight }]}>
              <Feather name="alert-triangle" size={13} color={colors.amber} />
              <Text style={[styles.noteText, { color: colors.amber }]}>BVN/NIN is required for Tier 2 verification and investment limits above ₦500,000.</Text>
            </View>
          </Animated.View>
        )}

        {/* STEP 4b — Business Profile */}
        {step === 4 && role === "business" && (
          <Animated.View entering={forward ? FadeInRight.duration(300) : FadeInLeft.duration(300)} style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>Your Business</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Tell us about the business seeking funding</Text>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <InputField label="Business Name" icon="briefcase" value={businessName} onChange={setBusinessName} placeholder="Registered business name" colors={colors} />
              <Divider colors={colors} />
              <InputField label="CAC Registration Number" icon="file-text" value={cacNumber} onChange={setCacNumber} placeholder="e.g. RC-1234567" colors={colors} />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Business Type</Text>
            <View style={{ gap: 10 }}>
              {BUSINESS_TYPES.map((t) => (
                <PressableScale
                  key={t}
                  style={[styles.selectRow, { borderColor: businessType === t ? colors.primary : colors.border, backgroundColor: businessType === t ? colors.primaryXLight : colors.card }]}
                  onPress={() => { setBusinessType(t); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.selectText, { color: businessType === t ? colors.primary : colors.foreground }]}>{t}</Text>
                  <View style={[styles.radioOuter, { borderColor: businessType === t ? colors.primary : colors.border }]}>
                    {businessType === t && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                </PressableScale>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Years in Operation</Text>
            <View style={styles.pillGrid}>
              {YEARS_OPERATING.map((y) => (
                <Pressable
                  key={y}
                  style={[styles.pill, { borderColor: yearsOperating === y ? colors.primary : colors.border, backgroundColor: yearsOperating === y ? colors.primaryXLight : colors.card }]}
                  onPress={() => { setYearsOperating(y); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.pillText, { color: yearsOperating === y ? colors.primary : colors.foreground }]}>{y}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Annual Revenue</Text>
            <View style={styles.pillGrid}>
              {ANNUAL_REVENUE.map((r) => (
                <Pressable
                  key={r}
                  style={[styles.pill, { borderColor: annualRevenue === r ? colors.primary : colors.border, backgroundColor: annualRevenue === r ? colors.primaryXLight : colors.card }]}
                  onPress={() => { setAnnualRevenue(r); Haptics.selectionAsync(); }}
                >
                  <Text style={[styles.pillText, { color: annualRevenue === r ? colors.primary : colors.foreground }]}>{r}</Text>
                </Pressable>
              ))}
            </View>

            <View style={[styles.noteBox, { backgroundColor: colors.muted }]}>
              <Feather name="info" size={13} color={colors.mutedForeground} />
              <Text style={[styles.noteText, { color: colors.mutedForeground }]}>Your CAC documents will be verified before your business is listed on the platform.</Text>
            </View>
          </Animated.View>
        )}

        {/* STEP 5 — Review & Terms */}
        {step === 5 && (
          <Animated.View entering={forward ? FadeInRight.duration(300) : FadeInLeft.duration(300)} style={styles.stepContent}>
            <Text style={[styles.stepHeading, { color: colors.foreground }]}>Almost There!</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>Review your details and agree to our terms</Text>

            {/* Summary card */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <SummaryRow label="Name" value={name} colors={colors} />
              <SummaryRow label="Email" value={email} colors={colors} />
              <SummaryRow label="Phone" value={phone} colors={colors} />
              <SummaryRow label="Country" value={country} colors={colors} />
              <SummaryRow label="Date of Birth" value={dob} colors={colors} />
              <SummaryRow label="Account Type" value={role === "investor" ? "Investor" : "Business Owner"} colors={colors} last={role === "investor" && !investmentGoal} />
              {role === "investor" && investmentGoal ? (
                <>
                  <SummaryRow label="Investment Goal" value={investmentGoal} colors={colors} />
                  <SummaryRow label="Risk Tolerance" value={riskTolerance || "—"} colors={colors} />
                  <SummaryRow label="Income Range" value={incomeRange || "—"} colors={colors} last />
                </>
              ) : null}
              {role === "business" && businessName ? (
                <>
                  <SummaryRow label="Business Name" value={businessName} colors={colors} />
                  <SummaryRow label="Business Type" value={businessType || "—"} colors={colors} last />
                </>
              ) : null}
            </View>

            {/* Agreements */}
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Agreements</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, gap: 0 }]}>
              <CheckItem
                checked={agreedTerms}
                onPress={() => { setAgreedTerms((v) => !v); Haptics.selectionAsync(); }}
                colors={colors}
              >
                I have read and agree to the{" "}
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Terms of Service</Text>
                {" "}and{" "}
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Investment Risk Disclosure</Text>
              </CheckItem>
              <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
              <CheckItem
                checked={agreedPrivacy}
                onPress={() => { setAgreedPrivacy((v) => !v); Haptics.selectionAsync(); }}
                colors={colors}
              >
                I agree to the{" "}
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Privacy Policy</Text>
                {" "}and consent to the processing of my personal data
              </CheckItem>
              <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />
              <CheckItem
                checked={agreedAge}
                onPress={() => { setAgreedAge((v) => !v); Haptics.selectionAsync(); }}
                colors={colors}
              >
                I confirm I am{" "}
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>18 years or older</Text>
                {" "}and the information I provided is accurate
              </CheckItem>
            </View>

            {error ? (
              <View style={[styles.errBox, { backgroundColor: colors.destructiveLight }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errText, { color: colors.destructive }]}>{error}</Text>
              </View>
            ) : null}

            <Pressable onPress={handleSubmit} disabled={loading}>
              <LinearGradient colors={["#1a5e9a", "#2db56e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.submitBtn}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <>
                    <Feather name="check-circle" size={18} color="#fff" />
                    <Text style={styles.submitText}>Create My Account</Text>
                  </>
                )}
              </LinearGradient>
            </Pressable>

            <Pressable onPress={() => router.push("/(auth)/login")}>
              <Text style={[styles.switchText, { color: colors.mutedForeground }]}>
                Already have an account?{" "}
                <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign In</Text>
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Error bar (steps 1–4) */}
        {error && step < 5 ? (
          <View style={[styles.errBox, { backgroundColor: colors.destructiveLight, marginHorizontal: 20 }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : null}

        {/* Next button (steps 1–4) */}
        {step < 5 && (
          <View style={styles.navRow}>
            <PressableScale style={[styles.nextBtn, { backgroundColor: colors.primary }]} onPress={() => go(1)}>
              <Text style={styles.nextText}>Continue</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </PressableScale>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────

function InputField({
  label, icon, value, onChange, placeholder, keyboardType, autoCapitalize, colors,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad" | "numbers-and-punctuation";
  autoCapitalize?: "none" | "sentences" | "words";
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <View style={styles.fieldWrap}>
      {label ? <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text> : null}
      <View style={[styles.inputRow, { borderColor: colors.border }]}>
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

function Divider({ colors }: { colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  return <View style={[styles.dividerLine, { backgroundColor: colors.borderLight }]} />;
}

function PasswordStrength({ pw, colors }: { pw: string; colors: ReturnType<typeof import("@/hooks/useColors").useColors> }) {
  const score = [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const label = ["", "Weak", "Fair", "Good", "Strong"][score];
  const barColor = ["", colors.destructive, colors.amber, colors.primary, colors.accent][score];
  if (!pw) return null;
  return (
    <View style={styles.pwStrengthWrap}>
      <View style={styles.pwBars}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.pwBar, { backgroundColor: i <= score ? barColor : colors.muted }]} />
        ))}
      </View>
      <Text style={[styles.pwLabel, { color: barColor }]}>{label}</Text>
    </View>
  );
}

function SummaryRow({ label, value, colors, last }: {
  label: string;
  value: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
  last?: boolean;
}) {
  return (
    <View style={[styles.summaryRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
      <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.summaryValue, { color: colors.foreground }]} numberOfLines={1}>{value || "—"}</Text>
    </View>
  );
}

function CheckItem({
  checked, onPress, children, colors,
}: {
  checked: boolean;
  onPress: () => void;
  children: React.ReactNode;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}) {
  return (
    <Pressable style={styles.checkRow} onPress={onPress}>
      <View style={[styles.checkbox, { borderColor: checked ? colors.primary : colors.border, backgroundColor: checked ? colors.primary : "transparent" }]}>
        {checked && <Feather name="check" size={12} color="#fff" />}
      </View>
      <Text style={[styles.checkText, { color: colors.foreground }]}>{children}</Text>
    </Pressable>
  );
}

// ─── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  fixedHeader: { paddingHorizontal: 20, paddingBottom: 12, zIndex: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  stepLabel: { fontSize: 11, fontFamily: "Inter_400Regular", marginBottom: 1 },
  stepTitle: { fontSize: 14, fontWeight: "700", fontFamily: "Inter_700Bold" },
  progressTrack: { height: 4, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 4 },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  stepContent: { gap: 16, paddingBottom: 8 },
  logoBlock: { alignItems: "center", marginBottom: 8, gap: 4 },
  logoImage: { width: 110, height: 80, marginBottom: 4 },
  stepHeading: { fontSize: 24, fontWeight: "800", fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  stepSub: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  pickLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Inter_600SemiBold" },
  roleCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 2, padding: 16 },
  roleIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  roleTitle: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 3 },
  roleSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  infoBox: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1, alignItems: "flex-start" },
  infoText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, flex: 1 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 14 },
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5, fontFamily: "Inter_600SemiBold" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  dividerLine: { height: 1 },
  pwStrengthWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  pwBars: { flexDirection: "row", gap: 4, flex: 1 },
  pwBar: { flex: 1, height: 3, borderRadius: 2 },
  pwLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", width: 50, textAlign: "right" },
  pwMismatch: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
  sectionLabel: { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "Inter_600SemiBold", marginBottom: -6 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 14, borderRadius: 14, borderWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9, borderWidth: 1.5 },
  chipText: { fontSize: 13, fontWeight: "500", fontFamily: "Inter_500Medium" },
  pillGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5 },
  pillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  riskCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1.5, padding: 14 },
  riskIcon: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  riskLabel: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  riskSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  selectRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1.5, padding: 14 },
  selectText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  noteBox: { flexDirection: "row", gap: 10, padding: 12, borderRadius: 12, alignItems: "flex-start" },
  noteText: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 18, flex: 1 },
  summaryRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  summaryLabel: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  summaryValue: { fontSize: 13, fontWeight: "600", fontFamily: "Inter_600SemiBold", flex: 1, textAlign: "right" },
  checkRow: { flexDirection: "row", gap: 12, padding: 14, alignItems: "flex-start" },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center", marginTop: 1 },
  checkText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  errBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10 },
  errText: { fontSize: 13, flex: 1, fontFamily: "Inter_400Regular" },
  submitBtn: { borderRadius: 14, paddingVertical: 17, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  switchText: { textAlign: "center", fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  navRow: { marginTop: 8 },
  nextBtn: { borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  nextText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
