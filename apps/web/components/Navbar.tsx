'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  ShieldCheck,
  Briefcase,
  PhoneCall,
  Menu,
  X,
  UserCheck,
  Lock,
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
  { href: '/#trust', label: 'Verification', icon: UserCheck, tint: '#296A4B' },
  { href: '/enterprise', label: 'For Business', icon: Briefcase, tint: '#ABEEC8' },
];

export default function Navbar({ onPostJobClick, onBecomeWorkerClick, drawerOpenRef, hideOnPwa }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [chipShown, setChipShown] = useState(false);
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const settledTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [settleAtTop, setSettleAtTop] = useState(
    typeof window !== 'undefined' && window.innerWidth < 640
  );

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
      if (settleAtTop) {
        setChipShown(false);
        if (settledTimer.current) clearTimeout(settledTimer.current);
        settledTimer.current = setTimeout(() => {
          setChipShown(y > 40);
          settledTimer.current = null;
        }, 450);
      }
    };
    handleScroll();
    const onResize = () => setSettleAtTop(window.innerWidth < 640);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', onResize);
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
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-sm rounded-full bg-white/15 backdrop-blur-md border border-white/20 shadow-[0_6px_20px_-8px_rgba(0,26,65,0.45)] flex items-center justify-between px-4 h-11 pointer-events-auto">
            <span className="text-[11px] font-medium text-white/90 drop-shadow">Payments secured by escrow</span>
            <button
              ref={triggerRef}
              onClick={() => (mobileMenuOpen ? closeDrawer() : openDrawer())}
              className="p-1.5 rounded-full text-white hover:bg-white/15"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        )}
        {drawerOnly && (
          <>
            <div
              className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
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
      className={`sticky top-0 z-50 w-full text-white transition-all duration-300 ${
        solid
          ? 'bg-[#001A41]/35 backdrop-blur-md border-b border-white/10 pointer-events-auto'
          : 'bg-transparent pointer-events-none'
      }`}
      style={solid ? {} : { position: 'absolute', top: 0, left: 0, right: 0 }}
    >
      {/* Compact escrow + contact strip, visible only once scrolled for contrast on light page sections */}
      <div
        className={`overflow-hidden transition-all duration-300 ${solid ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}
        aria-hidden={!solid}
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 text-slate-300 text-[11px] py-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#296A4B]/30 text-[#ABEEC8] text-[10px] font-semibold border border-[#296A4B]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ABEEC8] animate-pulse" />
              Live Now
            </span>
            <span className="hidden sm:inline">
              Live in Lagos, Abuja and Port Harcourt, expanding to 34 state capitals
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1 text-[#ABEEC8]">
              <Lock className="w-3 h-3 text-[#296A4B]" />
              Payments secured by escrow
            </span>
            <span className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors">
              <PhoneCall className="w-3 h-3 text-[#ABEEC8]" />
              +234 800-BUKIE-JOBS
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div
        className={`max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between transition-all duration-300 ${
          solid ? 'py-2' : 'py-4'
        }`}
      >
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/wordmark-banner-tight.png?v=3"
            alt="BukieBrainJobs"
            width={210}
            height={47}
            className="hidden sm:block object-contain h-10 w-auto transition-transform group-hover:scale-105"
            priority
          />
          <Image
            src="/images/logo-icon.png?v=3"
            alt="BukieBrainJobs"
            width={40}
            height={40}
            className="sm:hidden object-contain h-10 w-10 rounded-xl"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-200">
          <Link href="/services" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#296A4B]" />
            Services
          </Link>
          <Link href="/guarantee" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#296A4B]" />
            BukieGuarantee
          </Link>
          <a href="#trust" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#ABEEC8]" />
            Verification
          </a>
          <Link href="/enterprise" className="hover:text-[#ABEEC8] transition-colors">
            For Business
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {/* Level 2 Secondary: Join as Professional */}
          <button
            onClick={onBecomeWorkerClick}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
            Join as a Professional
          </button>

          {/* Level 2 Secondary: Post a Job */}
          <button
            onClick={onPostJobClick}
            className="px-4 py-2 text-xs font-semibold text-[#ABEEC8] border border-[#296A4B] hover:bg-[#296A4B]/20 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Post a Job Request
          </button>

          {/* Level 3 Supporting: Sign In */}
          <button className="ml-1 text-xs font-semibold text-slate-300 hover:text-white underline-offset-4 hover:underline">
            Sign In
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          ref={triggerRef}
          onClick={() => (mobileMenuOpen ? closeDrawer() : openDrawer())}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 pointer-events-auto"
          aria-label="Toggle Navigation Menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile slide-in drawer */}
      {mobileMenuOpen && !drawerOnly && (
        <>
          <div
            className={`lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
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


function DrawerSheet({
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
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <DrawerPanel
        visible={visible}
        onClose={onClose}
        onNavigate={onNavigate}
        onPostJob={onPostJob}
        onBecomeWorker={onBecomeWorker}
      />
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
            className={`lg:hidden fixed top-0 right-0 z-50 h-full w-[300px] max-w-[85vw] bg-[#001A41] border-l border-[#1E3A60] flex flex-col transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 h-20 border-b border-[#1E3A60]">
              <Image
                src="/images/logo-icon.png?v=3"
                alt="BukieBrainJobs"
                width={36}
                height={36}
                className="object-contain h-9 w-9 rounded-xl"
                priority
              />
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Close Navigation Menu"
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
                  className="flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-medium text-slate-200 hover:bg-[#ABEEC8]/10 hover:text-[#ABEEC8] active:bg-[#ABEEC8]/15 transition-colors"
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
                className="w-full py-3.5 px-4 text-sm font-semibold text-center text-[#ABEEC8] bg-[#296A4B] hover:bg-[#1f5239] active:bg-[#17402c] rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                Post a Job Request
              </button>
              <button
                onClick={() => { onClose(); onBecomeWorker?.(); }}
                className="w-full py-3.5 px-4 text-sm font-semibold text-center text-white bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/15 rounded-xl transition-colors"
              >
                Join as a Professional
              </button>
              <button
                onClick={onClose}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white underline-offset-4 hover:underline"
              >
                Sign In
              </button>
            </div>
          </aside>
  );
}
