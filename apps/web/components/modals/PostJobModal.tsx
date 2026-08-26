'use client';

import React, { useEffect, useState } from 'react';
import { X, Briefcase, CheckCircle2, Lock } from 'lucide-react';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostJobModal({ isOpen, onClose }: PostJobModalProps) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001A41]/65 p-4" role="dialog" aria-modal="true" aria-labelledby="post-job-title">
      <div className="relative w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#296A4B]"
          type="button"
          aria-label="Close job details"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EEFF] text-[#001A41] text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5 text-[#296A4B]" />
                Job details
              </div>
              <h3 id="post-job-title" className="font-display font-bold text-xl sm:text-2xl text-[#0B1C30]">
                Prepare job details
              </h3>
              <p className="text-xs text-slate-500">
                Tell us what you need done, then review the details before you move ahead.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div>
                <label htmlFor="post-job-title-input" className="mb-1 block text-xs font-semibold text-slate-700">
                  Service or job title
                </label>
                <input
                  id="post-job-title-input"
                  type="text"
                  required
                  placeholder="e.g. 50kVA Generator Maintenance and Oil Change"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#001A41]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="post-job-city" className="mb-1 block text-xs font-semibold text-slate-700">City</label>
                  <select id="post-job-city" className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white">
                    <option>Lagos State</option>
                    <option>Abuja FCT</option>
                    <option>Port Harcourt</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="post-job-budget" className="mb-1 block text-xs font-semibold text-slate-700">Budget range</label>
                  <input id="post-job-budget"
                    type="text"
                    placeholder="e.g. ₦15,000 to ₦25,000"
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="post-job-description" className="mb-1 block text-xs font-semibold text-slate-700">What needs to be done?</label>
                <textarea id="post-job-description"
                  rows={3}
                  placeholder="Describe the work, issue, and any useful requirements."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#296A4B] shrink-0" />
                <span>This page prepares your job details only. It does not post a job yet.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-all shadow-md"
              >
                Prepare job details
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-[#ABEEC8]/40 text-[#2E6E4F] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#0B1C30]">
              Your job details are ready to review
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Keep these details close while you decide what to do next.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                onClose();
              }}
              className="px-6 py-2.5 bg-[#001A41] text-white text-xs font-bold rounded-full"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
