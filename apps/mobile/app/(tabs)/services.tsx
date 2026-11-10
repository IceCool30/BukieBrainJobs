import React, { useState, type ComponentProps } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStripAccentColor, getStripTextColor, mono, useThemeColors } from '../../lib/theme';
import {
  CANONICAL_SERVICES,
  filterServices,
  type MobileServiceCategory,
} from '../../lib/services';

const FILTER_GROUPS = [
  'All',
  'Power & Cooling',
  'Utilities & Structure',
  'Home & Lifestyle',
] as const;

type SearchProps = {
  query: string;
  onChangeQuery: (text: string) => void;
  onClear: () => void;
};

type PillItemProps = {
  name: string;
  active: boolean;
  onSelect: (group: string) => void;
};

type PillsProps = {
  selected: string;
  onSelect: (group: string) => void;
};

type CardProps = {
  item: MobileServiceCategory;
  onSelect: () => void;
};

export default function MobileServicesScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('All');
  const filtered = filterServices(CANONICAL_SERVICES, { query, group });
  const c = useThemeColors();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.canvas }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ServicesPreviewBanner />
        <ServicesSearchInput query={query} onChangeQuery={setQuery} onClear={() => setQuery('')} />
        <ServicesFilterPills selected={group} onSelect={setGroup} />
        {filtered.length > 0 ? (
          <ServicesList services={filtered} onSelect={(id) => router.push(`/services/${id}`)} />
        ) : (
          <ServicesEmptyState onReset={() => { setQuery(''); setGroup('All'); }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ServicesPreviewBanner() {
  const c = useThemeColors();
  return (
    <View style={[styles.noticeCard, { backgroundColor: c.strip, borderColor: c.divider }]}>
      <View style={styles.noticeHeader}>
        <Ionicons name="information-circle-outline" size={15} color={getStripAccentColor(c, c.amber)} />
        <Text style={[styles.noticeTitle, { color: getStripAccentColor(c, c.amber) }]}>
          LOCAL PREVIEW
        </Text>
      </View>
      <Text style={[styles.noticeBody, { color: c.stripText }]}>
        This preview does not include live service listings or booking actions.
      </Text>
    </View>
  );
}

function ClearSearchButton({ onClear }: { onClear: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={onClear} style={styles.clearBtn}>
      <Ionicons name="close-circle" size={18} color={c.mutedText} />
    </Pressable>
  );
}

function ServicesSearchInput({ query, onChangeQuery, onClear }: SearchProps) {
  const c = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const boxStyle = [styles.searchBox, { backgroundColor: c.card, borderColor: isFocused ? c.amber : c.divider }];

  return (
    <View style={boxStyle}>
      <Ionicons name="search-outline" size={18} color={isFocused ? c.amber : c.mutedText} />
      <TextInput
        style={[styles.searchInput, { color: c.mainText }]}
        placeholder="Search services..."
        placeholderTextColor={c.mutedText}
        accessibilityLabel="Search services"
        value={query}
        onChangeText={onChangeQuery}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoCorrect={false}
      />
      {query.length > 0 ? <ClearSearchButton onClear={onClear} /> : null}
    </View>
  );
}

function FilterPillItem({ name, active, onSelect }: PillItemProps) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${name}`}
      accessibilityState={{ selected: active }}
      onPress={() => onSelect(name)}
      style={({ pressed }) => [
        styles.pill,
        {
          backgroundColor: active ? c.amber : pressed ? c.cardHover : c.strip,
          borderColor: active ? c.amber : c.divider,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: active ? c.card : getStripTextColor(c, c.mainText) }]}>
        {name}
      </Text>
    </Pressable>
  );
}

function ServicesFilterPills({ selected, onSelect }: PillsProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
      {FILTER_GROUPS.map((name) => (
        <FilterPillItem key={name} name={name} active={selected === name} onSelect={onSelect} />
      ))}
    </ScrollView>
  );
}

function ServicesList({
  services,
  onSelect,
}: {
  services: readonly MobileServiceCategory[];
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.list} accessibilityLabel="Services list">
      {services.map((item) => (
        <ServiceCard key={item.id} item={item} onSelect={() => onSelect(item.id)} />
      ))}
    </View>
  );
}

function ServiceCardTop({
  group,
  icon,
}: { group: string; icon: ComponentProps<typeof Ionicons>['name'] }) {
  const c = useThemeColors();
  const accent = getStripAccentColor(c, c.amber);
  return (
    <View style={styles.cardTop}>
      <View style={styles.badgeRow}>
        <View style={[styles.iconWrap, { backgroundColor: c.strip, borderColor: c.divider }]}>
          <Ionicons name={icon} size={16} color={accent} />
        </View>
        <View style={[styles.groupBadge, { backgroundColor: c.strip, borderColor: c.divider }]}>
          <Text style={[styles.groupTag, { color: accent }]}>{group.toUpperCase()}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={16} color={c.mutedText} />
    </View>
  );
}

function ServiceCard({ item, onSelect }: CardProps) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={item.title}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? c.cardHover : c.card,
          borderColor: c.divider,
        },
      ]}
    >
      <ServiceCardTop group={item.group} icon={item.icon} />
      <Text style={[styles.serviceTitle, { color: c.mainText }]}>
        {item.title}
      </Text>
      <Text numberOfLines={2} style={[styles.serviceDesc, { color: c.mutedText }]}>
        {item.description}
      </Text>
    </Pressable>
  );
}

function ServicesEmptyState({ onReset }: { onReset: () => void }) {
  const c = useThemeColors();
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={32} color={c.mutedText} />
      <Text style={[styles.emptyTitle, { color: c.mainText }]}>No matching services found</Text>
      <Text style={[styles.emptySubtitle, { color: c.mutedText }]}>
        Try adjusting your search terms or filter selection.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Reset filters and search"
        onPress={onReset}
        style={({ pressed }) => [
          styles.resetBtn,
          { backgroundColor: pressed ? c.cardHover : c.strip, borderColor: c.divider },
        ]}
      >
        <Text style={[styles.resetBtnText, { color: getStripAccentColor(c, c.amber) }]}>Reset filters</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, gap: 16, paddingBottom: 32 },
  noticeCard: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noticeTitle: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  noticeBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 12,
    minHeight: 48,
  },
  clearBtn: {
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: { gap: 12 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    minHeight: 64,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
  },
  groupTag: {
    fontFamily: mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  serviceDesc: {
    fontSize: 13,
    lineHeight: 19,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
  resetBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
