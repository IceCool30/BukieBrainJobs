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
              <Image
                src="/images/wordmark-banner-tight.png?v=3"
                alt="BukieBrainJobs"
                width={180}
                height={40}
                className="object-contain h-8 w-auto"
              />
            </div>

            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              BukieBrainJobs helps customers find professionals and helps skilled people find work. Review the booking details before you proceed.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#ABEEC8] font-mono">
                <Lock className="w-3.5 h-3.5 text-[#296A4B]" />
                Escrow is available for eligible bookings
              </div>
              <a href="/guarantee" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
                Review BukieGuarantee terms
              </a>
            </div>
          </div>

          {/* Column 1: Our Services */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Explore services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="/services" className="hover:text-white transition-colors">Generator services</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Air-conditioning services</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Plumbing services</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Electrical and solar services</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">TV and satellite services</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Moving and relocation</a></li>
            </ul>
          </div>

          {/* Column 2: Trust and Safety */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Trust and Safety</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#trust" className="hover:text-white transition-colors">Profile Verification</a></li>
              <li><a href="#trust" className="hover:text-white transition-colors">Verification Process</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Pay through Escrow</a></li>
              <li><a href="/guarantee" className="hover:text-white transition-colors">BukieGuarantee</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Column 3: Business and Support */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">For businesses and support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="/enterprise" className="hover:text-white transition-colors">Business services</a></li>
              <li><a href="/enterprise" className="hover:text-white transition-colors">Contact support</a></li>
              <li className="flex items-center gap-1.5 pt-1 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-[#ABEEC8]" />
                +234 800-BUKIE-JOBS
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-[#ABEEC8]" />
                support@bukiebrainjobs.ng
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright and Legal Links */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4">
          <div>
            &copy; 2026 BukieBrainJobs Platform Limited. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Escrow information</span>
            <span className="hover:text-slate-300 cursor-pointer">Trust and safety</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
