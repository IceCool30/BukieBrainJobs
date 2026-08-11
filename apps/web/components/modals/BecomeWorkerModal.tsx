'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Award, Wallet, ArrowRight } from 'lucide-react';

interface BecomeWorkerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BecomeWorkerModal({ isOpen, onClose }: BecomeWorkerModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [skillTrade, setSkillTrade] = useState('Generator & Electrical Servicing');
  const [city, setCity] = useState('Ikeja, Lagos');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep(1);
    setFullName('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/60 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="become-worker-modal-title"
    >
      <div 
        className="bg-white rounded-[2rem] max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 relative text-[#001A41]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors focus:ring-2 focus:ring-[#001A41]"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-[#296A4B] uppercase tracking-wider bg-[#EEFBF3] px-3 py-1 rounded-full">
                Secondary Path • Become a BrainWorker
              </span>
              <h2 id="become-worker-modal-title" className="font-display font-extrabold text-2xl text-[#001A41] mt-2">
                Join Nigeria&apos;s #1 Verified Artisan Platform
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Earn consistent income, set your own rates, and receive instant payouts directly to your Nigerian bank account.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              <div className="bg-[#F8F9FF] p-3.5 rounded-xl border border-slate-100 text-center">
                <ShieldCheck className="w-6 h-6 text-[#296A4B] mx-auto mb-1.5" />
                <div className="font-bold text-xs text-[#001A41]">BukiePassport</div>
                <div className="text-[11px] text-slate-500">Biometric NIN & BVN vetting badge</div>
              </div>
              <div className="bg-[#F8F9FF] p-3.5 rounded-xl border border-slate-100 text-center">
                <Wallet className="w-6 h-6 text-[#296A4B] mx-auto mb-1.5" />
                <div className="font-bold text-xs text-[#001A41]">Instant Payouts</div>
                <div className="text-[11px] text-slate-500">Direct to your bank account upon approval</div>
              </div>
              <div className="bg-[#F8F9FF] p-3.5 rounded-xl border border-slate-100 text-center">
                <Award className="w-6 h-6 text-[#296A4B] mx-auto mb-1.5" />
                <div className="font-bold text-xs text-[#001A41]">Set Your Rates</div>
                <div className="text-[11px] text-slate-500">Charge per hour or per project flat fee</div>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-4">
              <div>
                <label className="form-label font-semibold text-xs text-slate-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Babatunde Ogunlesi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label font-semibold text-xs text-slate-700">
                    Primary Trade / Skill *
                  </label>
                  <select
                    value={skillTrade}
                    onChange={(e) => setSkillTrade(e.target.value)}
                    className="form-input text-sm bg-white"
                  >
                    <option value="Generator & Electrical Servicing">Generator & Electrical</option>
                    <option value="AC & Refrigeration Repair">AC & Refrigeration</option>
                    <option value="Plumbing & Water Systems">Plumbing & Water Tanks</option>
                    <option value="TV Mounting & DSTV tracking">TV & Electronics</option>
                    <option value="Carpentry & Wardrobes">Carpentry & Furniture</option>
                    <option value="House Cleaning & Fumigation">Cleaning & Fumigation</option>
                  </select>
                </div>

                <div>
                  <label className="form-label font-semibold text-xs text-slate-700">
                    Operating City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input text-sm bg-white"
                  >
                    <option value="Ikeja, Lagos">Ikeja, Lagos</option>
                    <option value="Lekki / Victoria Island, Lagos">Lekki / VI, Lagos</option>
                    <option value="Maitama / Wuse, Abuja">Abuja (FCT)</option>
                    <option value="GRA, Port Harcourt">Port Harcourt</option>
                    <option value="Bodija, Ibadan">Ibadan</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="btn-emerald w-full py-3 font-semibold text-sm shadow-md flex items-center justify-center gap-2"
              >
                Proceed to BukiePassport Onboarding (Mock) <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#EEFBF3] text-[#296A4B] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#ABEEC8]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-[#001A41]">
              Registration Application Initiated!
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mt-2 leading-relaxed">
              Welcome, <strong className="text-[#001A41]">{fullName || 'BrainWorker'}</strong>! In production, you would now submit your NIN or BVN for instant BukiePassport Tier 1 verification.
            </p>

            <div className="my-6 bg-[#F8F9FF] border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left space-y-1">
              <div className="font-semibold text-[#001A41] mb-1">BukiePassport Onboarding Requirements:</div>
              <div>✔ Biometric NIN & BVN Match</div>
              <div>✔ Physical Address Verification Check</div>
              <div>✔ Trade Skill Assessment / Past Work Proof</div>
            </div>

            <button
              onClick={handleReset}
              className="btn-primary px-8 py-3 text-sm font-semibold shadow"
            >
              Back to Customer Homepage
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
