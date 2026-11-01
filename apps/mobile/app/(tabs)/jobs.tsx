import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStripAccentColor, getStripTextColor, mono, useThemeColors } from '../../lib/theme';

const TABS = ['All', 'Active', 'Upcoming', 'Past'] as const;
type TabType = (typeof TABS)[number];

export default function MobileJobsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('Active');
  const c = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.canvas }]} edges={['left', 'right']}>
      <JobsTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      <ScrollView contentContainerStyle={styles.content}>
        <EmptyJobsCard
          activeTab={activeTab}
          onExplore={() => router.push('/(tabs)/services')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function JobsTabItem({
  tab,
  selected,
  onSelect,
}: {
  tab: TabType;
  selected: boolean;
  onSelect: () => void;
}) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="tab" accessibilityState={{ selected }}
      onPress={onSelect}
      style={[
        styles.tabItem,
        selected && { borderBottomColor: getStripAccentColor(c, c.amber), borderBottomWidth: 2 },
      ]}
    >
      <Text style={[styles.tabLabel, { color: selected ? getStripAccentColor(c, c.amber) : getStripTextColor(c, c.mutedText) }]}>
        {tab}
      </Text>
    </Pressable>
  );
}

function JobsTabBar({
  activeTab,
  onSelectTab,
}: {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
}) {
  const c = useThemeColors();
  return (
    <View style={[styles.tabBar, { backgroundColor: c.strip, borderBottomColor: c.divider }]}>
      {TABS.map((tab) => (
        <JobsTabItem
          key={tab}
          tab={tab}
          selected={activeTab === tab}
          onSelect={() => onSelectTab(tab)}
        />
      ))}
    </View>
  );
}

function ExploreServicesButton({ onPress }: { onPress: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Explore services"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        { backgroundColor: pressed ? c.amberHover : c.amber },
      ]}
    >
      <Ionicons name="grid-outline" size={16} color="#FFFFFF" />
      <Text style={styles.actionLabel}>EXPLORE SERVICES</Text>
    </Pressable>
  );
}

function EmptyJobsCard({
  activeTab,
  onExplore,
}: {
  activeTab: TabType;
  onExplore: () => void;
}) {
  const c = useThemeColors();
  return (
    <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.divider }]}>
      <View style={[styles.iconCircle, { backgroundColor: c.strip }]}>
        <Ionicons name="briefcase-outline" size={28} color={getStripTextColor(c, c.mutedText)} />
      </View>
      <Text style={[styles.emptyTitle, { color: c.mainText }]}>
        No {activeTab.toLowerCase()} jobs
      </Text>
      <Text style={[styles.emptyBody, { color: c.mutedText }]}>
        This preview does not include live booking records.
      </Text>
      <ExploreServicesButton onPress={onExplore} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tabItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: { padding: 18, gap: 16 },
  emptyCard: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 280,
  },
  actionButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
