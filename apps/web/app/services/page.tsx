import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SERVICE_CATEGORIES } from '../../lib/mock/homepage-data';
import { Zap, Wind, Wrench, Sun, Sparkles, Hammer, Tv, Truck, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

const ICONS: Record<string, React.ReactNode> = {
  Zap: <Zap className="w-6 h-6 text-slate-600" />,
  Wind: <Wind className="w-6 h-6 text-slate-600" />,
  Wrench: <Wrench className="w-6 h-6 text-slate-600" />,
  Sun: <Sun className="w-6 h-6 text-slate-600" />,
  Sparkles: <Sparkles className="w-6 h-6 text-slate-600" />,
  Hammer: <Hammer className="w-6 h-6 text-slate-600" />,
  Tv: <Tv className="w-6 h-6 text-slate-600" />,
  Truck: <Truck className="w-6 h-6 text-slate-600" />,
};

export default function ServicesPage() {
  const groups = Array.from(new Set(SERVICE_CATEGORIES.map((c) => c.group)));

  return (
    <main className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <div className="bg-[#001A41] text-white border-b border-[#1E3A60]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#001A41]/95 to-[#001A41]/60" />
          <div className="relative z-10 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight">
              All Services and Starting Prices
            </h1>
            <p className="text-base text-slate-300 max-w-2xl leading-relaxed">
              Every service below starts at the price shown. Your quote is locked in before
              the professional starts, and your payment stays in escrow until you approve
              the finished work.
            </p>
          </div>
        </div>
      </div>

      {/* Category groups */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {groups.map((group) => (
          <section key={group}>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
              {group}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICE_CATEGORIES.filter((c) => c.group === group).map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] p-7 space-y-4"
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                    {ICONS[cat.iconName]}
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="font-display font-bold text-lg text-[#0B1C30]">{cat.title}</h2>
                    <p className="text-sm text-slate-500 leading-relaxed">{cat.description}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Popular within this category
                    </div>
                    <ul className="space-y-1">
                      {cat.popularServices.map((s) => (
                        <li key={s} className="text-sm text-slate-700 flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-slate-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-sm text-slate-500">
                      Prices from{' '}
                      <span className="font-bold text-[#001A41] text-base">{cat.startingPrice}</span>
                    </div>
                    <Link
                      href="/"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#296A4B] hover:text-[#1f5239] transition-colors"
                    >
                      Book this service
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Reassurance band */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_2px_8px_-4px_rgba(0,26,65,0.10)] p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-slate-600" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display font-bold text-lg text-[#0B1C30]">
              The price you see is the price you get
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
              Every professional quotes against the same price framework, so surprises are rare.
              If the final work costs more than the agreed quote, the platform disputes it on
              your behalf before releasing any payment.
            </p>
          </div>
        </div>
      </div>

      {/* Footer link */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Image
            src="/images/wordmark-banner-tight.png?v=3"
            alt="BukieBrainJobs"
            width={150}
            height={44}
            priority={false}
            className="opacity-70"
          />
        </div>
      </div>
    </main>
  );
}
