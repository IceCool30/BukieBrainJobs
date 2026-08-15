'use client';

import React, { useState } from 'react';
import { Calculator, ShieldCheck, Lock, Clock, ArrowRight } from 'lucide-react';

interface EstimateOption {
  id: string;
  label: string;
  baseMin: number;
  baseMax: number;
  unit: string;
}

const SERVICES_DATA: {
  id: string;
  name: string;
  options: EstimateOption[];
}[] = [
  {
    id: 'ac',
    name: 'AC Servicing & Gas Refill',
    options: [
      { id: '1unit', label: '1 Split Unit (1.0 - 1.5 HP)', baseMin: 10000, baseMax: 14000, unit: 'per service' },
      { id: '2units', label: '2 - 3 Split Units (Full House)', baseMin: 22000, baseMax: 32000, unit: 'total estimate' },
      { id: 'heavy', label: 'Standing / Commercial AC (3.0+ HP)', baseMin: 25000, baseMax: 40000, unit: 'per unit' },
    ],
  },
  {
    id: 'generator',
    name: 'Generator Servicing & Repair',
    options: [
      { id: 'small', label: 'Petrol Generator (2.5kVA - 8kVA)', baseMin: 8000, baseMax: 14000, unit: 'oil & filter service' },
      { id: 'diesel', label: 'Diesel Generator (15kVA - 30kVA)', baseMin: 20000, baseMax: 35000, unit: 'full diagnostic & service' },
      { id: 'heavy-diesel', label: 'Industrial Diesel (50kVA - 250kVA)', baseMin: 45000, baseMax: 80000, unit: 'scheduled overhaul' },
    ],
  },
  {
    id: 'plumbing',
    name: 'Plumbing & Water Tanks',
    options: [
      { id: 'leak', label: 'Pipe Leak / Tap / Toilet Repair', baseMin: 7000, baseMax: 12000, unit: 'per fixture' },
      { id: 'tank', label: 'Overhead Water Tank Setup / Cleaning', baseMin: 15000, baseMax: 25000, unit: 'per tank' },
      { id: 'pump', label: 'Pressure Pump Installation / Repair', baseMin: 18000, baseMax: 30000, unit: 'complete setup' },
    ],
  },
  {
    id: 'solar',
    name: 'Solar & Inverter Installation',
    options: [
      { id: 'inverter-basic', label: '1kVA - 2.5kVA Inverter + 2 Batteries', baseMin: 25000, baseMax: 40000, unit: 'wiring & installation' },
      { id: 'inverter-pro', label: '3.5kVA - 5kVA Solar Hybrid Setup', baseMin: 50000, baseMax: 90000, unit: 'full solar array setup' },
    ],
  },
  {
    id: 'tv',
    name: 'DSTV & TV Wall Mounting',
    options: [
      { id: 'tv-mount', label: 'TV Wall Mount (32" - 65") with Trunking', baseMin: 7500, baseMax: 12000, unit: 'per TV' },
      { id: 'dstv', label: 'DSTV Dish Mounting & Signal Calibration', baseMin: 8000, baseMax: 14000, unit: 'complete setup' },
    ],
  },
];

export default function PriceEstimator({ onBookEstimate }: { onBookEstimate?: (serviceName: string) => void }) {
  const [selectedServiceId, setSelectedServiceId] = useState('ac');
  const [selectedOptionId, setSelectedOptionId] = useState('1unit');
  const [selectedCity, setSelectedCity] = useState('Lagos');

  const currentService = SERVICES_DATA.find((s) => s.id === selectedServiceId) || SERVICES_DATA[0];
  const currentOption = currentService?.options.find((o) => o.id === selectedOptionId) || currentService?.options[0];

  const handleServiceChange = (id: string) => {
    setSelectedServiceId(id);
    const newService = SERVICES_DATA.find((s) => s.id === id);
    if (newService?.options[0]) {
      setSelectedOptionId(newService.options[0].id);
    }
  };

  const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;

  return (
    <section className="py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E5EEFF] text-[#001A41] text-xs font-bold border border-[#CBDBF5]">
            <Calculator className="w-3.5 h-3.5 text-[#296A4B]" />
            <span>Plan your booking</span>
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
            Get a starting estimate
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Use this guide to plan your booking. Final prices depend on the job scope and your location.
          </p>
        </div>

        {/* Interactive Estimator Container */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Select Service Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                1. Choose a service
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SERVICES_DATA.map((svc) => (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleServiceChange(svc.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all border text-left truncate ${
                      selectedServiceId === svc.id
                        ? 'bg-[#001A41] text-white border-[#001A41] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {svc.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Job Scope / Option */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                2. Choose the job scope
              </label>
              <div className="space-y-2">
                {currentService?.options.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`w-full p-3.5 rounded-xl text-xs font-medium transition-all border flex items-center justify-between gap-3 text-left ${
                      selectedOptionId === opt.id
                        ? 'bg-[#EFF4FF] text-[#001A41] border-[#296A4B] font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[11px] text-[#296A4B] font-bold shrink-0">
                      {formatNaira(opt.baseMin)}+
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Location */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                3. Choose your location
              </label>
              <div className="flex gap-2">
                {['Lagos', 'Abuja (FCT)', 'Port Harcourt'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      selectedCity === city
                        ? 'bg-[#296A4B] text-white border-[#296A4B]'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Estimate Display Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#001A41] text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl border border-[#1E3A60]">
            <div className="space-y-4">
              <div className="text-[11px] font-bold text-[#ABEEC8] uppercase tracking-wider">
                Estimated price range
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                  {currentOption ? `${formatNaira(currentOption.baseMin)} - ${formatNaira(currentOption.baseMax)}` : '₦12,000'}
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Estimated range for {selectedCity} ({currentOption?.unit})
                </div>
              </div>

              {/* Guarantees List */}
              <div className="space-y-2.5 pt-4 border-t border-[#1E3A60] text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#ABEEC8] shrink-0" />
                  <span>Pay through Escrow for eligible bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#ABEEC8] shrink-0" />
                  <span>Review Profile Verification before you book</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#ABEEC8] shrink-0" />
                  <span>Confirm availability and timing with your professional</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onBookEstimate?.(currentService?.name || 'General Service')}
              className="w-full py-3.5 bg-[#296A4B] hover:bg-[#1F523A] active:bg-[#17402C] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>Continue with this estimate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
