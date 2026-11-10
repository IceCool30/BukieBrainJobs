import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getStripTextColor, useThemeColors } from '../../lib/theme';

export default function MobileMessagesScreen() {
  const c = useThemeColors();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.canvas }]} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <MessagesHeader />
        <EmptyMessagesCard />
      </ScrollView>
    </SafeAreaView>
  );
}

function MessagesHeader() {
  const c = useThemeColors();
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={[styles.heading, { color: c.mainText }]}>
        Messages
      </Text>
      <Text style={[styles.subtitle, { color: c.mutedText }]}>
        Direct messaging with assigned BrainWorkers.
      </Text>
    </View>
  );
}

function EmptyMessagesCard() {
  const c = useThemeColors();
  return (
    <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.divider }]}>
      <View style={[styles.iconCircle, { backgroundColor: c.strip }]}>
        <Ionicons name="chatbubbles-outline" size={28} color={getStripTextColor(c, c.mutedText)} accessible={false} />
      </View>
      <Text accessibilityRole="header" style={[styles.emptyTitle, { color: c.mainText }]}>
        No conversations
      </Text>
      <Text style={[styles.emptyBody, { color: c.mutedText }]}>
        This preview does not include live conversations.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 18, gap: 16, paddingBottom: 32 },
  header: { gap: 6 },
  heading: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 13, lineHeight: 19 },
  emptyCard: {
    padding: 28,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
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
    maxWidth: 290,
  },
});
