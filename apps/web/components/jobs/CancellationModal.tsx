'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  referenceCode?: string | undefined;
  isPending: boolean;
  onConfirm: (reason: string) => Promise<void>;
  onClose: () => void;
}

const CANCELLATION_REASONS = [
  'Schedule conflict',
  'Found alternative service',
  'Change of requirements',
  'Cost or budget adjustment',
  'Emergency or personal circumstances',
  'Other reason',
];

export function CancellationModal({
  isOpen,
  referenceCode,
  isPending,
  onConfirm,
  onClose,
}: CancellationModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>(CANCELLATION_REASONS[0]!);
  const [customDetails, setCustomDetails] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap, initial focus, and focus restoration
  useEffect(() => {
    if (!isOpen) return;

    // Capture currently focused element for restoration
    previousActiveElement.current = document.activeElement as HTMLElement | null;

    // Focus the first interactive element after render
    const frameId = requestAnimationFrame(() => {
      if (modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) {
          focusable[0]?.focus();
        }
      }
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalRef.current) return;
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), select:not([disabled]), textarea:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0]!;
        const lastElement = focusable[focusable.length - 1]!;

        if (e.shiftKey) {
          if (document.activeElement === firstElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement || !modalRef.current.contains(document.activeElement)) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previously active element
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customDetails.trim()
      ? `${selectedReason}: ${customDetails.trim()}`
      : selectedReason;
    await onConfirm(finalReason);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/40 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-rose-700">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />
            <h3 id="cancel-modal-title" className="text-base font-bold text-slate-900 font-display">
              Cancel Service Request
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Are you sure you want to cancel request{' '}
          <span className="font-semibold text-slate-900 font-mono">{referenceCode}</span>?
          This action will update the request status to Cancelled and stop further processing.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cancel-reason-select" className="block text-xs font-semibold text-slate-700 mb-1">
              Primary reason for cancellation
            </label>
            <select
              id="cancel-reason-select"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              disabled={isPending}
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001A41]"
            >
              {CANCELLATION_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cancel-details-text" className="block text-xs font-semibold text-slate-700 mb-1">
              Additional notes (optional)
            </label>
            <textarea
              id="cancel-details-text"
              rows={2}
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              disabled={isPending}
              placeholder="Provide any helpful context..."
              className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#001A41] resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50 cursor-pointer"
            >
              Keep request
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                  <span>Cancelling...</span>
                </>
              ) : (
                <span>Confirm Cancellation</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
