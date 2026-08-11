import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-8 font-body text-on-background">
      <div className="flex flex-col items-center gap-6 text-center">
        <Image
          src="/images/logo-main.png"
          alt="BukieBrainJobs Logo"
          width={280}
          height={80}
          className="h-auto max-w-[280px] object-contain"
          priority
        />
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-container font-display text-xl font-bold text-on-primary shadow-md">
            B
          </span>
          <span className="font-display text-2xl font-bold tracking-tight text-primary-container">
            BukieBrainJobs
          </span>
        </div>
        <p className="max-w-md text-on-surface-variant text-body-md">
          Clean slate ready for fresh design.
        </p>
      </div>
    </div>
  );
}
