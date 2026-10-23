import { describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY, isTradesTheme, readStoredTheme, resolveTheme } from './theme';

describe('theme engine', () => {
  it('defaults to dark when nothing is saved', () => {
    expect(resolveTheme(null)).toBe('dark');
    expect(resolveTheme(undefined)).toBe('dark');
    expect(resolveTheme('something-else')).toBe('dark');
  });
  it('uses light only when the visitor chose it', () => {
    expect(resolveTheme('light')).toBe('light');
    expect(resolveTheme('dark')).toBe('dark');
  });
  it('recognises valid theme values', () => {
    expect(isTradesTheme('light')).toBe(true);
    expect(isTradesTheme('dark')).toBe(true);
    expect(isTradesTheme('system')).toBe(false);
  });
  it('reads the saved value and survives blocked storage', () => {
    expect(readStoredTheme({ getItem: (k: string) => (k === THEME_STORAGE_KEY ? 'light' : null) })).toBe('light');
    expect(readStoredTheme({ getItem: () => { throw new Error('blocked'); } })).toBeNull();
  });
});
