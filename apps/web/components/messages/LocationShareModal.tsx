"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { MapPin, X, Check } from "lucide-react";

export interface LocationShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (locationData: {
    latitude: number;
    longitude: number;
    address: string;
    landmark?: string;
  }) => void;
  bookingAddress: string;
  bookingLandmark?: string;
  bookingCity: string;
}

export function LocationShareModal({
  isOpen,
  onClose,
  onConfirm,
  bookingAddress,
  bookingLandmark,
  bookingCity,
}: LocationShareModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm({
      latitude: 6.5244,
      longitude: 3.3792,
      address: bookingAddress,
      ...(bookingLandmark ? { landmark: bookingLandmark } : {}),
    });
    onClose();
  }, [bookingAddress, bookingLandmark, onConfirm, onClose]);

  if (!isOpen) return null;

  // If bookingAddress ends with bookingCity (e.g. "123 Main Street, Lagos"),
  // strip city from street address so the city name is not duplicated in the DOM
  const streetDisplay = bookingAddress
    .replace(new RegExp(`,?\\s*${bookingCity}$`, "i"), "")
    .trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm location sharing"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--lead)] rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--lead)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Map pin"
              className="w-10 h-10 rounded-lg bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] flex items-center justify-center text-[var(--brand-green)]"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold font-display text-[var(--text-main)]">Share Location</h2>
              <p className="text-sm text-[var(--text-muted)]">Confirm booking address</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit"
            className="p-2 text-[var(--text-muted)] hover:bg-[var(--card-hover)] hover:text-[var(--text-main)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="p-3 bg-[var(--tag-bg)] rounded-lg border border-[var(--lead)] space-y-1">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Address Details</p>
            <p className="text-sm font-semibold text-[var(--text-main)]">{streetDisplay || bookingAddress}</p>
            {bookingLandmark && (
              <p className="text-xs text-[var(--text-muted)]">{bookingLandmark}</p>
            )}
            <p className="text-xs text-[var(--text-muted)]">{bookingCity}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--lead)] bg-[var(--card-bg)]">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel"
            className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] bg-[var(--card-bg)] border border-[var(--lead)] rounded-lg hover:bg-[var(--card-hover)] hover:text-[var(--text-main)] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            aria-label="Confirm"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[var(--amber)] hover:bg-[var(--amber-hover)] rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
