import Image from 'next/image';
import { ShieldCheck, Fingerprint } from 'lucide-react';

interface PartnerBarProps {
  compact?: boolean;
}

export default function PartnerBar({ compact = false }: PartnerBarProps) {
  const layout = compact
    ? 'flex items-center justify-center gap-6'
    : 'flex flex-wrap items-center justify-center gap-x-10 gap-y-4';
  const logoHeight = compact ? 'h-4' : 'h-5';
  const labelSize = compact ? 'text-[11px] leading-snug' : 'text-sm';

  return (
    <section aria-label="Payment and verification partners" className="border-b border-slate-200 bg-white">
      <div className={compact ? 'px-4 py-3' : 'mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8'}>
        <div className={layout}>
          <Image
            src="/images/partners/paystack-official.svg"
            alt="Paystack"
            width={157}
            height={28}
            className={`${logoHeight} w-auto`}
          />
          <Image
            src="/images/partners/flutterwave-official.svg"
            alt="Flutterwave"
            width={1013}
            height={241}
            className={`${logoHeight} w-auto`}
          />
          {!compact && (
            <>
              <div className="hidden h-6 w-px bg-slate-200 sm:block" />
              <div className="flex min-w-0 items-center gap-2">
                <Fingerprint className="h-5 w-5 shrink-0 text-slate-600" />
                <span className={`${labelSize} font-medium text-slate-700`}>NIN verification available</span>
              </div>
              <div className="hidden h-6 w-px bg-slate-200 sm:block" />
              <div className="flex min-w-0 items-center gap-2">
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#296A4B]" />
                <span className={`${labelSize} font-medium text-slate-700`}>Escrow available for eligible bookings</span>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
