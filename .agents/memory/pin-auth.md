---
name: PIN & Biometric Auth
description: Banking-style PIN lock system — architecture, flow, and key decisions
---

# PIN & Biometric Auth

## Architecture
- `context/PinContext.tsx` — manages lock state, biometric detection, SecureStore I/O
- `components/PinOverlay.tsx` — fullscreen overlay rendered in `app/_layout.tsx`
- Overlay shown only when `user && screen !== "idle"` (does not show on logged-out screens)

## Screen states (PinContext `screen`)
- `"idle"` → no overlay shown
- `"lock"` → user must authenticate (PIN or biometrics) to proceed
- `"setup-enter"` → creating PIN (first entry)
- `"setup-confirm"` → creating PIN (confirmation)

## Key decisions
- PIN stored as simple hash in `expo-secure-store` (Platform.OS === "web" falls back to localStorage)
- Auto-triggers biometric prompt 500ms after lock screen appears
- Locks app when returning from background after 30 seconds (LOCK_AFTER_BG_MS)
- 5 wrong attempts → 30s cooldown
- `firstPinRef` (useRef in PinOverlay) stores first PIN entry for confirm step — NOT state, to avoid async mismatch
- PIN setup prompted after login (600ms delay) if no PIN set; also after registration
- `promptSetup()` / `dismissSetup()` in PinContext control setup overlay

**Why:** Ref used for first PIN to avoid the stale closure problem where useState value isn't updated within the same render cycle when comparing entry vs confirm.
