import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
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
  BW003_DECLINE_REASONS,
  getDeclineReasonLabel,
  getSampleLeadById,
  CHECKIN_SIMULATION_DISCLAIMER,
  CHECKIN_SAMPLE_JOB,
  type WorkerSampleLead,
  type SampleLeadAlert,
  type DeclineReasonCode,
  type PreviewOutcome,
} from '../../lib/worker-workspace-preview';

function useEscapeDismiss(visible: boolean, onDismiss: () => void) {
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onDismiss();
      };
      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    }
  }, [visible, onDismiss]);
}

function useModalStates() {
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<DeclineReasonCode | null>(null);
  return {
    acceptModalVisible,
    setAcceptModalVisible,
    declineModalVisible,
    setDeclineModalVisible,
    selectedReason,
    setSelectedReason,
  };
}

function useCheckInSimulationState() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [isArrivalSimulated, setIsArrivalSimulated] = useState(false);
  const resetArrival = () => setIsArrivalSimulated(false);
  const resetCheckIn = () => {
    setShowCheckIn(false);
    setIsArrivalSimulated(false);
  };
  return { showCheckIn, setShowCheckIn, isArrivalSimulated, setIsArrivalSimulated, resetArrival, resetCheckIn };
}

function useWorkspacePreviewState() {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [previewOutcome, setPreviewOutcome] = useState<PreviewOutcome | null>(null);
  const modals = useModalStates();
  const checkIn = useCheckInSimulationState();

  const resetAll = () => {
    setSelectedLeadId(null);
    setPreviewOutcome(null);
    checkIn.resetCheckIn();
    modals.setAcceptModalVisible(false);
    modals.setDeclineModalVisible(false);
    modals.setSelectedReason(null);
  };

  return { selectedLeadId, setSelectedLeadId, previewOutcome, setPreviewOutcome, resetAll, ...modals, ...checkIn };
}

function useAcceptDeclineHandlers(state: ReturnType<typeof useWorkspacePreviewState>) {
  const onConfirmAccept = () => {
    state.setAcceptModalVisible(false);
    state.setPreviewOutcome({
      type: 'ACCEPTED',
      message: 'This was a local in-memory preview demonstration. No response was transmitted to any server and no active booking was created.',
    });
  };

  const onConfirmDecline = () => {
    if (!state.selectedReason) return;
    state.setDeclineModalVisible(false);
    state.setPreviewOutcome({
      type: 'DECLINED',
      reasonCode: state.selectedReason,
      reasonLabel: getDeclineReasonLabel(state.selectedReason),
      message: 'This was a local in-memory preview demonstration. No response was transmitted to any server.',
    });
    state.setSelectedReason(null);
  };

  return { onConfirmAccept, onConfirmDecline };
}

function WorkspaceFeedView({
  onSelectAlert,
  onSelectLead,
}: {
  onSelectAlert: () => void;
  onSelectLead: (id: string) => void;
}) {
  return (
    <>
      <WorkspaceHeaderBlock />
      <SampleLeadAlertBanner onSelect={onSelectAlert} />
      <SampleLeadFeedList onSelectLead={onSelectLead} />
    </>
  );
}

type MainBodyProps = {
  selectedLead: WorkerSampleLead | null;
  onBack: () => void;
  state: ReturnType<typeof useWorkspacePreviewState>;
};

function useDetailCallbacks(state: ReturnType<typeof useWorkspacePreviewState>) {
  return {
    onResetOutcome: () => {
      state.setPreviewOutcome(null);
      state.resetCheckIn();
    },
    onOpenAccept: () => state.setAcceptModalVisible(true),
    onOpenDecline: () => state.setDeclineModalVisible(true),
    onOpenCheckIn: () => state.setShowCheckIn(true),
    onSimulateArrival: () => state.setIsArrivalSimulated(true),
  };
}

function DetailViewWithState({
  lead,
  onBack,
  state,
}: {
  lead: WorkerSampleLead;
  onBack: () => void;
  state: ReturnType<typeof useWorkspacePreviewState>;
}) {
  const cbs = useDetailCallbacks(state);
  return (
    <SampleLeadDetailView
      lead={lead}
      onBack={onBack}
      previewOutcome={state.previewOutcome}
      showCheckIn={state.showCheckIn}
      isArrivalSimulated={state.isArrivalSimulated}
      onResetArrival={state.resetArrival}
      {...cbs}
    />
  );
}

function WorkspaceMainBody({ selectedLead, onBack, state }: MainBodyProps) {
  if (!selectedLead) {
    return (
      <WorkspaceFeedView
        onSelectAlert={() => state.setSelectedLeadId(SAMPLE_LEAD_ALERT.id)}
        onSelectLead={(id) => state.setSelectedLeadId(id)}
      />
    );
  }
  return <DetailViewWithState lead={selectedLead} onBack={onBack} state={state} />;
}

type WorkspaceModalsProps = {
  state: ReturnType<typeof useWorkspacePreviewState>;
  onConfirmAccept: () => void;
  onConfirmDecline: () => void;
};

function WorkspaceModals({ state, onConfirmAccept, onConfirmDecline }: WorkspaceModalsProps) {
  const onCancelDecline = () => {
    state.setDeclineModalVisible(false);
    state.setSelectedReason(null);
  };
  return (
    <>
      <AcceptConfirmationModal
        visible={state.acceptModalVisible}
        onCancel={() => state.setAcceptModalVisible(false)}
        onConfirm={onConfirmAccept}
      />
      <DeclineModal
        visible={state.declineModalVisible}
        selectedReason={state.selectedReason}
        onSelectReason={(code) => state.setSelectedReason(code)}
        onCancel={onCancelDecline}
        onConfirm={onConfirmDecline}
      />
    </>
  );
}

export default function MobileBrainWorkerWorkspacePreviewScreen() {
  const router = useRouter();
  const c = useThemeColors();
  const state = useWorkspacePreviewState();
  const { onConfirmAccept, onConfirmDecline } = useAcceptDeclineHandlers(state);
  const lead = state.selectedLeadId ? getSampleLeadById(state.selectedLeadId) ?? null : null;

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: c.canvas }]} edges={['top', 'left', 'right', 'bottom']}>
      <WorkspaceTopNav onBack={() => router.back()} />
      <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <WorkspaceDisclaimerBanner />
        <WorkspaceMainBody selectedLead={lead} onBack={state.resetAll} state={state} />
      </ScrollView>
      <WorkspaceModals state={state} onConfirmAccept={onConfirmAccept} onConfirmDecline={onConfirmDecline} />
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
        <View style={[s.priceBadge, { backgroundColor: c.cardHover, borderColor: c.mutedText }]}>
          <Text style={[s.priceBadgeText, { color: c.mainText }]}>{lead.sampleBudget}</Text>
        </View>
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

type LeadDetailProps = {
  lead: WorkerSampleLead;
  onBack: () => void;
  previewOutcome: PreviewOutcome | null;
  onResetOutcome: () => void;
  onOpenAccept: () => void;
  onOpenDecline: () => void;
  showCheckIn: boolean;
  onOpenCheckIn: () => void;
  isArrivalSimulated: boolean;
  onSimulateArrival: () => void;
  onResetArrival: () => void;
};

type LeadDetailActionsProps = {
  isAlert: boolean;
  outcome: PreviewOutcome | null;
  onReset: () => void;
  onAccept: () => void;
  onDecline: () => void;
  showCheckIn: boolean;
  onOpenCheckIn: () => void;
  isArrivalSimulated: boolean;
  onSimulateArrival: () => void;
  onResetArrival: () => void;
};

function LeadDetailActions(props: LeadDetailActionsProps) {
  if (!props.isAlert) return null;
  const isAccepted = props.outcome?.type === 'ACCEPTED';
  return (
    <>
      <InvitationActionSection
        outcome={props.outcome}
        onReset={props.onReset}
        onAccept={props.onAccept}
        onDecline={props.onDecline}
        onOpenCheckIn={props.onOpenCheckIn}
      />
      {isAccepted && props.showCheckIn ? (
        <CheckInSimulationSection
          isArrivalSimulated={props.isArrivalSimulated}
          onSimulateArrival={props.onSimulateArrival}
          onResetArrival={props.onResetArrival}
        />
      ) : null}
    </>
  );
}

function SampleLeadDetailView(props: LeadDetailProps) {
  const { lead, onBack, previewOutcome, onResetOutcome, onOpenAccept, onOpenDecline, ...checkInProps } = props;
  const c = useThemeColors();
  const isAlert = lead.id === SAMPLE_LEAD_ALERT.id;
  return (
    <View style={[s.detailCard, { backgroundColor: c.card, borderColor: c.divider }]}>
      <DetailBackBtn onBack={onBack} />
      <DetailHeaderInfo lead={lead} />
      <DetailProblemSection problemDetail={lead.problemDetail} />
      <DetailMetaGrid lead={lead} />
      <LeadDetailActions
        isAlert={isAlert}
        outcome={previewOutcome}
        onReset={onResetOutcome}
        onAccept={onOpenAccept}
        onDecline={onOpenDecline}
        {...checkInProps}
      />
      <DetailNoticeBlock c={c} />
    </View>
  );
}

function InvitationActionSection({
  outcome,
  onReset,
  onAccept,
  onDecline,
  onOpenCheckIn,
}: {
  outcome: PreviewOutcome | null;
  onReset: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onOpenCheckIn: () => void;
}) {
  if (outcome) {
    return <InvitationOutcomeCard outcome={outcome} onReset={onReset} onOpenCheckIn={onOpenCheckIn} />;
  }
  return <InvitationActionCard onAccept={onAccept} onDecline={onDecline} />;
}

function InvitationActionCardHeader() {
  const c = useThemeColors();
  const tagColor = getStripAccentColor(c, c.amber);
  const eyebrowColor = c.mode === 'light' ? c.amberHover : c.amber;
  return (
    <View style={s.actionHeaderRow}>
      <Text style={[s.actionEyebrow, { color: eyebrowColor }]}>SAMPLE INVITATION ACTIONS</Text>
      <View style={[s.localPreviewTag, { backgroundColor: c.strip, borderColor: c.divider }]}>
        <Text style={[s.localPreviewTagText, { color: tagColor }]}>LOCAL PREVIEW</Text>
      </View>
    </View>
  );
}

function InvitationActionCard({
  onAccept,
  onDecline,
}: {
  onAccept: () => void;
  onDecline: () => void;
}) {
  const c = useThemeColors();
  return (
    <View style={[s.actionCard, { backgroundColor: c.canvas, borderColor: c.amber }]}>
      <InvitationActionCardHeader />
      <Text style={[s.actionDescription, { color: c.mutedText }]}>
        Preview how direct lead invitations are handled. Actions taken here are simulated locally; no server response or booking is created.
      </Text>
      <View style={s.actionBtnCol}>
        <AcceptButton onAccept={onAccept} />
        <DeclineButton onDecline={onDecline} />
      </View>
    </View>
  );
}

function AcceptButton({ onAccept }: { onAccept: () => void }) {
  const c = useThemeColors();
  const bg = c.mode === 'light' ? c.amberHover : c.amber;
  const fg = c.mode === 'dark' ? c.canvas : c.card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Accept sample lead"
      onPress={onAccept}
      style={({ pressed }) => [s.actionBtn, { backgroundColor: pressed ? c.amberHover : bg }]}
    >
      <Ionicons name="checkmark-circle-outline" size={18} color={fg} accessible={false} />
      <Text style={[s.actionBtnText, { color: fg }]}>Accept sample lead</Text>
    </Pressable>
  );
}

function DeclineButton({ onDecline }: { onDecline: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Decline sample lead"
      onPress={onDecline}
      style={({ pressed }) => [
        s.actionBtnOutline,
        { borderColor: c.mutedText, backgroundColor: pressed ? c.cardHover : 'transparent' },
      ]}
    >
      <Ionicons name="close-circle-outline" size={18} color={c.mainText} accessible={false} />
      <Text style={[s.actionBtnText, { color: c.mainText }]}>Decline sample lead</Text>
    </Pressable>
  );
}

type InvitationOutcomeCardProps = {
  outcome: PreviewOutcome;
  onReset: () => void;
  onOpenCheckIn?: () => void;
};

function InvitationOutcomeCard({ outcome, onReset, onOpenCheckIn }: InvitationOutcomeCardProps) {
  const c = useThemeColors();
  const isAccepted = outcome.type === 'ACCEPTED';
  const amberCol = c.mode === 'light' ? c.amberHover : c.amber;
  return (
    <View style={[s.outcomeCard, { backgroundColor: c.canvas, borderColor: isAccepted ? c.green : c.amber }]}>
      <Text accessibilityRole="header" style={[s.outcomeTitle, { color: isAccepted ? c.green : amberCol }]}>
        {isAccepted ? 'Sample Lead Accepted (Preview)' : 'Sample Lead Declined (Preview)'}
      </Text>
      {!isAccepted && <Text style={[s.outcomeReason, { color: c.mainText }]}>Reason: {outcome.reasonLabel}</Text>}
      <Text style={[s.outcomeDesc, { color: c.mutedText }]}>{outcome.message}</Text>
      {isAccepted && onOpenCheckIn && <CheckInEntryButton onPress={onOpenCheckIn} />}
      <ResetOutcomeButton onReset={onReset} />
    </View>
  );
}

function CheckInEntryButton({ onPress }: { onPress: () => void }) {
  const c = useThemeColors();
  const bg = c.mode === 'light' ? c.amberHover : c.amber;
  const fg = c.mode === 'dark' ? c.canvas : c.card;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Simulate on-site check-in for sample generator repair"
      onPress={onPress}
      style={({ pressed }) => [s.checkInEntryBtn, { backgroundColor: pressed ? c.amberHover : bg }]}
    >
      <Ionicons name="location-outline" size={18} color={fg} accessible={false} />
      <Text style={[s.checkInEntryBtnText, { color: fg }]}>Preview on-site check-in</Text>
    </Pressable>
  );
}

function CheckInDisclaimer() {
  const c = useThemeColors();
  return (
    <View style={[s.checkInNoticeBox, { backgroundColor: c.strip, borderColor: c.divider }]}>
      <Ionicons name="information-circle-outline" size={16} color={getStripAccentColor(c, c.amber)} accessible={false} />
      <Text
        accessibilityRole="alert"
        accessibilityLabel={CHECKIN_SIMULATION_DISCLAIMER}
        style={[s.checkInNoticeText, { color: getStripTextColor(c, c.mutedText) }]}
      >
        {CHECKIN_SIMULATION_DISCLAIMER}
      </Text>
    </View>
  );
}

function CheckInHeaderBlock() {
  const c = useThemeColors();
  const tagColor = getStripAccentColor(c, c.amber);
  return (
    <View style={s.checkInHeaderRow}>
      <Text style={[s.checkInEyebrow, { color: c.green }]}>SAMPLE LOCATION SIMULATION</Text>
      <View style={[s.localPreviewTag, { backgroundColor: c.strip, borderColor: c.divider }]}>
        <Text style={[s.localPreviewTagText, { color: tagColor }]}>LOCAL PREVIEW ONLY</Text>
      </View>
    </View>
  );
}

function CheckInJobInfoCard() {
  const c = useThemeColors();
  const job = CHECKIN_SAMPLE_JOB;
  const statusTag = job.bookingStatusTag || 'CONFIRMED (Sample)';
  return (
    <View style={[s.jobInfoCard, { backgroundColor: c.card, borderColor: c.divider }]}>
      <View style={s.jobInfoStatusRow}>
        <Text accessibilityRole="header" style={[s.jobInfoTitle, { color: c.mainText }]}>
          {job.serviceTitle}
        </Text>
        <View style={[s.confirmedTag, { backgroundColor: c.strip, borderColor: c.divider }]}>
          <Text style={[s.confirmedTagText, { color: getStripAccentColor(c, c.amber) }]}>{statusTag}</Text>
        </View>
      </View>
      <Text style={[s.jobInfoLocation, { color: c.amber }]}>{job.locationArea}</Text>
      <Text style={[s.jobInfoLandmark, { color: c.mutedText }]}>Landmark: {job.landmark}</Text>
      <Text style={[s.jobInfoSubtext, { color: c.mutedText }]}>{job.explanatorySubtext}</Text>
    </View>
  );
}

function CheckInSchematicCard() {
  const c = useThemeColors();
  return (
    <View style={[s.schematicCard, { backgroundColor: c.card, borderColor: c.mutedText }]}>
      <View style={s.schematicHeaderRow}>
        <Ionicons name="location-outline" size={20} color={c.amber} accessible={false} />
        <Text style={[s.schematicTitle, { color: c.mainText }]}>Simulated Site Location</Text>
      </View>
      <Text style={[s.schematicStatus, { color: c.mutedText }]}>Arrival Snapshot: Not simulated</Text>
    </View>
  );
}

function CheckInActionButton({ onSimulate }: { onSimulate: () => void }) {
  const c = useThemeColors();
  const bg = c.mode === 'light' ? c.amberHover : c.amber;
  const fg = c.mode === 'dark' ? c.canvas : c.card;
  return (
    <View style={s.actionTriggerCol}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Simulate on-site check-in for sample generator repair"
        onPress={onSimulate}
        style={({ pressed }) => [s.actionBtn, { backgroundColor: pressed ? c.amberHover : bg }]}
      >
        <Ionicons name="navigate-outline" size={18} color={fg} accessible={false} />
        <Text style={[s.actionBtnText, { color: fg }]}>Simulate on-site check-in</Text>
      </Pressable>
      <Text style={[s.actionSubtext, { color: c.mutedText }]}>
        Tapping directly sets the temporary in-memory arrival preview view without opening a separate confirmation modal.
      </Text>
    </View>
  );
}

function CheckInState1View({ onSimulate }: { onSimulate: () => void }) {
  return (
    <View style={s.stateBlock}>
      <CheckInHeaderBlock />
      <CheckInJobInfoCard />
      <CheckInSchematicCard />
      <CheckInActionButton onSimulate={onSimulate} />
    </View>
  );
}

function CheckInSimulatedHeader() {
  const c = useThemeColors();
  return (
    <View style={s.simulatedHeaderCol}>
      <Text style={[s.checkInEyebrow, { color: c.green }]}>SAMPLE CHECK-IN SIMULATED</Text>
      <Text accessibilityRole="header" style={[s.simulatedTitle, { color: c.mainText }]}>
        On-Site Arrival Simulated (Preview)
      </Text>
    </View>
  );
}

function CheckInSimulatedStatusCard() {
  const c = useThemeColors();
  const job = CHECKIN_SAMPLE_JOB;
  return (
    <View style={[s.simulatedCard, { backgroundColor: c.card, borderColor: c.green }]}>
      <View style={[s.statusBadge, { backgroundColor: c.strip, borderColor: getStripAccentColor(c, c.green) }]}>
        <Ionicons name="checkmark-circle-outline" size={16} color={getStripAccentColor(c, c.green)} accessible={false} />
        <Text style={[s.statusBadgeText, { color: getStripAccentColor(c, c.green) }]}>SIMULATED ARRIVAL (Preview)</Text>
      </View>
      <Text style={[s.stampText, { color: c.mainText }]}>Arrival view previewed in memory</Text>
      <Text style={[s.timingText, { color: c.mutedText }]}>Timing: Current preview session only</Text>
      <Text style={[s.explanationText, { color: c.mutedText }]}>{job.simulationExplanation}</Text>
      <Text style={[s.boundaryNotice, { color: c.amber }]}>{job.presentationBoundaryNotice}</Text>
    </View>
  );
}

function CheckInResetButton({ onReset }: { onReset: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Reset location simulation"
      onPress={onReset}
      style={({ pressed }) => [s.resetBtn, { borderColor: c.mutedText, opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name="refresh-outline" size={16} color={c.mainText} accessible={false} />
      <Text style={[s.resetBtnText, { color: c.mainText }]}>Reset location simulation</Text>
    </Pressable>
  );
}

function CheckInState2View({ onReset }: { onReset: () => void }) {
  return (
    <View style={s.stateBlock}>
      <CheckInSimulatedHeader />
      <CheckInSimulatedStatusCard />
      <CheckInResetButton onReset={onReset} />
    </View>
  );
}

function CheckInSimulationSection({
  isArrivalSimulated,
  onSimulateArrival,
  onResetArrival,
}: {
  isArrivalSimulated: boolean;
  onSimulateArrival: () => void;
  onResetArrival: () => void;
}) {
  const c = useThemeColors();
  return (
    <View style={[s.checkInContainer, { backgroundColor: c.canvas, borderColor: c.amber }]}>
      <CheckInDisclaimer />
      {isArrivalSimulated ? (
        <CheckInState2View onReset={onResetArrival} />
      ) : (
        <CheckInState1View onSimulate={onSimulateArrival} />
      )}
    </View>
  );
}

function ResetOutcomeButton({ onReset }: { onReset: () => void }) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Reset preview outcome"
      onPress={onReset}
      style={({ pressed }) => [s.resetBtn, { borderColor: c.mutedText, opacity: pressed ? 0.7 : 1 }]}
    >
      <Ionicons name="refresh-outline" size={16} color={c.mainText} accessible={false} />
      <Text style={[s.resetBtnText, { color: c.mainText }]}>Reset preview outcome</Text>
    </Pressable>
  );
}

type AcceptModalProps = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function AcceptModalContent({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const c = useThemeColors();
  return (
    <>
      <Text accessibilityRole="header" style={[s.modalTitle, { color: c.mainText }]}>
        Accept Sample Lead?
      </Text>
      <Text style={[s.modalBody, { color: c.mutedText }]}>
        This is an interface preview only. Confirming will show how an accepted state appears locally. No real customer booking will be created and no provider commitment is made. No response will be sent or saved.
      </Text>
      <AcceptModalActions onCancel={onCancel} onConfirm={onConfirm} />
    </>
  );
}

function AcceptConfirmationModal({ visible, onCancel, onConfirm }: AcceptModalProps) {
  const c = useThemeColors();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  useEscapeDismiss(visible, onCancel);
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={[s.modalOverlay, isLandscape ? s.overlayCenter : s.overlayBottom]}>
        <View
          testID="accept-modal-card"
          style={[
            s.modalCard,
            isLandscape ? s.cardLandscape : s.cardPortrait,
            { backgroundColor: c.card, borderColor: c.mutedText },
          ]}
        >
          {!isLandscape && <View style={[s.sheetHandle, { backgroundColor: c.mutedText }]} />}
          <AcceptModalContent onCancel={onCancel} onConfirm={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}

function AcceptModalActions({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  const c = useThemeColors();
  const confirmBg = c.mode === 'light' ? c.amberHover : c.amber;
  const confirmFg = c.mode === 'dark' ? c.canvas : c.card;
  return (
    <View style={s.modalActionsRow}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel acceptance preview"
        onPress={onCancel}
        style={({ pressed }) => [s.modalCancelBtn, { borderColor: c.mutedText, opacity: pressed ? 0.7 : 1 }]}
      >
        <Text style={[s.modalActionBtnText, { color: c.mainText }]}>Cancel</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Confirm sample acceptance"
        onPress={onConfirm}
        style={({ pressed }) => [s.modalConfirmBtn, { backgroundColor: pressed ? c.amberHover : confirmBg }]}
      >
        <Text style={[s.modalActionBtnText, { color: confirmFg }]}>Confirm sample acceptance</Text>
      </Pressable>
    </View>
  );
}

type DeclineModalProps = {
  visible: boolean;
  selectedReason: DeclineReasonCode | null;
  onSelectReason: (code: DeclineReasonCode) => void;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeclineModal({ visible, selectedReason, onSelectReason, onCancel, onConfirm }: DeclineModalProps) {
  const c = useThemeColors();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  useEscapeDismiss(visible, onCancel);
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <View style={[s.modalOverlay, isLandscape ? s.overlayCenter : s.overlayBottom]}>
        <View
          testID="decline-modal-card"
          style={[
            s.modalCard,
            isLandscape ? s.cardLandscape : s.cardPortrait,
            { backgroundColor: c.card, borderColor: c.mutedText },
          ]}
        >
          {!isLandscape && <View style={[s.sheetHandle, { backgroundColor: c.mutedText }]} />}
          <DeclineModalHeader />
          <DeclineReasonList selectedReason={selectedReason} onSelectReason={onSelectReason} />
          <DeclineModalActions selectedReason={selectedReason} onCancel={onCancel} onConfirm={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}

function DeclineModalHeader() {
  const c = useThemeColors();
  return (
    <View style={s.declineHeaderGap}>
      <Text accessibilityRole="header" style={[s.modalTitle, { color: c.mainText }]}>
        Decline Sample Lead
      </Text>
      <Text style={[s.modalSubtitle, { color: c.mutedText }]}>
        Select a reason to preview the decline flow. No response will be submitted.
      </Text>
    </View>
  );
}

type DeclineReasonListProps = {
  selectedReason: DeclineReasonCode | null;
  onSelectReason: (code: DeclineReasonCode) => void;
};

function DeclineReasonList({ selectedReason, onSelectReason }: DeclineReasonListProps) {
  return (
    <ScrollView style={s.reasonListScroll}>
      {BW003_DECLINE_REASONS.map((reason) => (
        <DeclineReasonOption
          key={reason.code}
          code={reason.code}
          label={reason.label}
          isSelected={selectedReason === reason.code}
          onSelect={() => onSelectReason(reason.code)}
        />
      ))}
    </ScrollView>
  );
}

function DeclineRadioBullet({ isSelected, border, bulletBg }: { isSelected: boolean; border: string; bulletBg: string }) {
  return (
    <View style={[s.radioCircle, { borderColor: border }]}>
      {isSelected && <View style={[s.radioInner, { backgroundColor: bulletBg }]} />}
    </View>
  );
}

type DeclineReasonOptionProps = {
  code: DeclineReasonCode;
  label: string;
  isSelected: boolean;
  onSelect: () => void;
};

function DeclineReasonOption({ label, isSelected, onSelect }: DeclineReasonOptionProps) {
  const c = useThemeColors();
  const accent = c.mode === 'light' ? c.amberHover : c.amber;
  const border = isSelected ? accent : c.mutedText;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={label}
      onPress={onSelect}
      style={({ pressed }) => [
        s.reasonOptionRow,
        { borderColor: border, backgroundColor: pressed ? c.cardHover : 'transparent' },
      ]}
    >
      <DeclineRadioBullet isSelected={isSelected} border={border} bulletBg={accent} />
      <Text style={[s.reasonOptionText, { color: c.mainText }]}>{label}</Text>
    </Pressable>
  );
}

function DeclineCancelBtn({ onCancel, c }: { onCancel: () => void; c: ReturnType<typeof useThemeColors> }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cancel decline preview"
      onPress={onCancel}
      style={({ pressed }) => [s.modalCancelBtn, { borderColor: c.mutedText, opacity: pressed ? 0.7 : 1 }]}
    >
      <Text style={[s.modalActionBtnText, { color: c.mainText }]}>Cancel</Text>
    </Pressable>
  );
}

type DeclineActionsProps = {
  selectedReason: DeclineReasonCode | null;
  onCancel: () => void;
  onConfirm: () => void;
};

type DeclineConfirmBtnProps = {
  isDisabled: boolean;
  onConfirm: () => void;
  confirmBg: string;
  confirmFg: string;
  c: ReturnType<typeof useThemeColors>;
};

function DeclineConfirmBtn({ isDisabled, onConfirm, confirmBg, confirmFg, c }: DeclineConfirmBtnProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Confirm sample decline"
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onConfirm}
      style={({ pressed }) => [
        s.modalConfirmBtn,
        {
          backgroundColor: pressed && !isDisabled ? c.amberHover : confirmBg,
          borderColor: isDisabled ? c.mutedText : 'transparent',
          borderWidth: isDisabled ? 1 : 0,
        },
      ]}
    >
      <Text style={[s.modalActionBtnText, { color: confirmFg }]}>Confirm sample decline</Text>
    </Pressable>
  );
}

function DeclineModalActions({ selectedReason, onCancel, onConfirm }: DeclineActionsProps) {
  const c = useThemeColors();
  const isDisabled = selectedReason === null;
  const confirmBg = isDisabled ? c.cardHover : (c.mode === 'light' ? c.amberHover : c.amber);
  const confirmFg = isDisabled ? c.mutedText : (c.mode === 'dark' ? c.canvas : c.card);
  return (
    <View style={s.modalActionsRow}>
      <DeclineCancelBtn onCancel={onCancel} c={c} />
      <DeclineConfirmBtn isDisabled={isDisabled} onConfirm={onConfirm} confirmBg={confirmBg} confirmFg={confirmFg} c={c} />
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
        <View style={[s.priceBadge, { backgroundColor: c.cardHover, borderColor: c.mutedText }]}>
          <Text style={[s.priceBadgeText, { color: c.mainText }]}>{lead.sampleBudget}</Text>
        </View>
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
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 6,
    minHeight: 48,
  },
  priceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 2,
  },
  priceBadgeText: {
    fontFamily: mono,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
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
  actionCard: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 14,
    gap: 10,
    marginTop: 4,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionEyebrow: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  localPreviewTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  localPreviewTagText: {
    fontFamily: mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  actionDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  actionBtnCol: {
    gap: 8,
  },
  actionBtn: {
    minHeight: 48,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  actionBtnOutline: {
    minHeight: 48,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  outcomeCard: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 14,
    gap: 8,
    marginTop: 4,
  },
  outcomeTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  outcomeReason: {
    fontSize: 13,
    fontWeight: '600',
  },
  outcomeDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  resetBtn: {
    minHeight: 48,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  resetBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayBottom: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 0,
  },
  overlayCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 6,
    opacity: 0.6,
  },
  modalCard: {
    width: '100%',
    padding: 16,
    gap: 10,
  },
  cardPortrait: {
    maxWidth: 480,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    paddingBottom: 28,
  },
  cardLandscape: {
    maxWidth: 520,
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: 340,
    padding: 14,
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  modalBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmBtn: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalActionBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  declineHeaderGap: {
    gap: 4,
  },
  reasonListScroll: {
    maxHeight: 160,
  },
  reasonOptionRow: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasonOptionText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  checkInEntryBtn: {
    minHeight: 48,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  checkInEntryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  checkInContainer: {
    borderRadius: 8,
    borderWidth: 1.5,
    padding: 14,
    gap: 12,
    marginTop: 10,
  },
  checkInNoticeBox: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 10,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  checkInNoticeText: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  stateBlock: {
    gap: 10,
  },
  checkInHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInEyebrow: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  jobInfoCard: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  jobInfoStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  jobInfoTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmedTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  confirmedTagText: {
    fontFamily: mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  jobInfoLocation: {
    fontSize: 13,
    fontWeight: '600',
  },
  jobInfoLandmark: {
    fontSize: 12,
  },
  jobInfoSubtext: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  schematicCard: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  schematicHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  schematicTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  schematicStatus: {
    fontSize: 12,
  },
  actionTriggerCol: {
    gap: 6,
  },
  actionSubtext: {
    fontSize: 11,
    lineHeight: 16,
  },
  simulatedHeaderCol: {
    gap: 4,
  },
  simulatedTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  simulatedCard: {
    borderRadius: 6,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  stampText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timingText: {
    fontSize: 12,
  },
  explanationText: {
    fontSize: 12,
    lineHeight: 17,
  },
  boundaryNotice: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  },
});
