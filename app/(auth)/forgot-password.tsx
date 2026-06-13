import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import Animated, { FadeInDown, FadeInRight, FadeInLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { SoundManager } from "@/utils/soundManager";

const DEMO_OTP = "123456";
const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

function getStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: "Very Weak", color: "#e03e3e" };
  if (score === 2) return { score, label: "Weak", color: "#e08c1a" };
  if (score === 3) return { score, label: "Fair", color: "#e0c01a" };
  if (score === 4) return { score, label: "Good", color: "#2db56e" };
  return { score: 5, label: "Strong", color: "#1a7a4a" };
}

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPassword() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState<Step>("email");
  const [forward, setForward] = useState(true);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(RESEND_DELAY);
  const [resending, setResending] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const strength = getStrength(password);

  const startTimer = useCallback(() => {
    setResendTimer(RESEND_DELAY);
    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { clearInterval(timerRef.current!); return 0; }
        return t - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { timerRef.current && clearInterval(timerRef.current); }, []);

  const goForward = (s: Step) => { setForward(true); setStep(s); };
  const goBack = (s: Step) => { setForward(false); setStep(s); };

  const handleSendCode = async () => {
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Please enter a valid email address.");
      SoundManager.error();
      return;
    }
    setLoading(true);
    setEmailError("");
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    startTimer();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    SoundManager.notification();
    goForward("otp");
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[idx] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
    if (next.every(Boolean)) {
      setTimeout(() => handleVerifyOtp(next), 120);
    }
  };

  const handleOtpKeyPress = (e: { nativeEvent: { key: string } }, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = (digits: string[] = otp) => {
    const entered = digits.join("");
    if (entered === DEMO_OTP || entered.length === OTP_LENGTH) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      SoundManager.unlock();
      goForward("password");
    } else {
      setOtpError("Incorrect code. Please try again.");
      SoundManager.error();
      setOtp(Array(OTP_LENGTH).fill(""));
      otpRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    setResending(true);
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    await new Promise((r) => setTimeout(r, 800));
    setResending(false);
    startTimer();
    SoundManager.notification();
  };

  const handleSetPassword = async () => {
    setPwError("");
    if (strength.score < 3) {
      setPwError("Password is too weak. Use a mix of upper/lowercase, numbers, and symbols.");
      SoundManager.error();
      return;
    }
    if (password !== confirmPassword) {
      setPwError("Passwords don't match.");
      SoundManager.error();
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    SoundManager.success();
    goForward("success");
  };

  const reqChecks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Uppercase letter (A–Z)", ok: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a–z)", ok: /[a-z]/.test(password) },
    { label: "Number (0–9)", ok: /[0-9]/.test(password) },
    { label: "Special character (!@#$…)", ok: /[^A-Za-z0-9]/.test(password) },
  ];

  const anim = forward ? FadeInRight.duration(280) : FadeInLeft.duration(280);

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: topPad + 16, paddingBottom: bottomPad + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step !== "success" && (
          <Pressable
            style={styles.back}
            onPress={() => {
              if (step === "email") router.back();
              else if (step === "otp") goBack("email");
              else if (step === "password") goBack("otp");
            }}
          >
            <Feather name="arrow-left" size={22} color={colors.primary} />
          </Pressable>
        )}

        <View style={styles.progressRow}>
          {(["email", "otp", "password"] as Step[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                { backgroundColor: step === "success" || ["email", "otp", "password"].indexOf(step) >= i ? colors.primary : colors.borderLight },
              ]}
            />
          ))}
        </View>

        {/* ── STEP 1: EMAIL ── */}
        {step === "email" && (
          <Animated.View key="email" entering={anim} style={styles.stepWrap}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryXLight }]}>
              <Feather name="lock" size={28} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Forgot Password?</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Enter your registered email. We'll send you a verification code to reset your password.
            </Text>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>Email Address</Text>
              <View style={[styles.inputRow, { borderColor: emailError ? colors.destructive : colors.border }]}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={(v) => { setEmail(v); setEmailError(""); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
              </View>
              {emailError ? (
                <View style={[styles.errRow, { backgroundColor: colors.destructiveLight }]}>
                  <Feather name="alert-circle" size={13} color={colors.destructive} />
                  <Text style={[styles.errText, { color: colors.destructive }]}>{emailError}</Text>
                </View>
              ) : null}
            </View>

            <Pressable onPress={handleSendCode} disabled={loading}>
              <LinearGradient colors={["#1a5e9a", "#2db56e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Send Verification Code</Text>}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === "otp" && (
          <Animated.View key="otp" entering={anim} style={styles.stepWrap}>
            <View style={[styles.iconCircle, { backgroundColor: "#fef3dc" }]}>
              <Feather name="message-square" size={28} color="#e08c1a" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Enter Code</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              We sent a 6-digit code to{"\n"}
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{email}</Text>
            </Text>

            <View style={[styles.demoBox, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
              <Feather name="info" size={13} color={colors.primary} />
              <Text style={[styles.demoText, { color: colors.primary }]}>
                Demo mode: use code <Text style={{ fontFamily: "Inter_700Bold" }}>123456</Text>
              </Text>
            </View>

            <View style={styles.otpRow}>
              {Array(OTP_LENGTH).fill(null).map((_, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { otpRefs.current[i] = r; }}
                  style={[
                    styles.otpBox,
                    {
                      backgroundColor: colors.card,
                      borderColor: otp[i] ? colors.primary : otpError ? colors.destructive : colors.border,
                      color: colors.foreground,
                    },
                  ]}
                  value={otp[i]}
                  onChangeText={(v) => handleOtpChange(v, i)}
                  onKeyPress={(e) => handleOtpKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            {otpError ? (
              <View style={[styles.errRow, { backgroundColor: colors.destructiveLight }]}>
                <Feather name="alert-circle" size={13} color={colors.destructive} />
                <Text style={[styles.errText, { color: colors.destructive }]}>{otpError}</Text>
              </View>
            ) : null}

            <Pressable
              onPress={() => handleVerifyOtp()}
              disabled={otp.some((d) => !d)}
              style={({ pressed }) => [{ opacity: otp.some((d) => !d) || pressed ? 0.6 : 1 }]}
            >
              <LinearGradient colors={["#1a5e9a", "#2db56e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                <Text style={styles.btnText}>Verify Code</Text>
              </LinearGradient>
            </Pressable>

            <View style={styles.resendRow}>
              {resendTimer > 0 ? (
                <Text style={[styles.resendText, { color: colors.mutedForeground }]}>
                  Resend code in <Text style={{ color: colors.foreground }}>{resendTimer}s</Text>
                </Text>
              ) : (
                <Pressable onPress={handleResend} disabled={resending}>
                  <Text style={[styles.resendLink, { color: colors.primary }]}>
                    {resending ? "Sending…" : "Resend Code"}
                  </Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        )}

        {/* ── STEP 3: NEW PASSWORD ── */}
        {step === "password" && (
          <Animated.View key="password" entering={anim} style={styles.stepWrap}>
            <View style={[styles.iconCircle, { backgroundColor: "#d6f5e7" }]}>
              <Feather name="shield" size={28} color="#1a7a4a" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>New Password</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Create a strong password to keep your account secure.
            </Text>

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>New Password</Text>
              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <Feather name="lock" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPw}
                  autoFocus
                />
                <Pressable onPress={() => setShowPw((v) => !v)}>
                  <Feather name={showPw ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>

              {password.length > 0 && (
                <View style={styles.strengthWrap}>
                  <View style={styles.strengthBar}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <View
                        key={n}
                        style={[
                          styles.strengthSeg,
                          { backgroundColor: n <= strength.score ? strength.color : colors.borderLight },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[styles.strengthLabel, { color: strength.color }]}>{strength.label}</Text>
                </View>
              )}

              <View style={styles.divider} />

              <Text style={[styles.label, { color: colors.mutedForeground }]}>Confirm Password</Text>
              <View style={[styles.inputRow, { borderColor: colors.border }]}>
                <Feather name="lock" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.mutedForeground}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showCpw}
                />
                <Pressable onPress={() => setShowCpw((v) => !v)}>
                  <Feather name={showCpw ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                </Pressable>
              </View>
            </View>

            <View style={[styles.reqBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {reqChecks.map((r) => (
                <View key={r.label} style={styles.reqRow}>
                  <Feather
                    name={r.ok ? "check-circle" : "circle"}
                    size={13}
                    color={r.ok ? "#2db56e" : colors.mutedForeground}
                  />
                  <Text style={[styles.reqText, { color: r.ok ? colors.foreground : colors.mutedForeground }]}>
                    {r.label}
                  </Text>
                </View>
              ))}
            </View>

            {pwError ? (
              <View style={[styles.errRow, { backgroundColor: colors.destructiveLight }]}>
                <Feather name="alert-circle" size={13} color={colors.destructive} />
                <Text style={[styles.errText, { color: colors.destructive }]}>{pwError}</Text>
              </View>
            ) : null}

            <Pressable onPress={handleSetPassword} disabled={loading}>
              <LinearGradient colors={["#1a5e9a", "#2db56e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Update Password</Text>}
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* ── STEP 4: SUCCESS ── */}
        {step === "success" && (
          <Animated.View key="success" entering={FadeInDown.duration(400)} style={[styles.stepWrap, styles.successWrap]}>
            <View style={styles.successIcon}>
              <Feather name="check-circle" size={56} color="#2db56e" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Password Updated!</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Your password has been changed successfully. Please sign in with your new password.
            </Text>
            <View style={[styles.successCard, { backgroundColor: "#d6f5e7", borderColor: "#2db56e20" }]}>
              <Feather name="shield" size={16} color="#1a7a4a" />
              <Text style={[styles.successCardText, { color: "#1a7a4a" }]}>
                Your account is secured. Never share your password or PIN with anyone — CoFund will never ask for them.
              </Text>
            </View>
            <Pressable onPress={() => router.replace("/(auth)/login")}>
              <LinearGradient colors={["#1a7a4a", "#2db56e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                <Text style={styles.btnText}>Back to Sign In</Text>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  back: { marginBottom: 16, alignSelf: "flex-start", padding: 4 },
  progressRow: { flexDirection: "row", gap: 6, marginBottom: 28, alignSelf: "center" },
  progressDot: { width: 28, height: 4, borderRadius: 2 },
  stepWrap: { flex: 1, gap: 16 },
  iconCircle: { width: 68, height: 68, borderRadius: 20, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 4 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.6, fontFamily: "Inter_700Bold", textAlign: "center" },
  sub: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 4 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  label: { fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: "Inter_600SemiBold" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  errRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10 },
  errText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  demoBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  demoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  otpRow: { flexDirection: "row", gap: 10, justifyContent: "center", marginVertical: 8 },
  otpBox: { width: 46, height: 58, borderRadius: 12, borderWidth: 2, fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  resendRow: { alignItems: "center", marginTop: 4 },
  resendText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  resendLink: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  strengthWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  strengthBar: { flex: 1, flexDirection: "row", gap: 4 },
  strengthSeg: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 11, fontWeight: "600", fontFamily: "Inter_600SemiBold", minWidth: 60, textAlign: "right" },
  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.06)" },
  reqBox: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  reqRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  reqText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
  successWrap: { justifyContent: "center", alignItems: "center", flex: 1, gap: 20 },
  successIcon: { width: 100, height: 100, borderRadius: 28, backgroundColor: "#d6f5e7", alignItems: "center", justifyContent: "center" },
  successCard: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, width: "100%" },
  successCardText: { flex: 1, fontSize: 13, lineHeight: 19, fontFamily: "Inter_400Regular" },
});
