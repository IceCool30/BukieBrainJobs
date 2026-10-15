'use client';

import { getPrototypeSubmissionOutcome, validateBrainWorkerDraft } from '@bukiebrainjobs/validation';
import { CheckCircle2, ShieldCheck, UserCheck, WifiOff, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { NIGERIAN_LOCATIONS, SERVICE_CATEGORIES } from '../../lib/mock/homepage-data';

interface BecomeWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type BrainWorkerDraft = { city: string; fullName: string; phone: string; service: string };
type SubmitStatus = 'idle' | 'pending' | 'error' | 'success';

const emptyBrainWorkerDraft: BrainWorkerDraft = { city: '', fullName: '', phone: '', service: '' };

export default function BecomeWorkerModal({ isOpen, onClose }: BecomeWorkerModalProps) {
  const [draft, setDraft] = useState(emptyBrainWorkerDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const nameRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => nameRef.current?.focus(), 0);
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (status === 'success') successRef.current?.focus();
  }, [status]);

  if (!isOpen) return null;

  const update = (field: keyof BrainWorkerDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    if (status === 'error') setStatus('idle');
  };

  const finishSubmission = () => {
    const mockError = new URLSearchParams(window.location.search).get('mockError') === '1';
    window.setTimeout(() => setStatus(getPrototypeSubmissionOutcome({ mockError, online: navigator.onLine })), 500);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateBrainWorkerDraft(draft);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      requestAnimationFrame(() => document.getElementById(`become-brainworker-${Object.keys(nextErrors)[0]}-input`)?.focus());
      return;
    }
    setStatus('pending');
    finishSubmission();
  };

  const retry = () => {
    setStatus('pending');
    finishSubmission();
  };

  const finish = () => {
    setStatus('idle');
    setErrors({});
    setDraft(emptyBrainWorkerDraft);
    onClose();
  };

  const invalid = (field: keyof BrainWorkerDraft) => Boolean(errors[field]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--modal-overlay)] backdrop-blur-xs p-4 transition-colors"
      role="dialog"
      aria-modal="true"
      aria-labelledby="become-brainworker-title"
    >
      <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--lead)] bg-[var(--card-bg)] text-[var(--text-main)] p-6 shadow-2xl sm:p-8 transition-colors">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--tag-bg)] hover:text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] transition-colors"
          type="button"
          aria-label="Close BrainWorker details"
        >
          <X className="h-5 w-5" />
        </button>
        {status === 'success' ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-green)]/15 text-[var(--brand-green)]">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3
              ref={successRef}
              tabIndex={-1}
              className="font-display text-xl font-bold text-[var(--text-main)] focus:outline-none"
              id="become-brainworker-title"
            >
              Your details are ready
            </h3>
            <p className="mx-auto max-w-sm text-xs text-[var(--text-muted)] leading-relaxed">
              Review your details, then continue to the next step.
            </p>
            <button
              onClick={finish}
              className="min-h-11 rounded-xl bg-[var(--brand-green)] px-6 py-2.5 text-xs font-bold text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] transition-all"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2 pr-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tag-bg)] border border-[var(--tag-border)] px-3 py-1 text-xs font-bold text-[var(--text-main)]">
                <UserCheck className="h-3.5 w-3.5 text-[var(--brand-green)]" />
                BrainWorker details
              </div>
              <h3
                id="become-brainworker-title"
                className="font-display text-xl font-bold text-[var(--text-main)] sm:text-2xl tracking-tight"
              >
                Become a BrainWorker
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Start with the service you offer and where you work.
              </p>
            </div>
            {status === 'error' && (
              <div
                className="mt-4 flex gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs leading-5 text-red-600 dark:text-red-400"
                role="alert"
              >
                <WifiOff className="h-4 w-4 shrink-0" />
                You are offline. Check your connection, then try again.
              </div>
            )}
            <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
              <div>
                <label
                  htmlFor="become-brainworker-fullName-input"
                  className="mb-1.5 block text-xs font-semibold text-[var(--text-main)]"
                >
                  Full name
                </label>
                <input
                  ref={nameRef}
                  id="become-brainworker-fullName-input"
                  value={draft.fullName}
                  onChange={(event) => update('fullName', event.target.value)}
                  aria-invalid={invalid('fullName')}
                  placeholder="e.g. Babatunde Adebayo"
                  className="w-full rounded-xl border border-[var(--rule)] bg-[var(--bg)] p-3 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] aria-[invalid=true]:border-red-500 transition-colors"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.fullName}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="become-brainworker-service-input"
                    className="mb-1.5 block text-xs font-semibold text-[var(--text-main)]"
                  >
                    Service you offer
                  </label>
                  <select
                    id="become-brainworker-service-input"
                    value={draft.service}
                    onChange={(event) => update('service', event.target.value)}
                    aria-invalid={invalid('service')}
                    className="w-full rounded-xl border border-[var(--rule)] bg-[var(--bg)] p-3 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] aria-[invalid=true]:border-red-500 transition-colors"
                  >
                    <option value="" className="bg-[var(--card-bg)] text-[var(--text-main)]">Choose a service</option>
                    {SERVICE_CATEGORIES.map((service) => (
                      <option key={service.id} value={service.title} className="bg-[var(--card-bg)] text-[var(--text-main)]">
                        {service.title}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className="mt-1 text-xs font-medium text-red-500">{errors.service}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="become-brainworker-city-input"
                    className="mb-1.5 block text-xs font-semibold text-[var(--text-main)]"
                  >
                    City
                  </label>
                  <select
                    id="become-brainworker-city-input"
                    value={draft.city}
                    onChange={(event) => update('city', event.target.value)}
                    aria-invalid={invalid('city')}
                    className="w-full rounded-xl border border-[var(--rule)] bg-[var(--bg)] p-3 text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] aria-[invalid=true]:border-red-500 transition-colors"
                  >
                    <option value="" className="bg-[var(--card-bg)] text-[var(--text-main)]">Choose a city</option>
                    {NIGERIAN_LOCATIONS.map((location) => (
                      <option key={location.id} value={location.name} className="bg-[var(--card-bg)] text-[var(--text-main)]">
                        {location.name}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-xs font-medium text-red-500">{errors.city}</p>
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="become-brainworker-phone-input"
                  className="mb-1.5 block text-xs font-semibold text-[var(--text-main)]"
                >
                  Phone number (WhatsApp)
                </label>
                <input
                  id="become-brainworker-phone-input"
                  type="tel"
                  value={draft.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  aria-invalid={invalid('phone')}
                  placeholder="+234 801 234 5678"
                  className="w-full rounded-xl border border-[var(--rule)] bg-[var(--bg)] p-3 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] aria-[invalid=true]:border-red-500 transition-colors"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs font-medium text-red-500">{errors.phone}</p>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-[var(--lead)] bg-[var(--tag-bg)] p-3 text-[11px] text-[var(--text-muted)]">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--brand-green)]" />
                <span>A clear profile helps customers understand your service and location.</span>
              </div>
              <button
                type="submit"
                disabled={status === 'pending'}
                className="min-h-12 w-full rounded-xl bg-[var(--brand-green)] px-4 text-xs font-bold text-white shadow-md transition-colors hover:opacity-90 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
              >
                {status === 'pending' ? 'Saving your details...' : 'Continue'}
              </button>
              {status === 'error' && (
                <button
                  type="button"
                  onClick={retry}
                  className="min-h-11 w-full rounded-xl border border-[var(--lead)] bg-[var(--card-bg)] px-4 text-xs font-bold text-[var(--text-main)] hover:bg-[var(--card-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)] transition-colors"
                >
                  Try again
                </button>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
