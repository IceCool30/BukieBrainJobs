'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    repo
      .getReceipt(user.id, bookingId)
      .then((res) => {
        setReceipt(res);
        setLoading(false);
      })
      .catch((err: unknown) => {
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
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] p-6 sm:p-12 flex items-center justify-center transition-colors duration-200">
        <div className="bg-[var(--card-bg)] p-8 rounded-lg border border-[var(--lead)] text-center max-w-sm w-full space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-full border-2 border-[var(--amber)] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[var(--text-muted)]">Retrieving verified transaction receipt...</p>
        </div>
      </main>
    );
  }

  if (error || !receipt) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] p-6 sm:p-12 flex items-center justify-center transition-colors duration-200">
        <div className="bg-[var(--card-bg)] p-8 rounded-lg border border-[var(--lead)] text-center max-w-md w-full space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-lg bg-[var(--danger-dim)] border border-[var(--danger-border)] text-[var(--danger)] flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-display font-bold text-[var(--text-main)]">Receipt Unavailable</h1>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {error || 'No verified payment record exists for this booking.'}
          </p>
          <div className="pt-2">
            <Link
              href="/jobs"
              className="motion-press inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[var(--amber)] text-white text-xs font-bold hover:bg-[var(--amber-hover)] transition shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--amber)]"
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
          color: 'bg-[var(--brand-green-dim)] text-[var(--brand-green)] border-[var(--brand-green-border)]',
          icon: CheckCircle2,
          date: receipt.settlementDate ? `Released on ${new Date(receipt.settlementDate).toLocaleDateString()}` : undefined,
        };
      case 'release_pending':
        return {
          label: 'Release Pending Verification',
          color: 'bg-[var(--amber-dim)] text-[var(--amber)] border-[var(--amber)]/30',
          icon: Clock,
          date: 'Payout transfer undergoing banking settlement',
        };
      case 'funded':
      default:
        return {
          label: 'Funds Secured in Escrow',
          color: 'bg-sky-500/10 text-[var(--text-main)] border-sky-500/20',
          icon: ShieldCheck,
          date: 'Held safely under BukieGuarantee until completion approval',
        };
    }
  };

  const badge = resolveBadge();
  const Icon = badge.icon;

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-main)] py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation Bar (Hidden on print) */}
        <div className="print:hidden flex items-center justify-between">
          <Link
            href="/jobs"
            className="motion-press inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] transition rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--amber)]" />
            <span>Back to Activity</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="motion-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] text-xs font-semibold text-[var(--text-main)] shadow-xs transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadJson}
                className="motion-press inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[var(--lead)] bg-[var(--card-bg)] hover:bg-[var(--card-hover)] text-xs font-semibold text-[var(--text-main)] shadow-xs transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-[var(--text-muted)]" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Receipt Canvas */}
        <div className="relative overflow-hidden bg-[var(--card-bg)] rounded-lg p-6 sm:p-10 border border-[var(--lead)] shadow-xs space-y-6">
          {/* Subtle Security Watermark */}
          <div
            className="pointer-events-none absolute -right-6 -bottom-8 opacity-[0.03] select-none"
            aria-hidden="true"
          >
            <Image
              src="/images/logo-watermark.png"
              alt=""
              width={220}
              height={220}
              className="object-contain"
            />
          </div>

          {/* Header */}
          <div className="relative z-10 flex items-start justify-between gap-4 pb-6 border-b border-[var(--lead)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-extrabold text-2xl text-[var(--text-main)] tracking-tight">
                  BukieBrain<span className="text-[var(--brand-green)]">Jobs</span>
                </span>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-[var(--tag-bg)] text-[var(--text-muted)] border border-[var(--lead)]">
                  Escrow Receipt
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">BukieBrainJobs Technologies Limited • Lagos, Nigeria</p>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-bold text-[var(--text-main)] block">{receipt.receiptNumber}</span>
              <span className="font-mono text-[11px] text-[var(--text-muted)] block">
                {new Date(receipt.paidAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Sandbox Simulated Watermark */}
          {receipt.isSimulatedTestDocument && (
            <div className="relative z-10 rounded-lg bg-[var(--tag-bg)] p-2.5 text-center text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border border-dashed border-[var(--lead)]">
              SIMULATED TEST RECEIPT (PHASE 1 MOCK BOUNDARY)
            </div>
          )}

          {/* Settlement Badge */}
          <div className={`relative z-10 rounded-lg p-3.5 border flex items-center justify-between gap-3 text-xs ${badge.color}`}>
            <div className="flex items-center gap-2 font-bold">
              <Icon className="h-4 w-4 shrink-0" />
              <span>{badge.label}</span>
            </div>
            {badge.date && <span className="text-[11px] font-medium">{badge.date}</span>}
          </div>

          {/* Metadata */}
          <div className="relative z-10 grid grid-cols-2 gap-4 text-xs bg-[var(--tag-bg)] p-5 rounded-lg border border-[var(--lead)]">
            <div>
              <span className="text-[var(--text-muted)] block text-[11px] font-mono uppercase tracking-wider">Billed To</span>
              <span className="font-bold text-[var(--text-main)] block mt-0.5">{receipt.customerName}</span>
              <span className="text-[var(--text-muted)]">{receipt.customerPhoneMasked}</span>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px] font-mono uppercase tracking-wider">Verified BrainWorker</span>
              <span className="font-bold text-[var(--text-main)] block mt-0.5">{receipt.workerName}</span>
              <span className="text-[var(--text-muted)]">{receipt.serviceTitle}</span>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px] font-mono uppercase tracking-wider">Payment Reference</span>
              <span className="font-mono text-[11px] font-bold text-[var(--brand-green)] block mt-0.5">
                {receipt.paymentReference}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px] font-mono uppercase tracking-wider">Service Location</span>
              <span className="text-[var(--text-main)] block mt-0.5 truncate">{receipt.address}</span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="relative z-10 space-y-2 text-xs">
            <h2 className="font-mono font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">
              Itemized Financial Summary
            </h2>
            <div className="rounded-lg border border-[var(--lead)] overflow-hidden divide-y divide-[var(--lead)]">
              <div className="p-3.5 flex justify-between bg-[var(--card-bg)] text-[var(--text-muted)]">
                <span>Base Service Estimate</span>
                <span className="font-mono font-semibold text-[var(--text-main)]">₦{receipt.pricing.baseServiceAmountNaira.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between bg-[var(--card-bg)] text-[var(--text-muted)]">
                <span>Platform Service Fee</span>
                <span className="font-mono font-semibold text-[var(--text-main)]">₦{receipt.pricing.platformServiceFeeNaira.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between bg-[var(--card-bg)] text-[var(--text-muted)]">
                <span>BukieGuarantee Escrow Protection Fee</span>
                <span className="font-mono font-semibold text-[var(--text-main)]">₦{receipt.pricing.escrowProtectionFeeNaira.toLocaleString()}</span>
              </div>
              <div className="p-3.5 flex justify-between bg-[var(--card-bg)] text-[var(--text-muted)]">
                <span>Statutory Value Added Tax (VAT 7.5%)</span>
                <span className="font-mono font-semibold text-[var(--text-main)]">₦{receipt.pricing.statutoryVatNaira.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-[var(--tag-bg)] flex justify-between text-sm font-bold text-[var(--text-main)]">
                <span>Total Amount Charged</span>
                <span className="font-mono text-lg font-extrabold text-[var(--brand-green)]">
                  ₦{receipt.pricing.totalPayableNaira.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="relative z-10 pt-3 border-t border-[var(--lead)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Payment Instrument: {receipt.paymentMethodUsed}</span>
            <span className="flex items-center gap-1 text-[var(--brand-green)] font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              BukieGuarantee Protected
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
