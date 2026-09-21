'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Printer, Download, AlertCircle, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { getMockAuthenticatedUser } from '../../../lib/auth/storage';
import { getCustomerPaymentRepository } from '../../../lib/payment/repository';
import type { PaymentReceipt } from '../../../lib/payment/types';

export default function ReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId as string;

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const user = getMockAuthenticatedUser();
    if (!user) {
      router.replace(`/login?returnUrl=/receipt/${bookingId}`);
      return;
    }

    const repo = getCustomerPaymentRepository();
    // Default seed or fetch
    repo
      .getReceipt(user.id, bookingId)
      .then((res) => {
        setReceipt(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
        // Fallback: If not funded yet or not found, try fallback for demo
        const msg = err instanceof Error ? err.message : 'Receipt not available.';
        setError(msg);
        setLoading(false);
      });
  }, [bookingId, router]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadJson = () => {
    if (!receipt) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `receipt-${receipt.receiptNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F9FF] p-6 sm:p-12 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-sm w-full space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-full border-2 border-[#001A41] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Retrieving verified transaction receipt...</p>
        </div>
      </main>
    );
  }

  if (error || !receipt) {
    return (
      <main className="min-h-screen bg-[#F8F9FF] p-6 sm:p-12 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md w-full space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-display font-bold text-[#001A41]">Receipt Unavailable</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'No verified payment record exists for this booking.'}
          </p>
          <div className="pt-2">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#001A41] text-white text-xs font-semibold hover:bg-[#002661] transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Jobs & Bookings</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const resolveBadge = () => {
    switch (receipt.settlementStatus) {
      case 'settled':
        return {
          label: 'Payment Settled & Released',
          color: 'bg-emerald-50 text-[#296A4B] border-emerald-200',
          icon: CheckCircle2,
          date: receipt.settlementDate ? `Released on ${new Date(receipt.settlementDate).toLocaleDateString()}` : undefined,
        };
      case 'release_pending':
        return {
          label: 'Release Pending Verification',
          color: 'bg-amber-50 text-amber-800 border-amber-200',
          icon: Clock,
          date: 'Payout transfer undergoing banking settlement',
        };
      case 'funded':
      default:
        return {
          label: 'Funds Secured in Escrow',
          color: 'bg-blue-50 text-blue-800 border-blue-200',
          icon: ShieldCheck,
          date: 'Held safely under BukieGuarantee until completion approval',
        };
    }
  };

  const badge = resolveBadge();
  const Icon = badge.icon;

  return (
    <main className="min-h-screen bg-[#F8F9FF] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Activity</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Receipt Canvas */}
        <div className="bg-white rounded-2xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-2xl text-[#001A41] tracking-tight">
                  BukieBrain<span className="text-[#296A4B]">Jobs</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Escrow Receipt
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">BukieBrainJobs Technologies Limited • Lagos, Nigeria</p>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-bold text-slate-900 block">{receipt.receiptNumber}</span>
              <span className="text-[11px] text-slate-500 block">
                {new Date(receipt.paidAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Sandbox Simulated Watermark */}
          {receipt.isSimulatedTestDocument && (
            <div className="rounded-xl bg-slate-100 p-2.5 text-center text-[10px] font-mono uppercase tracking-wider text-slate-500 border border-dashed border-slate-300">
              SIMULATED TEST RECEIPT (PHASE 1 MOCK BOUNDARY)
            </div>
          )}

          {/* Settlement Badge */}
          <div className={`rounded-xl p-3.5 border flex items-center justify-between gap-3 text-xs ${badge.color}`}>
            <div className="flex items-center gap-2 font-bold">
              <Icon className="h-4 w-4 shrink-0" />
              <span>{badge.label}</span>
            </div>
            {badge.date && <span className="text-[11px] font-medium">{badge.date}</span>}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[11px]">Billed To</span>
              <span className="font-bold text-slate-900 block mt-0.5">{receipt.customerName}</span>
              <span className="text-slate-500">{receipt.customerPhoneMasked}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Verified BrainWorker</span>
              <span className="font-bold text-slate-900 block mt-0.5">{receipt.workerName}</span>
              <span className="text-slate-500">{receipt.serviceTitle}</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Payment Reference</span>
              <span className="font-mono text-[11px] font-semibold text-slate-700 block mt-0.5">
                {receipt.paymentReference}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Service Location</span>
              <span className="text-slate-700 block mt-0.5 truncate">{receipt.address}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2 text-xs">
            <h2 className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">
              Itemized Financial Summary
            </h2>
            <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
              <div className="p-3.5 flex justify-between">
                <span>Base Service Estimate</span>
                <span className="font-mono font-semibold">₦{receipt.pricing.baseServiceAmountNaira.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Platform Service Fee</span>
                <span className="font-mono font-semibold">₦{receipt.pricing.platformServiceFeeNaira.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>BukieGuarantee Escrow Protection Fee</span>
                <span className="font-mono font-semibold">₦{receipt.pricing.escrowProtectionFeeNaira.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span>Statutory Value Added Tax (VAT 7.5%)</span>
                <span className="font-mono font-semibold">₦{receipt.pricing.statutoryVatNaira.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-slate-50 flex justify-between text-sm font-bold text-[#001A41]">
                <span>Total Amount Charged</span>
                <span className="font-mono text-lg text-[#296A4B]">
                  ₦{receipt.pricing.totalPayableNaira.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Payment Instrument: {receipt.paymentMethodUsed}</span>
            <span>BukieGuarantee Protected</span>
          </div>
        </div>
      </div>
    </main>
  );
}
