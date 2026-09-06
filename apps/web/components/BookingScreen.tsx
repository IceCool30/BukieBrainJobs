'use client';

import React, { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  HelpCircle,
  Info,
  MapPin,
  ShieldCheck,
  Smartphone,
  UserCheck,
  WifiOff,
} from 'lucide-react';
import {
  getPrototypeSubmissionOutcome,
  validateBookingDraft,
} from '@bukiebrainjobs/validation';
import { NIGERIAN_LOCATIONS } from '../lib/mock/homepage-data';
import {
  DATE_OPTIONS,
  TIME_OPTIONS,
  DateOption,
  TimeOption,
  PaymentPreference,
  buildBookingReturnUrl,
  resolveBookingContext,
} from '../lib/booking';
import {
  getPreservedBookingDraft,
  savePreservedBookingDraft,
  PreservedBookingDraft,
} from '../lib/auth';

type SubmitStatus = 'idle' | 'pending' | 'error' | 'success';

interface BookingFormData {
  city: string;
  streetAddress: string;
  landmark: string;
  dateOption: DateOption;
  customDate: string;
  arrivalWindow: TimeOption;
  jobDetails: string;
  paymentPreference: PaymentPreference;
}

function BookingHeader({ returnUrl }: { returnUrl: string }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={returnUrl}
          className="motion-press inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#001A41] transition-colors hover:text-[#296A4B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#296A4B]"
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
  );
}

function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-semibold text-red-700" role="alert">
      {message}
    </p>
  );
}

export default function BookingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const context = useMemo(() => resolveBookingContext(searchParams), [searchParams]);
  const isContinuation = searchParams.get('bookingContinuation') === '1';
  const [restoredBanner, setRestoredBanner] = useState(false);

  const activeLocations = useMemo(
    () => NIGERIAN_LOCATIONS.filter((loc) => loc.status === 'active'),
    [],
  );

  const [formData, setFormData] = useState<BookingFormData>(() => ({
    city: context.city || '',
    streetAddress: '',
    landmark: '',
    dateOption: 'Tomorrow',
    customDate: '',
    arrivalWindow: TIME_OPTIONS[0],
    jobDetails: context.note || '',
    paymentPreference: 'card',
  }));

  useEffect(() => {
    const draft = getPreservedBookingDraft();
    if (draft) {
      setFormData((prev) => ({
        city: draft.city || prev.city,
        streetAddress: draft.streetAddress || prev.streetAddress,
        landmark: draft.landmark || prev.landmark,
        dateOption: (draft.date as DateOption) || prev.dateOption,
        customDate:
          draft.date && /^\d{4}-\d{2}-\d{2}$/.test(draft.date)
            ? draft.date
            : prev.customDate,
        arrivalWindow: (draft.arrivalWindow as TimeOption) || prev.arrivalWindow,
        jobDetails: draft.jobDescription || prev.jobDetails,
        paymentPreference:
          (draft.paymentPreference as PaymentPreference) || prev.paymentPreference,
      }));
      if (isContinuation) {
        setRestoredBanner(true);
      }
    }
  }, [isContinuation]);

  const handleSaveAndSignIn = () => {
    const effectiveDate =
      formData.dateOption === 'Specific Date'
        ? formData.customDate
        : formData.dateOption;

    const draftToSave: PreservedBookingDraft = {
      service: context.service?.title || context.rawService,
      priceContext: context.price,
      city: formData.city || context.city,
      worker: context.worker,
      streetAddress: formData.streetAddress,
      landmark: formData.landmark,
      date: effectiveDate,
      arrivalWindow: formData.arrivalWindow,
      jobDescription: formData.jobDetails,
      paymentPreference: formData.paymentPreference,
    };

    savePreservedBookingDraft(draftToSave);
    router.push('/login?returnUrl=/book&handoff=1');
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');

  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const isPending = status === 'pending';

  const returnUrl = useMemo(
    () => buildBookingReturnUrl({ service: context.service, city: context.city }),
    [context.service, context.city],
  );

  const todayStr = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }, []);

  const selectedDateLabel = useMemo(() => {
    if (formData.dateOption === 'Specific Date') {
      return formData.customDate || 'Specific date unselected';
    }
    return formData.dateOption;
  }, [formData.dateOption, formData.customDate]);

  useEffect(() => {
    if (status === 'success') {
      confirmationRef.current?.focus();
    }
  }, [status]);

  const updateField = <K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field] && !prev.address && !prev.notes) return prev;
      const next = { ...prev };
      delete next[field];
      if (field === 'streetAddress') delete next.address;
      if (field === 'jobDetails') delete next.notes;
      return next;
    });
    if (status === 'error') {
      setStatus('idle');
    }
  };

  const executeSubmission = () => {
    setStatus('pending');
    window.setTimeout(() => {
      const outcome = getPrototypeSubmissionOutcome({
        mockError: context.mockError,
        online: typeof navigator !== 'undefined' ? navigator.onLine : true,
      });
      setStatus(outcome);
    }, 450);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const effectiveDate =
      formData.dateOption === 'Specific Date'
        ? formData.customDate
        : formData.dateOption;

    const validationErrors = validateBookingDraft({
      streetAddress: formData.streetAddress,
      city: formData.city,
      jobDescription: formData.jobDetails,
      date: effectiveDate,
      arrivalWindow: formData.arrivalWindow,
      paymentPreference: formData.paymentPreference,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Accessible focus to first invalid element
      const firstKey = Object.keys(validationErrors)[0];
      const targetId =
        firstKey === 'streetAddress' || firstKey === 'address'
          ? 'booking-address'
          : firstKey === 'city'
            ? 'booking-city'
            : firstKey === 'jobDescription' || firstKey === 'notes'
              ? 'booking-job-details'
              : firstKey === 'date'
                ? formData.dateOption === 'Specific Date'
                  ? 'booking-specific-date'
                  : 'booking-date-today'
                : undefined;

      if (targetId) {
        requestAnimationFrame(() => {
          document.getElementById(targetId)?.focus();
        });
      }
      return;
    }

    executeSubmission();
  };

  // Safe Recovery Screen for Missing Service Context
  if (context.serviceStatus === 'missing') {
    return (
      <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
        <BookingHeader returnUrl="/services" />
        <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_12px_30px_rgba(0,26,65,0.06)] sm:p-8">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <HelpCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#001A41]">
              No service selected
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Please choose a service from our directory to prepare your booking request.
            </p>
            <div className="mt-6">
              <Link
                href="/services"
                className="motion-press inline-flex min-h-12 items-center justify-center rounded-full bg-[#001A41] px-6 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
              >
                Browse services
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Safe Recovery Screen for Invalid / Unrecognized Service Context
  if (context.serviceStatus === 'invalid') {
    return (
      <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
        <BookingHeader returnUrl="/services" />
        <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-[0_12px_30px_rgba(0,26,65,0.06)] sm:p-8">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-600">
              <Info className="h-6 w-6 text-slate-500" aria-hidden="true" />
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-[#001A41]">
              Service not found
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The service &ldquo;{context.rawService}&rdquo; was not recognized in our active catalog.
              Please select a verified service from our directory to continue.
            </p>
            <div className="mt-6">
              <Link
                href="/services"
                className="motion-press inline-flex min-h-12 items-center justify-center rounded-full bg-[#001A41] px-6 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
              >
                Browse services
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const service = context.service!;

  // Confirmation View
  if (status === 'success') {
    return (
      <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
        <BookingHeader returnUrl={returnUrl} />
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(0,26,65,0.08)] sm:p-8">
            <div className="text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ABEEC8]/40 text-[#296A4B]">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </span>
              <h1
                ref={confirmationRef}
                tabIndex={-1}
                className="mt-4 font-display text-2xl font-extrabold tracking-tight text-[#001A41] sm:text-3xl focus:outline-none"
              >
                Service request prepared
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This is a mock preparation step — no payment was taken and no BrainWorker has been dispatched.
              </p>
            </div>

            {/* Request Summary */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-[#F8F9FF] p-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Prepared Request Summary
              </h2>
              <dl className="mt-4 divide-y divide-slate-200 text-sm">
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-600">Service</dt>
                  <dd className="font-bold text-[#001A41]">{service.title}</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-600">Starting price</dt>
                  <dd className="font-bold text-[#001A41]">{context.price}</dd>
                </div>
                {context.worker && (
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-600">Preferred worker</dt>
                    <dd className="font-semibold text-slate-800">{context.worker}</dd>
                  </div>
                )}
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-600">City</dt>
                  <dd className="font-medium text-slate-800">{formData.city}</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-600">Street address</dt>
                  <dd className="max-w-[60%] text-right font-medium text-slate-800">
                    {formData.streetAddress}
                  </dd>
                </div>
                {formData.landmark && (
                  <div className="flex justify-between py-2.5">
                    <dt className="text-slate-600">Landmark</dt>
                    <dd className="max-w-[60%] text-right font-medium text-slate-800">
                      {formData.landmark}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-600">Preferred date</dt>
                  <dd className="font-medium text-slate-800">{selectedDateLabel}</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-600">Arrival window</dt>
                  <dd className="font-medium text-slate-800">{formData.arrivalWindow}</dd>
                </div>
                <div className="flex justify-between py-2.5">
                  <dt className="text-slate-600">Payment preference</dt>
                  <dd className="font-semibold capitalize text-slate-800">
                    {formData.paymentPreference === 'card'
                      ? 'Card'
                      : formData.paymentPreference === 'transfer'
                        ? 'Bank Transfer'
                        : 'USSD'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={returnUrl}
                className="motion-press inline-flex min-h-12 items-center justify-center rounded-full bg-[#001A41] px-6 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
              >
                Return to services
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  // Normal Form Screen
  return (
    <main className="min-h-screen bg-[#F8F9FF] text-[#0B1C30]">
      <BookingHeader returnUrl={returnUrl} />

      <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Page Title */}
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#296A4B]">
            Step 3 of 4: Request Preparation
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-[#001A41] sm:text-4xl">
            Prepare your service request
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
            Review the service details, provide your location, and set your schedule preferences before submitting your request.
          </p>
        </div>

        {/* Restored Booking Details Banner */}
        {restoredBanner && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-5 text-emerald-950 shadow-sm"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#059669]" aria-hidden="true" />
            <div>
              <p className="font-bold">Your booking details have been restored</p>
              <p className="mt-0.5 text-xs text-emerald-900">
                All your location, scheduling, and job details have been retained from your account login. You can now finalize your request below.
              </p>
            </div>
          </div>
        )}

        {/* Global Submission Error Alert */}
        {status === 'error' && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-5 text-red-900 shadow-sm"
          >
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-red-700" aria-hidden="true" />
            <div className="flex-1">
              <p className="font-bold">We could not submit your booking request.</p>
              <p className="mt-1 text-xs text-red-800">
                Check your connection or try again. All your entered information has been preserved.
              </p>
            </div>
            <button
              type="button"
              onClick={executeSubmission}
              className="motion-press inline-flex min-h-10 items-center rounded-xl bg-red-700 px-3.5 text-xs font-bold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Try again
            </button>
          </div>
        )}

        {/* Inactive or Invalid City Notice */}
        {(context.cityStatus === 'invalid' || context.cityStatus === 'inactive') && (
          <div
            role="status"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-900 shadow-sm"
          >
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
            <p className="text-xs sm:text-sm">
              <strong>Location unavailable:</strong> &ldquo;{context.requestedCity}&rdquo; is currently not available for bookings.
              Please select an active Nigerian location from the city options below.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            {/* Left Form Column */}
            <div className="space-y-6">
              {/* Service Context Card */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-block rounded-md bg-[#EFF4FF] px-2.5 py-1 text-xs font-bold text-[#001A41]">
                      {service.group}
                    </span>
                    <h2 className="mt-2 font-display text-xl font-bold tracking-tight text-[#001A41] sm:text-2xl">
                      {service.title}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 sm:text-sm">
                      {service.description}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#F8F9FF] p-3 text-right">
                    <p className="text-xs font-medium text-slate-600">Starting from</p>
                    <p className="font-display text-lg font-extrabold text-[#001A41] sm:text-xl">
                      {context.price}
                    </p>
                  </div>
                </div>

                {context.worker && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950">
                    <UserCheck className="h-4 w-4 shrink-0 text-[#296A4B]" aria-hidden="true" />
                    <div>
                      <span className="font-bold">Preferred BrainWorker: </span>
                      {context.worker}
                      <span className="block text-[11px] text-emerald-900">
                        (Subject to availability; not an automatic assignment)
                      </span>
                    </div>
                  </div>
                )}

                <p className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-[#296A4B]" aria-hidden="true" />
                  Starting price only. Final pricing is confirmed with your BrainWorker before work begins.
                </p>
              </section>

              {/* Location Section */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6">
                <div className="flex items-center gap-2 text-[#001A41]">
                  <MapPin className="h-5 w-5 text-[#296A4B]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-bold">Where is the job?</h2>
                </div>

                <div className="mt-5 space-y-4">
                  {/* City Select */}
                  <div>
                    <label
                      htmlFor="booking-city"
                      className="block text-xs font-bold tracking-wide text-slate-700 uppercase"
                    >
                      City <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="booking-city"
                      value={formData.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      aria-invalid={Boolean(errors.city)}
                      aria-describedby={errors.city ? 'booking-city-error' : undefined}
                      className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#001A41] focus:ring-2 focus:ring-[#ABEEC8] aria-[invalid=true]:border-red-500"
                    >
                      <option value="">Select an active city</option>
                      {activeLocations.map((loc) => (
                        <option key={loc.id} value={loc.name}>
                          {loc.name} ({loc.state})
                        </option>
                      ))}
                    </select>
                    <FieldError id="booking-city-error" message={errors.city} />
                  </div>

                  {/* Street Address */}
                  <div>
                    <label
                      htmlFor="booking-address"
                      className="block text-xs font-bold tracking-wide text-slate-700 uppercase"
                    >
                      Street address and house number <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="booking-address"
                      type="text"
                      value={formData.streetAddress}
                      onChange={(e) => updateField('streetAddress', e.target.value)}
                      aria-invalid={Boolean(errors.streetAddress || errors.address)}
                      aria-describedby={
                        errors.streetAddress || errors.address
                          ? 'booking-address-error'
                          : undefined
                      }
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                      className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#001A41] focus:ring-2 focus:ring-[#ABEEC8] aria-[invalid=true]:border-red-500"
                    />
                    <FieldError
                      id="booking-address-error"
                      message={errors.streetAddress || errors.address}
                    />
                  </div>

                  {/* Landmark */}
                  <div>
                    <label
                      htmlFor="booking-landmark"
                      className="block text-xs font-bold tracking-wide text-slate-700 uppercase"
                    >
                      Closest landmark or estate gate
                    </label>
                    <input
                      id="booking-landmark"
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => updateField('landmark', e.target.value)}
                      placeholder="e.g. Opposite Ebeano Supermarket, Gate 2"
                      className="mt-1.5 h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#001A41] focus:ring-2 focus:ring-[#ABEEC8]"
                    />
                    <p className="mt-1 text-xs text-slate-600">
                      Your landmark or estate gate helps the BrainWorker find the location easily.
                    </p>
                  </div>
                </div>
              </section>

              {/* Schedule Section */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6">
                <div className="flex items-center gap-2 text-[#001A41]">
                  <Calendar className="h-5 w-5 text-[#296A4B]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-bold">When do you need it?</h2>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-bold tracking-wide text-slate-700 uppercase">
                    Preferred service date <span className="text-red-600">*</span>
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {DATE_OPTIONS.map((option) => {
                      const active = formData.dateOption === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          id={`booking-date-${option.toLowerCase().replace(/\s+/g, '-')}`}
                          onClick={() => updateField('dateOption', option)}
                          aria-pressed={active}
                          className={`motion-press min-h-12 rounded-xl border px-3 text-center text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] ${
                            active
                              ? 'border-[#001A41] bg-[#001A41] text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {formData.dateOption === 'Specific Date' && (
                    <div className="mt-3">
                      <label
                        htmlFor="booking-specific-date"
                        className="block text-xs font-medium text-slate-700"
                      >
                        Choose date
                      </label>
                      <input
                        id="booking-specific-date"
                        type="date"
                        min={todayStr}
                        value={formData.customDate}
                        onChange={(e) => updateField('customDate', e.target.value)}
                        aria-invalid={Boolean(errors.date)}
                        aria-describedby={errors.date ? 'booking-date-error' : undefined}
                        className="mt-1 h-12 w-full max-w-xs rounded-xl border border-slate-300 px-3 text-sm text-slate-800 outline-none focus:border-[#001A41] focus:ring-2 focus:ring-[#ABEEC8] aria-[invalid=true]:border-red-500"
                      />
                    </div>
                  )}
                  <FieldError id="booking-date-error" message={errors.date} />
                </div>

                {/* Arrival Window Selection */}
                <div className="mt-6">
                  <p className="text-xs font-bold tracking-wide text-slate-700 uppercase">
                    Arrival window <span className="text-red-600">*</span>
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {TIME_OPTIONS.map((time) => {
                      const active = formData.arrivalWindow === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          onClick={() => updateField('arrivalWindow', time)}
                          aria-pressed={active}
                          className={`motion-press flex min-h-12 items-center justify-start gap-2.5 rounded-xl border p-3 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] ${
                            active
                              ? 'border-[#296A4B] bg-emerald-50/60 text-[#001A41] ring-1 ring-[#296A4B]'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <Clock className={`h-4 w-4 shrink-0 ${active ? 'text-[#296A4B]' : 'text-slate-600'}`} aria-hidden="true" />
                          <span>{time}</span>
                        </button>
                      );
                    })}
                  </div>
                  <FieldError id="booking-time-error" message={errors.arrivalWindow} />
                </div>
              </section>

              {/* Job Details Section */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6">
                <div className="flex items-center gap-2 text-[#001A41]">
                  <FileText className="h-5 w-5 text-[#296A4B]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-bold">Job details</h2>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="booking-job-details"
                    className="block text-xs font-bold tracking-wide text-slate-700 uppercase"
                  >
                    Job details <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="booking-job-details"
                    rows={4}
                    value={formData.jobDetails}
                    onChange={(e) => updateField('jobDetails', e.target.value)}
                    aria-invalid={Boolean(errors.jobDetails || errors.notes)}
                    aria-describedby={
                      errors.jobDetails || errors.notes
                        ? 'booking-job-details-error'
                        : undefined
                    }
                    placeholder="Tell the BrainWorker what you need help with. Describe the issue, brand/model, or requirements."
                    className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 outline-none transition-colors focus:border-[#001A41] focus:ring-2 focus:ring-[#ABEEC8] aria-[invalid=true]:border-red-500"
                  />
                  <FieldError
                    id="booking-job-details-error"
                    message={errors.jobDescription || errors.jobDetails || errors.notes}
                  />
                  <p className="mt-1 text-xs text-slate-600">
                    A clear description helps the BrainWorker prepare tools and provide accurate estimates.
                  </p>
                </div>
              </section>

              {/* Payment Preference Section */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6">
                <div className="flex items-center gap-2 text-[#001A41]">
                  <CreditCard className="h-5 w-5 text-[#296A4B]" aria-hidden="true" />
                  <h2 className="font-display text-lg font-bold">Payment preference</h2>
                </div>

                <p className="mt-2 text-xs text-slate-600">
                  This is a payment preference for the later payment step. No payment is taken here.
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Payment preference">
                  {[
                    { id: 'card', label: 'Card', icon: CreditCard, desc: 'Debit / Credit card' },
                    { id: 'transfer', label: 'Bank Transfer', icon: Building2, desc: 'Direct bank transfer' },
                    { id: 'ussd', label: 'USSD', icon: Smartphone, desc: 'Mobile bank code' },
                  ].map((method) => {
                    const active = formData.paymentPreference === method.id;
                    const Icon = method.icon;
                    return (
                      <label
                        key={method.id}
                        className={`motion-press flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors ${
                          active
                            ? 'border-[#296A4B] bg-emerald-50/50 ring-1 ring-[#296A4B]'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentPreference"
                          value={method.id}
                          checked={active}
                          onChange={() => updateField('paymentPreference', method.id as PaymentPreference)}
                          className="mt-0.5 h-4 w-4 text-[#296A4B] focus:ring-[#ABEEC8]"
                        />
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#296A4B]" aria-hidden="true" />
                        <div>
                          <p className="text-xs font-bold text-[#001A41]">{method.label}</p>
                          <p className="text-[11px] text-slate-600">{method.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right Summary & Submit Column */}
            <div className="space-y-6">
              <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_12px_30px_rgba(0,26,65,0.05)] sm:p-6 lg:sticky lg:top-6">
                <h2 className="font-display text-lg font-bold text-[#001A41]">
                  Review your request
                </h2>

                <div className="mt-4 space-y-3 rounded-xl bg-[#F8F9FF] p-4 text-xs sm:text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Service</span>
                    <span className="font-bold text-[#001A41]">{service.title}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Starting price</span>
                    <span className="font-bold text-[#001A41]">{context.price}</span>
                  </div>

                  {context.worker && (
                    <div className="flex justify-between border-t border-slate-200/80 pt-2 text-slate-600">
                      <span>Preferred worker</span>
                      <span className="font-semibold text-[#001A41]">{context.worker}</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-slate-200/80 pt-2 text-slate-600">
                    <span>Location</span>
                    <span className="font-semibold text-[#001A41]">
                      {formData.city || 'Not set'}
                    </span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Schedule</span>
                    <span className="font-semibold text-[#001A41]">{selectedDateLabel}</span>
                  </div>

                  <div className="flex justify-between text-slate-600">
                    <span>Payment preference</span>
                    <span className="font-semibold capitalize text-[#001A41]">
                      {formData.paymentPreference}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs leading-relaxed text-emerald-950">
                  <p className="font-bold">No commitment or payment required</p>
                  <p className="mt-0.5 text-emerald-900">
                    Submitting this intake form sends your job details for BrainWorker preparation. You confirm final pricing before any work starts.
                  </p>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isPending}
                  className="motion-press mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#001A41] px-5 text-sm font-bold text-white transition-colors hover:bg-[#000F2D] disabled:cursor-wait disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2"
                >
                  {isPending ? 'Submitting request...' : 'Submit service request'}
                </button>

                <button
                  type="button"
                  onClick={handleSaveAndSignIn}
                  className="motion-press mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 text-sm font-bold text-[#001A41] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#001A41]"
                >
                  Save & sign in with account
                </button>

                <div className="mt-4 text-center">
                  <Link
                    href={returnUrl}
                    className="inline-flex min-h-10 items-center text-xs font-semibold text-slate-600 transition-colors hover:text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
                  >
                    Return to services
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
