'use client';

import React, { useState } from 'react';
import { X, BellRing, CheckCircle2, AlertCircle } from 'lucide-react';
import { NigerianLocation } from '../../lib/mock/homepage-data';

interface LocationNoticeModalProps {
  location: NigerianLocation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function LocationNoticeModal({ location, isOpen, onClose }: LocationNoticeModalProps) {
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !location) return null;

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotified(true);
  };

  const handleReset = () => {
    setNotified(false);
    setEmail('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/60 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="location-modal-title"
    >
      <div 
        className="bg-white rounded-[2rem] max-w-md w-full shadow-2xl border border-slate-100 p-6 sm:p-8 relative text-[#001A41]"
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

        {location.status === 'coming_soon' ? (
          !notified ? (
            <div>
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 border border-amber-200">
                <BellRing className="w-7 h-7" />
              </div>
              <h2 id="location-modal-title" className="font-display font-bold text-2xl text-[#001A41]">
                Coming Soon to {location.city}!
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                BukieBrainJobs is actively onboarding verified artisans and completing BukiePassport trade assessments in <strong className="text-[#001A41]">{location.city}, {location.state} State</strong>.
              </p>

              <form onSubmit={handleNotifySubmit} className="mt-6 space-y-3">
                <label className="form-label font-semibold text-xs text-slate-700">
                  Notify me when services launch in {location.city}:
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input text-sm"
                />
                <button
                  type="submit"
                  className="btn-emerald w-full py-3 font-semibold text-sm shadow-md"
                >
                  Notify Me First
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-[#296A4B] mx-auto mb-3" />
              <h3 className="font-display font-bold text-xl text-[#001A41]">You&apos;re on the VIP List!</h3>
              <p className="text-slate-600 text-sm mt-1">
                We will email <strong className="text-[#001A41]">{email}</strong> as soon as verified artisans are live in {location.city}.
              </p>
              <button
                onClick={handleReset}
                className="btn-primary mt-6 px-6 py-2.5 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          )
        ) : (
          <div>
            <div className="w-14 h-14 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 id="location-modal-title" className="font-display font-bold text-2xl text-[#001A41]">
              Location Not Yet Supported
            </h2>
            <p className="text-slate-600 text-sm mt-2 leading-relaxed">
              We currently operate across active state capitals in Nigeria (Lagos, Abuja FCT, Port Harcourt, Ibadan, Benin City, Enugu, Abeokuta).
            </p>
            <div className="mt-6">
              <button
                onClick={handleReset}
                className="btn-emerald w-full py-3 font-semibold text-sm"
              >
                Browse Active Hubs (Lagos / Abuja)
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
