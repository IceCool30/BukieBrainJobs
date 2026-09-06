'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShieldCheck,
  Briefcase,
  Menu,
  X,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  onPostJobClick?: () => void;
  onBecomeWorkerClick?: () => void;
  drawerOpenRef?: React.MutableRefObject<(() => void) | null>;
  hideOnPwa?: boolean;
}

const DRAWER_LINKS = [
  { href: '/services', label: 'Services', icon: Search, tint: '#296A4B' },
  { href: '/guarantee', label: 'BukieGuarantee', icon: ShieldCheck, tint: '#296A4B' },
  { href: '/#how-it-works', label: 'How It Works', icon: Briefcase, tint: '#296A4B' },
  { href: '/guarantee#verification', label: 'Verification', icon: UserCheck, tint: '#296A4B' },
  { href: '/enterprise', label: 'For Business', icon: Briefcase, tint: '#ABEEC8' },
  { href: '/login', label: 'Sign In', icon: UserCheck, tint: '#ABEEC8' },
];

export default function Navbar({ onPostJobClick, onBecomeWorkerClick, drawerOpenRef, hideOnPwa }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [chipShown, setChipShown] = useState(false);
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const settledTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDrawer = useCallback(() => {
    setMobileMenuOpen(true);
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = 'hidden';
  }, []);

  if (drawerOpenRef) drawerOpenRef.current = openDrawer;

  const closeDrawer = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setMobileMenuOpen(false);
      document.body.style.overflow = '';
      triggerRef.current?.focus();
    }, 250);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      if (window.innerWidth < 640) {
        setChipShown(false);
        if (settledTimer.current) clearTimeout(settledTimer.current);
        settledTimer.current = setTimeout(() => {
          setChipShown(y > 40);
          settledTimer.current = null;
        }, 450);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (settledTimer.current) clearTimeout(settledTimer.current);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen, closeDrawer]);

  const navigateTo = (href: string) => {
    closeDrawer();
    if (href.startsWith('/#')) {
      const id = href.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    window.location.href = href;
  };

  const solid = scrolled || mobileMenuOpen || (hideOnPwa && chipShown);
  const drawerOnly = hideOnPwa && mobileMenuOpen;
  const noop = () => {};
  const doPostJob = onPostJobClick ?? noop;
  const doBecomeWorker = onBecomeWorkerClick ?? noop;

  if (hideOnPwa) {
    if (!drawerOnly && !solid) return null;
    return (
      <>
        {solid && !drawerOnly && (
          <div className="fixed top-3 right-4 z-50 h-11 w-11 rounded-xl bg-[#001A41]/90 border border-white/15 shadow-[0_6px_20px_-8px_rgba(0,26,65,0.45)] flex items-center justify-center pointer-events-auto">
            <button
              ref={triggerRef}
              onClick={() => (mobileMenuOpen ? closeDrawer() : openDrawer())}
              className="motion-press p-2 rounded-lg text-white hover:bg-white/10"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
        {drawerOnly && (
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-[180ms] ease-[var(--ease-ui-out)] ${visible ? 'opacity-100' : 'opacity-0'}`}
              onClick={closeDrawer}
              aria-hidden="true"
            />
            <DrawerPanel
              visible={visible}
              onClose={closeDrawer}
              onNavigate={navigateTo}
              onPostJob={doPostJob}
              onBecomeWorker={doBecomeWorker}
            />
          </>
        )}
      </>
    );
  }

  return (
    <>
    {/* Desktop header, never rendered on the PWA home */}
    <header
      className={`fixed top-0 inset-x-0 z-50 w-full text-white transition-all duration-300 pointer-events-auto ${
        solid
          ? 'bg-[#001A41]/90 backdrop-blur-md border-b border-white/10 shadow-sm'
          : 'bg-gradient-to-b from-[#001A41]/75 to-transparent border-b border-transparent'
      }`}
    >
      {/* Main Header Container */}
      <div
        className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between transition-all duration-300 ${
          solid ? 'py-2' : 'py-4'
        }`}
      >
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/wordmark-banner-2280.png"
            alt="BukieBrainJobs"
            width={228}
            height={68}
            sizes="133px"
            className="hidden sm:block h-10 w-auto rounded-xl object-contain transition-transform duration-[180ms] ease-[var(--ease-ui-out)] group-hover:scale-[1.03]"
            priority
          />
          <Image
            src="/images/logo-icon.png"
            alt="BukieBrainJobs"
            width={40}
            height={40}
            className="sm:hidden object-contain h-10 w-10 rounded-xl"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]">
          <Link href="/services" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#ABEEC8]" />
            Services
          </Link>
          <Link href="/guarantee" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#ABEEC8]" />
            BukieGuarantee
          </Link>
          <Link href="/guarantee#verification" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#ABEEC8]" />
            Verification
          </Link>
          <Link href="/enterprise" className="hover:text-[#ABEEC8] transition-colors">
            For Business
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Secondary action: Become a BrainWorker */}
          <button
            onClick={onBecomeWorkerClick}
            className="motion-press px-3.5 py-2 text-xs font-semibold text-white hover:text-[#ABEEC8] rounded-full transition-colors flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
            Become a BrainWorker
          </button>

          {/* Level 2 Secondary: Post a Job */}
          {onPostJobClick ? (
            <button
              onClick={onPostJobClick}
              className="motion-press px-4 py-2 text-xs font-semibold text-[#ABEEC8] border border-[#ABEEC8]/70 bg-[#001A41]/55 backdrop-blur-sm hover:bg-[#296A4B]/60 rounded-full transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.45)]"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Post a Job
            </button>
          ) : (
            <Link
              href="/post-job"
              className="motion-press px-4 py-2 text-xs font-semibold text-[#ABEEC8] border border-[#ABEEC8]/70 bg-[#001A41]/55 backdrop-blur-sm hover:bg-[#296A4B]/60 rounded-full transition-colors flex items-center gap-1.5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.45)]"
            >
              <Briefcase className="w-3.5 h-3.5" />
              Post a Job
            </Link>
          )}

          {/* Sign In CTA */}
          <Link
            href="/login"
            className="motion-press px-4 py-2 text-xs font-semibold text-white hover:text-[#ABEEC8] rounded-full transition-colors flex items-center gap-1.5 drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)]"
          >
            Sign In
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          ref={triggerRef}
          onClick={() => (mobileMenuOpen ? closeDrawer() : openDrawer())}
          className="motion-press lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 pointer-events-auto"
            aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile slide-in drawer */}
      {mobileMenuOpen && !drawerOnly && (
        <>
          <div
            className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-[180ms] ease-[var(--ease-ui-out)] ${visible ? 'opacity-100' : 'opacity-0'}`}
            onClick={closeDrawer}
            aria-hidden="true"
          />
          <DrawerPanel
            visible={visible}
            onClose={closeDrawer}
            onNavigate={navigateTo}
            onPostJob={doPostJob}
            onBecomeWorker={doBecomeWorker}
          />
        </>
      )}
    </header>
    </>
  );
}

function DrawerPanel({
  visible,
  onClose,
  onNavigate,
  onPostJob,
  onBecomeWorker,
}: {
  visible: boolean;
  onClose: () => void;
  onNavigate: (href: string) => void;
  onPostJob: () => void;
  onBecomeWorker: () => void;
}) {
  return (
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            className={`lg:hidden fixed top-0 right-0 z-50 h-full w-[300px] max-w-[85vw] bg-[#001A41] border-l border-[#1E3A60] flex flex-col transition-transform duration-[240ms] ease-[var(--ease-ui-out)] ${visible ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-20 border-b border-[#1E3A60]">
              <Image
                src="/images/logo-icon.png"
                alt="BukieBrainJobs"
                width={36}
                height={36}
                className="object-contain h-9 w-9 rounded-xl"
                priority
              />
              <button
                onClick={onClose}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-colors hover:text-white hover:bg-white/10"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Link zone */}
            <nav className="flex flex-col gap-1 px-4 py-5 overflow-y-auto">
              {DRAWER_LINKS.map(({ href, label, icon: Icon, tint }) => (
                <button
                  key={label}
                  onClick={() => onNavigate(href)}
                  className="motion-press flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium text-slate-200 hover:bg-[#ABEEC8]/10 hover:text-[#ABEEC8] active:bg-[#ABEEC8]/15 transition-colors"
                >
                  <Icon className={`w-[18px] h-[18px] ${tint === '#ABEEC8' ? 'text-[#ABEEC8]' : 'text-[#ABEEC8]/80'}`} />
                  {label}
                </button>
              ))}
            </nav>

            {/* Action zone */}
            <div className="mt-auto px-5 pb-8 pt-4 space-y-2.5 border-t border-[#1E3A60]">
              <button
                onClick={() => { onClose(); onPostJob?.(); }}
                className="motion-press w-full py-3.5 px-4 text-sm font-semibold text-center text-[#ABEEC8] bg-[#296A4B] hover:bg-[#1f5239] active:bg-[#17402c] rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Post a Job
              </button>
              <button
                onClick={() => { onClose(); onBecomeWorker?.(); }}
                className="motion-press w-full py-3.5 px-4 text-sm font-semibold text-center text-white bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 rounded-xl transition-colors"
              >
                Become a BrainWorker
              </button>
            </div>
          </aside>
  );
}
