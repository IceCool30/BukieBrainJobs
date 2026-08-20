'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Zap,
  Wind,
  Sun,
  Wrench,
  Sparkles,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export interface ScopeOption {
  id: string;
  name: string;
  description: string;
  laborMin: number;
  laborMax: number;
  partsMin: number;
  partsMax: number;
  commonParts: string;
}

export interface EstimatorTrade {
  id: string;
  name: string;
  shortName: string;
  icon: React.ElementType;
  scopes: ScopeOption[];
}

const TRADES_DATA: EstimatorTrade[] = [
  {
    id: 'generator',
    name: 'Generator Servicing & Repair',
    shortName: 'Generator',
    icon: Zap,
    scopes: [
      {
        id: 'gen-petrol',
        name: 'Petrol Generator (2.5kVA - 8.5kVA)',
        description: 'Oil drainage, carburetor cleanout, spark plug swap & valve tune-up',
        laborMin: 8000,
        laborMax: 12000,
        partsMin: 4000,
        partsMax: 6500,
        commonParts: 'Engine Oil (20W-50), Spark Plug & Fuel Filter',
      },
      {
        id: 'gen-diesel-small',
        name: 'Small Diesel Generator (15kVA - 30kVA)',
        description: 'Full fuel injection diagnostics, dual filter change & AVR calibration',
        laborMin: 22000,
        laborMax: 30000,
        partsMin: 14000,
        partsMax: 20000,
        commonParts: 'Diesel Fuel Filter, Oil Filter Element & 15W-40 Lube',
      },
      {
        id: 'gen-diesel-industrial',
        name: 'Industrial Perkins / Mikano (50kVA - 250kVA)',
        description: 'Scheduled multi-point overhaul, radiator flush & ATS synchronization',
        laborMin: 45000,
        laborMax: 65000,
        partsMin: 30000,
        partsMax: 50000,
        commonParts: 'Heavy-Duty Fuel Separator, Coolant & Air Filter Cartridge',
      },
    ],
  },
  {
    id: 'ac',
    name: 'AC Repair & Gas Refill',
    shortName: 'AC / Cooling',
    icon: Wind,
    scopes: [
      {
        id: 'ac-single-service',
        name: '1 Split Unit (Routine Chemical Wash & Check)',
        description: 'Deep blower coil steam cleaning, drainage unclog & electrical test',
        laborMin: 9000,
        laborMax: 13000,
        partsMin: 2500,
        partsMax: 4000,
        commonParts: 'Chemical Coil Wash Solution & Capacitor Test',
      },
      {
        id: 'ac-gas-refill',
        name: '1 Split Unit (R410A / R22 Full Gas Recharge)',
        description: 'Pressure vacuum testing, flare-nut leak sealing & full gas top-up',
        laborMin: 12000,
        laborMax: 16000,
        partsMin: 10000,
        partsMax: 15000,
        commonParts: 'Virgin R410A/R22 Refrigerant Gas & Copper Flare Gasket',
      },
      {
        id: 'ac-multi-unit',
        name: 'Whole House (3 - 5 Split Units Maintenance)',
        description: 'Comprehensive multi-room AC overhaul, filter swap & condenser check',
        laborMin: 28000,
        laborMax: 40000,
        partsMin: 18000,
        partsMax: 28000,
        commonParts: 'Multi-Unit Gas Equalization & Chemical Service Kit',
      },
    ],
  },
  {
    id: 'solar',
    name: 'Solar & Inverter Installation',
    shortName: 'Solar / Inverter',
    icon: Sun,
    scopes: [
      {
        id: 'solar-inverter-basic',
        name: '1kVA - 2.5kVA Inverter Backup System',
        description: 'Changeover integration, battery rack wiring & load segregation',
        laborMin: 25000,
        laborMax: 35000,
        partsMin: 12000,
        partsMax: 18000,
        commonParts: '35mm DC Copper Cables, Heavy Battery Lugs & 63A Breaker',
      },
      {
        id: 'solar-hybrid-full',
        name: '3.5kVA - 5kVA Hybrid Solar Array Setup',
        description: 'Roof rail PV mounting, MPPT controller config & surge protection',
        laborMin: 55000,
        laborMax: 80000,
        partsMin: 28000,
        partsMax: 42000,
        commonParts: 'Aluminium Roof Clamps, 6mm Solar PV Cables & DC SPD Breakers',
      },
    ],
  },
  {
    id: 'plumbing',
    name: 'Plumbing & Water Tanks',
    shortName: 'Plumbing',
    icon: Wrench,
    scopes: [
      {
        id: 'plumb-leak-tap',
        name: 'Pipe Leak, Tap & Pressure Pump Repair',
        description: 'Leak detection, PPR pipe heat-joint repair & pressure sensor check',
        laborMin: 8000,
        laborMax: 13000,
        partsMin: 3500,
        partsMax: 6000,
        commonParts: 'PPR Heat Fittings, High-Pressure Seal Tape & Gate Valve',
      },
      {
        id: 'plumb-tank-setup',
        name: 'Overhead Tank Setup & Float Switch Install',
        description: 'Scaffold mounting, float switch auto-cutoff & overflow pipe piping',
        laborMin: 20000,
        laborMax: 30000,
        partsMin: 12000,
        partsMax: 18000,
        commonParts: 'Automatic Float Switch, 1" Non-Return Valve & PVC Union',
      },
    ],
  },
  {
    id: 'cleaning',
    name: 'Deep Cleaning & Post-Construction',
    shortName: 'Cleaning',
    icon: Sparkles,
    scopes: [
      {
        id: 'clean-flat',
        name: '2-Bedroom Flat Full Deep Scrub',
        description: 'Kitchen degreasing, bathroom descaling, tile scrubbing & window wash',
        laborMin: 20000,
        laborMax: 28000,
        partsMin: 5000,
        partsMax: 8000,
        commonParts: 'Eco Tile Scrub Detergents, Glass Shine & Disinfectant',
      },
      {
        id: 'clean-duplex',
        name: '4-Bedroom Duplex Post-Construction Clean',
        description: 'Paint splatter removal, industrial floor buffing & deep carpet extraction',
        laborMin: 45000,
        laborMax: 65000,
        partsMin: 12000,
        partsMax: 18000,
        commonParts: 'Industrial Floor Stripper, Pad Buffers & Protective Sealant',
      },
    ],
  },
];

const CITY_MULTIPLIERS: Record<string, { multiplier: number; label: string; popularHub: string }> = {
  Lagos: { multiplier: 1.0, label: 'Lagos State', popularHub: 'Ikeja / Lekki / VI / Yaba' },
  Abuja: { multiplier: 1.05, label: 'Abuja (FCT)', popularHub: 'Maitama / Wuse 2 / Garki' },
  'Port Harcourt': { multiplier: 1.0, label: 'Port Harcourt', popularHub: 'GRA Phase 2 / Trans-Amadi' },
};

interface PriceEstimatorProps {
  onBookEstimate?:
    | ((
        serviceName: string,
        details?: {
          scopeName: string;
          city: string;
          priceRange: string;
          scopeNote: string;
        }
      ) => void)
    | undefined;
}

export default function PriceEstimator({ onBookEstimate }: PriceEstimatorProps) {
  const [selectedTradeId, setSelectedTradeId] = useState<string>('generator');
  const [selectedScopeId, setSelectedScopeId] = useState<string>('gen-petrol');
  const [selectedCity, setSelectedCity] = useState<string>('Lagos');

  const currentTrade =
    TRADES_DATA.find((t) => t.id === selectedTradeId) || (TRADES_DATA[0] as EstimatorTrade);
  const currentScope =
    currentTrade.scopes.find((s) => s.id === selectedScopeId) ||
    (currentTrade.scopes[0] as ScopeOption);

  const cityData = CITY_MULTIPLIERS[selectedCity] ?? {
    multiplier: 1.0,
    label: 'Lagos State',
    popularHub: 'Ikeja / Lekki / VI / Yaba',
  };
  const multiplier = cityData.multiplier;

  const adjLaborMin = Math.round((currentScope.laborMin * multiplier) / 500) * 500;
  const adjLaborMax = Math.round((currentScope.laborMax * multiplier) / 500) * 500;
  const adjPartsMin = Math.round((currentScope.partsMin * multiplier) / 500) * 500;
  const adjPartsMax = Math.round((currentScope.partsMax * multiplier) / 500) * 500;

  const totalMin = adjLaborMin + adjPartsMin;
  const totalMax = adjLaborMax + adjPartsMax;

  const formatNaira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

  const handleTradeChange = (tradeId: string) => {
    setSelectedTradeId(tradeId);
    const trade = TRADES_DATA.find((t) => t.id === tradeId);
    if (trade?.scopes[0]) {
      setSelectedScopeId(trade.scopes[0].id);
    }
  };

  const handleBook = () => {
    const formattedRange = `${formatNaira(totalMin)} - ${formatNaira(totalMax)}`;
    const note = `Scope: ${currentScope.name}. Labor: ${formatNaira(adjLaborMin)}-${formatNaira(adjLaborMax)}. Estimated parts: ${currentScope.commonParts} (${formatNaira(adjPartsMin)}-${formatNaira(adjPartsMax)}). Location: ${selectedCity}.`;
    onBookEstimate?.(currentTrade.name, {
      scopeName: currentScope.name,
      city: selectedCity,
      priceRange: formattedRange,
      scopeNote: note,
    });
  };

  return (
    <section id="estimator" className="py-12 sm:py-20 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-[#001A41]">
            Plan your service budget
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Choose a service, scope, and location to see an estimated range.
          </p>
        </div>

        {/* Main Calculator Container */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl p-4 sm:p-9 border border-slate-200 shadow-[0_4px_24px_-12px_rgba(0,26,65,0.12)] grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left Column: Scope Builder (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Trade Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Service
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TRADES_DATA.map((trade) => {
                  const Icon = trade.icon;
                  const isSelected = selectedTradeId === trade.id;
                  return (
                    <button
                      key={trade.id}
                      type="button"
                      onClick={() => handleTradeChange(trade.id)}
                      className={`motion-press p-2.5 rounded-xl text-xs font-semibold border flex items-center gap-2 text-left transition-all ${
                        isSelected
                          ? 'bg-[#001A41] text-white border-[#001A41] shadow-sm'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-[#ABEEC8]' : 'text-[#296A4B]'}`} />
                      <span className="truncate">{trade.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Job Scope Radio Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Work scope
              </label>
              <div className="space-y-2.5">
                {currentTrade.scopes.map((scope) => {
                  const isSelected = selectedScopeId === scope.id;
                  return (
                    <button
                      key={scope.id}
                      type="button"
                      onClick={() => setSelectedScopeId(scope.id)}
                      className={`motion-press w-full p-3.5 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'bg-[#EFF4FF] border-[#296A4B] shadow-sm'
                          : 'bg-white border-slate-200 hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'border-[#296A4B] bg-[#296A4B]'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </span>
                            <span className="text-xs font-bold text-[#001A41]">{scope.name}</span>
                          </div>
                          <p className="text-[11px] font-medium text-slate-600 pl-5 leading-snug">
                            {scope.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[11px] font-extrabold text-[#296A4B] block">
                            Labor from {formatNaira(Math.round((scope.laborMin * multiplier) / 500) * 500)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3: City Benchmarker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Location
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.keys(CITY_MULTIPLIERS).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`motion-press py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      selectedCity === city
                        ? 'bg-[#296A4B] text-white border-[#296A4B] shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{city}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Escrow Breakdown Card (5 Cols) */}
          <div className="lg:col-span-5 bg-[#001A41] text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl border border-[#1E3A60]">
            <div className="space-y-5">
              <span className="text-[10px] text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
                {selectedCity}
              </span>

              {/* Total Price Range */}
              <div className="space-y-1">
                <div className="text-xs text-slate-300">Estimated range</div>
                <div className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
                  {formatNaira(totalMin)} – {formatNaira(totalMax)}
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentScope.name}
                </div>
              </div>

              {/* Itemized Cost Breakdown */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ABEEC8]" />
                    Labor
                  </span>
                  <span className="font-bold text-white">
                    {formatNaira(adjLaborMin)} - {formatNaira(adjLaborMax)}
                  </span>
                </div>

                <div className="flex justify-between items-start text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ABEEC8] shrink-0 mt-0.5" />
                    <span>Estimated parts</span>
                  </span>
                  <span className="font-bold text-white shrink-0">
                    {formatNaira(adjPartsMin)} - {formatNaira(adjPartsMax)}
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 pl-5 italic">
                  Common parts: {currentScope.commonParts}
                </div>

              </div>

            </div>

            {/* CTA Button prefilling booking modal */}
            <button
              type="button"
              onClick={handleBook}
              className="motion-press w-full py-3.5 bg-[#296A4B] hover:bg-[#1F523A] active:bg-[#17402C] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Book this scope</span>
              <ArrowRight className="w-4 h-4 text-[#ABEEC8]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
