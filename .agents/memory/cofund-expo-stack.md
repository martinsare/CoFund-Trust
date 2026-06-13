---
name: CoFund Expo Stack
description: Architecture decisions, animation rules, route structure, and package gotchas for the CoFund Expo/React Native app
---

## Route Structure
- Tab screens: `app/(investor)/*.tsx` and `app/(business)/*.tsx`
- Stack screens: `app/investor/*.tsx` (no parentheses) — analytics, pro, kyc, referral, messages
- Global stack screens: `app/notifications.tsx`, `app/business/[id].tsx`
- All stack screens declared in `app/_layout.tsx`

## Investor Tabs (5)
Home (dashboard) → Explore → Market → Portfolio → Profile

## Business Tabs (5)
Dashboard → Analytics → Request → Updates → Profile

## Animation Rules
- Use `FadeInDown` / `FadeInUp` from `react-native-reanimated` with `.delay(ms).duration(500)`
- Stagger: 80–120ms between items; first element delay 0–100ms
- `PressableScale` uses `withSpring(0.95)` on press; defined in `components/AnimatedPrimitives.tsx`
- Layout animations (`.springify()` on layout prop) do NOT work on web — never use them
- Bar charts: View-based with `FadeInUp.delay(i*80)` per bar column — no SVG lib

## Key Packages
- `expo-clipboard@~8.0.8` — must match expo SDK expectation; install at workspace root via `pnpm add`
- `react-native-reanimated` plugin must be last in `babel.config.js` plugins array
- After `babel.config.js` changes, restart workflow — Metro auto-detects the change

## Colors
- Primary: `#1a5e9a` (navy), Accent: `#2db56e` (green), Background: `#f4f7ff`
- Gold: from `useColors()`, Purple: `#7c3aed`
- Currency: ₦ Nigerian Naira; `formatCurrency()` in `constants/mockData.ts`

## Demo Accounts
- `investor@cofund.africa` (any password) → investor flow
- `business@cofund.africa` (any password) → business flow

## Gotchas
- `write` tool requires explicit `read` tool call before overwriting existing files (bash cat output doesn't count)
- `expo-clipboard` install via `pnpm add` in workspace root, not `artifacts/cofund/`
- Metro caches "not found" resolution; always restart workflow after installing new packages
