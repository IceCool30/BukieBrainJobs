import React, { type ComponentProps } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getStripAccentColor, mono, useThemeColors } from '../../lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const SECTIONS: readonly { id: string; label: string; icon: IconName }[] = [
  { id: 'bookings', label: 'Booking History', icon: 'time-outline' },
  { id: 'addresses', label: 'Saved Addresses', icon: 'location-outline' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline' },
  { id: 'support', label: 'Help & Support', icon: 'help-circle-outline' },
];

export default function MobileProfileScreen() {
  const c = useThemeColors();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.canvas }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeader />
        <ProfilePreviewBanner />
        <ProfileSectionsList />
      </ScrollView>
    </SafeAreaView>
  );
}

function ProfileHeader() {
  const c = useThemeColors();
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[styles.heading, { color: c.mainText }]}>
        Account
      </Text>
      <Text style={[styles.subtitle, { color: c.mutedText }]}>
        Account preferences and profile management.
      </Text>
    </View>
  );
}

function ProfilePreviewBanner() {
  const c = useThemeColors();
  return (
    <View style={[styles.previewCard, { backgroundColor: c.strip, borderColor: c.divider }]}>
      <View style={styles.previewHeader}>
        <Ionicons name="information-circle-outline" size={16} color={getStripAccentColor(c, c.amber)} />
        <Text style={[styles.previewTitle, { color: getStripAccentColor(c, c.amber) }]}>
          LOCAL PREVIEW
        </Text>
      </View>
      <Text style={[styles.previewBody, { color: c.stripText }]}>
        This preview does not include live user account or authentication records.
      </Text>
    </View>
  );
}

function ProfileSectionRow({
  item,
  isFirst,
}: {
  item: (typeof SECTIONS)[number];
  isFirst: boolean;
}) {
  const c = useThemeColors();
  return (
    <View
      style={[
        styles.menuRow,
        !isFirst && { borderTopWidth: 1, borderTopColor: c.rule },
      ]}
    >
      <Ionicons name={item.icon} size={20} color={c.amber} />
      <Text style={[styles.menuLabel, { color: c.mainText }]}>
        {item.label}
      </Text>
    </View>
  );
}

function ProfileSectionsList() {
  const c = useThemeColors();
  return (
    <View style={[styles.menuList, { backgroundColor: c.card, borderColor: c.divider }]}>
      {SECTIONS.map((item, i) => (
        <ProfileSectionRow key={item.id} item={item} isFirst={i === 0} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, gap: 16, paddingBottom: 32 },
  header: { gap: 6 },
  heading: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 13, lineHeight: 19 },
  previewCard: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewTitle: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  previewBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  menuList: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
