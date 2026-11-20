/**
 * MOB-BIO-001: Native BrainWorker Biometric Authentication & Quick Wallet Lock Preview.
 * Pure domain contracts, state structures, and in-memory simulation helpers.
 */

export type BiometricType = 'FACE_ID' | 'FINGERPRINT' | 'NONE';
export type BiometricSensorType = 'FACE_ID' | 'FINGERPRINT';
export type WalletLockStatus = 'LOCKED' | 'UNLOCKED';
export type BiometricChallengeOutcome = 'IDLE' | 'SUCCESS' | 'FAILURE' | 'CANCELLED';

export interface SampleWalletSummary {
  readonly availableBalance: string;
  readonly pendingEscrow: string;
  readonly sampleBankName: string;
  readonly sampleAccountMask: string;
  readonly lastPayoutDate: string;
}

export interface BiometricAuthState {
  readonly isBiometricEnabled: boolean;
  readonly biometricType: BiometricType;
  readonly walletLockStatus: WalletLockStatus;
  readonly lastAuthOutcome: BiometricChallengeOutcome;
  readonly errorMessage: string | null;
}

export const BIOMETRIC_PREVIEW_DISCLAIMER =
  'Sample biometric preview. Authentication is simulated in memory. No biometric hardware sensors or secure enclaves are accessed, and no financial data is unlocked.';

export const BIOMETRIC_WALLET_DISCLAIMER =
  'Sample biometric security preview. Biometric prompts and wallet balances are simulated local previews. No device biometric hardware is accessed, no keychains are modified, and no real funds are transferred.';

export const SAMPLE_WALLET_DATA: SampleWalletSummary = Object.freeze({
  availableBalance: '₦48,500.00 (sample)',
  pendingEscrow: '₦15,000.00 (sample)',
  sampleBankName: 'Zenith Bank (sample)',
  sampleAccountMask: '•••• 4821',
  lastPayoutDate: 'Sample payout 3 days ago',
});

export function createInitialBiometricState(
  overrides?: Partial<BiometricAuthState>
): BiometricAuthState {
  return {
    isBiometricEnabled: true,
    biometricType: 'FACE_ID',
    walletLockStatus: 'LOCKED',
    lastAuthOutcome: 'IDLE',
    errorMessage: null,
    ...overrides,
  };
}

export function simulateBiometricAuth(
  state: BiometricAuthState,
  success: boolean
): BiometricAuthState {
  if (success) {
    return {
      ...state,
      walletLockStatus: 'UNLOCKED',
      lastAuthOutcome: 'SUCCESS',
      errorMessage: null,
    };
  }
  return {
    ...state,
    walletLockStatus: 'LOCKED',
    lastAuthOutcome: 'FAILURE',
    errorMessage: 'Biometric scan was not recognized. Please try again or use your passcode.',
  };
}

export function toggleBiometricSetting(
  state: BiometricAuthState
): BiometricAuthState {
  const nextEnabled = !state.isBiometricEnabled;
  return {
    ...state,
    isBiometricEnabled: nextEnabled,
    walletLockStatus: nextEnabled ? 'LOCKED' : 'UNLOCKED',
    lastAuthOutcome: 'IDLE',
    errorMessage: null,
  };
}

export function lockWallet(
  state: BiometricAuthState
): BiometricAuthState {
  return {
    ...state,
    walletLockStatus: 'LOCKED',
    lastAuthOutcome: 'IDLE',
    errorMessage: null,
  };
}

export function setBiometricType(
  state: BiometricAuthState,
  biometricType: BiometricType
): BiometricAuthState {
  return {
    ...state,
    biometricType,
    errorMessage: null,
  };
}

export function cancelBiometricAuth(
  state: BiometricAuthState
): BiometricAuthState {
  return {
    ...state,
    lastAuthOutcome: 'CANCELLED',
    errorMessage: null,
  };
}

export function getBiometricLabel(type: BiometricType): string {
  if (type === 'FACE_ID') return 'Face ID';
  if (type === 'FINGERPRINT') return 'Fingerprint';
  return 'Passcode';
}

export function getWalletPendingText(): string {
  return `Pending Clearance: ${SAMPLE_WALLET_DATA.pendingEscrow}`;
}

export function getWalletSettlementText(): string {
  return SAMPLE_WALLET_DATA.lastPayoutDate;
}
