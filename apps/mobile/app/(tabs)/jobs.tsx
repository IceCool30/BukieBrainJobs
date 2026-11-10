import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  ACTIVITY_SAMPLES,
  ACTIVITY_SAMPLE_NOTICE,
  ACTIVITY_STATUS_LABELS,
  ACTIVITY_TYPE_LABELS,
  filterActivitySamples,
  type ActivitySample,
  type ActivitySegment,
} from '../../lib/activity-preview';
import {
  CANCELLED_PREVIEW_NOTICE,
  LIFECYCLE_SAMPLE_DISCLAIMER,
  getSampleLifecycleHeading,
  getSampleLifecycleNarrative,
  getSampleMilestoneProgression,
  isSampleCancelled,
  type MilestoneWithProgress,
} from '../../lib/lifecycle-preview';
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
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<ActivitySegment>('All');
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number | null>(null);
  const c = useThemeColors();
  const samples = filterActivitySamples(activeTab);

  useEffect(() => navigation.addListener('blur', () => setSelectedSampleIndex(null)), [navigation]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.canvas }]} edges={['left', 'right']}>
      <JobsTabBar activeTab={activeTab} onSelectTab={(tab) => { setSelectedSampleIndex(null); setActiveTab(tab); }} />
      <ScrollView contentContainerStyle={styles.content}>
        <JobsScreenBody
          selectedIndex={selectedSampleIndex}
          samples={samples}
          onSelect={(idx) => setSelectedSampleIndex(idx)}
          onBack={() => setSelectedSampleIndex(null)}
          onExplore={() => router.push('/(tabs)/services')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type ScreenBodyProps = {
  selectedIndex: number | null;
  samples: ReadonlyArray<ActivitySample>;
  onSelect: (idx: number) => void;
  onBack: () => void;
  onExplore: () => void;
};

function JobsScreenBody({ selectedIndex, samples, onSelect, onBack, onExplore }: ScreenBodyProps) {
  if (selectedIndex !== null) {
    return <ActivityLifecycleDetail sampleIndex={selectedIndex} onBack={onBack} />;
  }
  return <ActivityHubList samples={samples} onSelectSample={onSelect} onExplore={onExplore} />;
}

function JobsTabItem({ tab, selected, onSelect }: TabItemProps) {
  const c = useThemeColors();
  const accent = getStripAccentColor(c, c.amber);
  const textMuted = getStripTextColor(c, c.mutedText);
  const tabItemStyle = [
    styles.tabItem,
    selected && styles.tabItemSelected,
    selected && {
      borderBottomColor: accent,
      backgroundColor: c.mode === 'light' ? 'rgba(0, 26, 65, 0.06)' : 'rgba(255, 255, 255, 0.06)',
    },
  ];

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

type HubListProps = {
  samples: ReadonlyArray<ActivitySample>;
  onSelectSample: (index: number) => void;
  onExplore: () => void;
};

function ActivityHubList({ samples, onSelectSample, onExplore }: HubListProps) {
  const c = useThemeColors();
  return (
    <>
      <Text style={[styles.notice, { color: c.mutedText }]}>{ACTIVITY_SAMPLE_NOTICE}</Text>
      <ActivitySampleList samples={samples} onSelectSample={onSelectSample} />
      <ExploreServicesButton onPress={onExplore} />
    </>
  );
}

function ActivityCardHeader({ sample }: { sample: ActivitySample }) {
  const c = useThemeColors();
  const isCancelled = sample.status === 'cancelled';
  const badgeColor = isCancelled ? c.danger : getStripAccentColor(c, c.amber);
  const badgeBg = isCancelled && c.mode === 'light' ? c.card : c.strip;
  return (
    <View style={styles.cardHeader}>
      <Text style={[styles.typeLabel, { color: c.mutedText }]}>{ACTIVITY_TYPE_LABELS[sample.type]}</Text>
      <View style={[styles.badge, { backgroundColor: badgeBg, borderColor: isCancelled ? c.danger : c.divider }]}>
        <Text style={[styles.badgeText, { color: badgeColor }]}>{sample.badge}</Text>
      </View>
    </View>
  );
}

type CardProps = {
  sample: ActivitySample;
  onPress: () => void;
};

function CancelledNotice() {
  const c = useThemeColors();
  return (
    <View style={styles.cancelledInlineNotice}>
      <Ionicons name="information-circle-outline" size={13} color={c.danger} />
      <Text style={[styles.cancelledInlineText, { color: c.danger }]}>{CANCELLED_PREVIEW_NOTICE}</Text>
    </View>
  );
}

function ActivitySampleCard({ sample, onPress }: CardProps) {
  const c = useThemeColors();
  const isCancelled = sample.status === 'cancelled';
  const pressedBg = c.mode === 'light' ? (isCancelled ? c.card : c.cardHover) : c.strip;
  const cardStyle = ({ pressed }: { pressed: boolean }) => [
    styles.card,
    { backgroundColor: pressed ? pressedBg : c.card, borderColor: isCancelled ? c.danger : c.mutedText },
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View details for ${sample.serviceTitle}`}
      accessibilityHint="Opens lifecycle details"
      onPress={onPress}
      style={cardStyle}
    >
      <ActivityCardHeader sample={sample} />
      <Text style={[styles.serviceTitle, { color: c.mainText }]}>{sample.serviceTitle}</Text>
      <Text style={[styles.statusLabel, { color: isCancelled ? c.danger : c.mutedText }]}>{ACTIVITY_STATUS_LABELS[sample.status]}</Text>
      {isCancelled && <CancelledNotice />}
    </Pressable>
  );
}

type SampleListProps = {
  samples: ReadonlyArray<ActivitySample>;
  onSelectSample: (index: number) => void;
};

function ActivitySampleList({ samples, onSelectSample }: SampleListProps) {
  return (
    <View style={styles.sampleList}>
      {samples.map((item) => {
        const sampleIndex = ACTIVITY_SAMPLES.indexOf(item);
        return (
          <ActivitySampleCard
            key={`${item.type}-${item.status}-${item.serviceTitle}`}
            sample={item}
            onPress={() => onSelectSample(sampleIndex)}
          />
        );
      })}
    </View>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  const c = useThemeColors();
  const isLight = c.mode === 'light';
  const textColor = isLight ? c.amberHover : c.amber;
  const pressedBg = isLight ? c.card : c.strip;
  const buttonStyle = ({ pressed }: { pressed: boolean }) => [
    styles.backButton,
    { backgroundColor: pressed ? pressedBg : 'transparent', borderColor: c.divider },
  ];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back to activity list"
      onPress={onBack}
      style={buttonStyle}
    >
      <Ionicons name="chevron-back" size={18} color={textColor} />
      <Text style={[styles.backButtonText, { color: textColor }]}>Back to Activity</Text>
    </Pressable>
  );
}

function CurrentStateBlock({ sampleIndex, sample }: { sampleIndex: number; sample: ActivitySample }) {
  const c = useThemeColors();
  const heading = getSampleLifecycleHeading(sampleIndex);
  const narrative = getSampleLifecycleNarrative(sampleIndex);
  const cancelled = isSampleCancelled(sampleIndex);
  const accentColor = cancelled ? c.danger : c.amber;
  const badgeBg = cancelled && c.mode === 'light' ? c.card : c.strip;

  return (
    <View style={[styles.detailSection, { backgroundColor: c.card, borderColor: cancelled ? c.danger : c.divider }]}>
      <ActivityCardHeader sample={sample} />
      <Text accessibilityRole="header" style={[styles.serviceTitle, { color: c.mainText }]}>{sample.serviceTitle}</Text>
      <Text accessibilityRole="header" style={[styles.headingLabel, { color: accentColor }]}>{heading}</Text>
      {cancelled && (
        <View style={[styles.cancelledBadge, { backgroundColor: badgeBg, borderColor: c.danger }]}>
          <Ionicons name="alert-circle-outline" size={14} color={c.danger} />
          <Text style={[styles.cancelledBadgeText, { color: c.danger }]}>{CANCELLED_PREVIEW_NOTICE}</Text>
        </View>
      )}
      <Text style={[styles.narrativeText, { color: c.mutedText }]}>{narrative}</Text>
    </View>
  );
}

type MilestoneItemProps = {
  step: MilestoneWithProgress;
  isLast: boolean;
};

function ActiveStepMarker() {
  const c = useThemeColors();
  const markerColor = getStripAccentColor(c, c.amber);
  return (
    <View style={[styles.activeStepMarker, { backgroundColor: c.strip, borderColor: markerColor }]}>
      <View style={[styles.activeMarkerDot, { backgroundColor: markerColor }]} />
      <Text style={[styles.stepStateLabel, { color: markerColor }]}>Current step</Text>
    </View>
  );
}

function MilestoneStepItem({ step, isLast }: MilestoneItemProps) {
  const c = useThemeColors();
  const isDone = step.state === 'completed';
  const isActive = step.state === 'active';
  const iconColor = isDone ? c.green : isActive ? c.amber : c.divider;
  const iconName = isDone ? 'checkmark-circle' : isActive ? 'radio-button-on' : 'ellipse-outline';
  const labelColor = isDone || isActive ? c.mainText : c.mutedText;
  const stateLabel = isDone ? 'Completed' : isActive ? 'Current step' : 'Upcoming';

  return (
    <View style={styles.stepItem} accessible={true} accessibilityLabel={`${step.label}: ${stateLabel}`}>
      <View style={styles.stepTrack}>
        <Ionicons name={iconName} size={18} color={iconColor} />
        {!isLast && <View style={[styles.stepConnector, { backgroundColor: isDone ? c.green : c.divider }]} />}
      </View>
      <View style={styles.stepContent}>
        <Text style={[styles.stepLabel, { color: labelColor, fontWeight: isActive ? '700' : '500' }]}>{step.label}</Text>
        <View style={styles.stepStateRow}>
          {isActive ? <ActiveStepMarker /> : <Text style={[styles.stepStateLabel, { color: isDone ? c.green : c.mutedText }]}>{stateLabel}</Text>}
        </View>
      </View>
    </View>
  );
}

function MilestoneIndicatorBlock({ sampleIndex }: { sampleIndex: number }) {
  const c = useThemeColors();
  const progression = getSampleMilestoneProgression(sampleIndex);
  if (!progression) return null;

  return (
    <View style={[styles.detailSection, { backgroundColor: c.card, borderColor: c.divider }]}>
      <Text accessibilityRole="header" style={[styles.sectionTitle, { color: c.mainText }]}>
        LIFECYCLE PROGRESSION
      </Text>
      <View style={styles.milestoneList}>
        {progression.map((step, idx) => (
          <MilestoneStepItem key={step.id} step={step} isLast={idx === progression.length - 1} />
        ))}
      </View>
    </View>
  );
}

function SampleContextBlock({ sample }: { sample: ActivitySample }) {
  const c = useThemeColors();
  const contextTextColor = getStripTextColor(c, c.mutedText);
  return (
    <View style={[styles.detailSection, { backgroundColor: c.strip, borderColor: c.divider }]}>
      <Text style={[styles.typeLabel, { color: contextTextColor }]}>
        ENTRY TYPE: {ACTIVITY_TYPE_LABELS[sample.type].toUpperCase()}
      </Text>
      <Text style={[styles.disclaimerText, { color: contextTextColor }]}>
        {LIFECYCLE_SAMPLE_DISCLAIMER}
      </Text>
    </View>
  );
}

type DetailProps = {
  sampleIndex: number;
  onBack: () => void;
};

function ActivityLifecycleDetail({ sampleIndex, onBack }: DetailProps) {
  const sample = ACTIVITY_SAMPLES[sampleIndex];
  if (!sample) return null;

  return (
    <View style={styles.detailContainer}>
      <BackButton onBack={onBack} />
      <CurrentStateBlock sampleIndex={sampleIndex} sample={sample} />
      <MilestoneIndicatorBlock sampleIndex={sampleIndex} />
      <SampleContextBlock sample={sample} />
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
    paddingVertical: 6,
  },
  tabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 48,
    borderRadius: 20,
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
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    minHeight: 48,
    minWidth: 48,
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
    borderRadius: 6,
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
  cancelledInlineNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  cancelledInlineText: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 48,
    minWidth: 48,
  },
  actionLabel: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 48,
    minWidth: 48,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '700',
  },
  detailContainer: {
    gap: 16,
  },
  detailSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  headingLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: mono,
  },
  cancelledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  cancelledBadgeText: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  narrativeText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  milestoneList: {
    gap: 4,
    marginTop: 4,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 44,
  },
  stepTrack: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stepConnector: {
    width: 2,
    flex: 1,
    minHeight: 16,
    marginVertical: 2,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 12,
  },
  stepLabel: {
    fontSize: 14,
  },
  stepStateRow: {
    marginTop: 3,
  },
  activeStepMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  activeMarkerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stepStateLabel: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  disclaimerText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
