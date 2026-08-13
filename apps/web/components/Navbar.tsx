'use client';

import React, { useState, useEffect } from 'react';
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
}

export default function Navbar({ onPostJobClick, onBecomeWorkerClick }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solid = scrolled || mobileMenuOpen;

  return (
    <header
      className={`sticky top-0 z-50 w-full text-white transition-all duration-300 ${
        solid
          ? 'bg-[#001A41]/35 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
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
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#001A41] border-b border-[#1E3A60] px-4 pt-3 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-200">
            <Link
              href="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#ABEEC8] flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#296A4B]" />
              Services
            </Link>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#ABEEC8]"
            >
              How It Works
            </a>
            <a
              href="#trust"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#ABEEC8] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#ABEEC8]" />
              Verification
            </a>
            <Link
              href="/enterprise"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#ABEEC8]"
            >
              For Business
            </Link>
          </nav>

          <div className="pt-3 border-t border-[#1E3A60] flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onPostJobClick?.();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-center text-[#ABEEC8] border border-[#296A4B] rounded-full bg-[#296A4B]/20"
            >
              Post a Job Request
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBecomeWorkerClick?.();
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold text-center text-white bg-slate-800 rounded-full"
            >
              Join as a Professional
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
