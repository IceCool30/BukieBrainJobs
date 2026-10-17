import Image from 'next/image';
import Link from 'next/link';
import { CalendarCheck, Clock, Inbox, LayoutDashboard, LogOut, ShieldCheck, UserRound, Wallet, Wrench } from 'lucide-react';
import type { AuthUser } from '../../lib/auth/types';

const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'leads', label: 'Leads', icon: Inbox },
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { key: 'services', label: 'Services', icon: Wrench },
  { key: 'availability', label: 'Availability', icon: Clock },
  { key: 'profile', label: 'Profile', icon: UserRound },
  { key: 'wallet', label: 'Wallet', icon: Wallet },
] as const;

export type BrainWorkerSection = (typeof SECTIONS)[number]['key'];

interface BrainWorkerHeaderProps {
  active: BrainWorkerSection;
  user: AuthUser | null;
  onSignOut: () => void;
}

export function BrainWorkerHeader({ active, user, onSignOut }: BrainWorkerHeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--lead)] bg-[var(--card-bg)] text-[var(--text-main)] transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/brainworker/dashboard" className="flex shrink-0 items-center gap-2.5">
            <Image src="/images/logo-icon.png" alt="BukieBrainJobs" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
          </Link>
          <span className="inline-flex items-center gap-1 rounded-md border border-[var(--brand-green-border)] bg-[var(--brand-green-dim)] px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--brand-green)]">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Verified Provider
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <>
              <div className="hidden text-right leading-tight md:block">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-xs text-[var(--text-muted)]">{user.email || user.phone}</div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--tag-bg)] hover:text-[var(--danger)]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </>
          )}
        </div>
      </div>
      <nav aria-label="BrainWorker workspace" className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6">
        <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SECTIONS.map(({ key, label, icon: Icon }) => {
            const current = key === active;
            return (
              <li key={key} className="shrink-0">
                <Link
                  href={`/brainworker/${key}`}
                  aria-current={current ? 'page' : undefined}
                  className={`flex h-11 items-center gap-2 border-b-2 px-3 text-sm transition-colors ${
                    current
                      ? 'border-[var(--amber)] font-semibold text-[var(--text-main)]'
                      : 'border-transparent font-medium text-[var(--text-muted)] hover:border-[var(--rule)] hover:text-[var(--text-main)]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${current ? 'text-[var(--amber)]' : ''}`} aria-hidden="true" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
