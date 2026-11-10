import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { Tabs } from 'expo-router';

vi.mock('expo-router', () => {
  const Screen = (props: { name: string; options?: unknown }) => ({
    type: 'Tabs.Screen',
    props,
  });
  const Tabs = Object.assign(
    ({ children, ...props }: { children?: unknown; [key: string]: unknown }) => ({
      type: 'Tabs',
      props: { ...props, children },
    }),
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
  renderTabScreen,
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
    expect('fontFamily' in TAB_BAR_OPTIONS.headerTitleStyle).toBe(false);
    expect(TAB_BAR_OPTIONS.headerTitleStyle.letterSpacing).toBe(-0.4);
  });

  it('applies the selected light tokens when light mode is active', () => {
    const options = getTabBarOptions(0, obsidianLightTokens);

    expect(options.tabBarStyle.backgroundColor).toBe(obsidianLightTokens.strip);
    expect(options.tabBarActiveTintColor).toBe(obsidianLightTokens.stripAccent);
    expect(options.tabBarActiveTintColor).not.toBe(obsidianLightTokens.amber);
    expect(options.tabBarInactiveTintColor).toBe(obsidianLightTokens.stripText);
    expect(options.headerTintColor).toBe(obsidianLightTokens.stripText);
    expect('fontFamily' in options.headerTitleStyle).toBe(false);
    expect(options.headerTitleStyle.letterSpacing).toBe(-0.4);
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

  it('preserves Home as the initial tab route in both TAB_ROUTES and rendered tab hierarchy', () => {
    // 1. IA-001 route contract: 'home' is explicitly index 0
    expect(TAB_ROUTES[0].name).toBe('home');
    expect(TAB_ROUTES[0].title).toBe('Home');

    // 2. renderTabScreen creates the initial Screen element with name="home"
    const firstScreen = renderTabScreen(TAB_ROUTES[0]) as unknown as {
      type: string;
      props: { name: string; options: { title: string; tabBarLabel: string } };
    };
    expect(firstScreen.type).toBe(Tabs.Screen);
    expect(firstScreen.props.name).toBe('home');
    expect(firstScreen.props.options.title).toBe('Home');
    expect(firstScreen.props.options.tabBarLabel).toBe('Home');

    // 3. Inspect app/(tabs)/_layout.tsx to verify that:
    // a) <Tabs> omits initialRouteName (avoiding TS2322 incompatibility with Expo Router 58 TabsProps)
    // b) screens are mapped in order of TAB_ROUTES (making 'home' the first declared screen in the navigator)
    const layoutSource = readFileSync(
      resolve(__dirname, '(tabs)/_layout.tsx'),
      'utf8'
    );
    expect(layoutSource).not.toMatch(/<Tabs[^>]*\binitialRouteName=/);
    expect(layoutSource).toContain('{TAB_ROUTES.map(renderTabScreen)}');
  });
});
