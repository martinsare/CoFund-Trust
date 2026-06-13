import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  Animated,
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

import { useAuth } from "@/context/AuthContext";
import { usePin } from "@/context/PinContext";
import { useColors } from "@/hooks/useColors";
import { SoundManager } from "@/utils/soundManager";

const PIN_LENGTH = 4;
const DEMO_OTP = "123456";

type Step = "method" | "verify-otp" | "enter-pin" | "confirm-pin" | "success";

function useCooldown() {
  const [secs, setSecs] = useState(0);
  const start = useCallback((s: number) => {
    setSecs(s);
    const id = setInterval(() => setSecs((c) => { if (c <= 1) { clearInterval(id); return 0; } return c - 1; }), 1000);
  }, []);
  return { secs, start };
}

export default function ResetPin() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { setupPin, authenticateWithBiometrics, biometricAvailable, biometricLabel } = usePin();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const [step, setStep] = useState<Step>("method");
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [pin, setPin] = useState("");
  const [firstPin, setFirstPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef(Array.from({ length: PIN_LENGTH }, () => new Animated.Value(0))).current;
  const { secs: resendSecs, start: startResend } = useCooldown();

  const shake = useCallback(() => {
    SoundManager.error();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const animDot = (i: number) => {
    Animated.sequence([
      Animated.timing(dotAnims[i], { toValue: 1.3, duration: 80, useNativeDriver: true }),
      Animated.timing(dotAnims[i], { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handleBiometric = async () => {
    setLoading(true);
    const ok = await authenticateWithBiometrics();
    setLoading(false);
    if (ok) {
      SoundManager.unlock();
      setStep("enter-pin");
    } else {
      SoundManager.error();
      Alert.alert("Verification Failed", "Biometric verification was not successful. Please try again or use email OTP.");
    }
  };

  const handleOtpChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otpDigits];
    next[idx] = digit;
    setOtpDigits(next);
    setOtpError("");
    if (digit && idx < 5) otpRefs.current[idx + 1]?.focus();
    if (next.every(Boolean)) setTimeout(() => verifyOtp(next), 120);
  };

  const handleOtpKeyPress = (e: { nativeEvent: { key: string } }, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const verifyOtp = (digits: string[] = otpDigits) => {
    if (digits.join("") === DEMO_OTP) {
      SoundManager.unlock();
      setStep("enter-pin");
    } else {
      shake();
      setOtpError("Incorrect code. Please try again.");
      setOtpDigits(Array(6).fill(""));
      otpRefs.current[0]?.focus();
    }
  };

  const handleDigit = useCallback((digit: string) => {
    const current = pin;
    if (current.length >= PIN_LENGTH) return;
    SoundManager.pinClick();
    Haptics.selectionAsync();
    animDot(current.length);
    const next = current + digit;
    setPin(next);
    setPinError("");

    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        if (step === "enter-pin") {
          setFirstPin(next);
          setPin("");
          setStep("confirm-pin");
        } else if (step === "confirm-pin") {
          if (next === firstPin) {
            setupPin(next);
            SoundManager.success();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStep("success");
          } else {
            shake();
            setPinError("PINs don't match. Try again.");
            setPin("");
          }
        }
      }, 120);
    }
  }, [pin, step, firstPin, setupPin, shake, animDot]);

  const handleDelete = useCallback(() => {
    if (!pin.length) return;
    SoundManager.pinClick();
    setPin((p) => p.slice(0, -1));
  }, [pin]);

  const KEYS: (string | "del" | "")[] = [
    "1","2","3","4","5","6","7","8","9","","0","del",
  ];

  const subLabels: Record<string, string> = {
    "2":"ABC","3":"DEF","4":"GHI","5":"JKL","6":"MNO","7":"PQRS","8":"TUV","9":"WXYZ",
  };

  const renderNumpad = () => (
    <View style={styles.keypad}>
      {KEYS.map((key, idx) => {
        if (key === "") return <View key={idx} style={styles.keyCell} />;
        if (key === "del") return (
          <Pressable key="del" style={styles.keyCell} onPress={handleDelete}>
            <Feather name="delete" size={22} color={colors.mutedForeground} />
          </Pressable>
        );
        return (
          <Pressable
            key={key}
            style={({ pressed }) => [styles.keyCell, pressed && { opacity: 0.4 }]}
            onPress={() => handleDigit(key)}
          >
            <View style={[styles.keyBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.keyLabel, { color: colors.foreground }]}>{key}</Text>
              {subLabels[key] && <Text style={[styles.keySub, { color: colors.mutedForeground }]}>{subLabels[key]}</Text>}
            </View>
          </Pressable>
        );
      })}
    </View>
  );

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
              if (step === "method") router.back();
              else if (step === "verify-otp") setStep("method");
              else if (step === "enter-pin") setStep("method");
              else if (step === "confirm-pin") { setPin(""); setStep("enter-pin"); }
            }}
          >
            <Feather name="arrow-left" size={22} color={colors.primary} />
          </Pressable>
        )}

        {/* ── METHOD SELECTION ── */}
        {step === "method" && (
          <View style={styles.section}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primaryXLight }]}>
              <Feather name="key" size={26} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Reset Your PIN</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              To set a new PIN, first verify your identity using one of the methods below.
            </Text>

            {biometricAvailable && (
              <Pressable
                style={[styles.methodCard, { backgroundColor: "#d6f5e7", borderColor: "#2db56e30" }]}
                onPress={handleBiometric}
                disabled={loading}
              >
                <View style={[styles.methodIcon, { backgroundColor: "#2db56e20" }]}>
                  <Feather name={biometricLabel === "Face ID" ? "aperture" : "activity"} size={22} color="#1a7a4a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.methodTitle, { color: "#1a7a4a" }]}>Use {biometricLabel}</Text>
                  <Text style={[styles.methodSub, { color: "#1a7a4a99" }]}>
                    Quick and secure — verify with your {biometricLabel.toLowerCase()} to reset PIN
                  </Text>
                </View>
                {loading ? null : <Feather name="chevron-right" size={18} color="#1a7a4a" />}
              </Pressable>
            )}

            <Pressable
              style={[styles.methodCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => { startResend(60); setStep("verify-otp"); setOtpDigits(Array(6).fill("")); }}
            >
              <View style={[styles.methodIcon, { backgroundColor: colors.primaryXLight }]}>
                <Feather name="mail" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.methodTitle, { color: colors.foreground }]}>Verify with Email OTP</Text>
                <Text style={[styles.methodSub, { color: colors.mutedForeground }]}>
                  We'll send a code to {user?.email ?? "your registered email"}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>

            <View style={[styles.securityNote, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Feather name="shield" size={14} color={colors.mutedForeground} />
              <Text style={[styles.securityText, { color: colors.mutedForeground }]}>
                For your security, CoFund will never ask for your PIN. Do not share it with anyone.
              </Text>
            </View>
          </View>
        )}

        {/* ── OTP VERIFICATION ── */}
        {step === "verify-otp" && (
          <View style={styles.section}>
            <View style={[styles.iconCircle, { backgroundColor: "#fef3dc" }]}>
              <Feather name="message-square" size={26} color="#e08c1a" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Enter Code</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              We sent a verification code to{"\n"}
              <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>{user?.email ?? "your email"}</Text>
            </Text>

            <View style={[styles.demoBox, { backgroundColor: colors.primaryXLight, borderColor: colors.primaryLight }]}>
              <Feather name="info" size={13} color={colors.primary} />
              <Text style={[styles.demoText, { color: colors.primary }]}>
                Demo mode: use code <Text style={{ fontFamily: "Inter_700Bold" }}>123456</Text>
              </Text>
            </View>

            <View style={styles.otpRow}>
              {Array(6).fill(null).map((_, i) => (
                <TextInput
                  key={i}
                  ref={(r) => { otpRefs.current[i] = r; }}
                  style={[
                    styles.otpBox,
                    {
                      backgroundColor: colors.card,
                      borderColor: otpDigits[i] ? colors.primary : otpError ? colors.destructive : colors.border,
                      color: colors.foreground,
                    },
                  ]}
                  value={otpDigits[i]}
                  onChangeText={(v) => handleOtpChange(v, i)}
                  onKeyPress={(e) => handleOtpKeyPress(e, i)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={i === 0}
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

            <View style={styles.resendRow}>
              {resendSecs > 0
                ? <Text style={[styles.resendText, { color: colors.mutedForeground }]}>Resend in {resendSecs}s</Text>
                : <Pressable onPress={() => startResend(60)}><Text style={[styles.resendLink, { color: colors.primary }]}>Resend Code</Text></Pressable>
              }
            </View>
          </View>
        )}

        {/* ── ENTER PIN ── */}
        {(step === "enter-pin" || step === "confirm-pin") && (
          <View style={styles.pinSection}>
            <Text style={[styles.pinTitle, { color: colors.foreground }]}>
              {step === "enter-pin" ? "Create New PIN" : "Confirm New PIN"}
            </Text>
            <Text style={[styles.pinSub, { color: colors.mutedForeground }]}>
              {step === "enter-pin" ? "Choose a 4-digit PIN to secure your account" : "Re-enter your new PIN to confirm"}
            </Text>

            <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.dot,
                    i < pin.length ? styles.dotFilled : [styles.dotEmpty, { borderColor: colors.border }],
                    { transform: [{ scale: dotAnims[i].interpolate({ inputRange: [1, 1.3], outputRange: [1, 1.3] }) }] },
                  ]}
                />
              ))}
            </Animated.View>

            {pinError ? (
              <View style={[styles.errRow, { backgroundColor: colors.destructiveLight }]}>
                <Feather name="alert-circle" size={13} color={colors.destructive} />
                <Text style={[styles.errText, { color: colors.destructive }]}>{pinError}</Text>
              </View>
            ) : null}

            {renderNumpad()}
          </View>
        )}

        {/* ── SUCCESS ── */}
        {step === "success" && (
          <View style={styles.successSection}>
            <View style={styles.successIcon}>
              <Feather name="check-circle" size={56} color="#2db56e" />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>PIN Reset!</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Your PIN has been updated successfully. Your account is now protected with the new PIN.
            </Text>
            <View style={[styles.securityNote, { backgroundColor: "#d6f5e7", borderColor: "#2db56e30" }]}>
              <Feather name="shield" size={14} color="#1a7a4a" />
              <Text style={[styles.securityText, { color: "#1a7a4a" }]}>
                Never share your PIN. CoFund support will never ask for it.
              </Text>
            </View>
            <Pressable onPress={() => router.replace("/")}>
              <LinearGradient colors={["#1a7a4a", "#2db56e"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.btn}>
                <Text style={styles.btnText}>Back to App</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  back: { marginBottom: 20, alignSelf: "flex-start", padding: 4 },
  section: { gap: 16 },
  iconCircle: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 4 },
  title: { fontSize: 26, fontWeight: "800", letterSpacing: -0.6, fontFamily: "Inter_700Bold", textAlign: "center" },
  sub: { fontSize: 14, lineHeight: 21, fontFamily: "Inter_400Regular", textAlign: "center" },
  methodCard: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1, padding: 16 },
  methodIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  methodTitle: { fontSize: 15, fontWeight: "700", fontFamily: "Inter_700Bold", marginBottom: 2 },
  methodSub: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 16 },
  securityNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  securityText: { flex: 1, fontSize: 12, lineHeight: 17, fontFamily: "Inter_400Regular" },
  demoBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, borderWidth: 1 },
  demoText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  otpRow: { flexDirection: "row", gap: 9, justifyContent: "center", marginVertical: 8 },
  otpBox: { width: 44, height: 56, borderRadius: 12, borderWidth: 2, fontSize: 22, fontWeight: "700", fontFamily: "Inter_700Bold" },
  errRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10 },
  errText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  resendRow: { alignItems: "center" },
  resendText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  resendLink: { fontSize: 14, fontWeight: "600", fontFamily: "Inter_600SemiBold" },
  pinSection: { flex: 1, alignItems: "center", gap: 20, paddingTop: 16 },
  pinTitle: { fontSize: 24, fontWeight: "800", letterSpacing: -0.4, fontFamily: "Inter_700Bold", textAlign: "center" },
  pinSub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  dotsRow: { flexDirection: "row", gap: 18, marginVertical: 8 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotEmpty: { borderWidth: 2, backgroundColor: "transparent" },
  dotFilled: { backgroundColor: "#2db56e", borderWidth: 2, borderColor: "#2db56e" },
  keypad: { flexDirection: "row", flexWrap: "wrap", width: 280 },
  keyCell: { width: "33.33%", height: 72, alignItems: "center", justifyContent: "center" },
  keyBtn: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  keyLabel: { fontSize: 24, fontWeight: "300", fontFamily: "Inter_400Regular" },
  keySub: { fontSize: 8, letterSpacing: 1.5, fontFamily: "Inter_400Regular" },
  successSection: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, paddingVertical: 40 },
  successIcon: { width: 100, height: 100, borderRadius: 28, backgroundColor: "#d6f5e7", alignItems: "center", justifyContent: "center" },
  btn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", minWidth: 200 },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
});
