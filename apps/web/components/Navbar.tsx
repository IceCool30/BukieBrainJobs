'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@bukiebrainjobs/store';
import { 
  User, 
  ShieldCheck, 
  Wallet, 
  MessageSquare, 
  Briefcase, 
  Search, 
  Smartphone,
  ShieldAlert
} from 'lucide-react';

export default function Navbar() {
  const { currentRole, setRole, userName, passportStatus } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-[#001A41] text-white shadow-md border-b border-blue-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 relative rounded-full overflow-hidden border-2 border-[#296A4B] bg-white p-1">
              <Image 
                src="/images/logo-icon.png" 
                alt="BukieBrainJobs" 
                width={48} 
                height={48} 
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-2xl tracking-tight text-white group-hover:text-[#ABEEC8] transition-colors">
                BukieBrain<span className="text-[#296A4B]">Jobs</span>
              </span>
              <span className="block text-[10px] text-slate-300 tracking-wider font-semibold uppercase">
                Nigeria's #1 Artisan Marketplace
              </span>
            </div>
          </Link>

          {/* Navigation Links based on Active Role */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
              <Search className="w-4 h-4 text-[#296A4B]" /> Find Artisans
            </Link>
            
            {currentRole === 'client' && (
              <>
                <Link href="/bookings" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4" /> My Bookings
                </Link>
                <Link href="/chat" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Messages
                </Link>
              </>
            )}

            {currentRole === 'artisan' && (
              <>
                <Link href="/passport" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#ABEEC8]" /> BukiePassport ({passportStatus})
                </Link>
                <Link href="/wallet" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
                  <Wallet className="w-4 h-4" /> Wallet & Earnings
                </Link>
                <Link href="/chat" className="hover:text-[#ABEEC8] transition-colors flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" /> Client Messages
                </Link>
              </>
            )}

            {currentRole === 'admin' && (
              <Link href="/admin" className="text-[#F59E0B] hover:underline font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Admin Console
              </Link>
            )}
          </nav>

          {/* Role Switcher Pill & Profile Badge */}
          <div className="flex items-center gap-4">
            
            {/* Role Switcher */}
            <div className="bg-slate-900/80 p-1 rounded-full border border-slate-700 flex items-center text-xs font-semibold">
              <button
                onClick={() => setRole('client')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  currentRole === 'client' ? 'bg-[#296A4B] text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Client
              </button>
              <button
                onClick={() => setRole('artisan')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  currentRole === 'artisan' ? 'bg-[#296A4B] text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Artisan
              </button>
              <button
                onClick={() => setRole('admin')}
                className={`px-3 py-1.5 rounded-full transition-all ${
                  currentRole === 'admin' ? 'bg-[#F59E0B] text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Admin
              </button>
            </div>

            {/* PWA / App Mobile Badge */}
            <div className="hidden lg:flex items-center gap-2 bg-[#296A4B]/20 text-[#ABEEC8] border border-[#296A4B]/40 px-3 py-1.5 rounded-full text-xs font-semibold">
              <Smartphone className="w-3.5 h-3.5" /> PWA / Mobile Ready
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
