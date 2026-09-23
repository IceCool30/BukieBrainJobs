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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Map pin"
              className="w-10 h-10 rounded-full bg-[#296A4B]/10 flex items-center justify-center text-[#296A4B]"
            >
              <MapPin className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Share Location</h2>
              <p className="text-sm text-slate-500">Confirm booking address</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Exit"
            className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Address Details</p>
            <p className="text-sm font-medium text-slate-700">{streetDisplay || bookingAddress}</p>
            {bookingLandmark && (
              <p className="text-xs text-slate-500">{bookingLandmark}</p>
            )}
            <p className="text-xs text-slate-500">{bookingCity}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cancel"
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            aria-label="Confirm"
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#001A41] rounded-lg hover:bg-[#001A41]/90 transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Confirm Location</span>
          </button>
        </div>
      </div>
    </div>
  );
}
