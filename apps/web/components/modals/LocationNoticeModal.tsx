'use client';

import React, { useState } from 'react';
import { X, MapPin, Bell, CheckCircle2 } from 'lucide-react';
import { NigerianLocation } from '../../lib/mock/homepage-data';

interface LocationNoticeModalProps {
  location: NigerianLocation | null;
  onClose: () => void;
}

export default function LocationNoticeModal({ location, onClose }: LocationNoticeModalProps) {
  const [notified, setNotified] = useState(false);

  if (!location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 border border-slate-200 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {!notified ? (
          <>
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <MapPin className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Service Availability
              </span>
              <h3 className="font-display font-bold text-xl text-[#0B1C30]">
                Coming Soon to {location.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We are currently onboarding and verifying professionals in {location.name}, {location.state}. Full service will be available shortly.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotified(true);
              }}
              className="space-y-3 pt-2"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Get Notified When We Launch in {location.name}
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4 text-[#ABEEC8]" />
                <span>Notify Me When Available</span>
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 bg-[#ABEEC8]/40 text-[#2E6E4F] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-[#0B1C30]">
              You are on the Priority List!
            </h3>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              We will notify you as soon as verified professionals become available in {location.name}.
            </p>
            <button
              onClick={() => {
                setNotified(false);
                onClose();
              }}
              className="px-6 py-2 bg-[#001A41] text-white text-xs font-bold rounded-full"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
