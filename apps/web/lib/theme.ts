/**
 * Trades Design System theme engine (DESIGN.md v2.0).
 *
 * Persistence key is `bukie_theme`. On first visit with no stored value the
 * operating system `prefers-color-scheme` signal decides. All DOM effects
 * stay in `applyTheme` so the resolution logic remains pure and testable.
 */

export const THEME_STORAGE_KEY = 'bukie_theme';

export type TradesTheme = 'light' | 'dark';

export function isTradesTheme(value: unknown): value is TradesTheme {
  return value === 'light' || value === 'dark';
}

export function resolveTheme(
  storedValue: string | null | undefined,
  prefersDark: boolean,
): TradesTheme {
  if (isTradesTheme(storedValue)) return storedValue;
  return prefersDark ? 'dark' : 'light';
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'>): string | null {
  try {
    return storage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function applyTheme(theme: TradesTheme, storage?: Pick<Storage, 'setItem'>): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', theme);
  }
  if (storage) {
    try {
      storage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable (private mode). Theme still applies in memory.
    }
  }
}
