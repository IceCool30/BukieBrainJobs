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
import {
  ACTIVITY_SAMPLE_NOTICE,
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  filterActivitySamples,
  type ActivitySample,
  type ActivitySegment,
} from '../../lib/activity-preview';
import { getStripAccentColor, getStripTextColor, mono, useThemeColors } from '../../lib/theme';

// Note: This preview does not include live activity records.
const TABS: ReadonlyArray<ActivitySegment> = ['All', 'Active', 'Upcoming', 'Past'];

type TabItemProps = {
  tab: ActivitySegment;
  selected: boolean;
  onSelect: () => void;
};

type TabBarProps = {
  activeTab: ActivitySegment;
  onSelectTab: (tab: ActivitySegment) => void;
};

export default function MobileJobsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActivitySegment>('All');
  const c = useThemeColors();
  const samples = filterActivitySamples(activeTab);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.canvas }]} edges={['left', 'right']}>
      <JobsTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.notice, { color: c.mutedText }]}>{ACTIVITY_SAMPLE_NOTICE}</Text>
        <ActivitySampleList samples={samples} />
        <ExploreServicesButton onPress={() => router.push('/(tabs)/services')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function JobsTabItem({ tab, selected, onSelect }: TabItemProps) {
  const c = useThemeColors();
  const accent = getStripAccentColor(c, c.amber);
  const textMuted = getStripTextColor(c, c.mutedText);
  const tabItemStyle = [styles.tabItem, selected && styles.tabItemSelected, selected && { borderBottomColor: accent }];

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      aria-selected={selected}
      onPress={onSelect}
      style={tabItemStyle}
    >
      <Text style={[styles.tabLabel, { color: selected ? accent : textMuted }]}>{tab}</Text>
    </Pressable>
  );
}

function JobsTabBar({ activeTab, onSelectTab }: TabBarProps) {
  const c = useThemeColors();
  return (
    <View style={[styles.tabBar, { backgroundColor: c.strip, borderBottomColor: c.divider }]}>
      {TABS.map((tab) => (
        <JobsTabItem key={tab} tab={tab} selected={activeTab === tab} onSelect={() => onSelectTab(tab)} />
      ))}
    </View>
  );
}

function ActivitySampleCard({ sample }: { sample: ActivitySample }) {
  const c = useThemeColors();
  const typeLabel = ACTIVITY_TYPE_LABELS[sample.type];
  const statusLabel = ACTIVITY_STATUS_LABELS[sample.status];

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.divider }]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.typeLabel, { color: c.mutedText }]}>{typeLabel}</Text>
        <View style={[styles.badge, { backgroundColor: c.strip, borderColor: c.divider }]}>
          <Text style={[styles.badgeText, { color: getStripAccentColor(c, c.amber) }]}>{sample.badge}</Text>
        </View>
      </View>
      <Text style={[styles.serviceTitle, { color: c.mainText }]}>{sample.serviceTitle}</Text>
      <Text style={[styles.statusLabel, { color: c.mutedText }]}>{statusLabel}</Text>
    </View>
  );
}

function ActivitySampleList({ samples }: { samples: ReadonlyArray<ActivitySample> }) {
  return (
    <View style={styles.sampleList}>
      {samples.map((item) => (
        <ActivitySampleCard key={`${item.type}-${item.status}-${item.serviceTitle}`} sample={item} />
      ))}
    </View>
  );
}

function ExploreServicesButton({ onPress }: { onPress: () => void }) {
  const c = useThemeColors();
  const ctaFg = c.mode === 'light' ? c.card : c.canvas;
  const buttonStyle = ({ pressed }: { pressed: boolean }) => [
    styles.actionButton,
    { backgroundColor: pressed ? c.amberHover : c.amber },
  ];

  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Explore services" onPress={onPress} style={buttonStyle}>
      <Ionicons name="grid-outline" size={16} color={ctaFg} />
      <Text style={[styles.actionLabel, { color: ctaFg }]}>EXPLORE SERVICES</Text>
    </Pressable>
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
    minHeight: 48,
    minWidth: 48,
  },
  tabItemSelected: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    padding: 18,
    gap: 16,
    paddingBottom: 32,
  },
  notice: {
    fontSize: 13,
    lineHeight: 19,
  },
  sampleList: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeLabel: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontFamily: mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusLabel: {
    fontSize: 13,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
    minWidth: 48,
  },
  actionLabel: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
