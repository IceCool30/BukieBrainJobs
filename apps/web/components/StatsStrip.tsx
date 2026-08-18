'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Users, Briefcase, Star, Globe2 } from 'lucide-react';

type StatDef =
  | { icon: typeof Users; kind: 'count'; value: number; suffix: string; label: string; shortLabel?: string }
  | { icon: typeof Star; kind: 'rating'; value: number; label: string; shortLabel?: string };

// Placeholder until real platform figures exist. Avoid publishing exact counts
// we cannot verify; the guide forbids unsupported statistics and ratings.
const STATS: StatDef[] = [
  { icon: Users, kind: 'count', value: 0, suffix: '', label: 'Verified Professionals', shortLabel: 'Verified Professionals' },
  { icon: Briefcase, kind: 'count', value: 0, suffix: '', label: 'Jobs Completed', shortLabel: 'Jobs Completed' },
  { icon: Star, kind: 'rating', value: 0, label: 'Customer Rating' },
  { icon: Globe2, kind: 'count', value: 0, suffix: '', label: 'Serving Your Area', shortLabel: 'Serving Your Area' },
];

function useCountUp(target: number, active: boolean) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    const dur = 1400;
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min((t - start) / dur, 1);
      setN(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);
  return n;
}

function StatCell({ stat }: { stat: StatDef }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => entry?.isIntersecting && setVisible(true), { threshold: 0.1 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const n = useCountUp(stat.kind === 'rating' ? stat.value : stat.value, visible);
  const display =
    stat.kind === 'rating'
      ? n.toFixed(1)
      : Math.round(n).toLocaleString('en-US') + ('suffix' in stat && stat.suffix ? stat.suffix : '');
  return (
    <div ref={ref} className="flex flex-col items-center text-center gap-1.5">
      <stat.icon className="w-6 h-6 text-slate-400" />
      <div className="text-lg sm:text-xl font-display font-extrabold text-[#0B1C30]">{display}</div>
      <div className="text-xs font-semibold text-slate-600">{stat.shortLabel ?? stat.label}</div>
    </div>
  );
}

const CATEGORY_STATS: { label: string; value: string }[] = [
  { label: 'Generator repairs', value: 'Coming soon' },
  { label: 'AC services', value: 'Coming soon' },
  { label: 'Plumbing jobs', value: 'Coming soon' },
  { label: 'Electrical & solar', value: 'Coming soon' },
  { label: 'Cleaning jobs', value: 'Coming soon' },
  { label: 'Carpentry jobs', value: 'Coming soon' },
  { label: 'TV & DSTV installs', value: 'Coming soon' },
  { label: 'Relocations', value: 'Coming soon' },
];

export default function StatsStrip() {
  return (
    <section aria-label="Platform statistics" className="py-10 bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 rounded-xl border border-slate-100 p-6 sm:p-8">
          {STATS.map((stat) => (
            <StatCell key={stat.label} stat={stat} />
          ))}
        </div>
        <div className="border-t border-slate-100 pt-5">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.15em] text-slate-600 mb-3">
            Platform activity by category
          </p>
          <div className="flex flex-wrap justify-center gap-x-7 gap-y-2">
            {CATEGORY_STATS.map((cs) => (
              <div key={cs.label} className="flex items-baseline gap-1.5">
                <span className="text-base font-display font-bold text-slate-700">{cs.value}</span>
                <span className="text-sm font-medium text-slate-600">{cs.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
