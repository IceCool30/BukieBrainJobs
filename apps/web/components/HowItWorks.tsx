import React from 'react';
import { Search, UserCheck, ShieldCheck, Lock, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Find a service',
      desc: 'Choose the service and location that fit the job.',
      icon: <Search className="w-5 h-5 text-slate-600" />,
    },
    {
      num: '02',
      title: 'Choose how to book',
      desc: 'Book a BrainWorker or post a job for tailored quotes.',
      icon: <UserCheck className="w-5 h-5 text-slate-600" />,
    },
    {
      num: '03',
      title: 'Agree the details',
      desc: 'Confirm the scope, price, and timing before work begins.',
      icon: <ShieldCheck className="w-5 h-5 text-slate-600" />,
    },
    {
      num: '04',
      title: 'Complete your booking',
      desc: 'Keep the agreed details in one booking flow.',
      icon: <Lock className="w-5 h-5 text-slate-600" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-[#F8F9FF] border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
            How booking works
          </h2>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {steps.map((s, idx) => (
            <div
              key={s.num}
              className="bg-white p-5 sm:p-7 rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] relative flex flex-col justify-between space-y-4 hover:border-[#296A4B] hover:shadow-[0_12px_32px_-12px_rgba(0,26,65,0.18)] hover:-translate-y-1 transition-all"
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

                <h3 className="font-display font-bold text-base text-[#001A41]">
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
