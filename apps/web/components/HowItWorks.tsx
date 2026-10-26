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
      shortTitle: 'Find a service',
      desc: 'Choose the service and location that fit what you need done. Browse available BrainWorkers in your area or post a job.',
      icon: Search,
      badge: 'Pick your service',
      highlights: [
        'Browse over 20 trade categories across Nigeria',
        'Filter by location in Lagos, Abuja, and Port Harcourt',
        'See clear pricing guidance before you proceed',
      ],
      previewTitle: 'Find professionals',
      previewComponent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2FE896]" />
              <span className="text-xs text-slate-300 font-semibold">
                Available in your area
              </span>
            </div>
            <span className="text-[11px] text-[#F7803C] font-semibold">
              3 BrainWorkers nearby
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#F7803C]" />
                Generator Servicing, Ikeja
              </span>
              <span className="text-[11px] text-[#2FE896] font-semibold">
                Typical arrival: 20 mins
              </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#F7803C] to-[#2FE896] w-[85%]" />
            </div>
            <p className="text-[11px] text-slate-400">
              Professionals in your area with confirmed identity and active customer reviews.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#161B24]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F7803C]/20 text-[#F7803C] flex items-center justify-center font-bold text-xs">
                BA
              </div>
              <div>
                <p className="text-xs font-bold text-white">Babatunde A.</p>
                <p className="text-[10px] text-slate-400">Electrical Technician • 218 completed jobs</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#2FE896]/15 text-[#2FE896] text-[10px] font-bold">
              Available today
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'step-2',
      num: '02',
      title: 'Choose your next step',
      shortTitle: 'Choose a professional',
      desc: 'Look through verified profiles, compare reviews from previous customers, and choose the right BrainWorker for your job.',
      icon: UserCheck,
      badge: 'Profile verification',
      highlights: [
        'National Identity Number (NIN) and Bank Verification Number (BVN) checks',
        'Practical trade experience and workshop background confirmation',
        'Real reviews from customers who booked and paid on the platform',
      ],
      previewTitle: 'Profile verification',
      previewComponent: (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs text-slate-300 font-semibold">
              Verification checklist
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#2FE896]/20 text-[#2FE896] text-[10px] font-bold">
              Verified profile
            </span>
          </div>

          <div className="space-y-2">
            {[
              { label: 'National Identity (NIN)', status: 'Verified' },
              { label: 'Bank Verification Number (BVN)', status: 'Name match confirmed' },
              { label: 'Trade experience review', status: 'Confirmed' },
              { label: 'Customer rating history', status: 'Active on platform' },
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
      shortTitle: 'Agree and pay',
      desc: 'Review the scope, price, and schedule before work starts. Your payment stays securely in escrow and is released only when you approve the finished job.',
      icon: ShieldCheck,
      badge: 'Escrow protection',
      highlights: [
        'Your payment is held in escrow and released only after your confirmation',
        'Milestone releases for jobs that involve multiple stages or materials',
        'Direct dispute support if completed work differs from what was agreed',
      ],
      previewTitle: 'Payment escrow',
      previewComponent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs text-slate-300 font-semibold">
              Payment status
            </span>
            <span className="text-xs text-[#F7803C] font-semibold">
              Held in escrow
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Agreed job amount:</span>
              <span className="font-mono font-bold text-white text-sm">₦35,000.00</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-[#2FE896]/15 border border-[#2FE896]/30 text-[#2FE896]">
                <p className="font-bold">1. Deposited</p>
                <p className="text-[9px] opacity-80">By customer</p>
              </div>
              <div className="p-2 rounded-lg bg-[#F7803C]/15 border border-[#F7803C]/30 text-[#F7803C]">
                <p className="font-bold">2. In escrow</p>
                <p className="text-[9px] opacity-80">Protected</p>
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-400">
                <p className="font-bold">3. Released</p>
                <p className="text-[9px] opacity-80">After sign-off</p>
              </div>
            </div>
            <p className="text-[11px] text-slate-300 text-center">
              Payment is released to the BrainWorker only after you confirm the job is done.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'step-4',
      num: '04',
      title: 'Keep it together',
      shortTitle: 'Track and sign off',
      desc: 'Use the booking page to see arrival updates, communicate directly with your BrainWorker, and confirm job completion.',
      icon: Lock,
      badge: 'Job completion',
      highlights: [
        'Arrival window notifications when your BrainWorker is on the way',
        'Direct messaging to keep instructions and updates in one place',
        'Digital job record and receipt saved to your account',
      ],
      previewTitle: 'Arrival status',
      previewComponent: (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs text-slate-300 font-semibold">
              Arrival update
            </span>
            <span className="flex items-center gap-1.5 text-xs text-[#2FE896] font-semibold">
              <Clock className="w-3.5 h-3.5" />
              On the way
            </span>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2FE896]/20 border border-[#2FE896] flex items-center justify-center text-[#2FE896] shrink-0 font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">BrainWorker is on the way</p>
                <p className="text-[11px] text-slate-400 truncate">Lekki Phase 1, Lagos</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className="text-slate-400">Estimated arrival:</span>
              <span className="font-mono font-bold text-[#F7803C]">12 minutes</span>
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

            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-white">
              Before you book
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Four clear steps to find the right professional, agree on the job details, and protect your payment until the work is done.
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
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7803C]/15 border border-[#F7803C]/30 text-[#F7803C] text-xs font-bold">
                Step {currentStep.num}: {currentStep.badge}
              </span>

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
                    <ShieldCheck className="w-4 h-4 text-[#2FE896]" />
                    <span className="text-xs text-slate-200 font-semibold">
                      {currentStep.previewTitle}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Protected by escrow
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
