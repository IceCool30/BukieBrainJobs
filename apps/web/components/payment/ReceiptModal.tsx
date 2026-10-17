'use client';

import React from 'react';
import { X, Printer, Download, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import type { PaymentReceipt } from '../../lib/payment/types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: PaymentReceipt | null;
}

export function ReceiptModal({ isOpen, onClose, receipt }: ReceiptModalProps) {
  if (!isOpen || !receipt) return null;

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipt, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `receipt-${receipt.receiptNumber}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const resolveSettlementBadge = () => {
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
          color: 'bg-[var(--tag-bg)] text-[var(--amber)] border-[var(--lead)]',
          icon: ShieldCheck,
          date: 'Held safely under BukieGuarantee until completion approval',
        };
    }
  };

  const settlementBadge = resolveSettlementBadge();
  const IconComponent = settlementBadge.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg)] p-4 sm:p-6 overflow-y-auto backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Payment & Escrow Receipt"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-[var(--card-bg)] p-6 sm:p-8 shadow-2xl border border-[var(--lead)] overflow-hidden my-8">
        {/* Actions bar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between pb-4 mb-4 border-b border-[var(--lead)]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--rule)] hover:bg-[var(--card-hover)] text-xs font-semibold text-[var(--text-muted)] transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--rule)] hover:bg-[var(--card-hover)] text-xs font-semibold text-[var(--text-muted)] transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close receipt"
            className="p-1.5 rounded-xl text-[var(--text-muted)] hover:text-slate-600 hover:bg-[var(--card-hover)] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Printable Receipt Canvas */}
        <div id="receipt-printable-canvas" className="space-y-5 text-[var(--text-main)]">
          {/* Official Header */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--lead)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-black text-xl text-[var(--text-main)] tracking-tight">
                  BukieBrain<span className="text-[var(--brand-green)]">Jobs</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--text-muted)] border border-[var(--lead)]">
                  Escrow Receipt
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-1">BukieBrainJobs Technologies Limited • Lagos, Nigeria</p>
            </div>

            <div className="text-right">
              <span className="font-mono text-xs font-bold text-[var(--text-main)] block">{receipt.receiptNumber}</span>
              <span className="text-[11px] text-[var(--text-muted)] block">
                {new Date(receipt.paidAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Sandbox Watermark Banner */}
          {receipt.isSimulatedTestDocument && (
            <div className="rounded-lg bg-[var(--tag-bg)] p-2 text-center text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] border border-dashed border-[var(--rule)]">
              SIMULATED TEST RECEIPT (PHASE 1 MOCK BOUNDARY)
            </div>
          )}

          {/* Settlement Status Banner */}
          <div className={`rounded-xl p-3 border flex items-center justify-between gap-3 text-xs ${settlementBadge.color}`}>
            <div className="flex items-center gap-2 font-bold">
              <IconComponent className="h-4 w-4 shrink-0" />
              <span>{settlementBadge.label}</span>
            </div>
            {settlementBadge.date && (
              <span className="text-[11px] font-medium">{settlementBadge.date}</span>
            )}
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-[var(--bg)] p-4 rounded-xl border border-[var(--lead)]">
            <div>
              <span className="text-[var(--text-muted)] block text-[11px]">Billed To</span>
              <span className="font-bold text-[var(--text-main)] block mt-0.5">{receipt.customerName}</span>
              <span className="text-[var(--text-muted)]">{receipt.customerPhoneMasked}</span>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px]">Verified BrainWorker</span>
              <span className="font-bold text-[var(--text-main)] block mt-0.5">{receipt.workerName}</span>
              <span className="text-[var(--text-muted)]">{receipt.serviceTitle}</span>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px]">Payment Reference</span>
              <span className="font-mono text-[11px] font-semibold text-[var(--text-muted)] block mt-0.5">
                {receipt.paymentReference}
              </span>
            </div>

            <div>
              <span className="text-[var(--text-muted)] block text-[11px]">Service Location</span>
              <span className="text-[var(--text-muted)] block mt-0.5 truncate">{receipt.address}</span>
            </div>
          </div>

          {/* Itemized Breakdown Table */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-[var(--text-muted)] text-[10px]">
              Itemized Financial Summary
            </h4>
            <div className="rounded-xl border border-[var(--lead)] overflow-hidden divide-y divide-[var(--lead)]">
              <div className="p-3 flex justify-between">
                <span>Base Service Estimate</span>
                <span className="font-mono font-semibold">₦{receipt.pricing.baseServiceAmountNaira.toLocaleString()}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span>Platform Service Fee</span>
                <span className="font-mono font-semibold">₦{receipt.pricing.platformServiceFeeNaira.toLocaleString()}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span>BukieGuarantee Escrow Protection Fee</span>
                <span className="font-mono font-semibold">₦{receipt.pricing.escrowProtectionFeeNaira.toLocaleString()}</span>
              </div>
              <div className="p-3 flex justify-between">
                <span>Statutory Value Added Tax (VAT 7.5%)</span>
                <span className="font-mono font-semibold">₦{receipt.pricing.statutoryVatNaira.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-[var(--bg)] flex justify-between text-sm font-bold text-[var(--text-main)]">
                <span>Total Amount Charged</span>
                <span className="font-mono text-base text-[var(--brand-green)]">
                  ₦{receipt.pricing.totalPayableNaira.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="pt-2 border-t border-[var(--lead)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
            <span>Payment Instrument: {receipt.paymentMethodUsed}</span>
            <span>BukieGuarantee Protected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
