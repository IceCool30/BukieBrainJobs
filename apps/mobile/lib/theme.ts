import { Platform } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tradesColorTokens } from '@bukiebrainjobs/ui';

export const mono = Platform.select({ ios: 'Menlo', default: 'monospace' });

const STORAGE_KEY = 'bbj_theme_mode';

/**
 * Approved Mobile Design Tokens: Obsidian Titanium Gunmetal Dark
 *
 * Exact approved color values:
 * - Canvas: #0B0E13
 * - Strip: #07090D
 * - Card: #13171E
 * - Divider: #202734
 * - Rule: #2D3748
 * - Main Text: #F0F4F9
 * - Muted Text: #8897AB
 * - Amber: #FF6B35
 * - Green: #2FE896
 */
type ThemeMode = 'light' | 'dark';

export const obsidianDarkTokens = {
  mode: 'dark',
  // Primary semantic names
  canvas: '#0B0E13',
  strip: '#07090D',
  card: '#13171E',
  divider: '#202734',
  rule: '#2D3748',
  mainText: '#F0F4F9',
  mutedText: '#8897AB',
  amber: '#FF6B35',
  green: '#2FE896',

  // Semantic compatibility aliases for mobile screens
  bg: '#0B0E13',
  stripBg: '#07090D',
  cardBg: '#13171E',
  cardHover: '#191E27',
  lead: '#202734',
  textMain: '#F0F4F9',
  textMuted: '#8897AB',
  brandGreen: '#2FE896',
  stripAccent: '#2FE896',
  stripText: '#9FB2C8',
  amberHover: '#FF7D4D',
  danger: '#FF6B6B',
} as const;

/**
 * Approved Mobile Design Tokens: Light mode.
 *
 * Dark mode stays exactly as it is. Light values restore the approved off-white
 * canvas, white cards, navy text and navy strip. Amber and green are darkened
 * in light only so they meet the 4.5:1 contrast minimum on white surfaces.
 */
export const obsidianLightTokens = {
  mode: 'light',
  // Primary semantic names
  canvas: '#F7F9FC',
  strip: '#001A41',
  card: '#FFFFFF',
  divider: '#E5E9F0',
  rule: '#CBD5E1',
  mainText: '#001A41',
  mutedText: '#475569',
  amber: '#CC4A14',
  green: '#296A4B',

  // Semantic compatibility aliases for mobile screens
  bg: '#F7F9FC',
  stripBg: '#001A41',
  cardBg: '#FFFFFF',
  cardHover: '#F1F3F6',
  lead: '#E5E9F0',
  textMain: '#001A41',
  textMuted: '#475569',
  brandGreen: '#296A4B',
  stripAccent: tradesColorTokens.light.stripAccent,
  stripText: tradesColorTokens.light.stripText,
  amberHover: '#B34312',
  danger: '#DC2626',
} as const;

export type MobileThemeTokens = {
  mode: ThemeMode;
  canvas: string;
  strip: string;
  card: string;
  divider: string;
  rule: string;
  mainText: string;
  mutedText: string;
  amber: string;
  green: string;
  bg: string;
  stripBg: string;
  cardBg: string;
  cardHover: string;
  lead: string;
  textMain: string;
  textMuted: string;
  brandGreen: string;
  stripAccent: string;
  stripText: string;
  amberHover: string;
  danger: string;
};

let currentMode: ThemeMode = 'dark';
let currentTokens: MobileThemeTokens = obsidianDarkTokens;
let userHasInteracted = false;
const listeners = new Set<(mode: ThemeMode) => void>();

function getTokens(mode: ThemeMode): MobileThemeTokens {
  return mode === 'light' ? obsidianLightTokens : obsidianDarkTokens;
}

function notify(): void {
  for (const fn of listeners) {
    fn(currentMode);
  }
}

/**
 * Current theme mode. Dark is the first-visit default until a stored choice
 * resolves or the customer toggles.
 */
export function getThemeMode(): ThemeMode {
  return currentMode;
}

/**
 * Current theme tokens. Reactively updated when the stored preference resolves
 * or the customer toggles.
 */
export function getThemeColors(): MobileThemeTokens {
  return currentTokens;
}

export function getStripTextColor(tokens: MobileThemeTokens, darkColor: string): string {
  return tokens.mode === 'light' ? tokens.stripText : darkColor;
}

export function getStripAccentColor(tokens: MobileThemeTokens, darkColor: string): string {
  return tokens.mode === 'light' ? tokens.stripAccent : darkColor;
}

/**
 * Toggle between light and dark, persist to AsyncStorage, and notify
 * subscribers. Once the customer has toggled, a late-resolving storage value
 * must not override their choice (late-read race guard).
 */
export function toggleThemeMode(): void {
  userHasInteracted = true;
  const next: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
  currentMode = next;
  currentTokens = getTokens(next);
  try {
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {
      // Storage write failures must not break the UI; in-memory state is current.
    });
  } catch {
    // Storage unavailable; in-memory state is current.
  }
  notify();
}

/**
 * Reactive hook returning the current theme mode. Subscribes to toggle and
 * storage-resolution changes.
 */
export function useThemeMode(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>(currentMode);
  useEffect(() => {
    const listener = (nextMode: ThemeMode) => setMode(nextMode);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return mode;
}

/**
 * Reactive hook returning the current theme tokens. Subscribes to toggle and
 * storage-resolution changes.
 */
export function useThemeColors(): MobileThemeTokens {
  const [tokens, setTokens] = useState<MobileThemeTokens>(currentTokens);
  useEffect(() => {
    const listener = () => setTokens(currentTokens);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);
  return tokens;
}

/**
 * Backwards-compatible alias for existing screen components.
 */
export const useTrades = useThemeColors;

/**
 * Reads the saved theme preference from AsyncStorage once. Invalid or missing
 * values keep the dark default. A customer toggle already made wins over a
 * late-resolving stored value.
 */
function applyStoredTheme(value: string | null): void {
  if (userHasInteracted || (value !== 'light' && value !== 'dark')) return;
  currentMode = value;
  currentTokens = getTokens(value);
  notify();
}

function scheduleStoredTheme(value: string | null): void {
  setTimeout(() => applyStoredTheme(value), 0);
}

export function initializeTheme(): Promise<void> {
  let promise: Promise<string | null>;
  try {
    promise = AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (e.g., non-browser test env); keep dark default.
    return Promise.resolve();
  }
  promise.then(scheduleStoredTheme, () => {
    // Storage read failures must not break the UI; keep dark default.
  });
  return Promise.resolve();
}

initializeTheme();
