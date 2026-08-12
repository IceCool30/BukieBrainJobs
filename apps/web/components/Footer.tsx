import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Lock, PhoneCall, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#06152B] text-slate-300 border-t border-[#1E3A60] pt-16 pb-12 text-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1E3A60]/80">
          {/* Brand Overview Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 relative rounded-full overflow-hidden border border-[#296A4B] bg-white p-1">
                <Image
                  src="/images/logo-icon.png"
                  alt="BukieBrainJobs"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                BukieBrain<span className="text-[#296A4B]">Jobs</span>
              </span>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Nigeria&apos;s premier verified marketplace connecting homeowners, estate managers, and business leaders across Lagos, Abuja, Port Harcourt, and state capitals with background-checked artisans.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#ABEEC8] font-mono">
                <Lock className="w-3.5 h-3.5 text-[#296A4B]" />
                Dual Paystack &amp; Flutterwave Escrow Rails
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
                BukieGuarantee Protection (Up to ₦500,000)
              </div>
            </div>
          </div>

          {/* Column 1: Popular Services */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Popular Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#services" className="hover:text-white transition-colors">Generator Repair &amp; AVR</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">AC Repair &amp; Gas Top-Up</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Plumbing &amp; Water Tank</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Electrical &amp; Solar Setup</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">DSTV &amp; TV Wall Mount</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Home &amp; Office Relocation</a></li>
            </ul>
          </div>

          {/* Column 2: Customers & Trust */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Trust &amp; Verification</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#trust" className="hover:text-white transition-colors">BukiePassport System</a></li>
              <li><a href="#trust" className="hover:text-white transition-colors">NIN / BVN Biometrics</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Escrow Payment Security</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">BukieGuarantee Coverage</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">Frequently Asked Questions</a></li>
            </ul>
          </div>

          {/* Column 3: Corporate & Support */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Corporate &amp; Contact</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#corporate" className="hover:text-white transition-colors">Business Solutions</a></li>
              <li><a href="#corporate" className="hover:text-white transition-colors">Estate Maintenance API</a></li>
              <li className="flex items-center gap-1.5 pt-1 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-[#ABEEC8]" />
                +234 (0) 800-BUKIE-JOBS
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-[#ABEEC8]" />
                support@bukiebrainjobs.ng
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div>
            &copy; 2026 BukieBrainJobs Platform Ltd. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Escrow Rules</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
