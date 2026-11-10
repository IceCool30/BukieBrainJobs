import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStripAccentColor, getStripTextColor, mono, useThemeColors } from '../../lib/theme';
import {
  getServiceById,
  type MobileServiceCategory,
} from '../../lib/services';

export default function MobileServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const service = params.id ? getServiceById(params.id) : undefined;
  const c = useThemeColors();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: c.canvas }]}
      edges={['top', 'left', 'right', 'bottom']}
    >
      {service ? (
        <ServiceDetailContent
          service={service}
          onBack={() => router.back()}
        />
      ) : (
        <ServiceNotFoundView
          onBack={() => router.replace('/(tabs)/services')}
        />
      )}
    </SafeAreaView>
  );
}

function ServiceNotFoundView({ onBack }: { onBack: () => void }) {
  const c = useThemeColors();
  return (
    <View style={styles.notFoundContainer}>
      <View style={[styles.iconBox, { backgroundColor: c.strip, borderColor: c.divider }]}>
        <Ionicons name="alert-circle-outline" size={32} color={getStripAccentColor(c, c.amber)} />
      </View>
      <Text style={[styles.notFoundTitle, { color: c.mainText }]}>Service Not Found</Text>
      <Text style={[styles.notFoundBody, { color: c.mutedText }]}>
        The requested service category could not be found in our directory.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to services directory"
        onPress={onBack}
        style={({ pressed }) => [
          styles.secondaryBtn,
          { backgroundColor: pressed ? c.cardHover : c.strip, borderColor: c.divider },
        ]}
      >
        <Text style={[styles.secondaryBtnText, { color: getStripTextColor(c, c.mainText) }]}>Back to services</Text>
      </Pressable>
    </View>
  );
}

function ServiceDetailHeader({ group, onBack }: { group: string; onBack: () => void }) {
  const c = useThemeColors();
  return (
    <View style={styles.headerBar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to services"
        onPress={onBack}
        style={({ pressed }) => [
          styles.backBtn,
          { backgroundColor: pressed ? c.cardHover : c.strip, borderColor: c.divider },
        ]}
      >
        <Ionicons name="arrow-back" size={20} color={getStripTextColor(c, c.mainText)} />
      </Pressable>
      <View style={[styles.headerBadge, { backgroundColor: c.strip, borderColor: c.divider }]}>
        <Text style={[styles.groupTag, { color: getStripAccentColor(c, c.amber) }]}>
          {group.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

function ServiceTasksSection({ tasks }: { tasks: readonly string[] }) {
  const c = useThemeColors();
  return (
    <View style={[styles.tasksCard, { backgroundColor: c.card, borderColor: c.divider }]}>
      <Text style={[styles.sectionHeading, { color: c.mainText }]}>
        Examples in this local catalog
      </Text>
      <View style={styles.tasksList}>
        {tasks.map((task) => (
          <View key={task} style={styles.taskRow}>
            <Ionicons name="checkmark-circle" size={18} color={c.green} />
            <Text style={[styles.taskText, { color: c.mainText }]}>
              {task}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ServicePreviewActionCard() {
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
        This preview does not include live service booking or worker dispatch actions.
      </Text>
    </View>
  );
}

function ServiceTitle({ service }: { service: MobileServiceCategory }) {
  const c = useThemeColors();
  return (
    <View style={styles.titleArea}>
      <Text style={[styles.mainTitle, { color: c.mainText }]}>{service.title}</Text>
      <Text style={[styles.description, { color: c.mutedText }]}>{service.description}</Text>
    </View>
  );
}

function ServiceBookingAction({ service }: { service: MobileServiceCategory }) {
  const c = useThemeColors();
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const btnStyle = StyleSheet.flatten([
    styles.actionBtn,
    { backgroundColor: pressed ? c.ctaPressed : c.ctaFill, borderColor: pressed ? c.ctaPressed : c.ctaFill },
  ]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Prepare booking request"
      onPress={() => router.push({ pathname: '/book', params: { serviceId: service.id } })}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={btnStyle}
    >
      <Text style={[styles.actionBtnText, { color: c.ctaText }]}>
        Prepare booking request
      </Text>
    </Pressable>
  );
}

function ServiceDetailContent({
  service,
  onBack,
}: {
  service: MobileServiceCategory;
  onBack: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ServiceDetailHeader group={service.group} onBack={onBack} />
      <ServiceTitle service={service} />
      <ServiceTasksSection tasks={service.popularServices} />
      <ServicePreviewActionCard />
      <ServiceBookingAction service={service} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, gap: 18, paddingBottom: 36 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backBtn: {
    width: 48,
    height: 48,
    borderRadius: 9999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  groupTag: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  titleArea: { gap: 10 },
  mainTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 30 },
  description: { fontSize: 14, lineHeight: 22 },
  tasksCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  sectionHeading: { fontSize: 16, fontWeight: '700' },
  tasksList: { gap: 10 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
  },
  taskText: { fontSize: 14, lineHeight: 20, flex: 1 },
  previewCard: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    marginTop: 2,
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
  previewBody: { fontSize: 13, lineHeight: 19 },
  notFoundContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notFoundTitle: { fontSize: 20, fontWeight: '700' },
  notFoundBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  actionBtn: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  actionBtnText: { fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '600' },
});
