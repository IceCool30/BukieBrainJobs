import Image from 'next/image';

interface PartnerBarProps {
  compact?: boolean;
}

export default function PartnerBar({ compact = false }: PartnerBarProps) {
  const layout = compact
    ? 'grid grid-cols-3 items-center gap-3'
    : 'mx-auto grid max-w-3xl grid-cols-3 items-center gap-12';
  const logoHeight = compact ? 'h-4' : 'h-5';

  return (
    <section aria-label="Payment and identity partners" className="border-b border-slate-200 bg-white">
      <div className={compact ? 'px-4 py-3' : 'mx-auto max-w-[1280px] px-4 py-5 sm:px-6 lg:px-8'}>
        <div className={layout}>
          <Image
            src="/images/partners/paystack-official.svg"
            alt="Paystack"
            width={157}
            height={28}
            className={`${logoHeight} w-auto max-w-full justify-self-center`}
          />
          <Image
            src="/images/partners/flutterwave-official.svg"
            alt="Flutterwave"
            width={1013}
            height={241}
            className={`${logoHeight} w-auto max-w-full justify-self-center`}
          />
          <Image
            src="/images/partners/dojah-official.svg"
            alt="Dojah"
            width={67}
            height={30}
            className={`${logoHeight} w-auto max-w-full justify-self-center`}
          />
        </div>
      </div>
    </section>
  );
}
