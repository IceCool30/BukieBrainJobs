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
import { mono, useThemeColors, getStripTextColor, getStripAccentColor } from '../../lib/theme';
import {
  WORKER_WORKSPACE_DISCLAIMER,
  SAMPLE_WORKER_LEADS,
  SAMPLE_LEAD_ALERT,
  getSampleLeadById,
  type WorkerSampleLead,
  type SampleLeadAlert,
} from '../../lib/worker-workspace-preview';

export default function MobileBrainWorkerWorkspacePreviewScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const selectedLead = selectedLeadId ? getSampleLeadById(selectedLeadId) : null;

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: c.canvas }]} edges={['top', 'left', 'right', 'bottom']}>
      <WorkspaceTopNav onBack={() => router.back()} />
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <WorkspaceDisclaimerBanner />
        {selectedLead ? (
          <SampleLeadDetailView lead={selectedLead} onBack={() => setSelectedLeadId(null)} />
        ) : (
          <>
            <WorkspaceHeaderBlock />
            <SampleLeadAlertBanner onSelect={() => setSelectedLeadId(SAMPLE_LEAD_ALERT.id)} />
            <SampleLeadFeedList onSelectLead={(id) => setSelectedLeadId(id)} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WorkspaceTopNav({ onBack }: { onBack: () => void }) {
  const c = useThemeColors();
  return (
    <View style={[s.navBar, { borderBottomColor: c.divider }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Go back to registration"
        onPress={onBack}
        style={({ pressed }) => [s.navBackBtn, { opacity: pressed ? 0.7 : 1 }]}
      >
        <Ionicons name="arrow-back" size={20} color={c.amber} accessible={false} />
        <Text style={[s.navBackText, { color: c.mainText }]}>Registration</Text>
      </Pressable>
    </View>
  );
}

function WorkspaceDisclaimerBanner() {
  const c = useThemeColors();
  const iconColor = getStripAccentColor(c, c.amber);
  const textColor = getStripTextColor(c, c.mutedText);
  return (
    <View style={[s.disclaimerCard, { backgroundColor: c.strip, borderColor: c.divider }]}>
      <Ionicons name="information-circle-outline" size={18} color={iconColor} style={s.disclaimerIcon} accessible={false} />
      <Text
        accessibilityRole="text"
        accessibilityLabel={WORKER_WORKSPACE_DISCLAIMER}
        style={[s.disclaimerText, { color: textColor }]}
      >
        {WORKER_WORKSPACE_DISCLAIMER}
      </Text>
    </View>
  );
}

function WorkspaceHeaderBlock() {
  const c = useThemeColors();
  const badgeColor = getStripAccentColor(c, c.amber);
  return (
    <View style={s.headerBlock}>
      <View style={s.headerMetaRow}>
        <Text style={[s.eyebrow, { color: c.green }]}>BRAINWORKER WORKSPACE</Text>
        <View style={[s.sampleBadge, { backgroundColor: c.strip, borderColor: c.divider }]}>
          <Text style={[s.sampleBadgeText, { color: badgeColor }]}>SAMPLE PREVIEW</Text>
        </View>
      </View>
      <Text accessibilityRole="header" style={[s.screenTitle, { color: c.mainText }]}>
        BrainWorker workspace preview
      </Text>
      <Text style={[s.screenSubtitle, { color: c.mutedText }]}>
        Explore sample leads and alert details.
      </Text>
    </View>
  );
}

function SampleLeadAlertHeader({ alert }: { alert: SampleLeadAlert }) {
  const c = useThemeColors();
  return (
    <View style={s.alertHeaderRow}>
      <View style={s.alertTagRow}>
        <Ionicons name="notifications-outline" size={16} color={c.amber} accessible={false} />
        <Text style={[s.alertTagText, { color: c.amber }]}>{alert.alertTag}</Text>
      </View>
      <Text style={[s.alertUrgencyText, { color: c.mutedText }]}>{alert.sampleUrgency}</Text>
    </View>
  );
}

function SampleLeadAlertButton({ onSelect }: { onSelect: () => void }) {
  const c = useThemeColors();
  const fgColor = c.mode === 'dark' ? c.canvas : c.card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="View sample details for lead alert"
      onPress={onSelect}
      style={({ pressed }) => [
        s.viewDetailsBtn,
        { backgroundColor: pressed ? c.amberHover : c.amber },
      ]}
    >
      <Text style={[s.viewDetailsBtnText, { color: fgColor }]}>View sample details</Text>
      <Ionicons name="arrow-forward" size={16} color={fgColor} accessible={false} />
    </Pressable>
  );
}

function SampleLeadAlertBanner({ onSelect }: { onSelect: () => void }) {
  const c = useThemeColors();
  const alert = SAMPLE_LEAD_ALERT;
  return (
    <View style={[s.alertBanner, { backgroundColor: c.card, borderColor: c.amber }]}>
      <SampleLeadAlertHeader alert={alert} />
      <Text accessibilityRole="header" style={[s.alertTitle, { color: c.mainText }]}>
        {alert.serviceTitle}
      </Text>
      <Text style={[s.alertZone, { color: c.mutedText }]}>{alert.neighborhood}</Text>
      <Text numberOfLines={2} style={[s.alertSummary, { color: c.mutedText }]}>
        {alert.problemSummary}
      </Text>
      <SampleLeadAlertButton onSelect={onSelect} />
    </View>
  );
}

function SampleLeadFeedList({ onSelectLead }: { onSelectLead: (id: string) => void }) {
  const c = useThemeColors();
  return (
    <View style={s.feedSection}>
      <View style={s.sectionHeaderRow}>
        <Text accessibilityRole="header" style={[s.sectionTitle, { color: c.mainText }]}>
          Sample Leads
        </Text>
        <Text style={[s.sectionCount, { color: c.mutedText }]}>
          {SAMPLE_WORKER_LEADS.length} sample fixtures
        </Text>
      </View>
      {SAMPLE_WORKER_LEADS.map((lead) => (
        <SampleLeadCard key={lead.id} lead={lead} onSelect={() => onSelectLead(lead.id)} />
      ))}
    </View>
  );
}

function LeadCardHeader({ lead }: { lead: WorkerSampleLead }) {
  const c = useThemeColors();
  return (
    <View style={s.leadCardHeader}>
      <Text style={[s.leadCategory, { color: c.green }]}>{lead.category.toUpperCase()}</Text>
      <Text style={[s.leadUrgency, { color: c.mutedText }]}>{lead.sampleUrgency}</Text>
    </View>
  );
}

function LeadCardFooter({ lead }: { lead: WorkerSampleLead }) {
  const c = useThemeColors();
  return (
    <View style={[s.leadFooterStacked, { borderTopColor: c.divider }]}>
      <View style={s.footerField}>
        <Text style={[s.footerLabel, { color: c.mutedText }]}>SAMPLE BUDGET</Text>
        <Text style={[s.leadBudget, { color: c.mainText }]}>{lead.sampleBudget}</Text>
      </View>
      <View style={s.footerField}>
        <Text style={[s.footerLabel, { color: c.mutedText }]}>TIMEFRAME</Text>
        <Text style={[s.leadTimeframe, { color: c.mutedText }]}>{lead.sampleTimeframe}</Text>
      </View>
    </View>
  );
}

function LeadCardBody({ lead }: { lead: WorkerSampleLead }) {
  const c = useThemeColors();
  return (
    <>
      <Text accessibilityRole="header" style={[s.leadTitle, { color: c.mainText }]}>
        {lead.serviceTitle}
      </Text>
      <Text style={[s.leadZone, { color: c.amber }]}>{lead.neighborhood}</Text>
      <Text numberOfLines={2} style={[s.leadSummary, { color: c.mutedText }]}>
        {lead.problemSummary}
      </Text>
    </>
  );
}

function SampleLeadCard({
  lead,
  onSelect,
}: {
  lead: WorkerSampleLead;
  onSelect: () => void;
}) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View sample details for ${lead.serviceTitle}`}
      onPress={onSelect}
      style={({ pressed }) => [
        s.leadCard,
        { backgroundColor: pressed ? c.cardHover : c.card, borderColor: c.mutedText },
      ]}
    >
      <LeadCardHeader lead={lead} />
      <LeadCardBody lead={lead} />
      <LeadCardFooter lead={lead} />
    </Pressable>
  );
}

function DetailBackBtn({ onBack }: { onBack: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back to lead feed"
      onPress={onBack}
      style={({ pressed }) => [s.detailBackBtn, { opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name="arrow-back" size={18} color={c.amber} accessible={false} />
      <Text style={[s.detailBackBtnText, { color: c.amber }]}>Back to Lead Feed</Text>
    </Pressable>
  );
}

function DetailHeaderInfo({ lead }: { lead: WorkerSampleLead }) {
  const c = useThemeColors();
  return (
    <>
      <Text style={[s.detailCategory, { color: c.green }]}>{lead.category.toUpperCase()}</Text>
      <Text accessibilityRole="header" style={[s.detailTitle, { color: c.mainText }]}>
        {lead.serviceTitle}
      </Text>
      <Text style={[s.detailZone, { color: c.amber }]}>{lead.neighborhood}</Text>
      <Text style={[s.detailLandmark, { color: c.mutedText }]}>Landmark: {lead.landmark}</Text>
    </>
  );
}

function DetailProblemSection({ problemDetail }: { problemDetail: string }) {
  const c = useThemeColors();
  return (
    <View style={[s.detailSection, { borderTopColor: c.divider }]}>
      <Text style={[s.detailSectionLabel, { color: c.mutedText }]}>PROBLEM DESCRIPTION</Text>
      <Text style={[s.detailProblemText, { color: c.mainText }]}>{problemDetail}</Text>
    </View>
  );
}

function DetailNoticeBlock({ c }: { c: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={[s.detailNotice, { backgroundColor: c.strip, borderColor: c.divider }]}>
      <Text
        accessibilityRole="text"
        accessibilityLabel={WORKER_WORKSPACE_DISCLAIMER}
        style={[s.detailNoticeText, { color: getStripTextColor(c, c.mutedText) }]}
      >
        {WORKER_WORKSPACE_DISCLAIMER}
      </Text>
    </View>
  );
}

function SampleLeadDetailView({
  lead,
  onBack,
}: {
  lead: WorkerSampleLead;
  onBack: () => void;
}) {
  const c = useThemeColors();
  return (
    <View style={[s.detailCard, { backgroundColor: c.card, borderColor: c.divider }]}>
      <DetailBackBtn onBack={onBack} />
      <DetailHeaderInfo lead={lead} />
      <DetailProblemSection problemDetail={lead.problemDetail} />
      <DetailMetaGrid lead={lead} />
      <DetailNoticeBlock c={c} />
    </View>
  );
}

function DetailMetaGrid({ lead }: { lead: WorkerSampleLead }) {
  const c = useThemeColors();
  return (
    <View style={[s.metaGrid, { borderTopColor: c.divider, borderBottomColor: c.divider }]}>
      <View style={s.metaItem}>
        <Text style={[s.metaLabel, { color: c.mutedText }]}>TIMEFRAME</Text>
        <Text style={[s.metaValue, { color: c.mainText }]}>{lead.sampleTimeframe}</Text>
      </View>
      <View style={s.metaItem}>
        <Text style={[s.metaLabel, { color: c.mutedText }]}>SAMPLE BUDGET</Text>
        <Text style={[s.metaValue, { color: c.mainText }]}>{lead.sampleBudget}</Text>
      </View>
      <View style={s.metaItem}>
        <Text style={[s.metaLabel, { color: c.mutedText }]}>PRICING MODE</Text>
        <Text style={[s.metaValue, { color: c.mainText }]}>{lead.pricingMode}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingBottom: 40 },
  navBar: {
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
    justifyContent: 'center',
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 48,
    minWidth: 48,
  },
  navBackText: { fontSize: 15, fontWeight: '600' },
  disclaimerCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  disclaimerIcon: { marginTop: 2 },
  disclaimerText: { fontSize: 12, lineHeight: 17, flex: 1 },
  headerBlock: { gap: 6 },
  headerMetaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontFamily: mono, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  sampleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  sampleBadgeText: { fontFamily: mono, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  screenTitle: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  screenSubtitle: { fontSize: 14, lineHeight: 20 },
  alertBanner: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 16,
    gap: 8,
  },
  alertHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  alertTagText: { fontFamily: mono, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  alertUrgencyText: { fontFamily: mono, fontSize: 11 },
  alertTitle: { fontSize: 18, fontWeight: '700' },
  alertZone: { fontSize: 13, fontWeight: '600' },
  alertSummary: { fontSize: 13, lineHeight: 18 },
  viewDetailsBtn: {
    minHeight: 48,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  viewDetailsBtnText: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  feedSection: { gap: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionCount: { fontSize: 12 },
  leadCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 6,
    minHeight: 48,
  },
  leadCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leadCategory: { fontFamily: mono, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  leadUrgency: { fontFamily: mono, fontSize: 10 },
  leadTitle: { fontSize: 16, fontWeight: '700' },
  leadZone: { fontSize: 13, fontWeight: '600' },
  leadSummary: { fontSize: 13, lineHeight: 18 },
  leadFooterStacked: {
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    marginTop: 4,
  },
  footerField: { gap: 2 },
  footerLabel: { fontFamily: mono, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  leadBudget: { fontSize: 13, fontWeight: '700' },
  leadTimeframe: { fontSize: 12 },
  detailCard: { borderRadius: 8, borderWidth: 1, padding: 16, gap: 10 },
  detailBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 48,
    minWidth: 48,
    alignSelf: 'flex-start',
  },
  detailBackBtnText: { fontSize: 14, fontWeight: '600' },
  detailCategory: { fontFamily: mono, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  detailTitle: { fontSize: 20, fontWeight: '800' },
  detailZone: { fontSize: 14, fontWeight: '600' },
  detailLandmark: { fontSize: 13 },
  detailSection: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 4 },
  detailSectionLabel: { fontFamily: mono, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  detailProblemText: { fontSize: 14, lineHeight: 20 },
  metaGrid: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    gap: 8,
  },
  metaItem: { gap: 2 },
  metaLabel: { fontFamily: mono, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  metaValue: { fontSize: 13 },
  detailNotice: { borderRadius: 6, borderWidth: 1, padding: 10 },
  detailNoticeText: { fontSize: 11, lineHeight: 16 },
});
