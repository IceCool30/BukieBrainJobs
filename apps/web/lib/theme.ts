/**
 * Theme engine (THEME-001). Dark is the default for everyone. Light applies only
 * after the visitor chooses it with the toggle. The device colour setting is not used.
 */
export const THEME_STORAGE_KEY = 'bbj_theme_mode';
export type TradesTheme = 'light' | 'dark';
/** Browser bar colour per theme: the dark strip, or the navy strip in light. */
export const THEME_BAR_COLOR: Record<TradesTheme, string> = { dark: '#07090D', light: '#001A41' };

export function isTradesTheme(value: unknown): value is TradesTheme {
  return value === 'light' || value === 'dark';
}

export function resolveTheme(storedValue: string | null | undefined): TradesTheme {
  return storedValue === 'light' ? 'light' : 'dark';
}

export function readStoredTheme(storage: Pick<Storage, 'getItem'>): string | null {
  try {
    return storage.getItem(THEME_STORAGE_KEY);
  } catch (err: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[theme] Failed to read stored theme:', err instanceof Error ? err.message : String(err));
    }
    return null;
  }
}

export function applyTheme(theme: TradesTheme, storage?: Pick<Storage, 'setItem'>): void {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_BAR_COLOR[theme]);
  }
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err: unknown) {
    // Storage can be unavailable (private mode). The theme still applies for this visit.
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[theme] Failed to persist theme preference:', err instanceof Error ? err.message : String(err));
    }
  }
}
