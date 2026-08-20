'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  const [addressError, setAddressError] = useState('');
  const [landmark, setLandmark] = useState('');
  const addressInputRef = useRef<HTMLInputElement>(null);
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
      setAddressError('');
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#001A41]/70 p-3 animate-fadeIn sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#296A4B]">
              {step < 4 ? `Step ${step} of 3` : 'Booking summary'}
            </div>
            <h2 id="booking-modal-title" className="mt-1 font-display text-xl font-bold tracking-tight text-[#001A41] sm:text-2xl">
              {step === 1 && 'Choose a time for the visit'}
              {step === 2 && 'Where should the BrainWorker arrive?'}
              {step === 3 && 'Review before you book'}
              {step === 4 && 'Your booking details are ready'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#001A41] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
            aria-label="Close booking modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step < 4 && (
          <div className="flex items-center justify-between gap-2 px-5 pb-1 pt-4 sm:px-6">
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

        <div className="flex-grow space-y-5 p-5 sm:p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-[#001A41] p-4 text-xs text-white">
                <div>
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-300">Selected service</span>
                  <span className="mt-1 block text-sm font-bold">{serviceTitle}</span>
                  {worker && <span className="mt-1 block text-[11px] text-slate-300">with {worker.name}</span>}
                </div>
                <div className="text-right">
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-slate-300">Starting from</span>
                  <span className="mt-1 block font-display text-lg font-extrabold text-[#ABEEC8]">{startingPrice}</span>
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
                      aria-pressed={selectedDate === d}
                      className={`min-h-11 rounded-xl border p-2.5 text-left text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2 ${
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
                  <label htmlFor="booking-arrival-time" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Arrival Time Window
                  </label>
                  <select
                  id="booking-arrival-time"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                >
                  <option>Morning (9:00 AM - 12:00 PM)</option>
                  <option>Afternoon (1:00 PM - 4:00 PM)</option>
                  <option>Evening (4:00 PM - 7:00 PM)</option>
                </select>
              </div>

              <div>
                  <label htmlFor="booking-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Job Notes or Issue Description
                  </label>
                  <textarea
                  id="booking-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe specific symptoms, brand/model, or requirements..."
                  className="min-h-11 w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="booking-city" className="block text-xs font-semibold text-slate-700 mb-1.5">City / State</label>
                <select
                  id="booking-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-slate-300 bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                >
                  <option value="Lagos">Lagos (Ikeja, Lekki, VI, Yaba, Surulere, Ikoyi)</option>
                  <option value="Abuja">Abuja FCT (Maitama, Wuse 2, Garki, Jabi, Gwarinpa)</option>
                  <option value="Port Harcourt">Port Harcourt (GRA Phase 2, Peter Odili, Trans-Amadi)</option>
                </select>
              </div>

              <div>
                <label htmlFor="booking-address" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Street Address & House / Flat Number
                </label>
                <input
                  ref={addressInputRef}
                  id="booking-address"
                  type="text"
                  required
                  aria-invalid={Boolean(addressError)}
                  aria-describedby={addressError ? 'booking-address-error' : undefined}
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (addressError) setAddressError('');
                  }}
                  placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                  className="min-h-11 w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                />
                {addressError && (
                  <p id="booking-address-error" role="alert" className="mt-1.5 text-xs font-medium text-red-700">
                    {addressError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="booking-landmark" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Closest Landmark or Estate Gate
                </label>
                <input
                  id="booking-landmark"
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near Ebeano Supermarket / Green Gate"
                  className="min-h-11 w-full rounded-xl border border-slate-300 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#296A4B] shrink-0" />
                <span>Your exact address is only shared with the assigned verified BrainWorker.</span>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-[#F8F9FF] p-4 text-xs">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#296A4B]">Price summary</p>
                  <p className="mt-1 text-sm font-semibold text-[#001A41]">{serviceTitle}</p>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Starting service quote</span>
                  <span className="font-semibold text-slate-900">{startingPrice}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Escrow protection</span>
                  <span className="font-semibold text-[#296A4B]">Included</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-3 text-sm font-bold text-[#001A41]">
                  <span>Amount held in escrow</span>
                  <span className="text-base text-[#001A41]">{startingPrice}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900">
                <Lock className="w-4 h-4 text-[#296A4B] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Escrow protection</span>
                  <span className="text-[11px] text-emerald-800">
                    Your payment is held while you review the completed job.
                  </span>
                </div>
              </div>

              {/* Payment methods */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Payment method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    aria-pressed={paymentMethod === 'card'}
                    className={`flex min-h-20 flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2 ${
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
                    aria-pressed={paymentMethod === 'transfer'}
                    className={`flex min-h-20 flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2 ${
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
                    aria-pressed={paymentMethod === 'ussd'}
                    className={`flex min-h-20 flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2 ${
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
              <div className="space-y-4 py-6 text-center">
              <div className="w-14 h-14 bg-[#ABEEC8]/40 text-[#2E6E4F] rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-xl text-[#0B1C30]">
                  Booking details ready
                </h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Your request for <strong>{serviceTitle}</strong> is prepared for <strong>{selectedDate} ({selectedTimeSlot.split(' ')[0]})</strong> in {city}.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-700 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#001A41]">
                  <ShieldCheck className="w-4 h-4 text-[#296A4B]" />
                  <span>Escrow amount: {startingPrice}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Booking updates and BrainWorker arrival details will appear here when dispatch is available.
                </p>
              </div>
              <button
                onClick={onClose}
                className="min-h-11 rounded-xl bg-[#001A41] px-6 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#000F2D] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2"
              >
                Return to services
              </button>
            </div>
          )}
        </div>

        {/* Modal Navigation Buttons */}
        {step < 4 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-5 sm:p-6">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => (prev - 1) as 1 | 2 | 3)}
                className="inline-flex min-h-11 items-center gap-1 rounded-xl border border-slate-300 px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 rounded-xl border border-slate-300 px-4 text-xs font-bold text-slate-700 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#ABEEC8]"
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (step === 2 && !address.trim()) {
                  setAddressError('Enter the address where the BrainWorker should arrive.');
                  addressInputRef.current?.focus();
                  return;
                }
                if (step < 3) {
                  setStep((prev) => (prev + 1) as 1 | 2 | 3);
                } else {
                  setStep(4);
                }
              }}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-[#001A41] px-5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#000F2D] focus:outline-none focus:ring-2 focus:ring-[#ABEEC8] focus:ring-offset-2"
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
