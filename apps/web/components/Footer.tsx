import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, PhoneCall, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#06152B] text-slate-300 border-t border-[#1E3A60] pt-16 pb-12 text-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#1E3A60]/80">
          {/* Brand Overview Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ABEEC8] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06152B]"
              aria-label="BukieBrainJobs home"
            >
              <Image
                src="/images/logo-icon.png?v=3"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-contain"
              />
              <span className="font-display text-xl font-bold tracking-[-0.035em] text-white">
                Bukie<span className="text-[#ABEEC8]">BrainJobs</span>
              </span>
            </Link>

            <a href="/guarantee" className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ABEEC8]" />
              BukieGuarantee terms
            </a>
          </div>

          {/* Column 1: Our Services */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-4">Explore services</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
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
            <h3 className="font-display font-semibold text-white text-sm mb-4">Helpful links</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How booking works</a></li>
              <li><a href="/guarantee" className="hover:text-white transition-colors">BukieGuarantee</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Column 3: Business and Support */}
          <div>
            <h3 className="font-display font-semibold text-white text-sm mb-4">For businesses and support</h3>
            <ul className="space-y-2.5 text-xs text-slate-300">
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
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-300 gap-4">
          <div>
            &copy; 2026 BukieBrainJobs Platform Limited. All rights reserved.
          </div>
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
