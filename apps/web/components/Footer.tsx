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
              BukieBrainJobs connects you with verified artisans and technicians across Nigeria. Every job is protected by escrow.
            </p>

            <div className="pt-2 flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-[#ABEEC8] font-mono">
                <Lock className="w-3.5 h-3.5 text-[#296A4B]" />
                Secured by Paystack and Flutterwave escrow
              </div>
              <a href="/guarantee" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
                BukieGuarantee Protection: Up to N500,000 Coverage
              </a>
            </div>
          </div>

          {/* Column 1: Our Services */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Our Services</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="/services" className="hover:text-white transition-colors">Generator Maintenance and AVR Services</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">AC Repair and Gas Replenishment</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Plumbing and Water Systems</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Electrical and Solar Installation</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">DSTV and TV Installation</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Office and Home Relocation</a></li>
            </ul>
          </div>

          {/* Column 2: Trust and Safety */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Trust and Safety</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="#trust" className="hover:text-white transition-colors">About BukiePassport</a></li>
              <li><a href="#trust" className="hover:text-white transition-colors">Verification Process</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Payment Protection</a></li>
              <li><a href="/guarantee" className="hover:text-white transition-colors">BukieGuarantee</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Column 3: Business and Support */}
          <div>
            <h4 className="font-display font-semibold text-white text-sm mb-4">Business and Support</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><a href="/enterprise" className="hover:text-white transition-colors">Corporate Solutions</a></li>
              <li><a href="/enterprise" className="hover:text-white transition-colors">API Integration</a></li>
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
            <span className="hover:text-slate-300 cursor-pointer">Escrow Terms</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Center</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
