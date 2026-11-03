import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

declare const __dirname: string;

vi.mock('expo-router', () => {
  const Screen = () => null;
  const Tabs = Object.assign(
    ({ children }: { children?: unknown }) => children ?? null,
    { Screen }
  );
  return { Tabs };
});

vi.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import { describe, expect, it, vi } from 'vitest';
import { obsidianDarkTokens } from '../lib/theme';
import {
  BASE_TAB_BAR_HEIGHT,
  BASE_TAB_BAR_PADDING_BOTTOM,
  BASE_TAB_BAR_PADDING_TOP,
  getTabBarStyle,
} from './(tabs)/_layout';

describe('4.1.3 Safe Area & Status Bar Configuration', () => {
  const mobileRoot = resolve(__dirname, '..');
  const readMobileFile = (relativePath: string) =>
    readFileSync(resolve(mobileRoot, relativePath), 'utf8');

  const tabScreens = [
    'app/(tabs)/home.tsx',
    'app/(tabs)/services.tsx',
    'app/(tabs)/jobs.tsx',
    'app/(tabs)/messages.tsx',
    'app/(tabs)/profile.tsx',
  ];

  it('configures the RootLayout status bar from the selected theme', () => {
    const layout = readMobileFile('app/_layout.tsx');
    expect(layout).toContain('useThemeMode()');
    expect(layout).toContain("style={mode === 'dark' ? 'light' : 'dark'}");
    expect(layout).toContain('backgroundColor={c.canvas}');
  });

  it('wraps RootLayout in SafeAreaProvider from react-native-safe-area-context', () => {
    const layout = readMobileFile('app/_layout.tsx');
    expect(layout).toContain("from 'react-native-safe-area-context'");
    expect(layout).toContain('<SafeAreaProvider>');
    expect(layout).toContain('</SafeAreaProvider>');
  });

  it('protects marketing home on all 4 edges without tab bar', () => {
    const indexContent = readMobileFile('app/index.tsx');
    expect(indexContent).toContain("from 'react-native-safe-area-context'");
    expect(indexContent).toMatch(/<SafeAreaView[^>]*edges=\{[^}]*['"]top['"][^}]*['"]bottom['"][^}]*\}/);
  });

  it('protects BrainWorker registration on all 4 edges with keyboard avoidance', () => {
    const regContent = readMobileFile('app/brainworker/register.tsx');
    expect(regContent).toContain("from 'react-native-safe-area-context'");
    expect(regContent).toMatch(/<SafeAreaView[^>]*edges=\{[^}]*['"]top['"][^}]*['"]bottom['"][^}]*\}/);
  });

  it('prevents double insets in tab screens by restricting edges to left and right', () => {
    for (const screenPath of tabScreens) {
      const content = readMobileFile(screenPath);
      expect(content, `Tab screen ${screenPath} must import from react-native-safe-area-context`).toContain(
        "from 'react-native-safe-area-context'"
      );
      expect(content, `Tab screen ${screenPath} must avoid double vertical insets with edges={['left', 'right']}`).toMatch(
        /<SafeAreaView[^>]*edges=\{(\['left',\s*'right'\]|\['right',\s*'left'\])\}/
      );
    }
  });

  it('prohibits deprecated react-native SafeAreaView across all mobile screens', () => {
    const allScreens = [
      'app/index.tsx',
      'app/brainworker/register.tsx',
      ...tabScreens,
    ];

    for (const screenPath of allScreens) {
      const content = readMobileFile(screenPath);
      const matchesReactNativeSafeArea = /import\s*\{[^}]*\bSafeAreaView\b[^}]*\}\s*from\s*['"]react-native['"]/.test(
        content
      );
      expect(
        matchesReactNativeSafeArea,
        `${screenPath} must not import SafeAreaView from 'react-native'`
      ).toBe(false);
    }
  });

  it('declares react-native-safe-area-context matching Expo SDK 52 (~4.12.0)', () => {
    const pkg = JSON.parse(readMobileFile('package.json'));
    expect(pkg.dependencies['react-native-safe-area-context']).toBe('~4.12.0');
  });

  it('proves tab bar height and content padding include nonzero bottom inset without double-counting', () => {
    const layoutContent = readMobileFile('app/(tabs)/_layout.tsx');
    expect(layoutContent).toContain("from 'react-native-safe-area-context'");
    expect(layoutContent).toContain('useSafeAreaInsets');

    const bottomInset = 34;
    const withInset = getTabBarStyle(bottomInset);
    const withoutInset = getTabBarStyle(0);

    expect(withoutInset.height).toBe(BASE_TAB_BAR_HEIGHT);
    expect(withoutInset.paddingBottom).toBe(BASE_TAB_BAR_PADDING_BOTTOM);
    expect(withoutInset.paddingTop).toBe(BASE_TAB_BAR_PADDING_TOP);

    expect(withInset.height).toBe(BASE_TAB_BAR_HEIGHT + bottomInset);
    expect(withInset.paddingBottom).toBe(BASE_TAB_BAR_PADDING_BOTTOM + bottomInset);
    expect(withInset.paddingTop).toBe(BASE_TAB_BAR_PADDING_TOP);

    const contentAreaZero = withoutInset.height - withoutInset.paddingBottom - withoutInset.paddingTop;
    const contentAreaInset = withInset.height - withInset.paddingBottom - withInset.paddingTop;
    expect(contentAreaInset).toBe(contentAreaZero);

    const merged = Object.assign({}, { paddingBottom: bottomInset }, withInset);
    expect(merged.paddingBottom).toBe(BASE_TAB_BAR_PADDING_BOTTOM + bottomInset);
    expect(merged.paddingBottom).not.toBe(BASE_TAB_BAR_PADDING_BOTTOM + bottomInset * 2);
  });
});
