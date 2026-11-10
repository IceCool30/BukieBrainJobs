import React, { useEffect, useRef, useState, type RefObject } from 'react';
import {
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableInstance,
  type TextInputInstance,
  type ViewInstance,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ACTIVE_MARKETPLACE_CITIES } from '@bukiebrainjobs/validation';
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
  type MobileServiceCategory,
} from '../lib/services';
import {
  ARRIVAL_WINDOWS,
  PAYMENT_PREFERENCES,
  createEmptyBookingDraft,
  normalizeServiceId,
  submitBookingPreparationRequest,
  validateBookingPreparation,
  type BookingPreparationDraft,
  type BookingPreparationErrors,
} from '../lib/booking-preparation';
import { getBookingDateShortcut } from '../lib/local-preview';
import { focusFirstInvalidBookingControl } from '../lib/booking-focus';

const CITY_OPTIONS: ChoiceOption[] = ACTIVE_MARKETPLACE_CITIES
  .filter((city) => city !== 'abuja (fct)' && city !== 'benin')
  .map((city) => {
    const label = city.replace(/\b\w/g, (letter) => letter.toUpperCase());
    return { value: label, label };
  });

const DATE_SHORTCUTS = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'weekend', label: 'Weekend' },
] as const;

type DraftField = keyof BookingPreparationDraft;
type BookingController = ReturnType<typeof useBookingController>;
type BookingHeading = ViewInstance;
type BookingFocusRefs = {
  serviceId: RefObject<PressableInstance | null>;
  city: RefObject<PressableInstance | null>;
  streetAddress: RefObject<TextInputInstance | null>;
  date: RefObject<TextInputInstance | null>;
  arrivalWindow: RefObject<PressableInstance | null>;
  jobDescription: RefObject<TextInputInstance | null>;
  paymentPreference: RefObject<PressableInstance | null>;
};

const ARRIVAL_OPTIONS = ARRIVAL_WINDOWS.map((value) => ({ value, label: value }));
const PAYMENT_OPTIONS = PAYMENT_PREFERENCES.map((value) => ({ value, label: value }));

function useBookingFocusRefs(): BookingFocusRefs {
  return {
    serviceId: useRef<PressableInstance>(null),
    city: useRef<PressableInstance>(null),
    streetAddress: useRef<TextInputInstance>(null),
    date: useRef<TextInputInstance>(null),
    arrivalWindow: useRef<PressableInstance>(null),
    jobDescription: useRef<TextInputInstance>(null),
    paymentPreference: useRef<PressableInstance>(null),
  };
}

function focusNativeElement(target: ViewInstance | TextInputInstance | PressableInstance | null) {
  if (!target || Platform.OS === 'web') return;
  const node = findNodeHandle(target);
  if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
}

function focusInvalidBookingControl(
  errors: BookingPreparationErrors,
  focusRefs: BookingFocusRefs,
) {
  return focusFirstInvalidBookingControl(errors, focusRefs, (ref) => focusNativeElement(ref.current));
}

function InlineError({ message }: { message?: string }) {
  const c = useThemeColors();
  if (!message) return null;
  return <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: c.danger }]}>{message}</Text>;
}

function ServiceChoice({ service, active, onSelect, focusRef }: {
  service: MobileServiceCategory;
  active: boolean;
  onSelect: () => void;
  focusRef?: RefObject<PressableInstance | null>;
}) {
  const c = useThemeColors();
  return (
    <Pressable ref={focusRef} accessibilityRole="button" accessibilityLabel={service.title}
      accessibilityState={{ selected: active }} onPress={onSelect}
      style={({ pressed }) => [styles.serviceChoice, {
        backgroundColor: active ? c.cardHover : pressed ? c.cardHover : c.card,
        borderColor: active ? c.ctaFill : pressed ? c.rule : c.divider,
        borderWidth: active ? 1.5 : 1,
        opacity: pressed ? 0.9 : 1,
      }]}>
      <Text style={[styles.serviceTitle, { color: active ? (c.mode === 'light' ? c.amber : c.ctaFill) : c.mainText }]}>{service.title}</Text>
    </Pressable>
  );
}

function ServiceSection({ selectedId, onSelect, error, focusRef }: {
  selectedId: string;
  onSelect: (serviceId: string) => void;
  error?: string;
  focusRef: RefObject<PressableInstance | null>;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle>Service</SectionTitle>
      <View style={styles.serviceList}>{CANONICAL_SERVICES.map((service, index) => (
        <ServiceChoice key={service.id} service={service} active={selectedId === service.id}
          onSelect={() => onSelect(service.id)} focusRef={index === 0 ? focusRef : undefined} />
      ))}</View>
      <InlineError message={error} />
    </View>
  );
}

function CityField({ city, onChange, error, focusRef }: {
  city: string;
  onChange: (value: string) => void;
  error?: string;
  focusRef: RefObject<PressableInstance | null>;
}) {
  return (
    <View style={styles.section}>
      <ChoiceChips label="City" options={CITY_OPTIONS} selected={city} onSelect={onChange} wrap focusRef={focusRef} />
      <InlineError message={error} />
    </View>
  );
}

function AddressFields({ draft, update, errors, focusRef }: {
  draft: BookingPreparationDraft;
  update: (field: DraftField, value: string) => void;
  errors: Record<string, string>;
  focusRef: RefObject<TextInputInstance | null>;
}) {
  return (
    <View style={styles.section}>
      <Field label="Street address" value={draft.streetAddress}
        onChangeText={(value) => update('streetAddress', value)} error={errors.streetAddress}
        placeholder="Enter the service address" required focusRef={focusRef} />
      <Field label="Landmark" value={draft.landmark}
        onChangeText={(value) => update('landmark', value)}
        helper="Optional. Add a nearby landmark or estate gate." />
    </View>
  );
}

function LocationSection({ draft, update, errors, cityRef, streetAddressRef }: {
  draft: BookingPreparationDraft;
  update: (field: DraftField, value: string) => void;
  errors: Record<string, string>;
  cityRef: RefObject<PressableInstance | null>;
  streetAddressRef: RefObject<TextInputInstance | null>;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle>Where do you need the service?</SectionTitle>
      <CityField city={draft.city} onChange={(value) => update('city', value)} error={errors.city} focusRef={cityRef} />
      <AddressFields draft={draft} update={update} errors={errors} focusRef={streetAddressRef} />
    </View>
  );
}

function DateField({ value, onChange, error, focusRef }: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  focusRef: RefObject<TextInputInstance | null>;
}) {
  const selected = DATE_SHORTCUTS.find((choice) => getBookingDateShortcut(choice.value) === value)?.value ?? '';
  const choose = (choice: string) => {
    const shortcut = DATE_SHORTCUTS.find((item) => item.value === choice);
    if (shortcut) onChange(getBookingDateShortcut(shortcut.value));
  };
  return (
    <View style={styles.section}>
      <ChoiceChips label="Date shortcuts" options={DATE_SHORTCUTS} selected={selected} onSelect={choose} wrap />
      <Field label="Choose a date" value={value} onChangeText={onChange} error={error}
        helper="Enter a specific date as YYYY-MM-DD."
        keyboardType="numbers-and-punctuation" required focusRef={focusRef} />
    </View>
  );
}

function ArrivalField({ value, onChange, error, focusRef }: {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  focusRef: RefObject<PressableInstance | null>;
}) {
  return (
    <View style={styles.section}>
      <ChoiceChips label="Preferred arrival window" options={ARRIVAL_OPTIONS}
        selected={value} onSelect={onChange} wrap focusRef={focusRef} />
      <InlineError message={error} />
    </View>
  );
}

function ScheduleSection({ draft, update, errors, dateRef, arrivalRef }: {
  draft: BookingPreparationDraft;
  update: (field: DraftField, value: string) => void;
  errors: Record<string, string>;
  dateRef: RefObject<TextInputInstance | null>;
  arrivalRef: RefObject<PressableInstance | null>;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle>Preferred schedule</SectionTitle>
      <DateField value={draft.preferredDate} onChange={(value) => update('preferredDate', value)} error={errors.date} focusRef={dateRef} />
      <ArrivalField value={draft.arrivalWindow} onChange={(value) => update('arrivalWindow', value)} error={errors.arrivalWindow} focusRef={arrivalRef} />
    </View>
  );
}

function DescriptionSection({ draft, update, error, focusRef }: {
  draft: BookingPreparationDraft;
  update: (field: DraftField, value: string) => void;
  error?: string;
  focusRef: RefObject<TextInputInstance | null>;
}) {
  return (
    <View style={styles.section}>
      <SectionTitle>Job details</SectionTitle>
      <Field label="Job description" value={draft.jobDescription}
        onChangeText={(value) => update('jobDescription', value)} error={error}
        placeholder="Describe the work you need done" multiline maxLength={1000} required focusRef={focusRef} />
    </View>
  );
}

function PaymentSection({ draft, update, error, focusRef }: {
  draft: BookingPreparationDraft;
  update: (field: DraftField, value: string) => void;
  error?: string;
  focusRef: RefObject<PressableInstance | null>;
}) {
  const c = useThemeColors();
  return (
    <View style={styles.section}>
      <SectionTitle>Payment preference</SectionTitle>
      <ChoiceChips label="Payment preference" options={PAYMENT_OPTIONS}
        selected={draft.paymentPreference} onSelect={(value) => update('paymentPreference', value)} wrap focusRef={focusRef} />
      <InlineError message={error} />
      <Text style={[styles.helperText, { color: c.mutedText }]}>No payment is taken here.</Text>
    </View>
  );
}

function BookingSummary({ draft }: { draft: BookingPreparationDraft }) {
  const service = getServiceById(draft.serviceId);
  return (
    <FormCard>
      <SectionTitle>Review your request</SectionTitle>
      <SummaryRow label="Service" value={service?.title ?? 'Choose a service'} />
      <SummaryRow label="City" value={draft.city || 'Choose a city'} />
      <SummaryRow label="Street address" value={draft.streetAddress || 'Add a street address'} />
      <SummaryRow label="Landmark" value={draft.landmark || 'Optional'} />
      <SummaryRow label="Preferred date" value={draft.preferredDate || 'Choose a date'} />
      <SummaryRow label="Arrival window" value={draft.arrivalWindow || 'Choose a window'} />
      <SummaryRow label="Job description" value={draft.jobDescription || 'Add job details'} />
      <SummaryRow label="Payment preference" value={draft.paymentPreference || 'Choose a preference'} />
    </FormCard>
  );
}

function SubmissionResult({ reference, onEdit, headingRef }: {
  reference: string | null;
  onEdit: () => void;
  headingRef: RefObject<BookingHeading | null>;
}) {
  const c = useThemeColors();
  if (!reference) return null;
  return (
    <FormCard>
      <View ref={headingRef} accessibilityRole="header" accessibilityLabel="Local preview ready"
        accessible focusable>
        <Text style={[styles.resultHeading, { color: c.mainText }]}>Local preview ready</Text>
      </View>
      <SummaryRow label="Preview reference" value={reference} />
      <Text style={[styles.resultText, { color: c.mutedText }]}>No booking was created. No BrainWorker was assigned. No payment was taken.</Text>
      <SecondaryButton label="Edit details" onPress={onEdit} />
    </FormCard>
  );
}

function useBookingDraft(initialServiceId: string) {
  const [draft, setDraft] = useState(() => createEmptyBookingDraft(initialServiceId));
  const [attempted, setAttempted] = useState(false);
  const errors = validateBookingPreparation(draft);
  const update = (field: DraftField, value: string) => setDraft((current) => ({ ...current, [field]: value }));
  return { draft, errors, visibleErrors: attempted ? errors : {}, update, markAttempted: () => setAttempted(true) };
}

function useMounted() {
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  return mounted;
}

function waitForPreview() {
  return new Promise<void>((resolve) => setTimeout(resolve, 200));
}

async function createPreview(draft: BookingPreparationDraft, mockError: boolean) {
  await waitForPreview();
  return submitBookingPreparationRequest(draft, { mockError });
}

function validatePreviewSubmission(
  draft: BookingPreparationDraft,
  markAttempted: () => void,
  onInvalid: (errors: BookingPreparationErrors) => void,
): boolean {
  markAttempted();
  const errors = validateBookingPreparation(draft);
  if (Object.keys(errors).length === 0) return true;
  onInvalid(errors);
  return false;
}

type PreviewResult = Awaited<ReturnType<typeof createPreview>>;

function applyPreviewResult(
  result: PreviewResult,
  isMounted: boolean,
  setPending: (pending: boolean) => void,
  setError: (error: string | null) => void,
  setReference: (reference: string | null) => void,
) {
  if (!isMounted) return;
  setPending(false);
  if (result.ok) setReference(result.reference);
  else setError(result.message);
}

function useLocalPreviewSubmission(
  draft: BookingPreparationDraft,
  mockError: boolean,
  markAttempted: () => void,
  onInvalid: (errors: BookingPreparationErrors) => void,
) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const running = useRef(false);
  const mounted = useMounted();
  const clear = () => { setError(null); setReference(null); };
  const submit = async () => {
    if (running.current || !validatePreviewSubmission(draft, markAttempted, onInvalid)) return;
    running.current = true;
    setPending(true);
    clear();
    const result = await createPreview(draft, mockError);
    running.current = false;
    applyPreviewResult(result, mounted.current, setPending, setError, setReference);
  };
  return { pending, error, reference, submit, clear };
}

function useBookingController(initialServiceId: string, mockError: boolean, focusRefs: BookingFocusRefs) {
  const form = useBookingDraft(initialServiceId);
  const submission = useLocalPreviewSubmission(
    form.draft,
    mockError,
    form.markAttempted,
    (errors) => focusInvalidBookingControl(errors, focusRefs),
  );
  const update = (field: DraftField, value: string) => {
    if (submission.pending) return;
    form.update(field, value);
    submission.clear();
  };
  return { form, submission, update, focusRefs };
}

function BookingSections({ controller }: { controller: BookingController }) {
  const { form, submission, update, focusRefs } = controller;
  return (
    <View pointerEvents={submission.pending ? 'none' : 'auto'}
      style={[styles.sections, submission.pending && styles.pendingSections]}>
      <ServiceSection selectedId={form.draft.serviceId} onSelect={(value) => update('serviceId', value)} error={form.visibleErrors.serviceId} focusRef={focusRefs.serviceId} />
      <LocationSection draft={form.draft} update={update} errors={form.visibleErrors}
        cityRef={focusRefs.city} streetAddressRef={focusRefs.streetAddress} />
      <ScheduleSection draft={form.draft} update={update} errors={form.visibleErrors}
        dateRef={focusRefs.date} arrivalRef={focusRefs.arrivalWindow} />
      <DescriptionSection draft={form.draft} update={update} error={form.visibleErrors.jobDescription}
        focusRef={focusRefs.jobDescription} />
      <PaymentSection draft={form.draft} update={update} error={form.visibleErrors.paymentPreference}
        focusRef={focusRefs.paymentPreference} />
      <BookingSummary draft={form.draft} />
    </View>
  );
}

function BookingHeader({ onBack }: { onBack: () => void }) {
  return (
    <>
      <FormHeader title="Prepare a booking request" backLabel="Back to services" onBack={onBack} />
      <PreviewNotice body="This form creates a local preview only. No payment is taken here." />
    </>
  );
}

function BookingActions({ controller, resultHeadingRef }: {
  controller: BookingController;
  resultHeadingRef: RefObject<BookingHeading | null>;
}) {
  const { form, submission } = controller;
  const label = submission.reference ? 'Preview ready'
    : submission.pending ? 'Preparing request...'
      : submission.error ? 'Try again' : 'Prepare booking request';
  return (
    <>
      <ErrorSummary errors={form.visibleErrors} />
      <InlineError message={submission.error ?? undefined} />
      <SubmissionResult reference={submission.reference} onEdit={submission.clear} headingRef={resultHeadingRef} />
      <PrimaryButton label={label} onPress={submission.submit}
        disabled={submission.pending || Boolean(submission.reference)} />
    </>
  );
}

function BookingForm({ controller, onBack, resultHeadingRef }: {
  controller: BookingController;
  onBack: () => void;
  resultHeadingRef: RefObject<BookingHeading | null>;
}) {
  return (
    <FormScreen>
      <BookingHeader onBack={onBack} />
      <BookingSections controller={controller} />
      <BookingActions controller={controller} resultHeadingRef={resultHeadingRef} />
    </FormScreen>
  );
}

export default function BookScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ serviceId?: string | string[]; mockError?: string | string[] }>();
  const focusRefs = useBookingFocusRefs();
  const resultHeadingRef = useRef<BookingHeading>(null);
  const controller = useBookingController(normalizeServiceId(params.serviceId), params.mockError === '1', focusRefs);
  useEffect(() => {
    if (!controller.submission.reference) return;
    const frame = requestAnimationFrame(() => focusNativeElement(resultHeadingRef.current));
    return () => cancelAnimationFrame(frame);
  }, [controller.submission.reference]);
  return <BookingForm controller={controller} resultHeadingRef={resultHeadingRef}
    onBack={() => router.replace('/(tabs)/services')} />;
}

const styles = StyleSheet.create({
  section: { gap: 10 },
  serviceList: { gap: 8 },
  serviceChoice: { minHeight: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, justifyContent: 'center' },
  serviceTitle: { fontSize: 14, fontWeight: '600' },
  sections: { gap: 18 },
  pendingSections: { opacity: 0.65 },
  errorText: { fontSize: 12, lineHeight: 18 },
  helperText: { fontSize: 12, lineHeight: 18 },
  resultHeading: { fontSize: 16, fontWeight: '700' },
  resultText: { fontSize: 13, lineHeight: 19, marginVertical: 8 },
});
