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
  onOpenNoticeDialog,
}: {
  customer: CustomerActivityCustomer;
  onSignOut: () => void;
  onOpenNoticeDialog: (dialog: 'messages' | 'notifications') => void;
}) {
  const router = useRouter();

  return (
    <aside
      role="navigation"
      aria-label="Desktop Sidebar"
      className="hidden lg:flex flex-col w-64 bg-[#001A41] text-white p-6 shrink-0 rounded-2xl shadow-sm min-h-[calc(100vh-4rem)]"
    >
      {/* Brand / Logo */}
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition">
            <Image
              src="/images/logo-badge-512.png"
              alt="BukieBrainJobs"
              width={28}
              height={28}
              className="rounded-lg"
            />
          </div>
          <div>
            <span className="font-bold font-display text-sm tracking-tight text-white block">
              BukieBrainJobs
            </span>
            <span className="text-[11px] text-slate-400 block">Customer Workspace</span>
          </div>
        </Link>
      </div>

      {/* Main Nav Items */}
      <nav className="space-y-1.5 flex-1">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer text-left"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </button>

        <button
          type="button"
          aria-current="page"
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 shadow-xs transition cursor-pointer text-left"
        >
          <Briefcase className="h-4 w-4 text-[#ABEEC8]" />
          <span>Jobs / Bookings</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenNoticeDialog('messages')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer text-left"
        >
          <MessageSquare className="h-4 w-4" />
          <span>Messages</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenNoticeDialog('notifications')}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer text-left"
        >
          <Bell className="h-4 w-4" />
          <span>Notifications</span>
        </button>

        <Link
          href="/dashboard?tab=profile"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition"
        >
          <User className="h-4 w-4" />
          <span>Profile</span>
        </Link>
      </nav>

      {/* Authenticated Customer Footer */}
      <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white/10 text-white font-bold text-xs flex items-center justify-center shrink-0">
            {customer.name ? customer.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-white block truncate">
              {customer.name || 'Customer'}
            </span>
            <span className="text-[10px] text-slate-400 block truncate">
              {customer.email || 'customer@bukie.ng'}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition shrink-0 cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}

export function JobsMobileBottomNav({
  onOpenNoticeDialog,
}: {
  onOpenNoticeDialog: (dialog: 'messages' | 'notifications') => void;
}) {
  const router = useRouter();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#001A41] border-t border-white/10 px-2 py-1 shadow-lg"
    >
      <div className="flex items-center justify-around">
        <button
          type="button"
          onClick={() => router.push('/dashboard')}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-white transition cursor-pointer"
        >
          <Home className="h-5 w-5 mb-0.5" />
          <span>Home</span>
        </button>

        <button
          type="button"
          aria-current="page"
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-semibold text-[#ABEEC8] transition cursor-pointer"
        >
          <Briefcase className="h-5 w-5 mb-0.5" />
          <span>Jobs</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenNoticeDialog('messages')}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-white transition cursor-pointer"
        >
          <MessageSquare className="h-5 w-5 mb-0.5" />
          <span>Messages</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenNoticeDialog('notifications')}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-white transition cursor-pointer"
        >
          <Bell className="h-5 w-5 mb-0.5" />
          <span>Alerts</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/dashboard?tab=profile')}
          className="min-h-[48px] min-w-[48px] flex flex-col items-center justify-center text-[10px] font-medium text-slate-400 hover:text-white transition cursor-pointer"
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
  dialog: 'messages' | 'notifications' | null;
  onClose: () => void;
}) {
  if (!dialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-heading"
        className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 relative text-center"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 text-[#001A41] flex items-center justify-center mb-3">
          {dialog === 'messages' ? (
            <MessageSquare className="h-6 w-6" />
          ) : (
            <Bell className="h-6 w-6" />
          )}
        </div>
        <h3 id="dialog-heading" className="text-lg font-bold font-display text-[#001A41] mb-2">
          {dialog === 'messages'
            ? 'Messages Coming Soon'
            : 'Notifications Coming Soon'}
        </h3>
        <p className="text-slate-600 text-xs sm:text-sm mb-6 leading-relaxed">
          {dialog === 'messages'
            ? 'Real-time in-app messaging between customers and BrainWorkers is planned for an upcoming milestone.'
            : 'Direct in-app notification center and push alerts are being configured for a future release.'}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 px-4 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#002661] transition cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
