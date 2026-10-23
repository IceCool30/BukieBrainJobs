import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { mono, useTrades } from '../../lib/theme';

type Form = { name: string; email: string; phone: string };
type Errors = Partial<Record<keyof Form, string>>;

function validate(form: Form): Errors {
  const errors: Errors = {};
  if (!form.name.trim()) errors.name = 'Enter your full name.';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Enter a valid email address.';
  if (!form.phone.trim()) errors.phone = 'Enter your phone number.';
  return errors;
}

export default function MobileBrainWorkerRegisterScreen() {
  const router = useRouter();
  const c = useTrades();
  const [form, setForm] = useState<Form>({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<Errors>({});
  const set = (key: keyof Form) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = () => {
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length) return;
    Alert.alert('Registration Received', `Welcome, ${form.name.trim()}! Your registration has been received.`, [
      { text: 'OK', onPress: () => router.replace('/') },
    ]);
  };

  return (
    <SafeAreaView style={[s.fill, { backgroundColor: c.bg }]}>
      <KeyboardAvoidingView style={s.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.page} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} hitSlop={8} style={s.back}>
            <Ionicons name="arrow-back" size={18} color={c.amber} />
            <Text style={[s.backLabel, { color: c.textMain }]}>Back</Text>
          </Pressable>
          <View style={[s.card, { backgroundColor: c.cardBg, borderColor: c.lead }]}>
            <Text style={[s.eyebrow, { color: c.brandGreen }]}>BRAINWORKER REGISTRATION</Text>
            <Text accessibilityRole="header" style={[s.heading, { color: c.textMain }]}>Become a BrainWorker</Text>
            <Text style={[s.description, { color: c.textMuted }]}>
              Join BukieBrainJobs as a verified service provider. Complete your details to start onboarding.
            </Text>
            <Field label="FULL NAME" error={errors.name} value={form.name} onChangeText={set('name')} placeholder="e.g. Chidi Anozie" autoCapitalize="words" autoComplete="name" textContentType="name" />
            <Field label="EMAIL ADDRESS" error={errors.email} value={form.email} onChangeText={set('email')} placeholder="chidi@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="emailAddress" />
            <Field label="PHONE NUMBER" error={errors.phone} value={form.phone} onChangeText={set('phone')} placeholder="+234 800 000 0000" keyboardType="phone-pad" autoComplete="tel" textContentType="telephoneNumber" />
            <Pressable
              accessibilityRole="button"
              onPress={handleSubmit}
              style={({ pressed }) => [s.submit, { backgroundColor: pressed ? c.amberHover : c.amber }]}
            >
              <Text style={s.submitLabel}>CONTINUE TO ONBOARDING</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, error, ...input }: TextInputProps & { label: string; error?: string }) {
  const c = useTrades();
  const [focused, setFocused] = useState(false);
  const borderColor = error ? c.danger : focused ? c.amber : c.rule;
  return (
    <View style={s.field}>
      <Text style={[s.label, { color: c.textMuted }]}>{label}</Text>
      <TextInput
        {...input}
        accessibilityLabel={label}
        placeholderTextColor={c.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[s.input, { backgroundColor: c.bg, color: c.textMain, borderColor }]}
      />
      {error && (
        <Text accessibilityLiveRegion="polite" style={[s.error, { color: c.danger }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  page: { flexGrow: 1, padding: 20, gap: 16 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', minHeight: 44 },
  backLabel: { fontSize: 15, fontWeight: '600' },
  card: { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, padding: 20 },
  eyebrow: { fontFamily: mono, fontSize: 11, fontWeight: '700', letterSpacing: 1.3 },
  heading: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginTop: 8 },
  description: { fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontFamily: mono, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 6 },
  input: { minHeight: 48, borderRadius: 6, borderWidth: 1, paddingHorizontal: 14, fontSize: 16 },
  error: { fontSize: 13, marginTop: 6 },
  submit: { minHeight: 48, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  submitLabel: { color: '#FFFFFF', fontFamily: mono, fontSize: 13, fontWeight: '700', letterSpacing: 0.6 },
});
