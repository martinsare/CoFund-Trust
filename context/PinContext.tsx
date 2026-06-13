import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

const PIN_HASH_KEY = "cofund_pin_hash";
const PIN_ENABLED_KEY = "cofund_pin_enabled";
const LOCK_AFTER_BG_MS = 30_000;

export type PinScreen = "idle" | "lock" | "setup-enter" | "setup-confirm";

interface PinContextType {
  screen: PinScreen;
  pinEnabled: boolean;
  biometricAvailable: boolean;
  biometricLabel: "Face ID" | "Fingerprint" | "Biometrics";
  failCount: number;
  cooldownUntil: number;
  setupPin: (pin: string) => Promise<void>;
  verifyPin: (pin: string) => boolean;
  authenticateWithBiometrics: () => Promise<boolean>;
  unlock: () => void;
  lockApp: () => void;
  disablePin: () => Promise<void>;
  promptSetup: () => void;
  dismissSetup: () => void;
  advanceSetup: (firstPin: string) => void;
  recordFailure: () => void;
}

const PinContext = createContext<PinContextType | null>(null);

function simpleHash(pin: string): string {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) + h) ^ pin.charCodeAt(i);
    h = h >>> 0;
  }
  return h.toString(16) + ":" + pin.length;
}

async function sGet(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  return SecureStore.getItemAsync(key);
}

async function sSet(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    try { localStorage.setItem(key, value); } catch {}
    return;
  }
  return SecureStore.setItemAsync(key, value);
}

async function sDel(key: string): Promise<void> {
  if (Platform.OS === "web") {
    try { localStorage.removeItem(key); } catch {}
    return;
  }
  return SecureStore.deleteItemAsync(key);
}

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<PinScreen>("idle");
  const [pinEnabled, setPinEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState<"Face ID" | "Fingerprint" | "Biometrics">("Biometrics");
  const [failCount, setFailCount] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const storedHashRef = useRef<string | null>(null);
  const bgTimeRef = useRef<number | null>(null);
  const pendingPinRef = useRef<string>("");

  useEffect(() => {
    (async () => {
      const enabled = await sGet(PIN_ENABLED_KEY);
      if (enabled === "true") {
        const hash = await sGet(PIN_HASH_KEY);
        storedHashRef.current = hash;
        setPinEnabled(true);
        setScreen("lock");
      }

      if (Platform.OS !== "web") {
        try {
          const hw = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          if (hw && enrolled) {
            setBiometricAvailable(true);
            const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
            if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
              setBiometricLabel("Face ID");
            } else {
              setBiometricLabel("Fingerprint");
            }
          }
        } catch {}
      }
    })();
  }, []);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (next === "background" || next === "inactive") {
        bgTimeRef.current = Date.now();
      } else if (next === "active") {
        if (bgTimeRef.current !== null && pinEnabled) {
          const elapsed = Date.now() - bgTimeRef.current;
          if (elapsed >= LOCK_AFTER_BG_MS) {
            setScreen("lock");
            setFailCount(0);
          }
        }
        bgTimeRef.current = null;
      }
    };
    const sub = AppState.addEventListener("change", onChange);
    return () => sub.remove();
  }, [pinEnabled]);

  const verifyPin = useCallback((pin: string): boolean => {
    if (!storedHashRef.current) return false;
    return simpleHash(pin) === storedHashRef.current;
  }, []);

  const setupPin = useCallback(async (pin: string) => {
    const hash = simpleHash(pin);
    await sSet(PIN_HASH_KEY, hash);
    await sSet(PIN_ENABLED_KEY, "true");
    storedHashRef.current = hash;
    setPinEnabled(true);
    setScreen("idle");
    pendingPinRef.current = "";
  }, []);

  const authenticateWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === "web" || !biometricAvailable) return false;
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access CoFund",
        fallbackLabel: "Use PIN",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
      });
      return res.success;
    } catch {
      return false;
    }
  }, [biometricAvailable]);

  const unlock = useCallback(() => {
    setScreen("idle");
    setFailCount(0);
  }, []);

  const lockApp = useCallback(() => {
    if (pinEnabled) {
      setScreen("lock");
      setFailCount(0);
    }
  }, [pinEnabled]);

  const disablePin = useCallback(async () => {
    await sDel(PIN_HASH_KEY);
    await sDel(PIN_ENABLED_KEY);
    storedHashRef.current = null;
    setPinEnabled(false);
    setScreen("idle");
    pendingPinRef.current = "";
  }, []);

  const promptSetup = useCallback(() => {
    pendingPinRef.current = "";
    setScreen("setup-enter");
  }, []);

  const dismissSetup = useCallback(() => {
    pendingPinRef.current = "";
    setScreen("idle");
  }, []);

  const advanceSetup = useCallback((firstPin: string) => {
    pendingPinRef.current = firstPin;
    setScreen("setup-confirm");
  }, []);

  const recordFailure = useCallback(() => {
    setFailCount((c) => {
      const next = c + 1;
      if (next >= 5) {
        setCooldownUntil(Date.now() + 30_000);
        return 0;
      }
      return next;
    });
  }, []);

  return (
    <PinContext.Provider
      value={{
        screen, pinEnabled, biometricAvailable, biometricLabel,
        failCount, cooldownUntil,
        setupPin, verifyPin, authenticateWithBiometrics,
        unlock, lockApp, disablePin,
        promptSetup, dismissSetup, advanceSetup,
        recordFailure,
      }}
    >
      {children}
    </PinContext.Provider>
  );
}

export function usePin() {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error("usePin must be used within PinProvider");
  return ctx;
}
