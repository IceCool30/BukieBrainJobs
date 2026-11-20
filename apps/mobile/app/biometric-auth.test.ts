import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  BIOMETRIC_PREVIEW_DISCLAIMER,
  BIOMETRIC_WALLET_DISCLAIMER,
  SAMPLE_WALLET_DATA,
} from '../lib/biometric-auth-preview';

declare const __dirname: string;

const mobileRoot = resolve(__dirname, '..');
const readMobileFile = (path: string) => readFileSync(resolve(mobileRoot, path), 'utf8');

describe('MOB-BIO-001 Native BrainWorker Biometric Authentication & Quick Wallet Lock Preview', () => {
  const workspaceSource = readMobileFile('app/brainworker/workspace-preview.tsx');
  const libSource = readMobileFile('lib/biometric-auth-preview.ts');

  it('imports domain structures and helpers from biometric-auth-preview', () => {
    expect(workspaceSource).toContain("from '../../lib/biometric-auth-preview'");
    expect(workspaceSource).toContain('BIOMETRIC_PREVIEW_DISCLAIMER');
    expect(workspaceSource).toContain('SAMPLE_WALLET_DATA');
    expect(workspaceSource).toContain('createInitialBiometricState');
    expect(workspaceSource).toContain('simulateBiometricAuth');
    expect(workspaceSource).toContain('toggleBiometricSetting');
    expect(workspaceSource).toContain('lockWallet');
    expect(workspaceSource).toContain('setBiometricType');
    expect(workspaceSource).toContain('cancelBiometricAuth');
    expect(workspaceSource).toContain('getBiometricLabel');
  });

  it('contains the persistent biometric preview disclaimer card and disclaimer text', () => {
    expect(workspaceSource).toContain('BiometricNoticeCard');
    expect(workspaceSource).toContain('BIOMETRIC_PREVIEW_DISCLAIMER');
    expect(BIOMETRIC_PREVIEW_DISCLAIMER).toBe(
      'Sample biometric preview. Authentication is simulated in memory. No biometric hardware sensors or secure enclaves are accessed, and no financial data is unlocked.'
    );
  });

  it('renders BiometricWalletSection in the workspace feed view', () => {
    expect(workspaceSource).toContain('BiometricWalletSection');
    expect(workspaceSource).toContain('<BiometricWalletSection');
    expect(workspaceSource).toContain('WorkspaceFeedView');
  });

  it('implements biometric toggle switch with switch accessibility role and checked state', () => {
    expect(workspaceSource).toContain('BiometricToggleRow');
    const toggleMatch = workspaceSource.match(/function BiometricToggleRow[\s\S]*?\n\}/);
    expect(toggleMatch).not.toBeNull();
    const toggleCode = toggleMatch![0];
    expect(toggleCode).toContain('accessibilityRole="switch"');
    expect(toggleCode).toContain('accessibilityLabel="Toggle biometric quick wallet lock"');
    expect(toggleCode).toContain('accessibilityState={{ checked: isEnabled }}');
  });

  it('provides sensor type selector allowing preview of Face ID vs Fingerprint', () => {
    expect(workspaceSource).toContain('SensorTypeSelector');
    expect(workspaceSource).toContain('SensorTypePill');
    expect(workspaceSource).toContain("'FACE_ID'");
    expect(workspaceSource).toContain("'FINGERPRINT'");
  });

  it('implements UnlockWalletButton with concentric outer focus ring and 48dp target', () => {
    expect(workspaceSource).toContain('UnlockWalletButton');
    const buttonMatch = workspaceSource.match(/function UnlockWalletButton[\s\S]*?\n\}/);
    expect(buttonMatch).not.toBeNull();
    const buttonCode = buttonMatch![0];
    expect(buttonCode).toContain('isFocused');
    expect(buttonCode).toContain('setIsFocused(true)');
    expect(buttonCode).toContain('setIsFocused(false)');
    expect(buttonCode).toContain('outerFocusRing');
    expect(buttonCode).toContain('accessibilityRole="button"');
  });

  it('implements SimulateSuccessButton with concentric outer focus ring and 48dp target', () => {
    expect(workspaceSource).toContain('SimulateSuccessButton');
    const buttonMatch = workspaceSource.match(/function SimulateSuccessButton[\s\S]*?\n\}/);
    expect(buttonMatch).not.toBeNull();
    const buttonCode = buttonMatch![0];
    expect(buttonCode).toContain('isFocused');
    expect(buttonCode).toContain('setIsFocused(true)');
    expect(buttonCode).toContain('setIsFocused(false)');
    expect(buttonCode).toContain('outerFocusRing');
    expect(buttonCode).toContain('accessibilityRole="button"');
  });

  it('implements BiometricPromptModal with onRequestClose and simulation actions', () => {
    expect(workspaceSource).toContain('BiometricPromptModal');
    expect(workspaceSource).toContain('onRequestClose');
    expect(workspaceSource).toContain('SimulateSuccessButton');
    expect(workspaceSource).toContain('SimulateFailureButton');
    expect(workspaceSource).toContain('BiometricPromptIconBlock');
  });

  it('renders LockedWalletCard and UnlockedWalletCard with truthful sample figures', () => {
    expect(workspaceSource).toContain('LockedWalletCard');
    expect(workspaceSource).toContain('UnlockedWalletCard');
    expect(SAMPLE_WALLET_DATA.availableBalance).toBe('₦48,500.00 (sample)');
    expect(SAMPLE_WALLET_DATA.pendingEscrow).toBe('₦15,000.00 (sample)');
    expect(SAMPLE_WALLET_DATA.sampleBankName).toBe('Zenith Bank (sample)');
    expect(SAMPLE_WALLET_DATA.sampleAccountMask).toBe('•••• 4821');
  });

  it('strictly enforces <= 25 lines for every function in workspace-preview.tsx', () => {
    const fnRegex = /(?:function\s+([A-Za-z0-9_]+)\s*\([^)]*\)|const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>)\s*\{/g;
    const lines = workspaceSource.split('\n');

    let match: RegExpExecArray | null;
    while ((match = fnRegex.exec(workspaceSource)) !== null) {
      const fnName = match[1] || match[2];
      const startIdx = match.index;
      const lineNumber = workspaceSource.slice(0, startIdx).split('\n').length;

      let braceCount = 0;
      let endLine = lineNumber;
      for (let i = lineNumber - 1; i < lines.length; i++) {
        const line = lines[i]!;
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        if (braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }

      const fnLength = endLine - lineNumber + 1;
      expect(
        fnLength,
        `Function ${fnName} in workspace-preview.tsx exceeds 25 lines (actual: ${fnLength} lines, L${lineNumber}-L${endLine})`
      ).toBeLessThanOrEqual(25);
    }
  });

  it('strictly enforces <= 25 lines for every function in biometric-auth-preview.ts', () => {
    const fnRegex = /(?:function\s+([A-Za-z0-9_]+)\s*\([^)]*\)|const\s+([A-Za-z0-9_]+)\s*=\s*(?:\([^)]*\)|[A-Za-z0-9_]+)\s*=>)\s*\{/g;
    const lines = libSource.split('\n');

    let match: RegExpExecArray | null;
    while ((match = fnRegex.exec(libSource)) !== null) {
      const fnName = match[1] || match[2];
      const startIdx = match.index;
      const lineNumber = libSource.slice(0, startIdx).split('\n').length;

      let braceCount = 0;
      let endLine = lineNumber;
      for (let i = lineNumber - 1; i < lines.length; i++) {
        const line = lines[i]!;
        for (const char of line) {
          if (char === '{') braceCount++;
          if (char === '}') braceCount--;
        }
        if (braceCount === 0) {
          endLine = i + 1;
          break;
        }
      }

      const fnLength = endLine - lineNumber + 1;
      expect(
        fnLength,
        `Function ${fnName} in biometric-auth-preview.ts exceeds 25 lines (actual: ${fnLength} lines, L${lineNumber}-L${endLine})`
      ).toBeLessThanOrEqual(25);
    }
  });

  it('contains zero em dashes across both mobile files', () => {
    expect(workspaceSource).not.toContain('—');
    expect(workspaceSource).not.toContain('--');
    expect(libSource).not.toContain('—');
    expect(libSource).not.toContain('--');
  });
});
