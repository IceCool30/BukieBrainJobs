import { beforeEach, describe, expect, it, vi } from 'vitest';
import { tradesColorTokens } from '@bukiebrainjobs/ui';

const storage = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: storage.getItem, setItem: storage.setItem },
}));

async function loadTheme() {
  vi.resetModules();
  return vi.importActual<typeof import('./theme')>('./theme');
}

beforeEach(() => {
  storage.getItem.mockReset().mockResolvedValue(null);
  storage.setItem.mockReset().mockResolvedValue(undefined);
});

describe('THEME-001 native theme behavior', () => {
  it('starts in dark mode and reads the saved preference', async () => {
    const theme = await loadTheme();

    expect(theme.getThemeMode()).toBe('dark');
    expect(storage.getItem).toHaveBeenCalledWith('bbj_theme_mode');
  });

  it('restores a saved light preference and returns approved light tokens', async () => {
    storage.getItem.mockResolvedValue('light');
    const theme = await loadTheme();

    expect(theme.getThemeMode()).toBe('dark');
    await vi.waitFor(() => expect(theme.getThemeMode()).toBe('light'));
    expect(theme.getThemeColors()).toBe(theme.obsidianLightTokens);
  });

  it('maps strip foregrounds to shared light tokens and keeps dark colors unchanged', async () => {
    const theme = await loadTheme();

    expect(theme.obsidianLightTokens.stripText).toBe(tradesColorTokens.light.stripText);
    expect(theme.obsidianLightTokens.stripAccent).toBe(tradesColorTokens.light.stripAccent);
    expect(theme.getStripTextColor(theme.obsidianLightTokens, theme.obsidianLightTokens.mainText))
      .toBe(tradesColorTokens.light.stripText);
    expect(theme.getStripAccentColor(theme.obsidianLightTokens, theme.obsidianLightTokens.amber))
      .toBe(tradesColorTokens.light.stripAccent);
    expect(theme.getStripTextColor(theme.obsidianDarkTokens, theme.obsidianDarkTokens.mainText))
      .toBe(theme.obsidianDarkTokens.mainText);
    expect(theme.getStripAccentColor(theme.obsidianDarkTokens, theme.obsidianDarkTokens.amber))
      .toBe(theme.obsidianDarkTokens.amber);
  });

  it('toggles and persists both available modes', async () => {
    const theme = await loadTheme();

    theme.toggleThemeMode();
    expect(theme.getThemeMode()).toBe('light');
    expect(storage.setItem).toHaveBeenLastCalledWith('bbj_theme_mode', 'light');

    theme.toggleThemeMode();
    expect(theme.getThemeMode()).toBe('dark');
    expect(storage.setItem).toHaveBeenLastCalledWith('bbj_theme_mode', 'dark');
  });

  it('keeps a customer-selected mode when initial storage resolves late', async () => {
    let resolveStored: (value: string | null) => void = () => undefined;
    storage.getItem.mockImplementation(
      () => new Promise((resolve) => { resolveStored = resolve; }),
    );
    const theme = await loadTheme();

    theme.toggleThemeMode();
    theme.toggleThemeMode();
    resolveStored('light');
    await Promise.resolve();

    expect(theme.getThemeMode()).toBe('dark');
  });

  it('ignores an unknown saved mode and keeps the dark default', async () => {
    storage.getItem.mockResolvedValue('system');
    const theme = await loadTheme();

    await vi.waitFor(() => expect(storage.getItem).toHaveBeenCalledOnce());
    expect(theme.getThemeMode()).toBe('dark');
  });
});
