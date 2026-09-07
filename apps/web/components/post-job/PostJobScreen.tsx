'use client';

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  Edit3,
  Info,
  Loader2,
  Lock,
  Sparkles,
  UserCheck,
  WifiOff,
  X,
} from 'lucide-react';
import {
  CustomerJobDraft,
  validateCustomerJobDraft,
  getPrototypeSubmissionOutcome,
} from '@bukiebrainjobs/validation';
import {
  NIGERIAN_LOCATIONS,
  SERVICE_CATEGORIES,
  MOCK_BRAINWORKERS,
  BrainWorker,
} from '../../lib/mock/homepage-data';
import {
  ArrivalWindow,
  ARRIVAL_WINDOWS,
  resolveJobPostingContext,
  generateJobReference,
} from '../../lib/post-job';
import {
  getMockAuthenticatedUser,
  getPreservedJobDraft,
  savePreservedJobDraft,
  clearPreservedJobDraft,
  AuthUser,
} from '../../lib/auth';

type SubmitStatus = 'idle' | 'pending' | 'error' | 'success';

function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-semibold text-red-700 flex items-center gap-1" role="alert">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

export default function PostJobScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useMemo(() => resolveJobPostingContext(searchParams), [searchParams]);
  const isContinuation = searchParams.get('jobContinuation') === '1';

  // Active locations list
  const activeLocations = useMemo(
    () => NIGERIAN_LOCATIONS.filter((loc) => loc.status === 'active'),
    [],
  );

  // Authenticated user state
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);

  // Restoration banner state
  const [restoredBanner, setRestoredBanner] = useState(false);

  // Submission state
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [submittedReference, setSubmittedReference] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Today's date string for min date
  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, []);

  // Form data state
  const [formData, setFormData] = useState<CustomerJobDraft>(() => ({
    jobType: context.jobType,
    category: context.categoryId || '',
    title: context.title || '',
    description: context.description || '',
    city: context.city || 'Lagos',
    streetAddress: '',
    landmark: '',
    urgency: 'tomorrow',
    preferredDate: '',
    arrivalWindow: 'Any time',
    budget: '',
    budgetType: 'negotiable',
    preferredWorkerId: context.workerId || '',
    preferredWorkerName: context.worker?.name || '',
  }));

  // Selected BrainWorker preference
  const selectedWorker: BrainWorker | undefined = useMemo(() => {
    if (formData.preferredWorkerId) {
      return MOCK_BRAINWORKERS.find((w) => w.id === formData.preferredWorkerId);
    }
    return undefined;
  }, [formData.preferredWorkerId]);

  // Headings refs for focus management
  const successRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Check auth and preserved draft on mount
  useEffect(() => {
    const user = getMockAuthenticatedUser();
    setAuthenticatedUser(user);

    const draft = getPreservedJobDraft();
    if (draft) {
      setFormData((prev) => ({
        jobType: draft.jobType || prev.jobType,
        category: draft.category !== undefined ? draft.category : prev.category,
        title: draft.title || prev.title,
        description: draft.description || prev.description,
        city: draft.city || prev.city,
        streetAddress: draft.streetAddress || prev.streetAddress,
        landmark: draft.landmark || prev.landmark,
        urgency: draft.urgency || prev.urgency,
        preferredDate: draft.preferredDate || prev.preferredDate,
        arrivalWindow: (draft.arrivalWindow as ArrivalWindow) || prev.arrivalWindow,
        budget: draft.budget !== undefined ? draft.budget : prev.budget,
        budgetType: draft.budgetType || prev.budgetType,
        preferredWorkerId: draft.preferredWorkerId !== undefined ? draft.preferredWorkerId : prev.preferredWorkerId,
        preferredWorkerName: draft.preferredWorkerName !== undefined ? draft.preferredWorkerName : prev.preferredWorkerName,
      }));

      if (isContinuation) {
        setRestoredBanner(true);
      }
    }
  }, [isContinuation]);

  // Focus success heading on submission
  useEffect(() => {
    if (status === 'success' && successRef.current) {
      successRef.current.focus();
    }
  }, [status]);

  // Field change handler
  const handleFieldChange = <K extends keyof CustomerJobDraft>(field: K, value: CustomerJobDraft[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (status === 'error') {
      setStatus('idle');
    }
  };

  // Scroll to section helper for review card edit buttons
  const scrollToField = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  // Submission execution (mock boundary)
  const finishSubmission = () => {
    setStatus('pending');
    const isMockError = context.mockError || searchParams.get('mockError') === '1';
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    const outcome = getPrototypeSubmissionOutcome({ mockError: isMockError, online: isOnline });

    window.setTimeout(() => {
      if (outcome === 'success') {
        const ref = generateJobReference();
        setSubmittedReference(ref);
        clearPreservedJobDraft();
        setStatus('success');
      } else {
        setStatus('error');
      }
    }, 600);
  };

  // Form submission handler
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    const validationErrors = validateCustomerJobDraft(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Focus first error field
      const firstErrorKey = Object.keys(validationErrors)[0];
      const targetElement =
        document.getElementById(`post-job-${firstErrorKey}-input`) ||
        document.getElementById(`post-job-${firstErrorKey}-select`);
      targetElement?.focus();
      return;
    }

    // Commitment point: Guest handoff vs Authenticated submission
    if (!authenticatedUser) {
      savePreservedJobDraft({
        ...formData,
        preferredWorkerName: selectedWorker?.name,
      });
      router.push('/login?returnUrl=/post-job&handoff=1');
      return;
    }

    finishSubmission();
  };

  // SUCCESS CONFIRMATION VIEW (PJ-10)
  if (status === 'success') {
    const categoryTitle =
      formData.category === 'not_sure'
        ? "I'm not sure (to be matched)"
        : SERVICE_CATEGORIES.find((c) => c.id === formData.category)?.title || 'General Service Request';

    return (
      <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center font-display text-base font-extrabold tracking-tight text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
            >
              BukieBrainJobs
            </Link>
            <Link
              href="/services"
              className="motion-press inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#001A41] hover:text-[#296A4B]"
            >
              Browse Services
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-[#059669]">
              <CheckCircle2 className="h-10 w-10" aria-hidden="true" />
            </div>

            <h1
              ref={successRef}
              tabIndex={-1}
              className="mt-4 font-display text-2xl font-bold tracking-tight text-[#001A41] sm:text-3xl focus:outline-none"
            >
              Request received
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Your customer job request has been recorded. Matched BrainWorkers will review your details and respond.
            </p>

            {/* Reference Badge */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-mono font-bold text-[#001A41]">
              <span>Reference:</span>
              <span className="text-[#059669]">{submittedReference || 'REQ-72941'}</span>
            </div>

            {/* Honest Next-Steps Box */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/75 p-4 text-left text-xs leading-relaxed text-slate-700">
              <p className="font-semibold text-[#001A41] flex items-center gap-1.5 mb-1.5">
                <Info className="h-4 w-4 text-[#296A4B]" />
                What happens next
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Vetted BrainWorkers matching your category and city will review your scope.</li>
                <li>Interested professionals will provide availability and pricing proposals.</li>
                <li>
                  <span className="font-semibold text-slate-800">No payment has occurred:</span> Pricing and terms are finalized directly with your chosen artisan under the BukieGuarantee.
                </li>
                <li>
                  <span className="font-semibold text-slate-800">No worker dispatched yet:</span> Service begins only after mutual agreement and schedule confirmation.
                </li>
              </ul>
            </div>

            {/* Request Summary Card */}
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-left">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Job Request Summary
              </h2>
              <dl className="grid grid-cols-1 gap-y-2.5 sm:grid-cols-2 text-xs">
                <div>
                  <dt className="text-slate-500">Job Title</dt>
                  <dd className="font-semibold text-[#001A41] mt-0.5">{formData.title}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Job Type</dt>
                  <dd className="font-semibold text-[#001A41] mt-0.5">
                    {formData.jobType === 'specific_service' ? 'Specific Service' : 'Broader Project'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Category</dt>
                  <dd className="font-semibold text-[#001A41] mt-0.5">{categoryTitle}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Location</dt>
                  <dd className="font-semibold text-[#001A41] mt-0.5">
                    {formData.streetAddress}, {formData.city}
                    {formData.landmark ? ` (${formData.landmark})` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Schedule</dt>
                  <dd className="font-semibold text-[#001A41] mt-0.5 capitalize">
                    {formData.urgency ? formData.urgency.replace('_', ' ') : 'Tomorrow'}
                    {formData.preferredDate ? ` on ${formData.preferredDate}` : ''}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Budget Estimate</dt>
                  <dd className="font-semibold text-[#001A41] mt-0.5">
                    {formData.budget ? `${formData.budget} (${formData.budgetType})` : 'Flexible / Open to quotes'}
                  </dd>
                </div>
                {selectedWorker && (
                  <div className="sm:col-span-2 pt-2 border-t border-slate-100">
                    <dt className="text-slate-500">Preferred BrainWorker (Preference only)</dt>
                    <dd className="font-semibold text-[#001A41] mt-0.5 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5 text-[#059669]" />
                      {selectedWorker.name} ({selectedWorker.category})
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/services"
                className="motion-press inline-flex min-h-12 items-center justify-center rounded-full bg-[#001A41] px-6 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8]"
              >
                Browse Services Directory
              </Link>
              <Link
                href="/"
                className="motion-press inline-flex min-h-12 items-center justify-center rounded-full border border-slate-200 bg-white px-6 text-sm font-bold text-[#001A41] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // MAIN FORM VIEW
  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
      {/* Global Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="motion-press inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#001A41] transition-colors hover:text-[#296A4B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to services
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-display text-base font-extrabold tracking-tight text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
          >
            BukieBrainJobs
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Restored Draft Banner */}
        {restoredBanner && (
          <aside
            aria-label="Restored job draft"
            className="mb-6 flex items-start justify-between rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#059669] mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-[#001A41]">
                  Your job request details have been restored
                </h2>
                <p className="mt-0.5 text-xs text-slate-600">
                  Review your information below, make any updates needed, and submit your request.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRestoredBanner(false)}
              className="motion-press rounded-lg p-1 text-slate-500 hover:bg-emerald-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#059669]"
              aria-label="Dismiss restored alert"
            >
              <X className="h-4 w-4" />
            </button>
          </aside>
        )}

        {/* Offline / Submission Failure Banner */}
        {status === 'error' && (
          <aside
            aria-label="Submission error"
            className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <WifiOff className="h-5 w-5 shrink-0 text-red-600 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-red-900">
                  Submission could not be completed right now
                </h2>
                <p className="mt-0.5 text-xs text-red-700">
                  Your request details have been saved safely. Please check your connection and try again.
                </p>
              </div>
            </div>
            <button
              onClick={finishSubmission}
              className="motion-press inline-flex min-h-10 items-center justify-center rounded-xl bg-red-700 px-4 text-xs font-bold text-white transition-colors hover:bg-red-800"
            >
              Try again
            </button>
          </aside>
        )}

        {/* Page Hero Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#001A41]/5 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#001A41]">
              <Sparkles className="h-3.5 w-3.5 text-[#296A4B]" />
              Open Customer Request
            </span>
            {selectedWorker && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-semibold text-[#059669]">
                <UserCheck className="h-3.5 w-3.5" />
                Preferred: {selectedWorker.name}
              </span>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#001A41] sm:text-3xl lg:text-4xl">
            Post a Job & Receive Quotes
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base max-w-2xl">
            Describe your project, maintenance, or repair needs. Matched, verified Nigerian BrainWorkers will review your job and send availability proposals.
          </p>
        </div>

        {/* Form & Review Grid Layout */}
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Intake Form (7 cols on desktop) */}
          <div className="lg:col-span-7 space-y-6">
              {/* SECTION 1: JOB REQUIREMENT (PJ-01) */}
              <section
                id="section-requirement"
                aria-labelledby="heading-requirement"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#001A41] text-xs font-bold text-white">
                    1
                  </div>
                  <h2 id="heading-requirement" className="font-display text-base font-bold text-[#001A41] sm:text-lg">
                    Job Requirement
                  </h2>
                </div>

                {/* Job Type Selector */}
                <fieldset className="mb-5">
                  <legend className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    What type of work is this? <span className="text-red-600">*</span>
                  </legend>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                        formData.jobType === 'specific_service'
                          ? 'border-[#001A41] bg-[#001A41]/5 ring-1 ring-[#001A41]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#001A41]">Specific Service</span>
                        <input
                          type="radio"
                          name="jobType"
                          value="specific_service"
                          checked={formData.jobType === 'specific_service'}
                          onChange={() => handleFieldChange('jobType', 'specific_service')}
                          className="h-4 w-4 text-[#001A41] focus:ring-[#296A4B]"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Single trade or repair (e.g. generator repair, AC leak, pipe fitting).
                      </p>
                    </label>

                    <label
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all flex flex-col justify-between ${
                        formData.jobType === 'broader_project'
                          ? 'border-[#001A41] bg-[#001A41]/5 ring-1 ring-[#001A41]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-[#001A41]">Broader Project</span>
                        <input
                          type="radio"
                          name="jobType"
                          value="broader_project"
                          checked={formData.jobType === 'broader_project'}
                          onChange={() => handleFieldChange('jobType', 'broader_project')}
                          className="h-4 w-4 text-[#001A41] focus:ring-[#296A4B]"
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        Multi-trade or renovation (e.g. apartment makeover, rewiring, relocation).
                      </p>
                    </label>
                  </div>
                  <FieldError id="post-job-jobType-error" message={errors.jobType} />
                </fieldset>

                {/* Category Selection with 'I am not sure' */}
                <div className="mb-5">
                  <label
                    htmlFor="post-job-category-select"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Category <span className="text-xs font-normal text-slate-500 lowercase">(optional, select if known)</span>
                  </label>
                  <select
                    id="post-job-category-select"
                    value={formData.category || ''}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#001A41] focus:border-[#296A4B] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                  >
                    <option value="">Select a category</option>
                    <option value="not_sure">{"I'm not sure (we'll help match it)"}</option>
                    {SERVICE_CATEGORIES.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    {"If your issue spans multiple trades or you aren't sure, select \"I'm not sure\" and we'll route it correctly."}
                  </p>
                </div>

                {/* Job Title */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="post-job-title-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Job title <span className="text-red-600">*</span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {formData.title?.length || 0}/100
                    </span>
                  </div>
                  <input
                    id="post-job-title-input"
                    type="text"
                    maxLength={100}
                    value={formData.title || ''}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    placeholder="e.g. 5kVA Generator engine overheating or 3-Bedroom apartment rewiring"
                    aria-invalid={Boolean(errors.title)}
                    aria-describedby={errors.title ? 'post-job-title-error' : undefined}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#001A41] focus:outline-none focus:ring-2 ${
                      errors.title
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-[#296A4B] focus:ring-[#ABEEC8]'
                    }`}
                  />
                  <FieldError id="post-job-title-error" message={errors.title} />
                </div>

                {/* Job Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="post-job-description-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Job description <span className="text-red-600">*</span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {formData.description?.length || 0}/1,000
                    </span>
                  </div>
                  <textarea
                    id="post-job-description-input"
                    rows={4}
                    maxLength={1000}
                    value={formData.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Explain what needs to be fixed, installed, or completed. Mention symptoms, brand, or materials if relevant (minimum 20 characters)."
                    aria-invalid={Boolean(errors.description)}
                    aria-describedby={errors.description ? 'post-job-description-error' : undefined}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#001A41] focus:outline-none focus:ring-2 ${
                      errors.description
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-[#296A4B] focus:ring-[#ABEEC8]'
                    }`}
                  />
                  <FieldError id="post-job-description-error" message={errors.description} />

                  {/* Media placeholder cue (Section 25 of brief) */}
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3.5 py-2 text-xs text-slate-500">
                    <Camera className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>Photos help workers understand your job (photo upload coming soon).</span>
                  </div>
                </div>
              </section>

              {/* SECTION 2: LOCATION (PJ-02) */}
              <section
                id="section-location"
                aria-labelledby="heading-location"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#001A41] text-xs font-bold text-white">
                    2
                  </div>
                  <h2 id="heading-location" className="font-display text-base font-bold text-[#001A41] sm:text-lg">
                    Location Details
                  </h2>
                </div>

                {/* City selection */}
                <div className="mb-5">
                  <label
                    htmlFor="post-job-city-select"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    City / Operating Area <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="post-job-city-select"
                    value={formData.city || ''}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    aria-invalid={Boolean(errors.city)}
                    aria-describedby={errors.city ? 'post-job-city-error' : undefined}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#001A41] focus:outline-none focus:ring-2 ${
                      errors.city
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-[#296A4B] focus:ring-[#ABEEC8]'
                    }`}
                  >
                    <option value="">Select city</option>
                    {activeLocations.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name} ({loc.popularArea || loc.state})
                      </option>
                    ))}
                  </select>
                  <FieldError id="post-job-city-error" message={errors.city} />

                  {/* Notice if unactivated city from query parameter */}
                  {!context.isCityActive && context.rawCity && (
                    <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                      <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Service in {context.rawCity} coming soon:</span> We currently operate active artisan hubs in Lagos, Abuja, Port Harcourt, Ibadan, Enugu, Kano, and Benin City. Please select an active city.
                      </div>
                    </div>
                  )}
                </div>

                {/* Street address */}
                <div className="mb-5">
                  <label
                    htmlFor="post-job-streetAddress-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Street address <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="post-job-streetAddress-input"
                    type="text"
                    value={formData.streetAddress || ''}
                    onChange={(e) => handleFieldChange('streetAddress', e.target.value)}
                    placeholder="e.g. 15 Adeola Odeku Street, Victoria Island"
                    aria-invalid={Boolean(errors.streetAddress)}
                    aria-describedby={errors.streetAddress ? 'post-job-streetAddress-error' : undefined}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#001A41] focus:outline-none focus:ring-2 ${
                      errors.streetAddress
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-200 focus:border-[#296A4B] focus:ring-[#ABEEC8]'
                    }`}
                  />
                  <FieldError id="post-job-streetAddress-error" message={errors.streetAddress} />
                </div>

                {/* Landmark */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="post-job-landmark-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                    >
                      Nearest landmark <span className="text-xs font-normal text-slate-500 lowercase">(optional, recommended)</span>
                    </label>
                    <span className="text-xs text-slate-400">
                      {formData.landmark?.length || 0}/100
                    </span>
                  </div>
                  <input
                    id="post-job-landmark-input"
                    type="text"
                    maxLength={100}
                    value={formData.landmark || ''}
                    onChange={(e) => handleFieldChange('landmark', e.target.value)}
                    placeholder="e.g. Opposite Ebeano Supermarket, Near Total Filling Station, Estate Gate 2"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#001A41] focus:border-[#296A4B] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                  />
                  <FieldError id="post-job-landmark-error" message={errors.landmark} />
                  <p className="mt-1 text-xs text-slate-500">
                    Landmarks ensure artisans reach your job site without confusion or delayed dispatch.
                  </p>
                </div>

                {/* Privacy trust note */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <Lock className="h-3.5 w-3.5 text-[#296A4B] shrink-0" />
                  <span>Exact street address is shared only with the BrainWorker you hire.</span>
                </div>
              </section>

              {/* SECTION 3: SCHEDULE & URGENCY (PJ-03) */}
              <section
                id="section-schedule"
                aria-labelledby="heading-schedule"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#001A41] text-xs font-bold text-white">
                    3
                  </div>
                  <h2 id="heading-schedule" className="font-display text-base font-bold text-[#001A41] sm:text-lg">
                    Schedule & Timing
                  </h2>
                </div>

                <fieldset className="mb-5">
                  <legend className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    When do you need this completed? <span className="text-red-600">*</span>
                  </legend>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { id: 'urgent', label: 'Urgent / Today', desc: 'Emergency repair' },
                      { id: 'tomorrow', label: 'Tomorrow', desc: 'Standard turnaround' },
                      { id: 'flexible', label: 'Flexible', desc: 'Within a week' },
                      { id: 'specific_date', label: 'Specific Date', desc: 'Pick calendar date' },
                    ].map((option) => (
                      <label
                        key={option.id}
                        className={`cursor-pointer rounded-xl border p-3 text-center transition-all flex flex-col justify-center items-center ${
                          formData.urgency === option.id
                            ? 'border-[#001A41] bg-[#001A41]/5 ring-1 ring-[#001A41]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="urgency"
                          value={option.id}
                          checked={formData.urgency === option.id}
                          onChange={() => handleFieldChange('urgency', option.id as CustomerJobDraft['urgency'])}
                          className="sr-only"
                        />
                        <span className="text-xs font-bold text-[#001A41]">{option.label}</span>
                        <span className="text-[11px] text-slate-500 mt-0.5">{option.desc}</span>
                      </label>
                    ))}
                  </div>
                  <FieldError id="post-job-urgency-error" message={errors.urgency} />
                </fieldset>

                {/* Specific Date input if selected */}
                {formData.urgency === 'specific_date' && (
                  <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                    <label
                      htmlFor="post-job-preferredDate-input"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      Preferred service date <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="post-job-preferredDate-input"
                      type="date"
                      min={todayStr}
                      value={formData.preferredDate || ''}
                      onChange={(e) => handleFieldChange('preferredDate', e.target.value)}
                      aria-invalid={Boolean(errors.preferredDate)}
                      aria-describedby={errors.preferredDate ? 'post-job-preferredDate-error' : undefined}
                      className={`w-full rounded-xl border px-3.5 py-2 text-sm text-[#001A41] bg-white focus:outline-none focus:ring-2 ${
                        errors.preferredDate
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                          : 'border-slate-200 focus:border-[#296A4B] focus:ring-[#ABEEC8]'
                      }`}
                    />
                    <FieldError id="post-job-preferredDate-error" message={errors.preferredDate} />
                  </div>
                )}

                {/* Preferred Arrival Window */}
                <div>
                  <label
                    htmlFor="post-job-arrivalWindow-select"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Preferred arrival window
                  </label>
                  <select
                    id="post-job-arrivalWindow-select"
                    value={formData.arrivalWindow || 'Any time'}
                    onChange={(e) => handleFieldChange('arrivalWindow', e.target.value as ArrivalWindow)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-[#001A41] focus:border-[#296A4B] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                  >
                    {ARRIVAL_WINDOWS.map((window) => (
                      <option key={window} value={window}>
                        {window}
                      </option>
                    ))}
                  </select>
                </div>
              </section>

              {/* SECTION 4: BUDGET & RATE (PJ-04) */}
              <section
                id="section-budget"
                aria-labelledby="heading-budget"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#001A41] text-xs font-bold text-white">
                    4
                  </div>
                  <h2 id="heading-budget" className="font-display text-base font-bold text-[#001A41] sm:text-lg">
                    Budget & Pricing
                  </h2>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="post-job-budget-input"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                  >
                    Estimated budget <span className="text-xs font-normal text-slate-500 lowercase">(optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="post-job-budget-input"
                      type="text"
                      value={formData.budget || ''}
                      onChange={(e) => handleFieldChange('budget', e.target.value)}
                      placeholder="e.g. ₦25,000 or ₦20,000 - ₦35,000"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-[#001A41] focus:border-[#296A4B] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Add what you have in mind, or leave blank to receive quotes from professionals.
                  </p>
                </div>

                {/* Budget Type Toggle */}
                <fieldset className="mb-3">
                  <legend className="block text-xs font-semibold text-slate-700 mb-2">
                    Pricing flexibility:
                  </legend>
                  <div className="flex gap-4">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#001A41] cursor-pointer">
                      <input
                        type="radio"
                        name="budgetType"
                        value="negotiable"
                        checked={formData.budgetType === 'negotiable'}
                        onChange={() => handleFieldChange('budgetType', 'negotiable')}
                        className="h-4 w-4 text-[#001A41] focus:ring-[#296A4B]"
                      />
                      Open to discussion / Negotiable
                    </label>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#001A41] cursor-pointer">
                      <input
                        type="radio"
                        name="budgetType"
                        value="fixed"
                        checked={formData.budgetType === 'fixed'}
                        onChange={() => handleFieldChange('budgetType', 'fixed')}
                        className="h-4 w-4 text-[#001A41] focus:ring-[#296A4B]"
                      />
                      Fixed budget
                    </label>
                  </div>
                </fieldset>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <Info className="h-3.5 w-3.5 text-[#296A4B] shrink-0" />
                  <span>Budget estimates are informational and do not represent a final quote or payment.</span>
                </div>
              </section>

              {/* SECTION 5: PREFERRED BRAINWORKER (PJ-05) */}
              <section
                id="section-worker"
                aria-labelledby="heading-worker"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#001A41] text-xs font-bold text-white">
                    5
                  </div>
                  <h2 id="heading-worker" className="font-display text-base font-bold text-[#001A41] sm:text-lg">
                    Preferred BrainWorker <span className="text-xs font-normal text-slate-500">(Optional)</span>
                  </h2>
                </div>

                {selectedWorker ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#001A41] text-sm font-bold text-white">
                          {selectedWorker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#001A41] flex items-center gap-1.5">
                            {selectedWorker.name}
                            <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-[#059669]">
                              Verified
                            </span>
                          </p>
                          <p className="text-xs text-slate-600">{selectedWorker.title}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          handleFieldChange('preferredWorkerId', '');
                          handleFieldChange('preferredWorkerName', '');
                        }}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove preference
                      </button>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 flex items-start gap-1.5 border-t border-emerald-100 pt-2.5">
                      <Info className="h-4 w-4 text-[#059669] shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-800">Preference only:</strong> This artisan will be notified first, but this request remains an open post. No worker is assigned until proposal review.
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600">
                    No specific worker requested. Your job will be open to all verified BrainWorkers matching your category in {formData.city || 'your city'}.
                  </p>
                )}
              </section>

              {/* Mobile Submission Action Bar (PJ-07 / PJ-09) */}
              <div className="lg:hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                {authenticatedUser ? (
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
                    <span>Posting as:</span>
                    <span className="font-bold text-[#001A41]">{authenticatedUser.name}</span>
                  </div>
                ) : (
                  <p className="mb-3 text-xs text-slate-600">
                    Posting as guest. Your complete draft will be saved before signing in.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'pending'}
                  aria-busy={status === 'pending'}
                  className="motion-press inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#001A41] px-6 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8]"
                >
                  {status === 'pending' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting request...
                    </>
                  ) : authenticatedUser ? (
                    'Submit Job Request'
                  ) : (
                    'Save & Sign In to Post Job'
                  )}
                </button>
              </div>
          </div>

          {/* Right Column: Sticky Live Review Summary Card (PJ-06 on desktop) */}
          <div className="lg:col-span-5">
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="font-display text-base font-bold text-[#001A41]">
                  Request Preview
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#296A4B] bg-emerald-50 px-2 py-0.5 rounded-md">
                  Live summary
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Requirement Preview */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-slate-500 font-medium">Job details:</span>
                    <p className="font-bold text-[#001A41] mt-0.5">
                      {formData.title || <span className="text-slate-400 italic">No title entered</span>}
                    </p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Type: {formData.jobType === 'specific_service' ? 'Specific Service' : 'Broader Project'}
                      {formData.category && formData.category !== 'not_sure' && (
                        <span> • {SERVICE_CATEGORIES.find((c) => c.id === formData.category)?.title}</span>
                      )}
                      {formData.category === 'not_sure' && <span> • Category: To be matched</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToField('post-job-title-input')}
                    className="text-xs font-semibold text-[#296A4B] hover:text-[#001A41] flex items-center gap-1"
                    aria-label="Edit job details"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>

                {/* Location Preview */}
                <div className="flex items-start justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-500 font-medium">Location:</span>
                    <p className="font-bold text-[#001A41] mt-0.5">
                      {formData.city || 'City unselected'}
                    </p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      {formData.streetAddress || <span className="text-slate-400 italic">Address pending</span>}
                      {formData.landmark ? ` (${formData.landmark})` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToField('post-job-city-select')}
                    className="text-xs font-semibold text-[#296A4B] hover:text-[#001A41] flex items-center gap-1"
                    aria-label="Edit location"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>

                {/* Schedule Preview */}
                <div className="flex items-start justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-500 font-medium">Schedule:</span>
                    <p className="font-bold text-[#001A41] mt-0.5 capitalize">
                      {formData.urgency?.replace('_', ' ')}
                      {formData.preferredDate ? ` (${formData.preferredDate})` : ''}
                    </p>
                    <p className="text-slate-600 text-[11px] mt-0.5">
                      Arrival: {formData.arrivalWindow || 'Any time'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToField('section-schedule')}
                    className="text-xs font-semibold text-[#296A4B] hover:text-[#001A41] flex items-center gap-1"
                    aria-label="Edit schedule"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>

                {/* Budget Preview */}
                <div className="flex items-start justify-between border-t border-slate-100 pt-3">
                  <div>
                    <span className="text-slate-500 font-medium">Budget:</span>
                    <p className="font-bold text-[#001A41] mt-0.5">
                      {formData.budget ? `${formData.budget} (${formData.budgetType})` : 'Flexible / Open to quotes'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => scrollToField('post-job-budget-input')}
                    className="text-xs font-semibold text-[#296A4B] hover:text-[#001A41] flex items-center gap-1"
                    aria-label="Edit budget"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </div>

                {/* Preferred BrainWorker */}
                {selectedWorker && (
                  <div className="flex items-start justify-between border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-slate-500 font-medium">Preferred Artisan:</span>
                      <p className="font-bold text-[#001A41] mt-0.5">
                        {selectedWorker.name}
                      </p>
                      <p className="text-slate-600 text-[11px]">
                        Informational preference only
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => scrollToField('section-worker')}
                      className="text-xs font-semibold text-[#296A4B] hover:text-[#001A41] flex items-center gap-1"
                      aria-label="Edit preferred worker"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Submission Action (PJ-07 / PJ-09) */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                {authenticatedUser ? (
                  <div className="mb-3 flex items-center justify-between text-xs text-slate-600">
                    <span>Signed in as:</span>
                    <span className="font-bold text-[#001A41] truncate max-w-[180px]">
                      {authenticatedUser.name}
                    </span>
                  </div>
                ) : (
                  <div className="mb-3 rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600">
                    <p className="font-semibold text-[#001A41]">Guest checkout</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your draft is saved automatically before signing in.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'pending'}
                  aria-busy={status === 'pending'}
                  className="motion-press inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#001A41] px-6 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8]"
                >
                  {status === 'pending' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting request...
                    </>
                  ) : authenticatedUser ? (
                    'Submit Job Request'
                  ) : (
                    'Save & Sign In to Post Job'
                  )}
                </button>

                <p className="mt-2 text-center text-[11px] text-slate-400">
                  No payment required to submit a job post.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
