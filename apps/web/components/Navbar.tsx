'use client';

import React, { useState } from 'react';
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

  return (
    <header className="sticky top-0 z-50 w-full bg-[#001A41] text-white shadow-lg border-b border-[#1E3A60]">
      {/* Top Announcement / Contextual Bar */}
      <div className="bg-[#06152B] border-b border-[#1E3A60]/60 text-xs py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-300">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#296A4B]/30 text-[#ABEEC8] text-[11px] font-semibold border border-[#296A4B]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ABEEC8] animate-pulse" />
              Live Operations
            </span>
            <span className="hidden sm:inline text-slate-300">
              🇳🇬 Active in Lagos, Abuja &amp; Port Harcourt • 34 Capitals Expanding
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:flex items-center gap-1 text-[#ABEEC8]">
              <Lock className="w-3 h-3 text-[#296A4B]" />
              100% Escrow Protected
            </span>
            <span className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors">
              <PhoneCall className="w-3 h-3 text-[#ABEEC8]" />
              +234 (0) 800-BUKIE-JOBS
            </span>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 relative rounded-full overflow-hidden border-2 border-[#296A4B] bg-white p-1 shadow-sm transition-transform group-hover:scale-105">
            <Image
              src="/images/logo-icon.png"
              alt="BukieBrainJobs"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-[#ABEEC8] transition-colors">
              BukieBrain<span className="text-[#296A4B]">Jobs</span>
            </span>
            <span className="block text-[10px] text-slate-300 tracking-wider uppercase font-medium">
              Vetted Nigerian Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-200">
          <a href="#services" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
            <Search className="w-4 h-4 text-[#296A4B]" />
            Find Services
          </a>
          <a href="#how-it-works" className="hover:text-[#ABEEC8] transition-colors">
            How it Works
          </a>
          <a href="#trust" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#ABEEC8]" />
            BukiePassport
          </a>
          <a href="#corporate" className="hover:text-[#ABEEC8] transition-colors">
            Business Solutions
          </a>
        </nav>

        {/* Action Buttons (Strict CTA Hierarchy) */}
        <div className="hidden md:flex items-center gap-3">
          {/* Level 2 Secondary: Become a BrainWorker */}
          <button
            onClick={onBecomeWorkerClick}
            className="px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 rounded-full transition-all flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
            Become a BrainWorker
          </button>

          {/* Level 2 Secondary: Post a Job */}
          <button
            onClick={onPostJobClick}
            className="px-4 py-2 text-xs font-semibold text-[#ABEEC8] border border-[#296A4B] hover:bg-[#296A4B]/20 rounded-full transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Post a Job
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
            <a
              href="#services"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#ABEEC8] flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-[#296A4B]" />
              Find Services
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#ABEEC8]"
            >
              How it Works
            </a>
            <a
              href="#trust"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#ABEEC8] flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#ABEEC8]" />
              BukiePassport Verification
            </a>
            <a
              href="#corporate"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#ABEEC8]"
            >
              Business Solutions
            </a>
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
              Become a BrainWorker
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
