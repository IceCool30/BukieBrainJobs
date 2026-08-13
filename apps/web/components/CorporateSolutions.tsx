import React from 'react';
import Link from 'next/link';
import { Building2, ShieldCheck, ArrowRight, Layers, FileCheck } from 'lucide-react';

export default function CorporateSolutions() {
  return (
    <section id="corporate" className="py-16 bg-white border-b border-slate-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-xl p-8 sm:p-12 border border-slate-200 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-600">
              <Building2 className="w-3.5 h-3.5" />
              <span>For Enterprises</span>
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#001A41]">
              Comprehensive Maintenance Solutions
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              One platform for every repair request across your properties, with one invoice instead of twenty.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-slate-500" />
                <span>Centralized Billing and VAT-Compliant invoicing</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                <span>Dedicated Account Management</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <span>Custom Service Level Agreements</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>Seamless API Integration</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 space-y-3 text-center sm:text-left">
            <Link href="/enterprise" className="w-full sm:w-auto px-6 py-3.5 bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-md">
              <span>Discover Corporate Solutions</span>
              <ArrowRight className="w-4 h-4 text-[#ABEEC8]" />
            </Link>
            <div className="text-[11px] text-slate-500">
              Contact our corporate team at <span className="font-semibold text-slate-800">corporate@bukiebrainjobs.ng</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
