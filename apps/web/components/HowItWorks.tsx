import React from 'react';
import { Search, UserCheck, ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Search & Discover',
      desc: 'Type your service or location to view background-checked Nigerian BrainWorkers with upfront pricing.',
      icon: <Search className="w-5 h-5 text-[#296A4B]" />,
    },
    {
      num: '02',
      title: 'Book or Request Quote',
      desc: 'Select a professional directly based on BukiePassport ratings or post custom job requirements.',
      icon: <UserCheck className="w-5 h-5 text-[#296A4B]" />,
    },
    {
      num: '03',
      title: 'Work Completed',
      desc: 'The verified artisan arrives on schedule to diagnose, service, or install with standard quality rules.',
      icon: <ShieldCheck className="w-5 h-5 text-[#296A4B]" />,
    },
    {
      num: '04',
      title: 'Protected Escrow Payout',
      desc: 'Your funds remain held safely in escrow and are only released when you inspect and approve the job.',
      icon: <Lock className="w-5 h-5 text-[#296A4B]" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold text-[#296A4B] uppercase tracking-wider">
            Simple &amp; Transparent Journey
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
            How BukieBrainJobs Protects You
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            A frictionless 4-step process built specifically to eliminate artisan unreliability in Nigeria.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className="bg-[#F8F9FF] p-6 rounded-2xl border border-slate-200/80 relative flex flex-col justify-between space-y-4 hover:border-[#296A4B]/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-2xl text-[#001A41]/30">
                    {s.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                    {s.icon}
                  </div>
                </div>

                <h3 className="font-display font-bold text-base text-[#0B1C30]">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
