import { ShieldCheck, CreditCard, Fingerprint } from 'lucide-react';

interface PartnerBarProps {
  compact?: boolean;
}

export default function PartnerBar({ compact = false }: PartnerBarProps) {
  const layout = compact
    ? 'grid grid-cols-2 gap-x-3 gap-y-3'
    : 'flex flex-wrap items-center justify-center gap-x-10 gap-y-4';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';
  const labelSize = compact ? 'text-[11px] leading-snug' : 'text-sm';

  return (
    <section aria-label="Payment and verification partners" className="border-b border-slate-200 bg-white">
      <div className={compact ? 'px-4 py-3' : 'mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8'}>
        <div className={layout}>
          <div className="flex min-w-0 items-center gap-2">
            <CreditCard className={`${iconSize} shrink-0 text-slate-600`} />
            <span className={`${labelSize} font-bold uppercase tracking-wide text-slate-600`}>Paystack</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <CreditCard className={`${iconSize} shrink-0 text-slate-600`} />
            <span className={`${labelSize} font-bold uppercase tracking-wide text-slate-600`}>Flutterwave</span>
          </div>
          {!compact && <div className="hidden h-6 w-px bg-slate-200 sm:block" />}
          <div className="flex min-w-0 items-center gap-2">
            <Fingerprint className={`${iconSize} shrink-0 text-slate-600`} />
            <span className={`${labelSize} font-medium text-slate-700`}>NIN verification available</span>
          </div>
          {!compact && <div className="hidden h-6 w-px bg-slate-200 sm:block" />}
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className={`${iconSize} shrink-0 text-[#296A4B]`} />
            <span className={`${labelSize} font-medium text-slate-700`}>Escrow available for eligible bookings</span>
          </div>
        </div>
      </div>
    </section>
  );
}
