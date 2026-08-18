'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Building2,
  Smartphone,
} from 'lucide-react';
import { BrainWorker, ServiceCategory } from '../../lib/mock/homepage-data';

interface DirectBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker?: BrainWorker | null;
  serviceCategory?: ServiceCategory | null;
  initialDetails?: {
    title?: string;
    startingPrice?: string;
    city?: string;
    scopeNote?: string;
  } | null;
}

export default function DirectBookingModal({
  isOpen,
  onClose,
  worker,
  serviceCategory,
  initialDetails,
}: DirectBookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedDate, setSelectedDate] = useState('Tomorrow, 10:00 AM');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('Morning (9:00 AM - 12:00 PM)');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState(
    initialDetails?.city ||
      (worker?.location.includes('Abuja')
        ? 'Abuja'
        : worker?.location.includes('Port Harcourt')
        ? 'Port Harcourt'
        : 'Lagos')
  );
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'ussd'>('card');
  const [notes, setNotes] = useState(initialDetails?.scopeNote || '');

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      return;
    }
    if (initialDetails?.city) setCity(initialDetails.city);
    if (initialDetails?.scopeNote) setNotes(initialDetails.scopeNote);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, initialDetails]);

  if (!isOpen) return null;

  const startingPrice =
    initialDetails?.startingPrice ||
    worker?.startingRate ||
    serviceCategory?.startingPrice ||
    '₦10,000';
  const serviceTitle =
    initialDetails?.title ||
    worker?.category ||
    serviceCategory?.title ||
    'Service Booking';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-[#001A41] text-white rounded-t-2xl">
          <div>
            <div className="text-[11px] font-bold text-[#ABEEC8] uppercase tracking-wider">
              {step < 4 ? `Step ${step} of 3` : 'Booking Confirmed'}
            </div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-white">
              {step === 1 && 'Select Schedule & Details'}
              {step === 2 && 'Service Address in Nigeria'}
              {step === 3 && 'Escrow Payment Summary'}
              {step === 4 && 'Booking Dispatched'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-1 flex items-center justify-between gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? 'bg-[#296A4B]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        )}

        {/* Step Content */}
        <div className="p-6 space-y-5 flex-grow">
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F8F9FF] border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block text-[11px]">Selected Service</span>
                  <span className="font-bold text-[#001A41] text-sm">{serviceTitle}</span>
                  {worker && <span className="text-slate-600 block text-[11px]">with {worker.name}</span>}
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[11px]">Estimate</span>
                  <span className="font-extrabold text-[#296A4B] text-sm">{startingPrice}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Preferred Date
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Today (Urgent)', 'Tomorrow', 'This Weekend', 'Pick a Date'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`p-2.5 rounded-xl text-xs font-medium text-left border transition-all ${
                        selectedDate === d
                          ? 'border-[#001A41] bg-[#001A41] text-white shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5 inline mr-1.5 opacity-70" />
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Arrival Time Window
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#001A41]"
                >
                  <option>Morning (9:00 AM - 12:00 PM)</option>
                  <option>Afternoon (1:00 PM - 4:00 PM)</option>
                  <option>Evening (4:00 PM - 7:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Job Notes or Issue Description
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe specific symptoms, brand/model, or requirements..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#001A41]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">City / State</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#001A41]"
                >
                  <option value="Lagos">Lagos (Ikeja, Lekki, VI, Yaba, Surulere, Ikoyi)</option>
                  <option value="Abuja">Abuja FCT (Maitama, Wuse 2, Garki, Jabi, Gwarinpa)</option>
                  <option value="Port Harcourt">Port Harcourt (GRA Phase 2, Peter Odili, Trans-Amadi)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Street Address & House / Flat Number
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#001A41]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Closest Landmark or Estate Gate
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Ebeano Supermarket / Green Gate"
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#001A41]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#296A4B] shrink-0" />
                <span>Your exact address is only shared with the assigned verified artisan.</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* Escrow summary */}
              <div className="p-4 rounded-xl bg-[#F8F9FF] border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Starting Diagnostic & Service Quote</span>
                  <span className="font-semibold text-slate-900">{startingPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>BukieGuarantee Escrow Protection</span>
                  <span className="font-semibold text-[#296A4B]">FREE (₦0)</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-bold text-[#001A41]">
                  <span>Total Escrow Hold</span>
                  <span className="text-[#001A41] text-base">{startingPrice}</span>
                </div>
              </div>

              {/* Escrow guarantee reassurance */}
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-[#296A4B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">100% Escrow Protected</span>
                  <span className="text-[11px] text-emerald-800">
                    Your money is held safely in escrow. The BrainWorker is only paid after you inspect and sign off on the job.
                  </span>
                </div>
              </div>

              {/* Payment methods */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#001A41] bg-[#001A41] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Debit Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-[#001A41] bg-[#001A41] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Bank Transfer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('ussd')}
                    className={`p-3 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1.5 transition-all ${
                      paymentMethod === 'ussd'
                        ? 'border-[#001A41] bg-[#001A41] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>USSD</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 bg-[#ABEEC8]/40 text-[#2E6E4F] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl text-[#0B1C30]">
                  Booking Scheduled & Secured
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your booking for <strong>{serviceTitle}</strong> is confirmed for <strong>{selectedDate} ({selectedTimeSlot.split(' ')[0]})</strong> in {city}.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#001A41]">
                  <ShieldCheck className="w-4 h-4 text-[#296A4B]" />
                  <span>Escrow Hold: {startingPrice}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  SMS & In-app confirmation sent. You will receive the artisan’s live arrival notification prior to dispatch.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-8 py-3 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-all shadow-md"
              >
                Return to Marketplace
              </button>
            </div>
          )}
        </div>

        {/* Modal Navigation Buttons */}
        {step < 4 && (
          <div className="p-5 sm:p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex items-center justify-between gap-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-white transition-colors"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (step < 3) {
                  setStep((prev) => (prev + 1) as 1 | 2 | 3);
                } else {
                  setStep(4);
                }
              }}
              className="px-6 py-2.5 rounded-full bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
            >
              {step === 3 ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#ABEEC8]" />
                  <span>Authorize Escrow & Book</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
