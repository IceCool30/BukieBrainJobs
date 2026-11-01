import { describe, expect, it, vi } from 'vitest';

vi.mock('expo-router', () => {
  const Screen = () => null;
  const Tabs = Object.assign(
    ({ children }: { children?: unknown }) => children ?? null,
    { Screen }
  );
  return {
    Tabs,
    Link: ({ children }: { children?: unknown }) => children ?? null,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  };
});

vi.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

import {
  BASE_TAB_BAR_HEIGHT,
  BASE_TAB_BAR_PADDING_BOTTOM,
  BASE_TAB_BAR_PADDING_TOP,
  TAB_BAR_OPTIONS,
  TAB_ROUTES,
  getTabBarOptions,
  getTabBarStyle,
} from './(tabs)/_layout';
import { obsidianDarkTokens, obsidianLightTokens } from '../lib/theme';

describe('4.1.1 Expo Router Bottom Tabs Configuration', () => {
  it('defines exactly the 5 approved IA-001 bottom tabs in order', () => {
    expect(TAB_ROUTES).toHaveLength(5);
    expect(TAB_ROUTES.map((t) => t.name)).toEqual([
      'home',
      'services',
      'jobs',
      'messages',
      'profile',
    ]);
    expect(TAB_ROUTES.map((t) => t.title)).toEqual([
      'Home',
      'Services',
      'Jobs',
      'Messages',
      'Profile',
    ]);
  });

  it('uses approved outline and active icons for each tab', () => {
    const routeMap = Object.fromEntries(TAB_ROUTES.map((r) => [r.name, r]));
    expect(routeMap.home.icon).toBe('home-outline');
    expect(routeMap.services.icon).toBe('grid-outline');
    expect(routeMap.jobs.icon).toBe('briefcase-outline');
    expect(routeMap.messages.icon).toBe('chatbubbles-outline');
    expect(routeMap.profile.icon).toBe('person-outline');
  });

  it('applies the approved dark tokens to tab bar options', () => {
    expect(TAB_BAR_OPTIONS.tabBarActiveTintColor).toBe(obsidianDarkTokens.amber);
    expect(TAB_BAR_OPTIONS.tabBarInactiveTintColor).toBe(obsidianDarkTokens.mutedText);
    expect(TAB_BAR_OPTIONS.tabBarStyle.backgroundColor).toBe(obsidianDarkTokens.strip);
    expect(TAB_BAR_OPTIONS.tabBarStyle.borderTopColor).toBe(obsidianDarkTokens.divider);
    expect(TAB_BAR_OPTIONS.headerStyle.backgroundColor).toBe(obsidianDarkTokens.strip);
    expect(TAB_BAR_OPTIONS.headerTintColor).toBe(obsidianDarkTokens.mainText);
  });

  it('applies the selected light tokens when light mode is active', () => {
    const options = getTabBarOptions(0, obsidianLightTokens);

    expect(options.tabBarStyle.backgroundColor).toBe(obsidianLightTokens.strip);
    expect(options.tabBarActiveTintColor).toBe(obsidianLightTokens.stripAccent);
    expect(options.tabBarInactiveTintColor).toBe(obsidianLightTokens.stripText);
    expect(options.headerTintColor).toBe(obsidianLightTokens.stripText);
  });

  it('computes tab bar options dynamically with safe area insets', () => {
    const optionsWithInset = getTabBarOptions(34);
    expect(optionsWithInset.tabBarStyle.height).toBe(BASE_TAB_BAR_HEIGHT + 34);
    expect(optionsWithInset.tabBarStyle.paddingBottom).toBe(BASE_TAB_BAR_PADDING_BOTTOM + 34);
    expect(optionsWithInset.tabBarStyle.paddingTop).toBe(BASE_TAB_BAR_PADDING_TOP);
    expect(getTabBarStyle({ bottom: 20 }).height).toBe(BASE_TAB_BAR_HEIGHT + 20);
  });

  it('enforces a minimum touch target height of 48dp for all tab items', () => {
    const options = getTabBarOptions(0);
    const innerContentHeight =
      BASE_TAB_BAR_HEIGHT - BASE_TAB_BAR_PADDING_TOP - BASE_TAB_BAR_PADDING_BOTTOM;
    expect(innerContentHeight).toBeGreaterThanOrEqual(48);
    expect(options.tabBarItemStyle?.minHeight).toBeGreaterThanOrEqual(48);
  });
});
