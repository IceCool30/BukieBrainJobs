'use client';

import { getPrototypeSubmissionOutcome, validatePostJobDraft } from '@bukiebrainjobs/validation';
import { Briefcase, CheckCircle2, Lock, WifiOff, X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { NIGERIAN_LOCATIONS } from '../../lib/mock/homepage-data';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type JobDraft = { budget: string; city: string; description: string; title: string };
type SubmitStatus = 'idle' | 'pending' | 'error' | 'success';

const emptyJobDraft: JobDraft = { budget: '', city: '', description: '', title: '' };

export default function PostJobModal({ isOpen, onClose }: PostJobModalProps) {
  const [draft, setDraft] = useState(emptyJobDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const titleRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => titleRef.current?.focus(), 0);
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

  const update = (field: keyof JobDraft, value: string) => {
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
    const nextErrors = validatePostJobDraft(draft);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      requestAnimationFrame(() => document.getElementById(`post-job-${Object.keys(nextErrors)[0]}-input`)?.focus());
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
    setDraft(emptyJobDraft);
    onClose();
  };

  const invalid = (field: keyof JobDraft) => Boolean(errors[field]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001A41]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="post-job-title">
      <div className="relative max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <button onClick={onClose} className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]" type="button" aria-label="Close job details"><X className="h-5 w-5" /></button>
        {status === 'success' ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ABEEC8]/40 text-[#2E6E4F]"><CheckCircle2 className="h-7 w-7" /></div>
            <h3 ref={successRef} tabIndex={-1} className="font-display text-xl font-bold text-[#0B1C30] focus:outline-none" id="post-job-title">Your job has been posted</h3>
            <p className="mx-auto max-w-sm text-xs text-slate-600">BrainWorkers can now review the work you need done.</p>
            <button onClick={finish} className="min-h-11 rounded-xl bg-[#001A41] px-6 py-2.5 text-xs font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8]">Done</button>
          </div>
        ) : (
          <>
            <div className="space-y-2 pr-10">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#E5EEFF] px-3 py-1 text-xs font-bold text-[#001A41]"><Briefcase className="h-3.5 w-3.5 text-[#296A4B]" />Job details</div>
              <h3 id="post-job-title" className="font-display text-xl font-bold text-[#0B1C30] sm:text-2xl">Post a job</h3>
              <p className="text-xs text-slate-500">Tell us what you need done, where it is, and the budget you have in mind.</p>
            </div>
            {status === 'error' && <div className="mt-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-900" role="alert"><WifiOff className="h-4 w-4 shrink-0" />You are offline. Check your connection, then try again.</div>}
            <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
              <div><label htmlFor="post-job-title-input" className="mb-1 block text-xs font-semibold text-slate-700">Service or job title</label><input ref={titleRef} id="post-job-title-input" value={draft.title} onChange={(event) => update('title', event.target.value)} aria-invalid={invalid('title')} aria-describedby={invalid('title') ? 'post-job-title-error' : undefined} placeholder="e.g. 50kVA Generator Maintenance and Oil Change" className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#001A41] aria-[invalid=true]:border-red-500" />{errors.title && <p id="post-job-title-error" className="mt-1 text-xs font-medium text-red-700">{errors.title}</p>}</div>
              <div className="grid grid-cols-2 gap-3"><div><label htmlFor="post-job-city-input" className="mb-1 block text-xs font-semibold text-slate-700">City</label><select id="post-job-city-input" value={draft.city} onChange={(event) => update('city', event.target.value)} aria-invalid={invalid('city')} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs aria-[invalid=true]:border-red-500"><option value="">Choose a city</option>{NIGERIAN_LOCATIONS.map((location) => <option key={location.id} value={location.name}>{location.name}</option>)}</select>{errors.city && <p className="mt-1 text-xs font-medium text-red-700">{errors.city}</p>}</div><div><label htmlFor="post-job-budget-input" className="mb-1 block text-xs font-semibold text-slate-700">Budget range</label><input id="post-job-budget-input" value={draft.budget} onChange={(event) => update('budget', event.target.value)} aria-invalid={invalid('budget')} placeholder="e.g. ₦15,000 to ₦25,000" className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#001A41] aria-[invalid=true]:border-red-500" />{errors.budget && <p className="mt-1 text-xs font-medium text-red-700">{errors.budget}</p>}</div></div>
              <div><label htmlFor="post-job-description-input" className="mb-1 block text-xs font-semibold text-slate-700">What needs to be done?</label><textarea id="post-job-description-input" value={draft.description} onChange={(event) => update('description', event.target.value)} aria-invalid={invalid('description')} rows={3} placeholder="Describe the work, issue, and any useful requirements." className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#001A41] aria-[invalid=true]:border-red-500" />{errors.description && <p className="mt-1 text-xs font-medium text-red-700">{errors.description}</p>}</div>
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600"><Lock className="h-4 w-4 shrink-0 text-[#296A4B]" />Clear job details help the right BrainWorkers understand what you need.</div>
              <button type="submit" disabled={status === 'pending'} className="min-h-12 w-full rounded-xl bg-[#001A41] px-4 text-xs font-bold text-white shadow-md transition-colors hover:bg-[#000F2D] disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8]">{status === 'pending' ? 'Posting your job...' : 'Post a job'}</button>
              {status === 'error' && <button type="button" onClick={retry} className="min-h-11 w-full rounded-xl border border-[#001A41] px-4 text-xs font-bold text-[#001A41] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8]">Try again</button>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
