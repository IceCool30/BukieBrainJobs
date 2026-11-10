import React, { type ComponentProps } from 'react';
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
import { getStripAccentColor, mono, useThemeColors } from '../../lib/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Category = {
  readonly id: string;
  readonly title: string;
  readonly icon: IconName;
};

const SERVICE_GROUPS: readonly Category[] = [
  { id: 'power', title: 'Power & Cooling', icon: 'flash-outline' },
  { id: 'utilities', title: 'Utilities & Structure', icon: 'construct-outline' },
  { id: 'lifestyle', title: 'Home & Lifestyle', icon: 'home-outline' },
];

export default function MobileHomeScreen() {
  const router = useRouter();
  const c = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.canvas }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <HomePreviewBanner />
        <CategorySection
          onSeeAll={() => router.push('/(tabs)/services')}
          onSelect={() => router.push('/(tabs)/services')}
        />
        <ActivitySection />
      </ScrollView>
    </SafeAreaView>
  );
}

function HomePreviewBanner() {
  const c = useThemeColors();
  return (
    <View style={[styles.previewCard, { backgroundColor: c.strip, borderColor: c.divider }]}>
      <View style={styles.previewHeader}>
        <Ionicons name="information-circle-outline" size={18} color={getStripAccentColor(c, c.amber)} />
        <Text style={[styles.previewTitle, { color: getStripAccentColor(c, c.amber) }]}>
          LOCAL PREVIEW
        </Text>
      </View>
      <Text style={[styles.previewBody, { color: c.stripText }]}>
        This preview does not include live service, booking, conversation, or account data.
      </Text>
    </View>
  );
}

function CategoryHeader({ onSeeAll }: { onSeeAll: () => void }) {
  const c = useThemeColors();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.sectionTitle, { color: c.mainText }]}>
        Marketplace Categories
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="View all categories in services tab"
        onPress={onSeeAll}
        hitSlop={8}
        style={styles.seeAllBtn}
      >
        <Text style={[styles.sectionAction, { color: c.amber }]}>
          See all
        </Text>
      </Pressable>
    </View>
  );
}

function CategorySection({
  onSeeAll,
  onSelect,
}: {
  onSeeAll: () => void;
  onSelect: () => void;
}) {
  return (
    <View style={styles.sectionArea}>
      <CategoryHeader onSeeAll={onSeeAll} />
      <View style={styles.categoryList}>
        {SERVICE_GROUPS.map((cat) => (
          <CategoryItem key={cat.id} item={cat} onSelect={onSelect} />
        ))}
      </View>
    </View>
  );
}

function CategoryIcon({ icon }: { icon: IconName }) {
  const c = useThemeColors();
  return (
    <View style={[styles.iconWrapper, { backgroundColor: c.strip }]}>
      <Ionicons name={icon} size={22} color={getStripAccentColor(c, c.amber)} />
    </View>
  );
}

function CategoryItem({ item, onSelect }: { item: Category; onSelect: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.categoryCard,
        {
          backgroundColor: pressed ? c.cardHover : c.card,
          borderColor: c.divider,
        },
      ]}
    >
      <CategoryIcon icon={item.icon} />
      <Text style={[styles.categoryName, { color: c.mainText }]}>
        {item.title}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={c.mutedText} />
    </Pressable>
  );
}

function ActivitySection() {
  const c = useThemeColors();
  return (
    <View style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.divider }]}>
      <Text style={[styles.infoEyebrow, { color: c.mutedText }]}>
        ACTIVITY
      </Text>
      <Text style={[styles.infoTitle, { color: c.mainText }]}>
        No active bookings
      </Text>
      <Text style={[styles.infoBody, { color: c.mutedText }]}>
        This preview does not include live booking records.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, gap: 16, paddingBottom: 32 },
  previewCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewTitle: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  previewBody: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionArea: { gap: 10 },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllBtn: {
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: '600',
  },
  categoryList: { gap: 10 },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { flex: 1, fontSize: 15, fontWeight: '600' },
  infoCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    marginTop: 6,
  },
  infoEyebrow: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  infoBody: {
    fontSize: 13,
    lineHeight: 19,
  },
});
