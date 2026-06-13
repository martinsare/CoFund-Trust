import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { usePin } from "@/context/PinContext";
import { SoundManager } from "@/utils/soundManager";

const PIN_LENGTH = 4;

function useCooldownTick(cooldownUntil: number) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (cooldownUntil <= Date.now()) { setRemaining(0); return; }
    const update = () => {
      const r = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000));
      setRemaining(r);
      if (r > 0) requestAnimationFrame(update);
    };
    const raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [cooldownUntil]);
  return remaining;
}

export default function PinOverlay() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const {
    screen, pinEnabled, biometricAvailable, biometricLabel,
    failCount, cooldownUntil,
    setupPin, verifyPin, authenticateWithBiometrics,
    unlock, dismissSetup, advanceSetup, recordFailure, disablePin,
  } = usePin();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [setupSuccess, setSetupSuccess] = useState(false);
  const firstPinRef = useRef("");
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef(Array.from({ length: PIN_LENGTH }, () => new Animated.Value(0))).current;
  const cooldownRemaining = useCooldownTick(cooldownUntil);

  const isLock = screen === "lock";
  const isSetupEnter = screen === "setup-enter";
  const isSetupConfirm = screen === "setup-confirm";
  const isSetup = isSetupEnter || isSetupConfirm;

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const shake = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const animateDot = useCallback((index: number) => {
    Animated.sequence([
      Animated.timing(dotAnims[index], { toValue: 1, duration: 80, useNativeDriver: true }),
      Animated.timing(dotAnims[index], { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  }, [dotAnims]);

  const resetEntry = useCallback(() => {
    setPin("");
    setError("");
  }, []);

  useEffect(() => {
    resetEntry();
    setSetupSuccess(false);
  }, [screen, resetEntry]);

  const handleForgotPin = useCallback(() => {
    Alert.alert(
      "Forgot PIN?",
      "To reset your PIN, you'll be signed out. You can set a new PIN after signing back in with your password.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out & Reset",
          style: "destructive",
          onPress: async () => {
            await disablePin();
            await logout();
          },
        },
      ]
    );
  }, [disablePin, logout]);

  const tryBiometrics = useCallback(async () => {
    const ok = await authenticateWithBiometrics();
    if (ok) { SoundManager.unlock(); unlock(); }
    else { SoundManager.error(); setError(`${biometricLabel} failed. Enter your PIN.`); }
  }, [authenticateWithBiometrics, unlock, biometricLabel]);

  useEffect(() => {
    if (isLock && biometricAvailable) {
      const timer = setTimeout(tryBiometrics, 500);
      return () => clearTimeout(timer);
    }
  }, [isLock, biometricAvailable, tryBiometrics]);

  const handleDigit = useCallback((digit: string) => {
    if (cooldownRemaining > 0) return;
    const next = pin + digit;
    if (next.length > PIN_LENGTH) return;
    SoundManager.pinClick();
    Haptics.selectionAsync();
    animateDot(pin.length);
    setPin(next);
    setError("");

    if (next.length === PIN_LENGTH) {
      setTimeout(() => {
        if (isLock) {
          if (verifyPin(next)) {
            SoundManager.unlock();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            unlock();
          } else {
            SoundManager.error();
            shake();
            recordFailure();
            setError(failCount >= 4 ? "Too many attempts. Wait 30s." : `Incorrect PIN. ${4 - failCount} attempt${4 - failCount === 1 ? "" : "s"} left.`);
            setPin("");
          }
        } else if (isSetupEnter) {
          firstPinRef.current = next;
          advanceSetup(next);
        } else if (isSetupConfirm) {
          if (next === firstPinRef.current) {
            setSetupSuccess(true);
            setupPin(next);
            SoundManager.success();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            SoundManager.error();
            shake();
            setError("PINs don't match. Try again.");
            setPin("");
          }
        }
      }, 120);
    }
  }, [
    pin, cooldownRemaining, isLock, isSetupEnter, isSetupConfirm,
    verifyPin, unlock, shake, recordFailure, failCount,
    advanceSetup, setupPin, animateDot,
  ]);

  const handleDelete = useCallback(() => {
    if (!pin.length) return;
    Haptics.selectionAsync();
    setPin((p) => p.slice(0, -1));
    setError("");
  }, [pin]);

  if (screen === "idle") return null;

  const activePin = isSetupConfirm ? pin : pin;
  const dotsTitle = isLock ? "Enter your PIN" : isSetupEnter ? "Create a 4-digit PIN" : "Confirm your PIN";

  const KEYS: (string | "bio" | "del" | "")[] = [
    "1", "2", "3",
    "4", "5", "6",
    "7", "8", "9",
    biometricAvailable && isLock ? "bio" : "",
    "0",
    "del",
  ];

  return (
    <View style={[StyleSheet.absoluteFill, styles.overlay]}>
      <LinearGradient
        colors={["#0a1628", "#0d1f3c", "#112244"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.inner, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <View style={styles.logoRow}>
            <View style={styles.logoMark}>
              <Feather name="shield" size={22} color="#2db56e" />
            </View>
            <Text style={styles.logoText}>CoFund</Text>
          </View>

          {setupSuccess ? (
            <>
              <View style={styles.successIcon}>
                <Feather name="check-circle" size={44} color="#2db56e" />
              </View>
              <Text style={styles.greeting}>PIN activated!</Text>
              <Text style={styles.subText}>Your account is now protected. You'll be asked for this PIN each time you open the app.</Text>
            </>
          ) : (
            <>
              {isLock ? (
                <>
                  <Text style={styles.greeting}>Hello, {firstName} 👋</Text>
                  <Text style={styles.subText}>Verify it's you to continue</Text>
                </>
              ) : isSetupEnter ? (
                <>
                  <Text style={styles.greeting}>Set up your PIN</Text>
                  <Text style={styles.subText}>Choose a 4-digit PIN to secure your account</Text>
                </>
              ) : (
                <>
                  <Text style={styles.greeting}>Confirm PIN</Text>
                  <Text style={styles.subText}>Re-enter your PIN to confirm</Text>
                </>
              )}
            </>
          )}
        </View>

        {/* Dots */}
        {!setupSuccess && (
          <Animated.View style={[styles.dotsWrap, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={styles.dotsLabel}>{dotsTitle}</Text>
            <View style={styles.dots}>
              {Array.from({ length: PIN_LENGTH }).map((_, i) => {
                const filled = i < activePin.length;
                return (
                  <Animated.View
                    key={i}
                    style={[
                      styles.dot,
                      filled ? styles.dotFilled : styles.dotEmpty,
                      { transform: [{ scale: dotAnims[i].interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }] },
                    ]}
                  />
                );
              })}
            </View>
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : cooldownRemaining > 0 ? (
              <Text style={styles.errorText}>Try again in {cooldownRemaining}s</Text>
            ) : null}
          </Animated.View>
        )}

        {/* Keypad */}
        {!setupSuccess && (
          <View style={styles.keypad}>
            {KEYS.map((key, idx) => {
              if (key === "") return <View key={idx} style={styles.keyBtn} />;

              if (key === "bio") {
                return (
                  <Pressable key="bio" style={styles.keyBtn} onPress={tryBiometrics}>
                    <Feather
                      name={biometricLabel === "Face ID" ? "aperture" : "activity"}
                      size={26}
                      color="#2db56e"
                    />
                    <Text style={[styles.keySubLabel, { color: "#2db56e" }]}>{biometricLabel}</Text>
                  </Pressable>
                );
              }

              if (key === "del") {
                return (
                  <Pressable key="del" style={styles.keyBtn} onPress={handleDelete}>
                    <Feather name="delete" size={24} color="rgba(255,255,255,0.7)" />
                  </Pressable>
                );
              }

              const subLabels: Record<string, string> = {
                "2": "ABC", "3": "DEF", "4": "GHI", "5": "JKL",
                "6": "MNO", "7": "PQRS", "8": "TUV", "9": "WXYZ",
              };

              return (
                <Pressable
                  key={key}
                  style={({ pressed }) => [styles.keyBtn, pressed && styles.keyBtnPressed]}
                  onPress={() => handleDigit(key)}
                >
                  <Text style={styles.keyLabel}>{key}</Text>
                  {subLabels[key] && <Text style={styles.keySubLabel}>{subLabels[key]}</Text>}
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Footer actions */}
        <View style={styles.footer}>
          {setupSuccess ? (
            <Pressable style={styles.doneBtn} onPress={dismissSetup}>
              <Text style={styles.doneBtnText}>Continue to App</Text>
            </Pressable>
          ) : isSetup ? (
            <Pressable onPress={dismissSetup}>
              <Text style={styles.skipText}>Maybe Later</Text>
            </Pressable>
          ) : isLock ? (
            <Pressable onPress={handleForgotPin}>
              <Text style={styles.skipText}>Forgot PIN?</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { zIndex: 9999, elevation: 9999 },
  inner: { flex: 1, alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24 },
  headerWrap: { alignItems: "center", gap: 12, paddingTop: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  logoMark: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(45,181,110,0.15)", alignItems: "center", justifyContent: "center" },
  logoText: { fontSize: 22, fontWeight: "800", color: "#fff", letterSpacing: -0.5, fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_700Bold" },
  greeting: { fontSize: 24, fontWeight: "700", color: "#fff", textAlign: "center", letterSpacing: -0.3, fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_700Bold" },
  subText: { fontSize: 14, color: "rgba(255,255,255,0.55)", textAlign: "center", lineHeight: 20, maxWidth: 260, fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_400Regular" },
  successIcon: { width: 80, height: 80, borderRadius: 24, backgroundColor: "rgba(45,181,110,0.15)", alignItems: "center", justifyContent: "center", marginVertical: 8 },
  dotsWrap: { alignItems: "center", gap: 16 },
  dotsLabel: { fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5, textTransform: "uppercase", fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_400Regular" },
  dots: { flexDirection: "row", gap: 20 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  dotEmpty: { borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", backgroundColor: "transparent" },
  dotFilled: { backgroundColor: "#2db56e", borderWidth: 2, borderColor: "#2db56e" },
  errorText: { fontSize: 13, color: "#ff6b6b", textAlign: "center", fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_400Regular" },
  keypad: { flexDirection: "row", flexWrap: "wrap", width: 280, gap: 0 },
  keyBtn: { width: "33.33%", height: 72, alignItems: "center", justifyContent: "center", gap: 2 },
  keyBtnPressed: { opacity: 0.5 },
  keyLabel: { fontSize: 26, fontWeight: "300", color: "#fff", fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_400Regular" },
  keySubLabel: { fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_400Regular" },
  footer: { alignItems: "center", minHeight: 44, justifyContent: "center" },
  skipText: { fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_400Regular" },
  doneBtn: { backgroundColor: "#2db56e", paddingHorizontal: 40, paddingVertical: 14, borderRadius: 100 },
  doneBtnText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: Platform.OS === "web" ? "system-ui" : "Inter_700Bold" },
});
