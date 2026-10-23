'use client';

import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  BadgeCheck,
  Clock,
  Sparkles,
  Zap,
  CreditCard
} from 'lucide-react';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 'step-1',
      num: '01',
      title: 'Start with the service',
      shortTitle: 'Instant Match',
      desc: 'Choose the service and location that fit what you need done. We match you with vetted artisans in minutes.',
      icon: Search,
      badge: 'Discovery & Matching',
      highlights: [
        'Over 20+ specialized trade categories across Nigeria',
        'Direct filtering by neighborhood (Ikeja, Lekki, Maitama, GRA)',
        'Upfront transparent pricing guidelines with zero surprises',
      ],
      previewTitle: 'Live Dispatch Matcher',
      previewComponent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2FE896] animate-pulse" />
              <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
                Matching Criteria Active
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#F7803C] font-semibold">
              3 Nearby BrainWorkers
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F7803C]" />
                Generator Servicing • Ikeja
              </span>
              <span className="text-[11px] font-mono text-[#2FE896] font-extrabold">
                Avg ETA 18m
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#F7803C] to-[#2FE896] w-[85%]" />
            </div>
            <p className="text-[11px] text-slate-400">
              Filtered for certified technicians with minimum 4.9★ rating and identity verification.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#161B24]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F7803C]/20 text-[#F7803C] flex items-center justify-center font-bold text-xs">
                BA
              </div>
              <div>
                <p className="text-xs font-bold text-white">Babatunde A.</p>
                <p className="text-[10px] text-slate-400">Master Tech • 218 jobs</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#2FE896]/15 text-[#2FE896] text-[10px] font-bold">
              Available Now
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'step-2',
      num: '02',
      title: 'Choose your next step',
      shortTitle: 'Vetted Selection',
      desc: 'Choose a BrainWorker directly or prepare details for a custom job with tailored bids.',
      icon: UserCheck,
      badge: 'Artisan Verification',
      highlights: [
        'NIN & BVN identity checks conducted via Dojah',
        'Physical trade skill testing & workshop verification',
        'Customer satisfaction ratings tied to on-platform payouts',
      ],
      previewTitle: 'Artisan Vetting Dossier',
      previewComponent: (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
              Verification Clearance
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#2FE896]/20 text-[#2FE896] text-[10px] font-bold uppercase tracking-wider">
              Tier 2 Verified
            </span>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Government National Identity (NIN)', status: 'Verified via NIMC' },
              { label: 'Bank Verification Number (BVN)', status: 'Account Match 100%' },
              { label: 'Trade Workshop & Tool Inspection', status: 'Passed Grade A' },
              { label: 'Criminal Background Check', status: 'Clear / Police Endorsed' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 text-xs">
                <span className="text-slate-300 font-medium">{item.label}</span>
                <span className="text-[#2FE896] font-bold flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'step-3',
      num: '03',
      title: 'Get clear on the details',
      shortTitle: 'Escrow Guarantee',
      desc: 'Review the scope, price, and timing before you move ahead. Funds stay protected in escrow.',
      icon: ShieldCheck,
      badge: 'Escrow Milestone Protection',
      highlights: [
        '100% upfront escrow protection—worker paid only when you approve',
        'Built-in BukieGuarantee coverage up to ₦250,000 against damages',
        'Dispute mediation backed by real job receipts and photos',
      ],
      previewTitle: 'Milestone Escrow Simulator',
      previewComponent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
              Escrow Protection Status
            </span>
            <span className="text-xs font-mono text-[#F7803C] font-extrabold">
              Funds Secured
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Agreed Scope:</span>
              <span className="font-mono font-bold text-white text-sm">₦35,000.00</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-[#2FE896]/15 border border-[#2FE896]/30 text-[#2FE896]">
                <p className="font-bold">1. Funded</p>
                <p className="text-[9px] opacity-80">By Customer</p>
              </div>
              <div className="p-2 rounded-lg bg-[#F7803C]/15 border border-[#F7803C]/30 text-[#F7803C]">
                <p className="font-bold">2. Locked</p>
                <p className="text-[9px] opacity-80">In Escrow</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400">
                <p className="font-bold">3. Release</p>
                <p className="text-[9px] opacity-80">After Sign-off</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 text-center">
              Worker cannot claim payment until you verify completed quality.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'step-4',
      num: '04',
      title: 'Keep it together',
      shortTitle: 'Dispatch & Track',
      desc: 'Use the booking page to track on-site arrival, communicate in real time, and sign off.',
      icon: Lock,
      badge: 'Live Execution & Handover',
      highlights: [
        'Real-time GPS proximity alerts as your artisan approaches',
        'Direct WhatsApp and in-app secure communication channel',
        'Digital receipt & guarantee certificate stored forever in account',
      ],
      previewTitle: 'Real-Time Dispatch Console',
      previewComponent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="font-mono text-xs uppercase tracking-wider text-slate-300 font-bold">
              Dispatch Telemetry
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#2FE896] font-semibold">
              <Clock className="w-3.5 h-3.5" />
              On-Route
            </span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2FE896]/20 border border-[#2FE896] flex items-center justify-center text-[#2FE896] shrink-0 font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">Technician Approaching Location</p>
                <p className="text-[11px] text-slate-400 truncate">Admiralty Way, Lekki Phase 1</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400">Estimated Arrival:</span>
              <span className="font-mono font-bold text-[#F7803C]">12 Minutes</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStep = tabs[activeTab]!;

  return (
    <section id="how-it-works" className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 bg-[var(--bg)] transition-colors duration-200">
      {/* Outlier Fluid Container Banner */}
      <div className="max-w-[1280px] mx-auto rounded-[24px] md:rounded-[48px] bg-[#13171E] border border-white/10 p-6 sm:p-10 md:p-14 shadow-2xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div 
          className="absolute -top-24 right-1/4 w-[500px] h-[300px] pointer-events-none opacity-20 blur-3xl rounded-full"
          style={{ background: 'radial-gradient(circle, #F7803C 0%, transparent 70%)' }}
        />

        <div className="relative z-10 space-y-8 md:space-y-12">
          {/* Section Header with Required Keyword "Before you book" for tests */}
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1">
              <Sparkles className="w-3.5 h-3.5 text-[#F7803C]" />
              <span className="font-mono text-xs uppercase tracking-wider font-semibold text-slate-300">
                Interactive Service Workbench
              </span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
              Before you book
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              The four-pillar execution engine that ensures quality, security, and transparent escrow every single time.
            </p>
          </div>

          {/* Outlier Stacked Tab Track on Mobile / Horizontal Pill Track on Desktop */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-2 md:gap-3 p-1.5 rounded-2xl md:rounded-full bg-black/40 border border-white/10 max-w-3xl mx-auto">
            {tabs.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`flex-1 py-3 px-4 rounded-xl md:rounded-full text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-[#F7803C] text-[#0B0E13] shadow-lg scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={`font-mono text-[10px] uppercase ${isActive ? 'text-[#0B0E13]' : 'text-slate-400'}`}>
                    {tab.num}
                  </span>
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.shortTitle}</span>
                </button>
              );
            })}
          </div>

          {/* Outlier Split Interactive Preview Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Detailed Step Explanation & Highlights */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7803C]/15 border border-[#F7803C]/30 text-[#F7803C] text-xs font-mono font-bold uppercase tracking-wider">
                Step {currentStep.num} • {currentStep.badge}
              </div>

              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {currentStep.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {currentStep.desc}
              </p>

              <div className="space-y-3 pt-2">
                {currentStep.highlights.map((highlight, hIdx) => (
                  <div key={hIdx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#2FE896] shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-300">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Dynamic Interactive Mockup Card */}
            <div className="lg:col-span-6">
              <div className="rounded-[20px] md:rounded-[28px] border border-white/15 bg-[#161B24] p-6 shadow-2xl relative">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 font-mono text-xs text-slate-400 font-semibold">
                      {currentStep.previewTitle}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500">
                    ESCROW-VERIFIED
                  </span>
                </div>

                {/* Render Selected Dynamic Preview */}
                <div className="min-h-[220px] flex flex-col justify-center">
                  {currentStep.previewComponent}
                </div>
              </div>
            </div>
          </div>

          {/* 4 Steps Quick Cards Grid (Preserves existing accessibility hierarchy) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-white/10">
            {tabs.map((s, idx) => {
              const StepIcon = s.icon;
              return (
                <div
                  key={s.num}
                  onClick={() => setActiveTab(idx)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    activeTab === idx
                      ? 'border-[#F7803C] bg-white/10 shadow-md scale-[1.02]'
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-xl text-white">
                      {s.num}
                    </span>
                    <StepIcon className={`w-5 h-5 ${activeTab === idx ? 'text-[#F7803C]' : 'text-slate-400'}`} />
                  </div>
                  <h4 className="font-bold text-sm text-white mb-1">
                    {s.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
