# MOB-BIO-001: Native BrainWorker Biometric Authentication & Quick Wallet Lock Preview (UI-Only)

**Version:** 1.0  
**Status:** Approved for Implementation (UI-Only Preview)  
**Date:** 2026-11-19  
**Phase:** Phase 4.4 Device Capabilities & Push Alerts (`apps/mobile`), Item 3 ("Device biometric authentication (Face ID / Fingerprint) for quick wallet access")  
**Target Route/Component:** `/brainworker/workspace-preview` (`apps/mobile/app/brainworker/workspace-preview.tsx`) and preview support module (`apps/mobile/lib/biometric-wallet-preview.ts`)  
**Parent Baseline:** `eabb5621fd7cb366dabc5e9b21231e531bc36194` (MOB-MEDIA-001 native work proof photo picker preview committed and pushed)  

---

## 1. Overview & Business Intent

In the BukieBrainJobs BrainWorker mobile workflow, security and operational velocity must balance:
1. **Wallet Security (`BW-006`)**: BrainWorkers accumulate earnings from completed jobs in their platform wallet. Protecting payout account numbers, accumulated balances, and transfer triggers from unauthorized eyes on a shared or unlocked phone is critical.
2. **Frictionless On-Site Access**: Re-entering complex passwords while on-site or wearing work gear creates friction. Device biometric authentication (Face ID on iOS or Fingerprint / BiometricPrompt on Android) offers fast, secure verification.

In this mobile milestone (`MOB-BIO-001`), biometric authentication and quick wallet lock are architected strictly as a **UI-only local preview**. BrainWorkers can preview the interaction flow for configuring biometric lock preferences, toggling simulated sensor types, viewing locked wallet balances, and simulating biometric authentication challenges without invoking unmocked native hardware drivers, accessing hardware keychains or SecureStore, or mutating real banking and payout balances.

---

## 2. Scope Boundaries & Strict Prohibitions

### 2.1 In Scope (UI-Only Preview)
1. **In-Memory Biometric Wallet State**:
   - Biometric lock enabled/disabled toggle (defaults to disabled or enabled sample state).
   - Biometric sensor type simulation: `FACE_ID` (iOS Face ID) vs `FINGERPRINT` (Android / Touch ID).
   - Wallet card lock state: `LOCKED` (balance masked, payout actions hidden) vs `UNLOCKED` (sample balance revealed, payout action accessible).
   - Simulated unlock prompt challenge with success, failure, and cancel simulation outcomes.
2. **Sample Wallet Data**:
   - Sample wallet balance figures clearly labeled as simulated previews (such as sample available balance ₦48,500 and sample pending escrow ₦15,000).
   - Sample quick payout destination (sample bank account preview).
3. **Interactive Biometric Flow**:
   - "Quick Wallet Security" settings toggle card.
   - Sensor type selector allowing preview of Face ID vs Fingerprint dialog presentation.
   - Masked wallet card with "Unlock with Biometrics" trigger featuring concentric outer focus ring.
   - Simulated biometric challenge modal displaying native-style sensor icon, localized prompt text ("Confirm biometric identity to access wallet"), and interactive simulation actions ("Simulate Match", "Simulate Mismatch", "Cancel").
   - Lock wallet action to immediately re-lock sample wallet.
4. **Truthful Preview Notice**:
   - Visible, persistent disclaimer stating that all biometric interactions are simulated in-memory previews, no biometric hardware sensors or SecureStore APIs are invoked, and no real financial funds or bank accounts are linked.
5. **Accessibility & Design Tokens**:
   - Full support for THEME-001 dark and light modes.
   - All interactive touch targets >= 48dp.
   - High-contrast text (>= 4.5:1) and UI borders/focus indicators (>= 3:1).
   - Concentric outer focus ring on primary filled CTA buttons with 2dp visual separation gap and `c.amber`.
   - Every component and helper function must remain at 25 lines or fewer.

### 2.2 Strict Technical Prohibitions (Non-Goals)
1. **Zero Native Biometric Hardware Drivers**:
   - Do NOT invoke live `expo-local-authentication` methods (`hasHardwareAsync`, `supportedAuthenticationTypesAsync`, `authenticateAsync`) against real device hardware.
   - Zero operating system permission requests or native biometric prompts.
2. **Zero Keychain or SecureStore Mutations**:
   - Do NOT invoke `expo-secure-store` or write encryption keys to device keychains.
   - Zero persistent storage side effects (no AsyncStorage, MMKV, SQLite).
3. **Zero Banking or Payout Mutations**:
   - Do NOT initiate banking payouts, transfer requests, or financial API mutations.
   - Balances and account details remain static local sample data.
4. **Zero Corporate Slop & Zero Em Dashes**:
   - Adhere strictly to Mr. Solomon Natural Voice. Direct, honest, human tone. Never use em dashes.

---

## 3. Domain Model & In-Memory Data Structures

### 3.1 Types (`apps/mobile/lib/biometric-wallet-preview.ts`)

```typescript
export type BiometricSensorType = 'FACE_ID' | 'FINGERPRINT';

export type BiometricChallengeOutcome = 'SUCCESS' | 'FAILURE' | 'CANCELLED';

export interface BiometricWalletConfig {
  readonly isBiometricEnabled: boolean;
  readonly sensorType: BiometricSensorType;
  readonly isWalletLocked: boolean;
}

export interface SampleWalletSummary {
  readonly availableBalance: string;
  readonly pendingEscrow: string;
  readonly sampleBankName: string;
  readonly sampleAccountMask: string;
  readonly lastPayoutDate: string;
}
```

### 3.2 Canonical Sample Configuration

```typescript
export const BIOMETRIC_WALLET_DISCLAIMER =
  'Sample biometric security preview. Biometric prompts and wallet balances are simulated local previews. No device biometric hardware is accessed, no keychains are modified, and no real funds are transferred.';

export const SAMPLE_WALLET_DATA: SampleWalletSummary = Object.freeze({
  availableBalance: '₦48,500.00 (sample)',
  pendingEscrow: '₦15,000.00 (sample)',
  sampleBankName: 'Zenith Bank (sample)',
  sampleAccountMask: '•••• 4821',
  lastPayoutDate: 'Sample payout 3 days ago',
});
```

---

## 4. Component Architecture & Function Sizing

To satisfy the repository standard of functions remaining at 25 lines or fewer, the UI is decomposed into small, focused subcomponents:

1. **`BiometricNoticeCard`** (<= 25 lines):
   - Renders the disclaimer banner stating this is a simulated local biometric preview.
2. **`BiometricSettingsCard`** (<= 25 lines):
   - Renders biometric lock toggle and sensor type selector (Face ID vs Fingerprint).
3. **`SensorTypeSelector`** (<= 25 lines):
   - Accessible selector allowing switching between Face ID and Fingerprint simulation.
4. **`LockedWalletCard`** (<= 25 lines):
   - Displays masked wallet state with "Unlock with Biometrics" CTA.
5. **`UnlockedWalletCard`** (<= 25 lines):
   - Displays revealed sample balances, bank destination, and "Lock Wallet" CTA.
6. **`BiometricPromptModal`** (<= 25 lines):
   - Native-styled modal simulation rendering sensor icon, title, subtitle, and action buttons.
7. **`BiometricWalletPreview`** (<= 25 lines):
   - Container component coordinating state, challenge prompt modal, and lock status.

---

## 5. UI/UX Specifications & Visual Tokens

### 5.1 Color Tokens & Contrast (THEME-001)

| Element | Dark Mode | Light Mode | Target Contrast |
|---|---|---|---|
| Card Background | `#13171E` | `#FFFFFF` | Canvas base |
| Primary Text | `#F0F4F9` | `#001A41` | >= 7:1 against card |
| Muted Text / Captions | `#8897AB` | `#53647A` | >= 4.5:1 against card |
| Action Button Fill | `#F7803C` | `#C2410C` | High visibility |
| Action Button Text | `#001A41` | `#FFFFFF` | >= 5.4:1 against button |
| Focus Ring Outer | `#F7803C` | `#C2410C` | 7.27:1 (dark), 5.41:1 (light) |
| Success Accent | `#10B981` | `#059669` | >= 4.5:1 against card |
| Error Accent | `#FF6B6B` | `#DC2626` | >= 4.5:1 against card |

### 5.2 Geometry & Touch Targets
- Action Buttons: Minimum 48dp height, 9999px pill border radius.
- Switch / Toggle Pressable: 48x48dp minimum touch target area.
- Focus Rings: Absolute position with 2dp outer visual gap and 2dp border width (`top: -4`, `bottom: -4`, `left: -4`, `right: -4`).
- Modals: Accessible `Modal` with `onRequestClose` for hardware Android back button support.

---

## 6. Testing & Quality Gates

The test suite must be placed in `apps/mobile/app/biometric-wallet.test.ts` and `apps/mobile/lib/biometric-wallet-preview.test.ts`, verifying:
1. **Contract Invariants**:
   - Initial biometric lock states, defaults, and sensor configuration.
   - Wallet card properly masks balances when locked.
   - Toggling biometric lock on/off behaves deterministically.
2. **Simulated Authentication Flow**:
   - Successful biometric challenge simulation transitions wallet from locked to unlocked.
   - Failed biometric challenge retains locked state and shows error feedback.
   - Cancelling prompt retains locked state without side effects.
   - Manual lock action immediately re-locks wallet.
3. **Safety & Security Verifications**:
   - Verifies zero `expo-local-authentication` unmocked hardware drivers are called.
   - Verifies zero keychain or SecureStore writes are performed.
   - Verifies zero banking or payout network requests occur.
4. **Code Quality**:
   - All component and helper functions strictly <= 25 lines.
   - TypeScript compiler passes with exit code 0.
