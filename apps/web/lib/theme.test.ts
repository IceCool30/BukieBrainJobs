// @vitest-environment node
/**
 * Theme engine unit tests (Trades Design System, DESIGN.md v2.0).
 * Proves localStorage persistence key, stored-value precedence, and
 * prefers-color-scheme fallback on first visit.
 */
import { describe, expect, it } from 'vitest';
import { THEME_STORAGE_KEY, applyTheme, isTradesTheme, resolveTheme } from './theme';

describe('theme engine', () => {
  it('uses the bukie_theme storage key', () => {
    expect(THEME_STORAGE_KEY).toBe('bukie_theme');
  });

  it('accepts only light and dark theme values', () => {
    expect(isTradesTheme('light')).toBe(true);
    expect(isTradesTheme('dark')).toBe(true);
    expect(isTradesTheme('navy')).toBe(false);
    expect(isTradesTheme(null)).toBe(false);
  });

  it('prefers the stored value over the OS signal', () => {
    expect(resolveTheme('dark', false)).toBe('dark');
    expect(resolveTheme('light', true)).toBe('light');
  });

  it('falls back to prefers-color-scheme on first visit', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme(undefined, true)).toBe('dark');
  });

  it('treats unknown stored values as first visit', () => {
    expect(resolveTheme('midnight', true)).toBe('dark');
    expect(resolveTheme('midnight', false)).toBe('light');
  });

  it('applyTheme persists without a DOM', () => {
    const written: Record<string, string> = {};
    applyTheme('dark', {
      setItem: (key: string, value: string) => {
        written[key] = value;
      },
    });
    expect(written[THEME_STORAGE_KEY]).toBe('dark');
  });
});
