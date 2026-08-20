'use client';

import React, { useState } from 'react';
import { X, Briefcase, CheckCircle2, Lock } from 'lucide-react';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostJobModal({ isOpen, onClose }: PostJobModalProps) {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EEFF] text-[#001A41] text-xs font-bold">
                <Briefcase className="w-3.5 h-3.5 text-[#296A4B]" />
                Service Request
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0B1C30]">
                Post a Job Request
              </h3>
              <p className="text-xs text-slate-500">
                Describe the service you need and receive competitive quotes from verified BrainWorkers in your area.
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service or Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50kVA Generator Maintenance and Oil Change"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#001A41]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City or Location</label>
                  <select className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white">
                    <option>Lagos State</option>
                    <option>Abuja FCT</option>
                    <option>Port Harcourt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. N15,000 – N25,000"
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the issue or specific requirements..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#296A4B] shrink-0" />
                <span>Secure Escrow: No upfront payment required until you accept a quote.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-all shadow-md"
              >
                Submit Request
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-[#ABEEC8]/40 text-[#2E6E4F] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#0B1C30]">
              Request Submitted Successfully!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Verified BrainWorkers in your area are being notified. You will receive competitive quotes shortly via SMS and in-app notification.
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
