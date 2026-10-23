import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// Subpath import keeps the web-only component barrel out of the native bundle.
import { tradesColorTokens, type TradesThemeMode } from '@bukiebrainjobs/ui/src/tokens/colors';

export const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

// Dark for everyone until the user taps the toggle (THEME-001). The phone setting is not used.
const STORAGE_KEY = 'bbj_theme_mode';
let mode: TradesThemeMode = 'dark';
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

// Restore the saved choice once at startup. The splash screen covers this read.
AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    if (saved === 'light' && mode !== 'light') {
      mode = 'light';
      emit();
    }
  })
  .catch(() => undefined);

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function toggleThemeMode() {
  mode = mode === 'dark' ? 'light' : 'dark';
  emit();
  AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => undefined);
}

export function useThemeMode(): TradesThemeMode {
  return useSyncExternalStore(subscribe, () => mode, () => mode);
}

export function useTrades() {
  return tradesColorTokens[useThemeMode()];
}
