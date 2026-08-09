import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0B1C30] text-slate-300 py-12 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="font-display font-bold text-white text-lg mb-3">BukieBrainJobs</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Connecting homeowners, businesses, and estate managers across Lagos, Abuja, Port Harcourt, and Nigeria with background-checked, top-rated artisans.
          </p>
          <div className="text-xs text-[#ABEEC8] font-mono">
            Powered by Dual Paystack & Flutterwave Rails
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Popular Services</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link href="/" className="hover:text-white">Air Conditioner (AC) Repair</Link></li>
            <li><Link href="/" className="hover:text-white">TV & DSTV Wall Mounting</Link></li>
            <li><Link href="/" className="hover:text-white">Plumbing & Water Tanks</Link></li>
            <li><Link href="/" className="hover:text-white">Electrical & Solar Inverter</Link></li>
            <li><Link href="/" className="hover:text-white">Generator Servicing</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">Artisans & Trust</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link href="/passport" className="hover:text-white">Tiered BukiePassport Vetting</Link></li>
            <li><Link href="/passport" className="hover:text-white">NIN & BVN Biometric Verification</Link></li>
            <li><Link href="/wallet" className="hover:text-white">Instant Artisan Bank Payouts</Link></li>
            <li><Link href="/" className="hover:text-white">BukieGuarantee Protection (Up to ₦500k)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-3">B2B & Retail Partnerships</h4>
          <p className="text-xs text-slate-400 mb-3">
            Electronics retailer or estate manager? Integrate our "Book Installation at Checkout" API.
          </p>
          <button className="bg-[#296A4B] text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#1f523a] transition-all">
            Partner With Us
          </button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
        <div>© 2026 BukieBrainJobs Platform. All rights reserved.</div>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Security & Escrow Policy</span>
        </div>
      </div>
    </footer>
  );
}
