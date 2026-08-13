import React from 'react';
import { Search, UserCheck, ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Find the Right Professional',
      desc: 'Search for a service and see verified professionals in your area, each with transparent pricing and detailed work histories.',
      icon: <Search className="w-5 h-5 text-slate-600" />,
    },
    {
      num: '02',
      title: 'Book Directly or Request Quotes',
      desc: 'Book a professional within 24 hours or post your job to receive competitive quotes from verified specialists.',
      icon: <UserCheck className="w-5 h-5 text-slate-600" />,
    },
    {
      num: '03',
      title: 'Professional Service Delivery',
      desc: 'Your selected professional arrives promptly, completes the work, and provides updates throughout the process.',
      icon: <ShieldCheck className="w-5 h-5 text-slate-600" />,
    },
    {
      num: '04',
      title: 'Secure Payment Release',
      desc: 'Your payment remains securely in escrow and is released only after you inspect and approve the completed work.',
      icon: <Lock className="w-5 h-5 text-slate-600" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            How It Works
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#0B1C30]">
            Simple, Secure, and Straightforward
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            Post a job, get quotes, pay only when the work is done.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className="bg-white p-7 rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] relative flex flex-col justify-between space-y-4 hover:border-[#296A4B] hover:shadow-[0_12px_32px_-12px_rgba(0,26,65,0.18)] hover:-translate-y-1 transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-3xl text-[#001A41]/85">
                    {s.num}
                  </span>
                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {s.icon}
                  </div>
                </div>

                <h3 className="font-display font-bold text-base text-[#0B1C30]">
                  {s.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
