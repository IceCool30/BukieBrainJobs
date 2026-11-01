import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type AccessibilityRole,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStripTextColor, mono, useThemeColors, useThemeMode, toggleThemeMode } from '../lib/theme';

const FEATURED_SERVICES = [
  { id: 'generator', title: 'Generator Servicing & Repair', group: 'Power & Cooling' },
  { id: 'ac', title: 'AC Repair & Gas Refill', group: 'Power & Cooling' },
  { id: 'plumbing', title: 'Plumbing & Pipe Fitting', group: 'Utilities & Structure' },
  { id: 'electrical', title: 'Electrical & Solar Inverter', group: 'Utilities & Structure' },
  { id: 'cleaning', title: 'Deep Cleaning & Post-Construction', group: 'Home & Lifestyle' },
  { id: 'carpentry', title: 'Furniture & Carpentry Work', group: 'Home & Lifestyle' },
];

type Service = (typeof FEATURED_SERVICES)[number];

export default function MarketingHomeScreen() {
  const c = useThemeColors();

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: c.bg }]} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={s.page}>
        <Brand />
        <Hero />
        <ServicesSection />
      </ScrollView>
    </SafeAreaView>
  );
}

function ServicesSection() {
  const c = useThemeColors();
  const router = useRouter();

  return (
    <>
      <Text style={[s.eyebrow, { color: c.textMuted }]}>SERVICES</Text>
      <View style={[s.list, { backgroundColor: c.cardBg, borderColor: c.lead }]}>
        {FEATURED_SERVICES.map((service, i) => (
          <ServiceRow
            key={service.id}
            service={service}
            first={i === 0}
            onPress={() => router.push('/(tabs)/services')}
          />
        ))}
      </View>
      <AllServicesLink onPress={() => router.push('/(tabs)/services')} />
    </>
  );
}

function AllServicesLink({ onPress }: { onPress: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="View all services in app"
      onPress={onPress}
      style={s.textLink}
      hitSlop={8}
    >
      <Text style={[s.textLinkLabel, { color: c.amber }]}>View all services</Text>
      <Ionicons name="arrow-forward" size={14} color={c.amber} />
    </Pressable>
  );
}

function Brand() {
  const c = useThemeColors();
  const mode = useThemeMode();
  return (
    <View style={s.brand}>
      <Image source={require('../assets/images/logo-icon.png')} style={s.logo} accessibilityIgnoresInvertColors />
      <ThemeToggle accessibilityRole="button" style={{ minWidth: 48, minHeight: 48 }} />
      <Text accessibilityRole="header" style={[s.wordmark, { color: c.textMain }]}>
        Bukie<Text style={{ color: c.brandGreen }}>BrainJobs</Text>
      </Text>
    </View>
  );
}

function ThemeToggle({
  accessibilityRole,
  style,
}: {
  accessibilityRole?: AccessibilityRole;
  style?: Record<string, unknown>;
}) {
  const c = useThemeColors();
  const mode = useThemeMode();
  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      onPress={toggleThemeMode}
      style={[s.themeToggle, style, { backgroundColor: c.strip }]}
    >
      <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={getStripTextColor(c, c.textMain)} />
    </Pressable>
  );
}

function Hero() {
  const c = useThemeColors();
  return (
    <View style={[s.hero, { backgroundColor: c.stripBg, borderColor: c.lead }]}>
      <Text style={[s.heroTitle, { color: getStripTextColor(c, '#FFFFFF') }]}>
        Find a BrainWorker for the job, or offer your skills for work that respects your time.
      </Text>
      <HeroActions />
    </View>
  );
}

function FindWorkerButton() {
  const c = useThemeColors();
  return (
    <Link href="/(tabs)/services" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Find a BrainWorker"
        style={StyleSheet.flatten([s.button, { backgroundColor: c.amber }])}
      >
        <Ionicons name="search" size={16} color="#FFFFFF" />
        <Text style={s.buttonLabel}>FIND A BRAINWORKER</Text>
      </Pressable>
    </Link>
  );
}

function RegisterWorkerButton() {
  return (
    <Link href="/brainworker/register" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Become a BrainWorker"
        style={StyleSheet.flatten([s.button, s.ghost])}
      >
        <Text style={s.buttonLabel}>BECOME A BRAINWORKER</Text>
        <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
      </Pressable>
    </Link>
  );
}

function HeroActions() {
  return (
    <View style={s.actions}>
      <FindWorkerButton />
      <RegisterWorkerButton />
      <PostJobButton />
    </View>
  );
}

function PostJobButton() {
  return (
    <Link href="/post-job" asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Post a Job"
        style={StyleSheet.flatten([s.button, s.ghost])}
      >
        <Text style={s.buttonLabel}>Post a Job</Text>
      </Pressable>
    </Link>
  );
}

function ServiceRow({
  service,
  first,
  onPress,
}: { service: Service; first: boolean; onPress: () => void }) {
  const c = useThemeColors();
  const rowBorder = !first ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.rule } : null;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${service.title}, ${service.group}`}
      onPress={onPress}
      style={({ pressed }) => [s.row, rowBorder, pressed && { backgroundColor: c.cardHover }]}
    >
      <View style={s.fill}>
        <Text style={[s.rowTitle, { color: c.textMain }]}>{service.title}</Text>
        <Text style={[s.rowMeta, { color: c.textMuted }]}>{service.group}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={c.textMuted} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  page: { padding: 20, paddingBottom: 40, gap: 16 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  logo: { width: 32, height: 32, borderRadius: 8 },
  wordmark: { fontSize: 18, fontWeight: '800', letterSpacing: -0.4 },
  themeToggle: {
    minWidth: 48,
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  hero: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, padding: 22, gap: 16 },
  heroTitle: { color: '#FFFFFF', fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: -0.6 },
  actions: { gap: 12 },
  button: {
    minHeight: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  buttonLabel: { color: '#FFFFFF', fontFamily: mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.6 },
  ghost: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.28)', backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  eyebrow: { fontFamily: mono, fontSize: 11, fontWeight: '600', letterSpacing: 1.3, marginTop: 8 },
  list: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, minHeight: 56 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowMeta: { fontSize: 13, marginTop: 2 },
  textLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    minHeight: 48,
    minWidth: 48,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  textLinkLabel: { fontSize: 14, fontWeight: '600' },
});
