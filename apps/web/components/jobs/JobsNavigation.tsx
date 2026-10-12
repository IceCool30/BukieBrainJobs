'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Home,
  Briefcase,
  MessageSquare,
  Bell,
  User,
  LogOut,
  X,
} from 'lucide-react';
import { CustomerActivityCustomer } from '@bukiebrainjobs/types';

export function JobsSidebar({
  customer,
  onSignOut,
  onOpenNoticeDialog: _onOpenNoticeDialog,
}: {
  customer: CustomerActivityCustomer | null;
  onSignOut: () => void;
  onOpenNoticeDialog?: ((dialog: 'messages') => void) | undefined;
}) {
  const router = useRouter();

  return (
    <aside
      role="navigation"
      aria-label="Desktop Sidebar"
      className="hidden lg:flex flex-col w-64 bg-[var(--card-bg)] text-[var(--text-main)] p-6 shrink-0 rounded-lg border border-[var(--lead)] shadow-xs min-h-[calc(100vh-4rem)]"
    >
      {/* Brand / Logo */}
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-[var(--tag-bg)] flex items-center justify-center border border-[var(--lead)] group-hover:border-[var(--amber)] transition">
            <Image
              src="/images/logo-badge-512.png"
              alt="BukieBrainJobs"
              width={28}
              height={28}
              className="rounded-md object-contain"
            />
          </div>
          <div>
            <span className="font-bold font-display text-sm tracking-tight text-[var(--text-main)] block">
              BukieBrainJobs
            </span>
            <span className="text-[11px] text-[var(--text-muted)] block">Customer Workspace</span>
          </div>
        </Link>
      </div>

      {/* Main Nav Items */}
      <nav className="space-y-1.5 flex-1">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition cursor-pointer text-left"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>

        <button
          type="button"
          aria-current="page"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-bold text-white bg-[var(--amber)] shadow-xs transition cursor-pointer text-left"
        >
          <Briefcase className="h-4 w-4 text-white" />
          <span>Jobs / Bookings</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/messages')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition cursor-pointer text-left"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Messages</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/notifications')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition cursor-pointer text-left"
        >
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </button>

        <Link
          href="/profile"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Authenticated Customer Footer */}
      <div className="pt-6 mt-6 border-t border-[var(--lead)] flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--tag-bg)] text-[var(--text-main)] border border-[var(--lead)] font-bold text-xs flex items-center justify-center shrink-0">
            {customer?.name ? customer.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[var(--text-main)] block truncate">
              {customer?.name || 'Customer'}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] block truncate">
              {customer?.email || 'customer@bukie.ng'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] rounded-lg transition shrink-0 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

export function JobsMobileBottomNav({
  onOpenNoticeDialog: _onOpenNoticeDialog,
}: {
  onOpenNoticeDialog?: ((dialog: 'messages') => void) | undefined;
}) {
  const router = useRouter();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--card-bg)] border-t border-[var(--lead)] px-2 py-1 shadow-lg"
    >
      <div className="flex items-center justify-around">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          aria-current="page"
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-bold text-[var(--amber)] transition cursor-pointer"
        >
          <Briefcase className="h-5 w-5 mb-0.5" />
          <span>Jobs</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/messages')}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
        >
          <MessageSquare className="h-5 w-5 mb-0.5" />
          <span>Messages</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/notifications')}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
        >
          <Bell className="h-5 w-5 mb-0.5" />
          <span>Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/profile')}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] transition cursor-pointer"
        >
          <User className="h-5 w-5 mb-0.5" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
}

export function JobsNoticeDialog({
  dialog,
  onClose,
}: {
  dialog: 'messages' | null;
  onClose: () => void;
}) {
  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-heading"
        className="bg-[var(--card-bg)] rounded-lg max-w-sm w-full p-6 shadow-xl border border-[var(--lead)] relative text-center text-[var(--text-main)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--card-hover)] transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto w-12 h-12 rounded-lg bg-[var(--tag-bg)] border border-[var(--lead)] text-[var(--amber)] flex items-center justify-center mb-3">
          <MessageSquare className="h-6 w-6" />
        </div>
        <h3 id="dialog-heading" className="text-lg font-bold font-display text-[var(--text-main)] mb-2">
          Messages Coming Soon
        </h3>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm mb-6 leading-relaxed">
          Real-time in-app messaging between customers and BrainWorkers is planned for an upcoming milestone.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-lg bg-[var(--amber)] text-white text-xs font-bold hover:bg-[var(--amber-hover)] transition cursor-pointer shadow-xs"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
