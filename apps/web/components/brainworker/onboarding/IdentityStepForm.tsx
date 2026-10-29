// apps/web/components/brainworker/onboarding/IdentityStepForm.tsx
// Phase 4 GREEN: Step 1 Identity Verification Form Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.2)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 5: IDE-001 to IDE-008)

'use client';

import React, { useState, useId, useMemo } from 'react';
import { Shield, CheckCircle2, Edit2 } from 'lucide-react';
import type {
  OnboardingIdentityData,
  IdentityIdentifierType,
} from '../../../lib/brainworker/types';
import {
  validateDateOfBirth,
  validateNinFormat,
  validateBvnFormat,
  maskIdentityIdentifier,
} from '../../../lib/brainworker/validation';

export interface IdentityStepFormProps {
  initialData?: Partial<OnboardingIdentityData> | null | undefined;
  onSave: (data: OnboardingIdentityData) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
}

const NIGERIAN_STATES = [
  'Abia',
  'Abuja (FCT)',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

export function IdentityStepForm({
  initialData,
  onSave,
  isSubmitting = false,
  className = '',
}: IdentityStepFormProps): React.ReactElement {
  const formId = useId();

  // Form Fields
  const [firstName, setFirstName] = useState(initialData?.legalFirstName || '');
  const [middleName, setMiddleName] = useState(
    initialData?.legalMiddleName || ''
  );
  const [lastName, setLastName] = useState(initialData?.legalLastName || '');
  const [dateOfBirth, setDateOfBirth] = useState(
    initialData?.dateOfBirth || ''
  );
  const [identifierType, setIdentifierType] = useState<IdentityIdentifierType>(
    initialData?.identifierType || 'NIN'
  );
  const [identifierNumber, setIdentifierNumber] = useState(
    initialData?.identifierNumber || ''
  );
  const [isMasked, setIsMasked] = useState(
    Boolean(initialData?.identifierNumber && initialData.identifierNumber.length === 11)
  );

  const [street, setStreet] = useState(
    initialData?.residentialAddress?.street || ''
  );
  const [state, setState] = useState(
    initialData?.residentialAddress?.state || ''
  );
  const [city, setCity] = useState(
    initialData?.residentialAddress?.city || ''
  );

  // Field Touched Tracking
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Field Validations
  const firstNameError = useMemo(() => {
    if (!touched.firstName) return null;
    if (!firstName.trim()) return 'First name is required';
    return null;
  }, [firstName, touched.firstName]);

  const lastNameError = useMemo(() => {
    if (!touched.lastName) return null;
    if (!lastName.trim()) return 'Last name is required';
    return null;
  }, [lastName, touched.lastName]);

  const dobValidation = useMemo(() => {
    if (!dateOfBirth) {
      return touched.dateOfBirth ? { valid: false, error: 'Date of birth is required' } : null;
    }
    const res = validateDateOfBirth(dateOfBirth);
    return res;
  }, [dateOfBirth, touched.dateOfBirth]);

  const isDobValid = Boolean(dobValidation && dobValidation.valid);
  const dobError = touched.dateOfBirth && dobValidation && !dobValidation.valid ? dobValidation.error : null;

  const isIdentifierValid = useMemo(() => {
    if (identifierNumber.length !== 11) return false;
    return identifierType === 'NIN'
      ? validateNinFormat(identifierNumber)
      : validateBvnFormat(identifierNumber);
  }, [identifierNumber, identifierType]);

  const identifierError = useMemo(() => {
    if (!touched.identifierNumber) return null;
    if (!identifierNumber) return 'Identifier is required';
    if (identifierNumber.length !== 11) {
      return 'Must be exactly 11 digits';
    }
    return null;
  }, [identifierNumber, touched.identifierNumber]);

  const streetError = useMemo(() => {
    if (!touched.street) return null;
    if (!street.trim()) return 'Street address is required';
    return null;
  }, [street, touched.street]);

  const stateError = useMemo(() => {
    if (!touched.state) return null;
    if (!state.trim()) return 'State is required';
    return null;
  }, [state, touched.state]);

  const cityError = useMemo(() => {
    if (!touched.city) return null;
    if (!city.trim()) return 'City / LGA is required';
    return null;
  }, [city, touched.city]);

  // Overall form validity
  const isFormValid = useMemo(() => {
    return (
      Boolean(firstName.trim()) &&
      Boolean(lastName.trim()) &&
      isDobValid &&
      isIdentifierValid &&
      Boolean(street.trim()) &&
      Boolean(state.trim()) &&
      Boolean(city.trim())
    );
  }, [
    firstName,
    lastName,
    isDobValid,
    isIdentifierValid,
    street,
    state,
    city,
  ]);

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const sanitized = raw.replace(/\D/g, '').slice(0, 11);
    setIdentifierNumber(sanitized);
  };

  const handleIdentifierBlur = () => {
    markTouched('identifierNumber');
    if (identifierNumber.length === 11) {
      setIsMasked(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    const data: OnboardingIdentityData = {
      legalFirstName: firstName.trim(),
      ...(middleName.trim() ? { legalMiddleName: middleName.trim() } : {}),
      legalLastName: lastName.trim(),
      dateOfBirth,
      identifierType,
      identifierNumber,
      maskedIdentifier: maskIdentityIdentifier(identifierNumber),
      residentialAddress: {
        street: street.trim(),
        city: city.trim(),
        lga: city.trim(),
        state: state.trim(),
      },
    };

    onSave(data);
  };

  const identifierLabel =
    identifierType === 'NIN'
      ? 'National Identification Number (NIN)'
      : 'Bank Verification Number (BVN)';

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className={`w-full max-w-3xl mx-auto space-y-8 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 sm:p-10 shadow-xs transition-colors ${className}`}
    >
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
          Step 1: Legal Identity Verification
        </h1>
        <p className="mt-2 text-sm text-[var(--text-muted)] leading-relaxed">
          Enter your legal name as it appears on your government documents, along with your verified identifier.
        </p>
      </div>

      {/* Legal Names Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Legal Names
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor={`${formId}-first-name`}
              className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
            >
              Legal First Name <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id={`${formId}-first-name`}
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onFocus={() => markTouched('firstName')}
              onBlur={() => markTouched('firstName')}
              placeholder="e.g. Amina"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--text-main)] bg-[var(--bg)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 ${
                firstNameError
                  ? 'border-[var(--danger-border)] focus:ring-red-400 bg-[var(--danger-dim)]'
                  : 'border-[var(--card-border)] focus:border-[var(--amber)] focus:ring-[var(--amber-dim)]'
              }`}
            />
            {firstNameError && (
              <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
                {firstNameError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-middle-name`}
              className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
            >
              Middle Name (Optional)
            </label>
            <input
              id={`${formId}-middle-name`}
              type="text"
              value={middleName}
              onChange={(e) => setMiddleName(e.target.value)}
              placeholder="e.g. Bolanle"
              className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 focus:ring-[var(--amber-dim)]"
            />
          </div>

          <div>
            <label
              htmlFor={`${formId}-last-name`}
              className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
            >
              Legal Last Name <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id={`${formId}-last-name`}
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onFocus={() => markTouched('lastName')}
              onBlur={() => markTouched('lastName')}
              placeholder="e.g. Okonkwo"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--text-main)] bg-[var(--bg)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 ${
                lastNameError
                  ? 'border-[var(--danger-border)] focus:ring-red-400 bg-[var(--danger-dim)]'
                  : 'border-[var(--card-border)] focus:border-[var(--amber)] focus:ring-[var(--amber-dim)]'
              }`}
            />
            {lastNameError && (
              <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
                {lastNameError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Date of Birth Section */}
      <div className="space-y-4 pt-2">
        <div>
          <label
            htmlFor={`${formId}-dob`}
            className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
          >
            Date of Birth <span className="text-[var(--danger)]">*</span>
          </label>
          <input
            id={`${formId}-dob`}
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            onFocus={() => markTouched('dateOfBirth')}
            onBlur={() => markTouched('dateOfBirth')}
            className={`w-full sm:max-w-xs rounded-lg border px-3.5 py-2.5 text-sm text-[var(--text-main)] bg-[var(--bg)] transition focus:outline-none focus:ring-2 ${
              dobError
                ? 'border-[var(--danger-border)] focus:ring-red-400 bg-[var(--danger-dim)]'
                : 'border-[var(--card-border)] focus:border-[var(--amber)] focus:ring-[var(--amber-dim)]'
            }`}
          />
          {dobError && (
            <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
              {dobError}
            </p>
          )}
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Must be at least 18 years old to register as a verified provider.
          </p>
        </div>
      </div>

      {/* Identity Identifier Section */}
      <div className="space-y-4 pt-2 border-t border-[var(--card-border)]">
        <div>
          <span className="block text-xs font-semibold text-[var(--text-muted)] mb-2">
            Verification Identifier Type <span className="text-[var(--danger)]">*</span>
          </span>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-main)]">
              <input
                type="radio"
                name="identifierType"
                value="NIN"
                checked={identifierType === 'NIN'}
                onChange={() => {
                  setIdentifierType('NIN');
                  setIsMasked(false);
                }}
                className="h-4 w-4 text-[var(--text-main)] focus:ring-[var(--amber)]"
              />
              <span>NIN</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[var(--text-main)]">
              <input
                type="radio"
                name="identifierType"
                value="BVN"
                checked={identifierType === 'BVN'}
                onChange={() => {
                  setIdentifierType('BVN');
                  setIsMasked(false);
                }}
                className="h-4 w-4 text-[var(--text-main)] focus:ring-[var(--amber)]"
              />
              <span>BVN</span>
            </label>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor={`${formId}-identifier`}
              className="block text-xs font-semibold text-[var(--text-muted)]"
            >
              {identifierLabel} <span className="text-[var(--danger)]">*</span>
            </label>
            <span className="text-xs font-medium text-[var(--text-muted)] font-mono">
              {identifierNumber.length}/11 digits
            </span>
          </div>

          {isMasked ? (
            <div className="flex items-center justify-between rounded-lg border border-[var(--card-border)] bg-[var(--bg)] px-3.5 py-2.5">
              <span className="font-mono text-sm tracking-wider text-[var(--text-main)]">
                {maskIdentityIdentifier(identifierNumber)}
              </span>
              <button
                type="button"
                onClick={() => setIsMasked(false)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)] hover:underline"
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>Show / Edit</span>
              </button>
            </div>
          ) : (
            <input
              id={`${formId}-identifier`}
              type="text"
              inputMode="numeric"
              maxLength={11}
              value={identifierNumber}
              onChange={handleIdentifierChange}
              onFocus={() => markTouched('identifierNumber')}
              onBlur={handleIdentifierBlur}
              placeholder="Enter 11 numeric digits"
              className={`w-full rounded-lg border px-3.5 py-2.5 font-mono text-sm text-[var(--text-main)] bg-[var(--bg)] transition focus:outline-none focus:ring-2 ${
                identifierError
                  ? 'border-[var(--danger-border)] focus:ring-red-400 bg-[var(--danger-dim)]'
                  : 'border-[var(--card-border)] focus:border-[var(--amber)] focus:ring-[var(--amber-dim)]'
              }`}
            />
          )}

          {identifierError && (
            <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
              {identifierError}
            </p>
          )}

          {isIdentifierValid && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-[var(--brand-green)]">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>✓ 11-digit format valid</span>
            </p>
          )}

          {/* Privacy Disclaimer Note */}
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[var(--tag-bg)] p-3 text-xs text-[var(--text-muted)] border border-[var(--lead)]">
            <Shield className="h-4 w-4 shrink-0 text-[var(--text-main)] mt-0.5" />
            <p>
              Your NIN/BVN is used strictly to cross-reference your legal identity. It is never displayed to customers or shared with third parties.
            </p>
          </div>
        </div>
      </div>

      {/* Residential Address Section */}
      <div className="space-y-4 pt-2 border-t border-[var(--card-border)]">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
          Residential Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label
              htmlFor={`${formId}-street`}
              className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
            >
              Street Address <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id={`${formId}-street`}
              type="text"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              onFocus={() => markTouched('street')}
              onBlur={() => markTouched('street')}
              placeholder="e.g. 14 Commercial Avenue"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--text-main)] bg-[var(--bg)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 ${
                streetError
                  ? 'border-[var(--danger-border)] focus:ring-red-400 bg-[var(--danger-dim)]'
                  : 'border-[var(--card-border)] focus:border-[var(--amber)] focus:ring-[var(--amber-dim)]'
              }`}
            />
            {streetError && (
              <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
                {streetError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-state`}
              className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
            >
              State <span className="text-[var(--danger)]">*</span>
            </label>
            <select
              id={`${formId}-state`}
              value={state}
              onChange={(e) => setState(e.target.value)}
              onFocus={() => markTouched('state')}
              onBlur={() => markTouched('state')}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--text-main)] bg-[var(--bg)] transition focus:outline-none focus:ring-2 ${
                stateError
                  ? 'border-[var(--danger-border)] focus:ring-red-400 bg-[var(--danger-dim)]'
                  : 'border-[var(--card-border)] focus:border-[var(--amber)] focus:ring-[var(--amber-dim)]'
              }`}
            >
              <option value="">Select State</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {stateError && (
              <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
                {stateError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor={`${formId}-city`}
              className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
            >
              City / LGA <span className="text-[var(--danger)]">*</span>
            </label>
            <input
              id={`${formId}-city`}
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onFocus={() => markTouched('city')}
              onBlur={() => markTouched('city')}
              placeholder="e.g. Yaba"
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[var(--text-main)] bg-[var(--bg)] placeholder:text-[var(--text-muted)] transition focus:outline-none focus:ring-2 ${
                cityError
                  ? 'border-[var(--danger-border)] focus:ring-red-400 bg-[var(--danger-dim)]'
                  : 'border-[var(--card-border)] focus:border-[var(--amber)] focus:ring-[var(--amber-dim)]'
              }`}
            />
            {cityError && (
              <p role="alert" className="mt-1 text-xs text-[var(--danger)] font-medium">
                {cityError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[var(--lead)] flex items-center justify-end">
        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`outlier-pill-button inline-flex items-center justify-center rounded-full bg-[var(--amber)] px-6 py-3 text-sm font-bold text-[#001A41] shadow-xs transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] hover:bg-[var(--amber-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] focus-visible:ring-offset-2 ${
            !isFormValid || isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
              <span>Saving...</span>
            </span>
          ) : (
            <span>Save & Continue to Trade Profile</span>
          )}
        </button>
      </div>
    </form>
  );
}
