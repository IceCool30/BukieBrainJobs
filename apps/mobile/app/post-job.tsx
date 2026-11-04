import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChoiceChips,
  ErrorSummary,
  Field,
  FormCard,
  FormHeader,
  FormScreen,
  PreviewNotice,
  PrimaryButton,
  SecondaryButton,
  SectionTitle,
  SummaryRow,
  type ChoiceOption,
} from '../components/form-kit';
import { useThemeColors } from '../lib/theme';
import {
  CANONICAL_SERVICES,
  getServiceById,
} from '../lib/services';
import {
  ARRIVAL_WINDOW_OPTIONS,
  BUDGET_TYPE_OPTIONS,
  CANONICAL_CITIES,
  JOB_STEP_TITLES,
  JOB_STEPS,
  NOT_SURE_CATEGORY,
  PREFERRED_WORKERS,
  URGENCY_OPTIONS,
  createEmptyJobDraft,
  formatBudgetDisplay,
  getFirstInvalidStep,
  getNextStep,
  getPreferredWorkerName,
  getPreviousStep,
  getStepNumber,
  shouldSimulatePostJobFailure,
  submitJobPostingRequest,
  validateJobPosting,
  validateJobStep,
  type JobPostingDraft,
  type JobStep,
} from '../lib/job-posting';
import { todayDateString } from '../lib/local-preview';

const CITY_OPTIONS: ChoiceOption[] = CANONICAL_CITIES.map((city) => ({ value: city, label: city }));
const CATEGORY_OPTIONS: ChoiceOption[] = [
  ...CANONICAL_SERVICES.map((service) => ({ value: service.id, label: service.title })),
  { value: NOT_SURE_CATEGORY, label: "I'm not sure" },
];
const JOB_TYPE_OPTIONS: ChoiceOption[] = [
  { value: 'specific_service', label: 'A specific service' },
  { value: 'broader_project', label: 'A broader project' },
];
const URGENCY_CHOICE_OPTIONS: ChoiceOption[] = URGENCY_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));
const ARRIVAL_OPTIONS: ChoiceOption[] = ARRIVAL_WINDOW_OPTIONS.map((value) => ({ value, label: value }));
const BUDGET_TYPE_CHOICE_OPTIONS: ChoiceOption[] = BUDGET_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));
const WORKER_OPTIONS: ChoiceOption[] = PREFERRED_WORKERS.map((worker) => ({
  value: worker.id,
  label: worker.name,
}));

type FocusRefs = {
  jobType: React.RefObject<View>;
  categoryId: React.RefObject<View>;
  title: React.RefObject<TextInput>;
  description: React.RefObject<TextInput>;
  city: React.RefObject<View>;
  streetAddress: React.RefObject<TextInput>;
  landmark: React.RefObject<TextInput>;
  urgency: React.RefObject<View>;
  preferredDate: React.RefObject<TextInput>;
  arrivalWindow: React.RefObject<View>;
  budget: React.RefObject<TextInput>;
  budgetType: React.RefObject<View>;
  preferredWorkerId: React.RefObject<View>;
  reviewHeading: React.RefObject<View>;
  resultHeading: React.RefObject<View>;
};
type StepProps = {
  draft: JobPostingDraft;
  visibleErrors: Record<string, string>;
  update: (key: keyof JobPostingDraft, value: JobPostingDraft[keyof JobPostingDraft]) => void;
  focusRefs: FocusRefs;
};

function JobRequirementStep({ draft, visibleErrors, update, focusRefs }: StepProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.section}>
      <ChoiceChips label="Job type" options={JOB_TYPE_OPTIONS} selected={draft.jobType} onSelect={(value) => update('jobType', value as JobPostingDraft['jobType'])} wrap focusRef={focusRefs.jobType} />
      {visibleErrors.jobType ? <Text style={[styles.error, { color: colors.danger }]}>{visibleErrors.jobType}</Text> : null}
      <ChoiceChips label="Service category" options={CATEGORY_OPTIONS} selected={draft.categoryId} onSelect={(value) => update('categoryId', draft.categoryId === value ? '' : value)} wrap focusRef={focusRefs.categoryId} />
      {visibleErrors.categoryId ? <Text style={[styles.error, { color: colors.danger }]}>{visibleErrors.categoryId}</Text> : null}
      <Field label="Job title" value={draft.title} onChangeText={(value) => update('title', value)} error={visibleErrors.title} required maxLength={100} focusRef={focusRefs.title} />
      <Field label="Description" value={draft.description} onChangeText={(value) => update('description', value)} error={visibleErrors.description} required multiline maxLength={1000} focusRef={focusRefs.description} />
    </View>
  );
}

function LocationStep({ draft, visibleErrors, update, focusRefs }: StepProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.section}>
      <ChoiceChips label="City" options={CITY_OPTIONS} selected={draft.city} onSelect={(value) => update('city', value)} wrap focusRef={focusRefs.city} />
      {visibleErrors.city ? <Text style={[styles.error, { color: colors.danger }]}>{visibleErrors.city}</Text> : null}
      <Field label="Street address" value={draft.streetAddress} onChangeText={(value) => update('streetAddress', value)} error={visibleErrors.streetAddress} required focusRef={focusRefs.streetAddress} />
      <Field label="Landmark (optional)" value={draft.landmark} onChangeText={(value) => update('landmark', value)} error={visibleErrors.landmark} focusRef={focusRefs.landmark} />
    </View>
  );
}

function ScheduleStep({ draft, visibleErrors, update, focusRefs }: StepProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.section}>
      <ChoiceChips label="Timing preference" options={URGENCY_CHOICE_OPTIONS} selected={draft.urgency} onSelect={(value) => update('urgency', value as JobPostingDraft['urgency'])} wrap focusRef={focusRefs.urgency} />
      {visibleErrors.urgency ? <Text style={[styles.error, { color: colors.danger }]}>{visibleErrors.urgency}</Text> : null}
      {draft.urgency === 'specific_date' ? (
        <Field label="Preferred date (YYYY-MM-DD)" value={draft.preferredDate} onChangeText={(value) => update('preferredDate', value)} error={visibleErrors.preferredDate} required placeholder={todayDateString()} focusRef={focusRefs.preferredDate} />
      ) : null}
      <ChoiceChips label="Arrival window (optional)" options={ARRIVAL_OPTIONS} selected={draft.arrivalWindow} onSelect={(value) => update('arrivalWindow', draft.arrivalWindow === value ? '' : value)} wrap focusRef={focusRefs.arrivalWindow} />
      {visibleErrors.arrivalWindow ? <Text style={[styles.error, { color: colors.danger }]}>{visibleErrors.arrivalWindow}</Text> : null}
    </View>
  );
}

function BudgetStep({ draft, visibleErrors, update, focusRefs }: StepProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.section}>
      <Field label="Budget (optional)" value={draft.budget} onChangeText={(value) => update('budget', value)} error={visibleErrors.budget} helper={draft.budget.trim() !== '' ? formatBudgetDisplay(draft.budget, draft.budgetType) : undefined} keyboardType="decimal-pad" focusRef={focusRefs.budget} />
      {draft.budget.trim() !== '' ? (
        <ChoiceChips label="Budget type" options={BUDGET_TYPE_CHOICE_OPTIONS} selected={draft.budgetType} onSelect={(value) => update('budgetType', value as JobPostingDraft['budgetType'])} wrap focusRef={focusRefs.budgetType} />
      ) : null}
      {visibleErrors.budgetType ? <Text style={[styles.error, { color: colors.danger }]}>{visibleErrors.budgetType}</Text> : null}
      <ChoiceChips label="Preferred BrainWorker (optional)" options={WORKER_OPTIONS} selected={draft.preferredWorkerId} onSelect={(value) => update('preferredWorkerId', draft.preferredWorkerId === value ? '' : value)} wrap focusRef={focusRefs.preferredWorkerId} />
      {visibleErrors.preferredWorkerId ? <Text style={[styles.error, { color: colors.danger }]}>{visibleErrors.preferredWorkerId}</Text> : null}
    </View>
  );
}
function PostJobView() {
  const params = useLocalSearchParams<{ mockError?: string | string[] }>();
  const initialSimulateFailure = shouldSimulatePostJobFailure(__DEV__, params.mockError);
  const state = usePostJobState(initialSimulateFailure);
  const focusRefs = usePostJobFocusRefs();
  usePostJobEffects(state, focusRefs);
  const service = getServiceById(state.draft.categoryId);
  return <PostJobForm state={state} focusRefs={focusRefs} service={service} />;
}

type PostJobState = {
  step: JobStep;
  setStep: (value: JobStep) => void;
  draft: JobPostingDraft;
  setDraft: React.Dispatch<React.SetStateAction<JobPostingDraft>>;
  visibleErrors: Record<string, string>;
  setVisibleErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  pending: boolean;
  setPending: (value: boolean) => void;
  result: { reference: string; categoryTitle: string } | null;
  setResult: (value: { reference: string; categoryTitle: string } | null) => void;
  submitError: string | null;
  setSubmitError: (value: string | null) => void;
  pendingFocusKey: keyof FocusRefs | null;
  setPendingFocusKey: (value: keyof FocusRefs | null) => void;
  pendingRef: React.MutableRefObject<boolean>;
  simulateFailure: boolean;
  setSimulateFailure: (value: boolean) => void;
};

function usePostJobState(initialSimulateFailure: boolean): PostJobState {
  const [step, setStep] = useState<JobStep>('job_requirement');
  const [draft, setDraft] = useState<JobPostingDraft>(() => createEmptyJobDraft());
  const [visibleErrors, setVisibleErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ reference: string; categoryTitle: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingFocusKey, setPendingFocusKey] = useState<keyof FocusRefs | null>(null);
  const pendingRef = useRef(false);
  const [simulateFailure, setSimulateFailure] = useState(initialSimulateFailure);
  return {
    step, setStep, draft, setDraft, visibleErrors, setVisibleErrors,
    pending, setPending, result, setResult, submitError, setSubmitError,
    pendingFocusKey, setPendingFocusKey, pendingRef, simulateFailure, setSimulateFailure,
  };
}

function usePostJobFocusRefs(): FocusRefs {
  return useRef<FocusRefs>({
    jobType: React.createRef<View>(),
    categoryId: React.createRef<View>(),
    title: React.createRef<TextInput>(),
    description: React.createRef<TextInput>(),
    city: React.createRef<View>(),
    streetAddress: React.createRef<TextInput>(),
    landmark: React.createRef<TextInput>(),
    urgency: React.createRef<View>(),
    preferredDate: React.createRef<TextInput>(),
    arrivalWindow: React.createRef<View>(),
    budget: React.createRef<TextInput>(),
    budgetType: React.createRef<View>(),
    preferredWorkerId: React.createRef<View>(),
    reviewHeading: React.createRef<View>(),
    resultHeading: React.createRef<View>(),
  }).current;
}

function focusNativeElement(target: View | TextInput | null) {
  if (Platform.OS === 'web') {
    target?.focus?.();
    return;
  }
  if (!target) return;
  const node = findNodeHandle(target);
  if (node !== null) AccessibilityInfo.setAccessibilityFocus(node);
}

function usePostJobEffects(state: PostJobState, focusRefs: FocusRefs) {
  useEffect(() => {
    if (!state.pendingFocusKey) return;
    const ref = focusRefs[state.pendingFocusKey];
    const frame = requestAnimationFrame(() => {
      focusNativeElement(ref?.current ?? null);
      state.setPendingFocusKey(null);
    });
    return () => cancelAnimationFrame(frame);
  }, [state.pendingFocusKey, state.step]);
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(`Step ${getStepNumber(state.step)} of ${JOB_STEPS.length}: ${JOB_STEP_TITLES[state.step]}`);
  }, [state.step]);
  useEffect(() => {
    if (state.result) AccessibilityInfo.announceForAccessibility('Local request preview ready');
  }, [state.result]);
}

function getFirstInvalidFieldKey(errors: Record<string, string>): keyof FocusRefs | null {
  const order: (keyof FocusRefs)[] = ['jobType', 'categoryId', 'title', 'description', 'city', 'streetAddress', 'landmark', 'urgency', 'preferredDate', 'arrivalWindow', 'budget', 'budgetType', 'preferredWorkerId'];
  return order.find((item) => Boolean(errors[item])) ?? null;
}

function updatePostJobDraft(state: PostJobState, key: keyof JobPostingDraft, value: JobPostingDraft[keyof JobPostingDraft]) {
  state.setDraft((current) => ({ ...current, [key]: value }));
  state.setResult(null);
  state.setSubmitError(null);
  state.setVisibleErrors((current) => {
    const next = { ...current };
    delete next[key];
    return next;
  });
}

function validatePostJobCurrent(state: PostJobState, step: JobStep): boolean {
  const nextErrors = validateJobStep(step, state.draft);
  state.setVisibleErrors(nextErrors);
  if (Object.keys(nextErrors).length === 0) return true;
  state.setPendingFocusKey(getFirstInvalidFieldKey(nextErrors));
  return false;
}

function goNextPostJob(state: PostJobState) {
  if (!validatePostJobCurrent(state, state.step)) return;
  const next = getNextStep(state.step);
  if (!next) return;
  const fromStep = state.step;
  state.setStep(next);
  state.setVisibleErrors({});
  if (fromStep === 'job_requirement' && next === 'location') {
    state.setPendingFocusKey('city');
  }
  if (fromStep === 'location' && next === 'schedule') {
    state.setPendingFocusKey('urgency');
  }
  if (fromStep === 'schedule' && next === 'budget_preference') {
    state.setPendingFocusKey('budget');
  }
  if (fromStep === 'budget_preference' && next === 'review') {
    state.setPendingFocusKey('reviewHeading');
  }
}

const JOB_STEP_FOCUS_KEYS: Record<JobStep, keyof FocusRefs> = {
  job_requirement: 'jobType',
  location: 'city',
  schedule: 'urgency',
  budget_preference: 'budget',
  review: 'reviewHeading',
};

function goBackPostJob(state: PostJobState, router: ReturnType<typeof useRouter>) {
  const previous = getPreviousStep(state.step);
  if (previous) {
    state.setStep(previous);
    state.setVisibleErrors({});
    state.setPendingFocusKey(JOB_STEP_FOCUS_KEYS[previous]);
    return;
  }
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

function editStepPostJob(state: PostJobState, target: JobStep) {
  state.setStep(target);
  state.setVisibleErrors({});
  state.setPendingFocusKey(JOB_STEP_FOCUS_KEYS[target]);
}

async function submitPostJob(state: PostJobState, force = false) {
  if (state.pendingRef.current || (state.result && !force)) return;
  const allErrors = validateJobPosting(state.draft);
  state.setVisibleErrors(allErrors);
  if (Object.keys(allErrors).length > 0) {
    const first = getFirstInvalidStep(allErrors);
    state.setPendingFocusKey(getFirstInvalidFieldKey(allErrors));
    state.setStep(first);
    return;
  }
  const failureForThisSubmit = state.simulateFailure;
  state.pendingRef.current = true;
  state.setPending(true);
  state.setSubmitError(null);
  const outcome = submitJobPostingRequest(state.draft, { mockError: failureForThisSubmit });
  state.setPending(false);
  state.pendingRef.current = false;
  if (failureForThisSubmit) state.setSimulateFailure(false);
  if (!outcome.ok) {
    state.setSubmitError(outcome.message);
    return;
  }
  state.setResult({ reference: outcome.reference, categoryTitle: outcome.categoryTitle });
  state.setPendingFocusKey('resultHeading');
}

function retryPostJob(state: PostJobState) {
  state.setResult(null);
  state.setSubmitError(null);
  void submitPostJob(state, true);
}

function PostJobReviewSummary({ state, service }: { state: PostJobState; service: ReturnType<typeof getServiceById> }) {
  return (
    <FormCard>
      <SummaryRow label="Job type" value={state.draft.jobType === 'specific_service' ? 'A specific service' : 'A broader project'} />
      {state.draft.categoryId.trim() !== '' ? <SummaryRow label="Category" value={state.draft.categoryId === NOT_SURE_CATEGORY ? "I'm not sure" : (service?.title ?? 'General service request')} /> : null}
      <SummaryRow label="Title" value={state.draft.title.trim()} />
      <SummaryRow label="Description" value={state.draft.description.trim()} />
      <SummaryRow label="City" value={state.draft.city} />
      <SummaryRow label="Street address" value={state.draft.streetAddress.trim()} />
      {state.draft.landmark.trim() !== '' ? <SummaryRow label="Landmark" value={state.draft.landmark.trim()} /> : null}
      <SummaryRow label="Timing" value={URGENCY_OPTIONS.find((item) => item.value === state.draft.urgency)?.label ?? state.draft.urgency} />
      {state.draft.urgency === 'specific_date' && state.draft.preferredDate.trim() !== '' ? <SummaryRow label="Preferred date" value={state.draft.preferredDate.trim()} /> : null}
      {state.draft.arrivalWindow.trim() !== '' ? <SummaryRow label="Arrival window" value={state.draft.arrivalWindow} /> : null}
      {state.draft.budget.trim() !== '' ? <SummaryRow label="Budget" value={formatBudgetDisplay(state.draft.budget, state.draft.budgetType)} /> : null}
      {state.draft.preferredWorkerId.trim() !== '' ? <SummaryRow label="Preferred BrainWorker" value={getPreferredWorkerName(state.draft.preferredWorkerId)} /> : null}
    </FormCard>
  );
}

function PostJobReviewCommitment({ state }: { state: PostJobState }) {
  const c = useThemeColors();
  return (
    <>
      <PreviewNotice title="Mock-auth preview" body="This local preview does not sign you in, create an account, or send a request." />
      <ErrorSummary errors={state.visibleErrors} />
      {state.submitError ? <Text style={[styles.error, { color: c.danger }]}>{state.submitError}</Text> : null}
    </>
  );
}

function PostJobReviewResult({ state, resultHeadingRef }: { state: PostJobState; resultHeadingRef: React.RefObject<View> }) {
  const c = useThemeColors();
  if (!state.result) return null;
  return (
    <FormCard>
      <View ref={resultHeadingRef} accessible focusable accessibilityRole="header" accessibilityLabel="Local request preview">
        <Text style={[styles.resultHeading, { color: c.mainText }]}>Local request preview</Text>
      </View>
      <Text style={[styles.resultText, { color: c.mutedText }]}>No platform request was sent or stored.</Text>
      <Text style={[styles.resultText, { color: c.mainText }]}>Local preview reference: {state.result.reference}</Text>
      <Text style={[styles.resultText, { color: c.mutedText }]}>{state.draft.categoryId.trim() !== '' ? state.result.categoryTitle : null}</Text>
    </FormCard>
  );
}

function PostJobReviewActions({ state }: { state: PostJobState }) {
  return (
    <>
      <View style={styles.actions}>
        {JOB_STEPS.filter((item) => item !== 'review').map((item) => (
          <SecondaryButton key={item} label={`Edit ${JOB_STEP_TITLES[item]}`} onPress={() => editStepPostJob(state, item)} />
        ))}
      </View>
      <PrimaryButton label={state.pending ? 'Creating preview...' : state.result ? 'Preview ready' : 'Continue in local preview'} onPress={state.result ? () => {} : () => { void submitPostJob(state); }} disabled={state.pending || Boolean(state.result)} />
      {state.submitError ? <SecondaryButton label="Retry" onPress={() => retryPostJob(state)} disabled={state.pending} /> : null}
    </>
  );
}

function PostJobReview({ state, service, reviewHeadingRef, resultHeadingRef }: { state: PostJobState; service: ReturnType<typeof getServiceById>; reviewHeadingRef: React.RefObject<View>; resultHeadingRef: React.RefObject<View> }) {
  return (
    <View style={styles.section}>
      <View ref={reviewHeadingRef} accessible focusable accessibilityRole="header" accessibilityLabel="Review">
        <SectionTitle>Review</SectionTitle>
      </View>
      <PostJobReviewSummary state={state} service={service} />
      <PostJobReviewCommitment state={state} />
      <PostJobReviewResult state={state} resultHeadingRef={resultHeadingRef} />
      <PostJobReviewActions state={state} />
    </View>
  );
}

function PostJobForm({ state, focusRefs, service }: { state: PostJobState; focusRefs: FocusRefs; service: ReturnType<typeof getServiceById> }) {
  const router = useRouter();
  const update = (key: keyof JobPostingDraft, value: JobPostingDraft[keyof JobPostingDraft]) => updatePostJobDraft(state, key, value);
  return (
    <FormScreen>
      <FormHeader title={JOB_STEP_TITLES[state.step]} eyebrow={`Step ${getStepNumber(state.step)} of ${JOB_STEPS.length}`} onBack={() => goBackPostJob(state, router)} />
      {state.step === 'job_requirement' ? <JobRequirementStep draft={state.draft} visibleErrors={state.visibleErrors} update={update} focusRefs={focusRefs} /> : null}
      {state.step === 'location' ? <LocationStep draft={state.draft} visibleErrors={state.visibleErrors} update={update} focusRefs={focusRefs} /> : null}
      {state.step === 'schedule' ? <ScheduleStep draft={state.draft} visibleErrors={state.visibleErrors} update={update} focusRefs={focusRefs} /> : null}
      {state.step === 'budget_preference' ? <BudgetStep draft={state.draft} visibleErrors={state.visibleErrors} update={update} focusRefs={focusRefs} /> : null}
      {state.step === 'review' ? <PostJobReview state={state} service={service} reviewHeadingRef={focusRefs.reviewHeading} resultHeadingRef={focusRefs.resultHeading} /> : null}
      {state.step !== 'review' ? (
        <View style={styles.actions}>
          <PrimaryButton label="Continue" onPress={() => goNextPostJob(state)} disabled={state.pending} />
          {state.step !== 'job_requirement' ? <SecondaryButton label="Back" onPress={() => goBackPostJob(state, router)} /> : null}
        </View>
      ) : null}
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  actions: { gap: 10 },
  error: { fontSize: 12, lineHeight: 18 },
  resultHeading: { fontSize: 16, fontWeight: '700' },
  resultText: { fontSize: 13, lineHeight: 19 },
});
export default function PostJobScreen() {
  return <PostJobView />;
}
