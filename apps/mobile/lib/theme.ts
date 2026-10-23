import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
// Subpath import keeps the web-only component barrel out of the native bundle.
import { tradesColorTokens, type TradesThemeMode } from '@bukiebrainjobs/ui/src/tokens/colors';

export const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

// Dark for everyone until the user taps the toggle (THEME-001). The phone setting is not used.
let mode: TradesThemeMode = 'dark';
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toggleThemeMode() {
  mode = mode === 'dark' ? 'light' : 'dark';
  listeners.forEach((listener) => listener());
}

export function useThemeMode(): TradesThemeMode {
  return useSyncExternalStore(subscribe, () => mode, () => mode);
}

export function useTrades() {
  return tradesColorTokens[useThemeMode()];
}
