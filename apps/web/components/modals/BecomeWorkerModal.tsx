'use client';

import React, { useState } from 'react';
import { X, UserCheck, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface BecomeWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeWorkerModal({ isOpen, onClose }: BecomeWorkerModalProps) {
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
                <UserCheck className="w-3.5 h-3.5 text-[#296A4B]" />
                BrainWorker Registration
              </div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-[#0B1C30]">
                Become a BrainWorker
              </h3>
              <p className="text-xs text-slate-500">
                Submit your profile for comprehensive NIN and BVN verification and begin receiving service requests.
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Adebayo"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Trade or Service</label>
                  <select className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white">
                    <option>Generator Servicing</option>
                    <option>AC Repair and Gas Refill</option>
                    <option>Plumbing and Piping</option>
                    <option>Electrical and Solar</option>
                    <option>Cleaning and Haulage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Operating City</label>
                  <select className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white">
                    <option>Lagos State</option>
                    <option>Abuja FCT</option>
                    <option>Port Harcourt</option>
                    <option>Ibadan Soon</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number WhatsApp</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 801 234 5678"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#EFF4FF] border border-[#CBDBF5] text-[11px] text-[#0B1C30] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#296A4B] shrink-0" />
                <span>BukiePassport verification includes government photo ID and BVN confirmation.</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-[#296A4B] hover:bg-[#1F523A] text-white text-xs font-bold rounded-full transition-all shadow-md"
              >
                Submit Application
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-[#ABEEC8]/40 text-[#2E6E4F] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#0B1C30]">
              Application Received!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Our verification team will review your submission and contact you via WhatsApp to schedule your BukiePassport verification.
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
