import { describe, expect, it } from 'vitest';
import {
  BIOMETRIC_PREVIEW_DISCLAIMER,
  BIOMETRIC_WALLET_DISCLAIMER,
  SAMPLE_WALLET_DATA,
  createInitialBiometricState,
  simulateBiometricAuth,
  toggleBiometricSetting,
  lockWallet,
  setBiometricType,
  cancelBiometricAuth,
  getBiometricLabel,
  getWalletPendingText,
  getWalletSettlementText,
} from './biometric-auth-preview';

describe('biometric-auth-preview domain fixtures and disclaimers', () => {
  it('exposes the truthful biometric preview disclaimer with zero em dashes', () => {
    expect(BIOMETRIC_PREVIEW_DISCLAIMER).toBe(
      'Sample biometric preview. Authentication is simulated in memory. No biometric hardware sensors or secure enclaves are accessed, and no financial data is unlocked.'
    );
    expect(BIOMETRIC_PREVIEW_DISCLAIMER).not.toContain('—');
    expect(BIOMETRIC_PREVIEW_DISCLAIMER).not.toContain('--');
  });

  it('exposes the wallet disclaimer with zero em dashes', () => {
    expect(BIOMETRIC_WALLET_DISCLAIMER).toContain('Sample biometric security preview');
    expect(BIOMETRIC_WALLET_DISCLAIMER).not.toContain('—');
    expect(BIOMETRIC_WALLET_DISCLAIMER).not.toContain('--');
  });

  it('provides deterministic sample wallet figures', () => {
    expect(SAMPLE_WALLET_DATA.availableBalance).toBe('₦48,500.00 (sample)');
    expect(SAMPLE_WALLET_DATA.pendingEscrow).toBe('₦15,000.00 (sample)');
    expect(SAMPLE_WALLET_DATA.sampleBankName).toBe('Zenith Bank (sample)');
    expect(SAMPLE_WALLET_DATA.sampleAccountMask).toBe('•••• 4821');
    expect(SAMPLE_WALLET_DATA.lastPayoutDate).toBe('Sample payout 3 days ago');
  });

  it('formats pending and settlement text from sample data', () => {
    expect(getWalletPendingText()).toContain('₦15,000.00 (sample)');
    expect(getWalletSettlementText()).toBe('Sample payout 3 days ago');
  });
});

describe('biometric-auth-preview pure state helpers', () => {
  it('creates initial state with biometric enabled, locked wallet, and Face ID', () => {
    const state = createInitialBiometricState();
    expect(state.isBiometricEnabled).toBe(true);
    expect(state.biometricType).toBe('FACE_ID');
    expect(state.walletLockStatus).toBe('LOCKED');
    expect(state.lastAuthOutcome).toBe('IDLE');
    expect(state.errorMessage).toBeNull();
  });

  it('allows overriding initial biometric state fields', () => {
    const custom = createInitialBiometricState({
      biometricType: 'FINGERPRINT',
      walletLockStatus: 'UNLOCKED',
    });
    expect(custom.biometricType).toBe('FINGERPRINT');
    expect(custom.walletLockStatus).toBe('UNLOCKED');
  });

  it('simulates successful authentication by unlocking the wallet', () => {
    const initial = createInitialBiometricState();
    const updated = simulateBiometricAuth(initial, true);
    expect(updated.walletLockStatus).toBe('UNLOCKED');
    expect(updated.lastAuthOutcome).toBe('SUCCESS');
    expect(updated.errorMessage).toBeNull();
  });

  it('simulates failed authentication retaining locked status and populating error message', () => {
    const initial = createInitialBiometricState();
    const updated = simulateBiometricAuth(initial, false);
    expect(updated.walletLockStatus).toBe('LOCKED');
    expect(updated.lastAuthOutcome).toBe('FAILURE');
    expect(updated.errorMessage).toBeTruthy();
    expect(updated.errorMessage).not.toContain('—');
    expect(updated.errorMessage).not.toContain('--');
  });

  it('toggles biometric lock setting and adjusts lock status predictably', () => {
    const initial = createInitialBiometricState();
    expect(initial.isBiometricEnabled).toBe(true);

    const disabled = toggleBiometricSetting(initial);
    expect(disabled.isBiometricEnabled).toBe(false);
    expect(disabled.walletLockStatus).toBe('UNLOCKED');

    const reEnabled = toggleBiometricSetting(disabled);
    expect(reEnabled.isBiometricEnabled).toBe(true);
    expect(reEnabled.walletLockStatus).toBe('LOCKED');
  });

  it('explicitly locks an unlocked wallet', () => {
    const unlocked = createInitialBiometricState({ walletLockStatus: 'UNLOCKED' });
    const locked = lockWallet(unlocked);
    expect(locked.walletLockStatus).toBe('LOCKED');
    expect(locked.lastAuthOutcome).toBe('IDLE');
  });

  it('updates biometric sensor type', () => {
    const initial = createInitialBiometricState({ biometricType: 'FACE_ID' });
    const finger = setBiometricType(initial, 'FINGERPRINT');
    expect(finger.biometricType).toBe('FINGERPRINT');
  });

  it('handles cancelled biometric authentication without unlocking', () => {
    const initial = createInitialBiometricState();
    const cancelled = cancelBiometricAuth(initial);
    expect(cancelled.walletLockStatus).toBe('LOCKED');
    expect(cancelled.lastAuthOutcome).toBe('CANCELLED');
    expect(cancelled.errorMessage).toBeNull();
  });

  it('formats readable labels for biometric types', () => {
    expect(getBiometricLabel('FACE_ID')).toBe('Face ID');
    expect(getBiometricLabel('FINGERPRINT')).toBe('Fingerprint');
    expect(getBiometricLabel('NONE')).toBe('Passcode');
  });
});
