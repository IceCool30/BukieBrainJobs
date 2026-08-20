'use client';

import React from 'react';
import { X, ShieldCheck, UserCheck, CheckCircle2, EyeOff } from 'lucide-react';

interface BukiePassportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BukiePassportModal({ isOpen, onClose }: BukiePassportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EEFF] text-[#001A41] text-xs font-bold border border-[#CBDBF5]">
            <ShieldCheck className="w-4 h-4 text-[#296A4B]" />
            <span>BukiePassport Verification Standard</span>
          </div>
          <h3 className="font-display font-bold text-2xl text-[#0B1C30]">
            How Every BrainWorker is Vetted
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Every BrainWorker entering your home or office completes the BukiePassport credentialing process.
          </p>
        </div>

        {/* Comparison Cards: Tier 1 vs Tier 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tier 1 Box */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tier 1: Identity
              </span>
              <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full">
                Basic
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B] shrink-0 mt-0.5" />
                <span>Govt Photo ID (NIN / Voters / Driver&apos;s)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B] shrink-0 mt-0.5" />
                <span>BVN Confirmation &amp; Name Match</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B] shrink-0 mt-0.5" />
                <span>Verified Phone &amp; WhatsApp OTP</span>
              </li>
            </ul>
          </div>

          {/* Tier 2 Box (Active standard for bookings) */}
          <div className="bg-[#EFF4FF] p-5 rounded-2xl border-2 border-[#296A4B] space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#001A41] uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-[#296A4B]" />
                Tier 2: Biometric Vetted
              </span>
              <span className="text-[10px] font-bold bg-[#ABEEC8] text-[#2E6E4F] px-2 py-0.5 rounded-full">
                Active for Jobs
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B] shrink-0 mt-0.5" />
                <span>Live NIMC Facial &amp; Biometric Match</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B] shrink-0 mt-0.5" />
                <span>Physical Residential Address Audit</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B] shrink-0 mt-0.5" />
                <span>Trade Skill &amp; Tooling Proficiency Exam</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B] shrink-0 mt-0.5" />
                <span>Guarantor &amp; Background Clearance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Privacy Seal Notice */}
        <div className="p-4 rounded-xl bg-[#001A41] text-white flex items-center gap-3 text-xs">
          <EyeOff className="w-5 h-5 text-[#ABEEC8] shrink-0" />
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-white">Privacy Guarantee:</strong> Sensitive records (BVN, NIN, and home addresses) are securely encrypted and never disclosed to customers or third parties.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-colors"
          >
            Got It, Thanks
          </button>
        </div>
      </div>
    </div>
  );
}
