// apps/web/components/brainworker/onboarding/ReviewStepForm.tsx
// Phase 6 GREEN: Step 4 Review & Submit Form Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3 & 2.4)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.5)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 7: REV-001 to REV-005)

'use client';

import React, { useState, useId, useMemo } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Pencil,
  ShieldCheck,
  User,
  Wrench,
  FileCheck,
} from 'lucide-react';
import type {
  OnboardingIdentityData,
  OnboardingTradeData,
  OnboardingCredentialsData,
  OnboardingStep,
  StagedDocument,
} from '../../../lib/brainworker/types';

export interface ReviewStepFormProps {
  identityData: OnboardingIdentityData;
  tradeData: OnboardingTradeData;
  credentialsData: OnboardingCredentialsData;
  onEditStep: (step: OnboardingStep) => void;
  onBack: () => void;
  onSubmit: (declaration: {
    truthfulnessAcknowledged: boolean;
    termsAccepted: boolean;
    declaredAt: string;
  }) => void | Promise<void>;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
}

const TRADE_CATEGORY_LABELS: Record<string, string> = {
  generator: 'Generator Repair & Maintenance',
  ac: 'Air Conditioning & Refrigeration',
  plumbing: 'Plumbing & Pipe Fitting',
  electrical: 'Electrical Installation & Inverters',
  carpentry: 'Carpentry & Furniture Making',
  painting: 'Painting & Wall Finishing',
  masonry: 'Masonry, Tiling & Bricklaying',
  welding: 'Welding & Metal Fabrication',
};

const EXPERIENCE_TIER_LABELS: Record<string, string> = {
  APPRENTICE_INTERMEDIATE: 'Apprentice / Intermediate',
  JOURNEYMAN_EXPERIENCED: 'Journeyman / Experienced',
  MASTER_CRAFTSMAN: 'Master Craftsman',
};

const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  GOVERNMENT_ID: 'Government ID',
  TRADE_CREDENTIAL: 'Trade Credential',
  WORK_PROOF: 'Work / Tool Proof',
};

export function ReviewStepForm({
  identityData,
  tradeData,
  credentialsData,
  onEditStep,
  onBack,
  onSubmit,
  isSubmitting = false,
  className = '',
}: ReviewStepFormProps): React.ReactElement {
  const formId = useId();

  const [truthfulnessAcknowledged, setTruthfulnessAcknowledged] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const canSubmit = truthfulnessAcknowledged && termsAccepted && !isSubmitting;

  const fullName = useMemo(() => {
    return [
      identityData.legalFirstName,
      identityData.legalMiddleName,
      identityData.legalLastName,
    ]
      .filter(Boolean)
      .join(' ');
  }, [
    identityData.legalFirstName,
    identityData.legalMiddleName,
    identityData.legalLastName,
  ]);

  const fullAddress = useMemo(() => {
    const { street, city, lga, state } = identityData.residentialAddress;
    return `${street}, ${city}, ${lga}, ${state}`;
  }, [identityData.residentialAddress]);

  const allDocuments = useMemo(() => {
    const docs: StagedDocument[] = [];
    if (credentialsData.governmentId) {
      docs.push(credentialsData.governmentId);
    }
    if (Array.isArray(credentialsData.tradeCredentials)) {
      docs.push(...credentialsData.tradeCredentials);
    }
    if (Array.isArray(credentialsData.workProofs)) {
      docs.push(...credentialsData.workProofs);
    }
    return docs;
  }, [credentialsData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    onSubmit({
      truthfulnessAcknowledged: true,
      termsAccepted: true,
      declaredAt: new Date().toISOString(),
    });
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className={`w-full max-w-3xl mx-auto space-y-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm ${className}`}
    >
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#001A41]">
          Step 4: Review & Submit Application
        </h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Please confirm your details before submitting for operational review. Once submitted, your application is locked while our verification team confirms your records.
        </p>
      </div>

      {/* 1. Identity Summary Card (REV-001) */}
      <section
        aria-labelledby={`${formId}-identity-heading`}
        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 transition hover:border-slate-300"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100/70 text-[#001A41]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3
                id={`${formId}-identity-heading`}
                className="text-base font-bold text-[#001A41]"
              >
                Identity Information
              </h3>
              <p className="text-xs text-slate-500">Legal identity and verified residential address</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep('identity')}
            aria-label="Edit Identity Information"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Legal Full Name
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">{fullName}</dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Date of Birth
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {identityData.dateOfBirth}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {identityData.identifierType} Number (Masked)
            </dt>
            <dd className="mt-1 font-mono font-semibold text-slate-900 tracking-wider">
              {identityData.maskedIdentifier}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Residential Address
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">{fullAddress}</dd>
          </div>
        </dl>
      </section>

      {/* 2. Trade & Coverage Profile Card (REV-002) */}
      <section
        aria-labelledby={`${formId}-trade-heading`}
        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 transition hover:border-slate-300"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100/70 text-[#001A41]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h3
                id={`${formId}-trade-heading`}
                className="text-base font-bold text-[#001A41]"
              >
                Trade & Coverage Profile
              </h3>
              <p className="text-xs text-slate-500">Selected trade competency, experience, and service cities</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep('trade')}
            aria-label="Edit Trade Profile"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Primary Trade Category
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {TRADE_CATEGORY_LABELS[tradeData.primaryCategory] || tradeData.primaryCategory}
            </dd>
          </div>

          <div>
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Experience Level & Years
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              <span>{EXPERIENCE_TIER_LABELS[tradeData.experienceLevel] || tradeData.experienceLevel}</span>
              <span className="text-slate-500 text-xs ml-2">({tradeData.yearsInTrade} years)</span>
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Sub-Specialties
            </dt>
            <dd className="mt-1.5 flex flex-wrap gap-1.5">
              {tradeData.subSpecialties.length > 0 ? (
                tradeData.subSpecialties.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center rounded-lg bg-white border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-800 shadow-2xs"
                  >
                    {spec}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">None specified</span>
              )}
            </dd>
          </div>

          <div className="sm:col-span-2">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Operating Coverage Cities
            </dt>
            <dd className="mt-1 font-semibold text-slate-900">
              {tradeData.coverageCities.join(', ')}
            </dd>
          </div>
        </dl>
      </section>

      {/* 3. Documents & Credentials Summary Card (REV-003) */}
      <section
        aria-labelledby={`${formId}-credentials-heading`}
        className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6 transition hover:border-slate-300"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/70 text-[#001A41]">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <h3
                id={`${formId}-credentials-heading`}
                className="text-base font-bold text-[#001A41]"
              >
                Documents & Credentials
              </h3>
              <p className="text-xs text-slate-500">Staged identification and trade certifications</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEditStep('credentials')}
            aria-label="Edit Documents & Credentials"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {allDocuments.map((doc) => {
            const formattedSize = (doc.fileSizeBytes / (1024 * 1024)).toFixed(1);
            return (
              <div
                key={doc.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {doc.fileName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formattedSize} MB •{' '}
                      <span className="font-medium text-slate-700">
                        {DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}
                      </span>
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/60">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Staged</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Legal Truthfulness Declaration & Acknowledgements (REV-005) */}
      <div className="rounded-2xl border-2 border-slate-300 bg-blue-50/40 p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5 text-[#001A41]">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <h4 className="text-sm font-bold uppercase tracking-wider">
            Applicant Declaration & Agreement
          </h4>
        </div>

        <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id={`${formId}-truth`}
              checked={truthfulnessAcknowledged}
              onChange={(e) => setTruthfulnessAcknowledged(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#001A41] focus:ring-[#001A41]"
            />
            <span className="leading-snug">
              I solemnly declare that all personal details, trade experience, and credentials provided in this application are genuine, accurate, and belong to me. I understand that submitting fraudulent credentials results in immediate disqualification and account termination.
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              id={`${formId}-terms`}
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#001A41] focus:ring-[#001A41]"
            />
            <span className="leading-snug">
              I agree to the BukieBrainJobs Provider Terms of Service, background verification protocols, and code of professional conduct.
            </span>
          </label>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          <span>Back to Credentials</span>
        </button>

        <button
          type="submit"
          disabled={!canSubmit}
          className={`inline-flex items-center gap-2 rounded-xl bg-[#001A41] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002661] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2 ${
            !canSubmit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Submitting application...</span>
            </span>
          ) : (
            <span>Submit Verification Application</span>
          )}
        </button>
      </div>
    </form>
  );
}
