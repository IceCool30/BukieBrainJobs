import React from 'react';
import { Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toggleThemeMode, useThemeMode, useTrades as useThemeColors } from '../lib/theme';
import { mono, useTrades } from '../lib/theme';

const WEB_URL = 'https://bukie-brain-jobs.vercel.app';

// Mirrors the first six web SERVICE_CATEGORIES so each ID resolves to its live service page.
const POPULAR_SERVICES = [
  { id: 'generator', title: 'Generator Servicing & Repair', group: 'Power & Cooling', from: '₦10,000' },
  { id: 'ac', title: 'AC Repair & Gas Refill', group: 'Power & Cooling', from: '₦12,000' },
  { id: 'plumbing', title: 'Plumbing & Pipe Fitting', group: 'Utilities & Structure', from: '₦8,000' },
  { id: 'electrical', title: 'Electrical & Solar Inverter', group: 'Utilities & Structure', from: '₦15,000' },
  { id: 'cleaning', title: 'Deep Cleaning & Post-Construction', group: 'Home & Lifestyle', from: '₦15,000' },
  { id: 'carpentry', title: 'Furniture & Carpentry Work', group: 'Home & Lifestyle', from: '₦10,000' },
];

type Service = (typeof POPULAR_SERVICES)[number];

const openWeb = (path: string) => Linking.openURL(`${WEB_URL}${path}`);

export default function HomeScreen() {
  const c = useTrades();
  return (
    <SafeAreaView style={[s.fill, { backgroundColor: c.bg }]}>
      <ScrollView contentContainerStyle={s.page}>
        <Brand />
        <Hero />
        <Text style={[s.eyebrow, { color: c.textMuted }]}>POPULAR SERVICES</Text>
        <View style={[s.list, { backgroundColor: c.cardBg, borderColor: c.lead }]}>
          {POPULAR_SERVICES.map((service, i) => (
            <ServiceRow key={service.id} service={service} first={i === 0} />
          ))}
        </View>
        <Pressable accessibilityRole="link" onPress={() => openWeb('/services')} style={s.textLink} hitSlop={8}>
          <Text style={[s.textLinkLabel, { color: c.amber }]}>View all services</Text>
          <Ionicons name="arrow-forward" size={14} color={c.amber} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Brand() {
  const c = useTrades();
  return (
    <View style={s.brand}>
      <Image source={require('../assets/images/logo-icon.png')} style={s.logo} accessibilityIgnoresInvertColors />
      <Text accessibilityRole="header" style={[s.wordmark, { color: c.textMain }]}>
        Bukie<Text style={{ color: c.brandGreen }}>BrainJobs</Text>
      </Text>
      <ThemeButton />
    </View>
  );
}

function Hero() {
  const c = useTrades();
  return (
    <View style={[s.hero, { backgroundColor: c.stripBg, borderColor: c.lead }]}>
      <Text style={s.heroTitle}>
        Book a skilled local or remote worker in minutes or find flexible work that pays what you are worth only on{' '}
        <Text style={{ color: c.stripAccent }}>BukieBrainJobs.</Text>
      </Text>
      <Text style={[s.heroBody, { color: c.stripText }]}>
        Find a BrainWorker for the job, or offer your skills for work that respects your time.
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Find a BrainWorker"
        onPress={() => openWeb('/services')}
        style={({ pressed }) => [s.button, { backgroundColor: pressed ? c.amberHover : c.amber }]}
      >
        <Ionicons name="search" size={16} color="#FFFFFF" />
        <Text style={s.buttonLabel}>FIND A BRAINWORKER</Text>
      </Pressable>
      {/* Link's asChild slot forwards style to the web DOM as-is, so it must be one flat object. */}
      <Link href="/brainworker/register" asChild>
        <Pressable accessibilityRole="button" accessibilityLabel="Become a BrainWorker" style={StyleSheet.flatten([s.button, s.ghost])}>
          <Text style={s.buttonLabel}>BECOME A BRAINWORKER</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>
      </Link>
    </View>
  );
}

function ServiceRow({ service, first }: { service: Service; first: boolean }) {
  const c = useTrades();
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${service.title}, from ${service.from}`}
      onPress={() => openWeb(`/services/${service.id}`)}
      style={({ pressed }) => [s.row, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: c.rule }, pressed && { backgroundColor: c.cardHover }]}
    >
      <View style={s.fill}>
        <Text style={[s.rowTitle, { color: c.textMain }]}>{service.title}</Text>
        <Text style={[s.rowMeta, { color: c.textMuted }]}>{service.group}</Text>
      </View>
      <View style={s.price}>
        <Text style={[s.priceLabel, { color: c.textMuted }]}>FROM</Text>
        <Text style={[s.priceValue, { color: c.textMain }]}>{service.from}</Text>
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
  hero: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, padding: 22, gap: 14 },
  heroTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 31, fontWeight: '800', letterSpacing: -0.8 },
  heroBody: { fontSize: 15, lineHeight: 22 },
  button: { minHeight: 48, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16 },
  buttonLabel: { color: '#FFFFFF', fontFamily: mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.6 },
  ghost: { borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.28)', backgroundColor: 'rgba(255, 255, 255, 0.06)' },
  eyebrow: { fontFamily: mono, fontSize: 11, fontWeight: '600', letterSpacing: 1.3, marginTop: 8 },
  list: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, minHeight: 64 },
  rowTitle: { fontSize: 15, fontWeight: '600' },
  rowMeta: { fontSize: 13, marginTop: 2 },
  price: { alignItems: 'flex-end' },
  priceLabel: { fontFamily: mono, fontSize: 10, letterSpacing: 1 },
  priceValue: { fontFamily: mono, fontSize: 14, fontWeight: '700', marginTop: 2 },
  textLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  textLinkLabel: { fontSize: 14, fontWeight: '600' },
});

function ThemeButton() {
  const c = useThemeColors();
  const mode = useThemeMode();
  const label = mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={toggleThemeMode} hitSlop={10} style={{ marginLeft: 'auto', padding: 8 }}>
      <Ionicons name={mode === 'dark' ? 'sunny-outline' : 'moon-outline'} size={20} color={c.textMuted} />
    </Pressable>
  );
}
