// apps/web/components/brainworker/onboarding/CredentialsStepForm.tsx
// Phase 6 GREEN: Step 3 Credentials & Evidence Form Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.3)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.4)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 7: CRD-001 to CRD-004)

'use client';

import React, { useState, useEffect, useId, useMemo } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import type {
  OnboardingCredentialsData,
  StagedDocument,
  GovernmentIdType,
  TradeCredentialType,
  WorkProofType,
} from '../../../lib/brainworker/types';
import { DocumentUploadCard } from './DocumentUploadCard';

export interface CredentialsStepFormProps {
  initialData?: Partial<OnboardingCredentialsData> | null | undefined;
  onSave: (data: OnboardingCredentialsData) => void | Promise<void>;
  onBack: () => void;
  onStageDocument?: ((doc: StagedDocument) => void) | undefined;
  onRemoveDocument?: ((id: string) => void) | undefined;
  isSubmitting?: boolean | undefined;
  className?: string | undefined;
}

const GOVERNMENT_ID_OPTIONS: { type: GovernmentIdType; label: string }[] = [
  { type: 'NATIONAL_EID', label: 'National e-ID Card / NIN Slip (NIMC)' },
  { type: 'DRIVERS_LICENSE', label: "Driver's License (FRSC)" },
  { type: 'VOTERS_CARD', label: "Permanent Voter's Card (INEC)" },
  { type: 'INTERNATIONAL_PASSPORT', label: 'International Passport (NIS)' },
];

const TRADE_CREDENTIAL_OPTIONS: { type: TradeCredentialType; label: string }[] = [
  { type: 'TRADE_TEST_CERTIFICATE', label: 'Trade Test Certificate (Ministry of Labour)' },
  { type: 'APPRENTICESHIP_LETTER', label: 'Apprenticeship Freedom Letter / Certificate' },
  { type: 'VOCATIONAL_DIPLOMA', label: 'Vocational Diploma (NABTEB, City & Guilds)' },
  { type: 'ASSOCIATION_ID', label: 'Artisan Association Membership ID' },
];

const WORK_PROOF_OPTIONS: { type: WorkProofType; label: string }[] = [
  { type: 'WORKSHOP_PHOTO', label: 'Workshop Physical Photo with Signboard' },
  { type: 'TOOL_EQUIPMENT_PHOTO', label: 'Tool Kit / Diagnostic Gear Photo' },
  { type: 'PAST_WORK_PHOTO', label: 'Past Completed Work Photo' },
];

export function CredentialsStepForm({
  initialData,
  onSave,
  onBack,
  onStageDocument,
  onRemoveDocument,
  isSubmitting = false,
  className = '',
}: CredentialsStepFormProps): React.ReactElement {
  const formId = useId();

  // State
  const [govIdType, setGovIdType] = useState<GovernmentIdType>(
    (initialData?.governmentId?.specificType as GovernmentIdType) || 'NATIONAL_EID'
  );
  const [tradeType, setTradeType] = useState<TradeCredentialType>(
    (initialData?.tradeCredentials?.[0]?.specificType as TradeCredentialType) || 'TRADE_TEST_CERTIFICATE'
  );
  const [workProofType, setWorkProofType] = useState<WorkProofType>(
    (initialData?.workProofs?.[0]?.specificType as WorkProofType) || 'WORKSHOP_PHOTO'
  );

  const [governmentId, setGovernmentId] = useState<StagedDocument | null>(
    initialData?.governmentId || null
  );
  const [tradeCredentials, setTradeCredentials] = useState<StagedDocument[]>(
    initialData?.tradeCredentials || []
  );
  const [workProofs, setWorkProofs] = useState<StagedDocument[]>(
    initialData?.workProofs || []
  );

  // Sync state if initialData changes externally (e.g. from tests or store)
  useEffect(() => {
    if (initialData?.governmentId !== undefined) {
      setGovernmentId(initialData.governmentId);
      if (initialData.governmentId?.specificType) {
        setGovIdType(initialData.governmentId.specificType as GovernmentIdType);
      }
    }
    if (initialData?.tradeCredentials !== undefined) {
      setTradeCredentials(initialData.tradeCredentials);
      if (initialData.tradeCredentials[0]?.specificType) {
        setTradeType(initialData.tradeCredentials[0].specificType as TradeCredentialType);
      }
    }
    if (initialData?.workProofs !== undefined) {
      setWorkProofs(initialData.workProofs);
      if (initialData.workProofs[0]?.specificType) {
        setWorkProofType(initialData.workProofs[0].specificType as WorkProofType);
      }
    }
  }, [
    initialData?.governmentId,
    initialData?.tradeCredentials,
    initialData?.workProofs,
  ]);

  const isFormValid = useMemo(() => {
    return Boolean(governmentId) && tradeCredentials.length >= 1;
  }, [governmentId, tradeCredentials]);

  // Handlers for Government ID
  const handleGovernmentIdChange = (file: {
    name: string;
    size: number;
    type: string;
    previewUrl?: string | undefined;
  }) => {
    const stagedDoc: StagedDocument = {
      id: `gov-doc-${Date.now()}`,
      category: 'GOVERNMENT_ID',
      specificType: govIdType,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type as StagedDocument['mimeType'],
      stagedAt: new Date().toISOString(),
      ...(file.previewUrl ? { previewUrl: file.previewUrl } : {}),
    };
    setGovernmentId(stagedDoc);
    if (onStageDocument) {
      onStageDocument(stagedDoc);
    }
  };

  const handleGovernmentIdRemove = (docId: string) => {
    setGovernmentId(null);
    if (onRemoveDocument) {
      onRemoveDocument(docId);
    }
  };

  // Handlers for Trade Credential
  const handleTradeDocChange = (file: {
    name: string;
    size: number;
    type: string;
    previewUrl?: string | undefined;
  }) => {
    const stagedDoc: StagedDocument = {
      id: `trade-doc-${Date.now()}`,
      category: 'TRADE_CREDENTIAL',
      specificType: tradeType,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type as StagedDocument['mimeType'],
      stagedAt: new Date().toISOString(),
      ...(file.previewUrl ? { previewUrl: file.previewUrl } : {}),
    };
    setTradeCredentials([stagedDoc]);
    if (onStageDocument) {
      onStageDocument(stagedDoc);
    }
  };

  const handleTradeDocRemove = (docId: string) => {
    setTradeCredentials((prev) => prev.filter((d) => d.id !== docId));
    if (onRemoveDocument) {
      onRemoveDocument(docId);
    }
  };

  // Handlers for Work Proof (Optional)
  const handleWorkProofChange = (file: {
    name: string;
    size: number;
    type: string;
    previewUrl?: string | undefined;
  }) => {
    const stagedDoc: StagedDocument = {
      id: `work-doc-${Date.now()}`,
      category: 'WORK_PROOF',
      specificType: workProofType,
      fileName: file.name,
      fileSizeBytes: file.size,
      mimeType: file.type as StagedDocument['mimeType'],
      stagedAt: new Date().toISOString(),
      ...(file.previewUrl ? { previewUrl: file.previewUrl } : {}),
    };
    setWorkProofs([stagedDoc]);
    if (onStageDocument) {
      onStageDocument(stagedDoc);
    }
  };

  const handleWorkProofRemove = (docId: string) => {
    setWorkProofs((prev) => prev.filter((d) => d.id !== docId));
    if (onRemoveDocument) {
      onRemoveDocument(docId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;

    onSave({
      governmentId,
      tradeCredentials,
      workProofs,
    });
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      noValidate
      className={`w-full max-w-3xl mx-auto space-y-10 bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm ${className}`}
    >
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#001A41]">
          Step 3: Documents & Credentials
        </h2>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Upload your government identification and trade certifications. Photos must be clear and readable.
        </p>
      </div>

      {/* 1. Mandatory Government ID Section */}
      <div className="space-y-4">
        <div>
          <span className="block text-sm font-bold uppercase tracking-wider text-slate-700">
            Government Identity Document (Mandatory) <span className="text-red-500">*</span>
          </span>
          <p className="mt-1 text-xs text-slate-500">
            Select the government document type you are submitting to prove your identity.
          </p>
        </div>

        <div>
          <label
            htmlFor={`${formId}-gov-type`}
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Government Document Type <span className="text-red-500">*</span>
          </label>
          <select
            id={`${formId}-gov-type`}
            value={govIdType}
            onChange={(e) => setGovIdType(e.target.value as GovernmentIdType)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-[#001A41]"
          >
            {GOVERNMENT_ID_OPTIONS.map((opt) => (
              <option key={opt.type} value={opt.type}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <DocumentUploadCard
          id="government-id-upload"
          label="Government ID Upload"
          description="Upload a high-resolution photo or PDF of your selected government identification."
          category="GOVERNMENT_ID"
          specificType={govIdType}
          value={governmentId}
          onChange={handleGovernmentIdChange}
          onRemove={handleGovernmentIdRemove}
          required={true}
        />
      </div>

      {/* 2. Mandatory Trade Proof Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div>
          <span className="block text-sm font-bold uppercase tracking-wider text-slate-700">
            Trade Competency Proof (Mandatory) <span className="text-red-500">*</span>
          </span>
          <p className="mt-1 text-xs text-slate-500">
            Upload trade test certifications, freedom letters, or recognized artisan diplomas.
          </p>
        </div>

        <div>
          <label
            htmlFor={`${formId}-trade-type`}
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Trade Credential Type <span className="text-red-500">*</span>
          </label>
          <select
            id={`${formId}-trade-type`}
            value={tradeType}
            onChange={(e) => setTradeType(e.target.value as TradeCredentialType)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-[#001A41]"
          >
            {TRADE_CREDENTIAL_OPTIONS.map((opt) => (
              <option key={opt.type} value={opt.type}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <DocumentUploadCard
          id="trade-credential-upload"
          label="Trade Credential Upload"
          description="Upload an official certificate or signed freedom letter from an artisan master or vocational institute."
          category="TRADE_CREDENTIAL"
          specificType={tradeType}
          value={tradeCredentials[0] || null}
          onChange={handleTradeDocChange}
          onRemove={handleTradeDocRemove}
          required={true}
        />
      </div>

      {/* 3. Optional Workshop & Equipment Proof Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div>
          <span className="block text-sm font-bold uppercase tracking-wider text-slate-700">
            Workshop & Equipment Proof (Optional)
          </span>
          <p className="mt-1 text-xs text-slate-500">
            Optional proof of physical workshop, specialized tools, or completed field projects.
          </p>
        </div>

        <div>
          <label
            htmlFor={`${formId}-work-proof-type`}
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Work Proof Type
          </label>
          <select
            id={`${formId}-work-proof-type`}
            value={workProofType}
            onChange={(e) => setWorkProofType(e.target.value as WorkProofType)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-[#001A41]"
          >
            {WORK_PROOF_OPTIONS.map((opt) => (
              <option key={opt.type} value={opt.type}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <DocumentUploadCard
          id="work-proof-upload"
          label="Workshop / Equipment Photo"
          description="Clear photo of your workshop signboard, diagnostic gauges, or toolkits."
          category="WORK_PROOF"
          specificType={workProofType}
          value={workProofs[0] || null}
          onChange={handleWorkProofChange}
          onRemove={handleWorkProofRemove}
          required={false}
        />
      </div>

      {/* Safety Note */}
      <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/70 p-4 text-xs text-slate-600 border border-blue-100">
        <ShieldCheck className="h-5 w-5 shrink-0 text-[#001A41] mt-0.5" />
        <p>
          Uploaded documents are staged temporarily and encrypted. They are reviewed strictly by authorized BukieBrainJobs operational verification agents.
        </p>
      </div>

      {/* Action Footer */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
        >
          <ArrowLeft className="h-4 w-4 text-slate-500" />
          <span>Back to Trade Profile</span>
        </button>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitting}
          className={`inline-flex items-center gap-2 rounded-xl bg-[#001A41] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#002661] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41] focus-visible:ring-offset-2 ${
            !isFormValid || isSubmitting
              ? 'opacity-50 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Saving...</span>
            </span>
          ) : (
            <>
              <span>Save & Continue to Review</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
