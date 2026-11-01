import React, { type ComponentProps } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStripAccentColor, getStripTextColor, mono, obsidianDarkTokens, useThemeColors, type MobileThemeTokens } from '../../lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export type TabRoute = {
  readonly name: 'home' | 'services' | 'jobs' | 'messages' | 'profile';
  readonly title: string;
  readonly icon: IconName;
  readonly iconActive: IconName;
};

export const TAB_ROUTES: readonly TabRoute[] = [
  {
    name: 'home',
    title: 'Home',
    icon: 'home-outline',
    iconActive: 'home',
  },
  {
    name: 'services',
    title: 'Services',
    icon: 'grid-outline',
    iconActive: 'grid',
  },
  {
    name: 'jobs',
    title: 'Jobs',
    icon: 'briefcase-outline',
    iconActive: 'briefcase',
  },
  {
    name: 'messages',
    title: 'Messages',
    icon: 'chatbubbles-outline',
    iconActive: 'chatbubbles',
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
  },
] as const;

export const BASE_TAB_BAR_HEIGHT = 64;
export const BASE_TAB_BAR_PADDING_BOTTOM = 8;
export const BASE_TAB_BAR_PADDING_TOP = 6;

export function getTabBarStyle(
  insets: number | { bottom: number } = 0,
  tokens: MobileThemeTokens = obsidianDarkTokens,
) {
  const bottomInset = typeof insets === 'number' ? insets : (insets?.bottom ?? 0);
  return {
    backgroundColor: tokens.strip,
    borderTopColor: tokens.divider,
    borderTopWidth: 1,
    height: BASE_TAB_BAR_HEIGHT + bottomInset,
    paddingBottom: BASE_TAB_BAR_PADDING_BOTTOM + bottomInset,
    paddingTop: BASE_TAB_BAR_PADDING_TOP,
  };
}

export function getTabBarOptions(
  insets: number | { bottom: number } = 0,
  tokens: MobileThemeTokens = obsidianDarkTokens,
) {
  return {
    tabBarActiveTintColor: getStripAccentColor(tokens, tokens.amber),
    tabBarInactiveTintColor: getStripTextColor(tokens, tokens.mutedText),
    tabBarStyle: getTabBarStyle(insets, tokens),
    tabBarItemStyle: {
      minHeight: 48,
    },
    headerStyle: {
      backgroundColor: tokens.strip,
      borderBottomColor: tokens.divider,
      borderBottomWidth: 1,
    },
    headerTintColor: getStripTextColor(tokens, tokens.mainText),
    headerTitleStyle: {
      fontFamily: mono,
      fontSize: 16,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
    },
  };
}

export const TAB_BAR_OPTIONS = getTabBarOptions(0);

function TabIcon({
  tab,
  focused,
  color,
  size,
}: {
  tab: TabRoute;
  focused: boolean;
  color: string;
  size?: number;
}) {
  return (
    <Ionicons
      name={focused ? tab.iconActive : tab.icon}
      size={size ?? 22}
      color={color}
    />
  );
}

function renderTabScreen(tab: TabRoute) {
  return (
    <Tabs.Screen
      key={tab.name}
      name={tab.name}
      options={{
        title: tab.title,
        tabBarLabel: tab.title,
        tabBarIcon: ({ color, size, focused }) => (
          <TabIcon tab={tab} focused={focused} color={color} size={size} />
        ),
      }}
    />
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tokens = useThemeColors();
  const screenOptions = React.useMemo(
    () => getTabBarOptions(insets, tokens),
    [insets.bottom, tokens]
  );
  return (
    <Tabs initialRouteName="home" screenOptions={screenOptions}>
      {TAB_ROUTES.map(renderTabScreen)}
    </Tabs>
  );
}
