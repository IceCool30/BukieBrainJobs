import React, { type ReactNode, type RefObject } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getStripAccentColor, getStripTextColor, mono, useThemeColors, type MobileThemeTokens } from '../lib/theme';

export type ChoiceOption = {
  value: string;
  label: string;
};

type FormScreenProps = {
  children: ReactNode;
  scrollRef?: RefObject<ScrollView>;
};

export function FormScreen({ children, scrollRef }: FormScreenProps) {
  const c = useThemeColors();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: c.canvas }]} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormHeaderProps = {
  title: string;
  eyebrow?: string;
  onBack: () => void;
  backLabel?: string;
};

type FormBackButtonProps = {
  label: string;
  onPress: () => void;
  c: MobileThemeTokens;
};

function FormBackButton({ label, onPress, c }: FormBackButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.backButton,
        {
          backgroundColor: pressed && c.mode === 'dark' ? c.cardHover : c.strip,
          borderColor: c.divider,
        },
      ]}
    >
      <Ionicons name="arrow-back" size={20} color={getStripTextColor(c, c.mainText)} />
    </Pressable>
  );
}

export function FormHeader({ title, eyebrow, onBack, backLabel = 'Go back' }: FormHeaderProps) {
  const c = useThemeColors();
  return (
    <View style={styles.header}>
      <FormBackButton label={backLabel} onPress={onBack} c={c} />
      <View style={styles.headerText}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: c.amber }]}>{eyebrow}</Text>
        ) : null}
        <Text accessibilityRole="header" style={[styles.headerTitle, { color: c.mainText }]}>
          {title}
        </Text>
      </View>
    </View>
  );
}

export function PreviewNotice({
  title = 'LOCAL PREVIEW',
  body,
}: {
  title?: string;
  body: string;
}) {
  const c = useThemeColors();
  return (
    <View style={[styles.notice, { backgroundColor: c.strip, borderColor: c.divider }]}>
      <View style={styles.noticeHeader}>
        <Ionicons name="information-circle-outline" size={16} color={getStripAccentColor(c, c.amber)} />
        <Text style={[styles.noticeTitle, { color: getStripAccentColor(c, c.amber) }]}>{title}</Text>
      </View>
      <Text style={[styles.noticeBody, { color: c.stripText }]}>{body}</Text>
    </View>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string | undefined;
  helper?: string | undefined;
  placeholder?: string;
  required?: boolean;
  multiline?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  accessibilityLabel?: string;
  testID?: string;
  focusRef?: RefObject<TextInput>;
};

type FieldLabelProps = Pick<FieldProps, 'label' | 'required'> & { colors: MobileThemeTokens };

function FieldLabel({ label, required = false, colors }: FieldLabelProps) {
  return (
    <Text style={[styles.label, { color: colors.mainText }]}>
      {label}
      {required ? <Text style={{ color: colors.amber }}> (required)</Text> : null}
    </Text>
  );
}

type FieldFeedbackProps = Pick<FieldProps, 'error' | 'helper'> & { colors: MobileThemeTokens };

function FieldFeedback({ error, helper, colors }: FieldFeedbackProps) {
  if (error) return <Text accessibilityLiveRegion="polite" style={[styles.errorText, { color: colors.danger }]}>{error}</Text>;
  if (!helper) return null;
  return <Text style={[styles.helperText, { color: colors.mutedText }]}>{helper}</Text>;
}

type FieldInputProps = {
  field: FieldProps;
  colors: MobileThemeTokens;
};

function getFieldInputStyle(colors: MobileThemeTokens, multiline: boolean | undefined, error: string | undefined) {
  return [
    styles.input,
    multiline && styles.multilineInput,
    {
      backgroundColor: colors.card,
      borderColor: error ? colors.danger : colors.divider,
      color: colors.mainText,
    },
  ];
}

function FieldInput({ field, colors }: FieldInputProps) {
  const accessibilityLabel = `${field.accessibilityLabel ?? field.label}${field.required ? ', required' : ''}`;
  return (
    <TextInput
      ref={field.focusRef}
      testID={field.testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={field.error ?? field.helper}
      value={field.value}
      onChangeText={field.onChangeText}
      placeholder={field.placeholder}
      placeholderTextColor={colors.mutedText}
      multiline={field.multiline}
      maxLength={field.maxLength}
      keyboardType={field.keyboardType}
      autoCapitalize={field.autoCapitalize ?? 'sentences'}
      autoCorrect={false}
      style={getFieldInputStyle(colors, field.multiline, field.error)}
    />
  );
}

export function Field(props: FieldProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.field}>
      <FieldLabel label={props.label} required={props.required} colors={colors} />
      <FieldInput field={props} colors={colors} />
      <FieldFeedback error={props.error} helper={props.helper} colors={colors} />
    </View>
  );
}

type ChoiceChipsProps = {
  label: string;
  options: readonly ChoiceOption[];
  selected: string;
  onSelect: (value: string) => void;
  wrap?: boolean;
  focusRef?: RefObject<View>;
};

type ChoiceChipProps = {
  option: ChoiceOption;
  selected: string;
  onSelect: (value: string) => void;
  focusRef?: RefObject<View>;
  colors: MobileThemeTokens;
};

function ChoiceChip({ option, selected, onSelect, focusRef, colors }: ChoiceChipProps) {
  const active = selected === option.value;
  return (
    <Pressable
      ref={focusRef}
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ selected: active }}
      onPress={() => onSelect(option.value)}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.amber : colors.card,
          borderColor: active ? colors.amber : colors.divider,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? colors.canvas : colors.mainText }]}>
        {option.label}
      </Text>
    </Pressable>
  );
}

export function ChoiceChips({ label, options, selected, onSelect, wrap = false, focusRef }: ChoiceChipsProps) {
  const colors = useThemeColors();
  return (
    <View style={styles.field} accessibilityLabel={label}>
      <Text style={[styles.label, { color: colors.mainText }]}>{label}</Text>
      <View style={[styles.chipRow, wrap && styles.chipWrap]}>
        {options.map((option, index) => (
          <ChoiceChip key={option.value} option={option} selected={selected} onSelect={onSelect}
            focusRef={index === 0 ? focusRef : undefined} colors={colors} />
        ))}
      </View>
    </View>
  );
}

export function ErrorSummary({ errors }: { errors: Record<string, string> }) {
  const c = useThemeColors();
  const messages = Object.values(errors).filter(Boolean);
  if (messages.length === 0) {
    return null;
  }
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityLabel="Form errors"
      style={[styles.errorSummary, { backgroundColor: c.card, borderColor: c.danger }]}
    >
      <Text style={[styles.errorSummaryTitle, { color: c.danger }]}>
        Check the highlighted fields
      </Text>
      {messages.map((message) => (
        <Text key={message} style={[styles.errorSummaryItem, { color: c.mainText }]}>
          {message}
        </Text>
      ))}
    </View>
  );
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
};

export function PrimaryButton({ label, onPress, disabled = false, accessibilityLabel }: ButtonProps) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        {
          backgroundColor: disabled ? c.rule : pressed ? c.amberHover : c.amber,
          opacity: disabled ? 0.7 : 1,
        },
      ]}
    >
      <Text style={[styles.primaryButtonText, { color: c.canvas }]}>{label}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, disabled = false, accessibilityLabel }: ButtonProps) {
  const c = useThemeColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        {
          backgroundColor: pressed ? c.cardHover : 'transparent',
          borderColor: c.divider,
        },
      ]}
    >
      <Text style={[styles.secondaryButtonText, { color: c.mainText }]}>{label}</Text>
    </Pressable>
  );
}

type SummaryRowProps = {
  label: string;
  value: string;
  onEdit?: () => void;
  editLabel?: string;
};

type SummaryEditButtonProps = Pick<SummaryRowProps, 'label' | 'editLabel' | 'onEdit'> & { color: string };

function SummaryEditButton({ label, editLabel, onEdit, color }: SummaryEditButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={editLabel ?? `Edit ${label}`}
      onPress={onEdit}
      style={styles.editButton}
    >
      <Text style={[styles.editButtonText, { color }]}>Edit</Text>
    </Pressable>
  );
}

export function SummaryRow({ label, value, onEdit, editLabel }: SummaryRowProps) {
  const colors = useThemeColors();
  return (
    <View style={[styles.summaryRow, { borderTopColor: colors.divider }]}>
      <View style={styles.summaryText}>
        <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>{label}</Text>
        <Text style={[styles.summaryValue, { color: colors.mainText }]}>{value}</Text>
      </View>
      {onEdit ? <SummaryEditButton label={label} editLabel={editLabel} onEdit={onEdit} color={colors.amber} /> : null}
    </View>
  );
}

export function FormCard({ children }: { children: ReactNode }) {
  const c = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.divider }]}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  const c = useThemeColors();
  return <Text style={[styles.sectionTitle, { color: c.mainText }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: 18, paddingBottom: 40, gap: 18 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: mono,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  notice: {
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  noticeHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  noticeTitle: {
    fontFamily: mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  noticeBody: { fontSize: 12, lineHeight: 18 },
  field: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600' },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: { minHeight: 128, textAlignVertical: 'top' },
  errorText: { fontSize: 12, lineHeight: 18 },
  helperText: { fontSize: 12, lineHeight: 18 },
  chipRow: { flexDirection: 'row', gap: 8 },
  chipWrap: { flexWrap: 'wrap' },
  chip: {
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 0,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  errorSummary: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  errorSummaryTitle: { fontSize: 13, fontWeight: '700' },
  errorSummaryItem: { fontSize: 13, lineHeight: 19 },
  primaryButton: {
    minHeight: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    fontFamily: mono,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '600' },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  summaryText: { flex: 1, gap: 3 },
  summaryLabel: { fontSize: 12, fontWeight: '600' },
  summaryValue: { fontSize: 14, lineHeight: 20 },
  editButton: {
    minHeight: 48,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  editButtonText: { fontSize: 14, fontWeight: '700' },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
});
