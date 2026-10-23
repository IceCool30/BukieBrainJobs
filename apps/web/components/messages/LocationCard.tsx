'use client';

import React from 'react';
import { MapPin } from 'lucide-react';

export interface LocationCardProps {
  latitude: number;
  longitude: number;
  address: string;
  landmark?: string;
}

export function LocationCard({ latitude, longitude, address, landmark }: LocationCardProps) {
  // LOC-006: Format Google Maps URL strictly as https://maps.google.com/?q={lat},{lng}
  const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;

  return (
    <div
      role="region"
      aria-label="Location"
      className="flex flex-col gap-3 p-4 bg-[var(--card-bg)] border border-[var(--lead)] rounded-lg max-w-[80%] lg:max-w-[60%] shadow-xs"
    >
      {/* Header with icon */}
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-[var(--brand-green-dim)] border border-[var(--brand-green-border)] flex items-center justify-center text-[var(--brand-green)]">
          <MapPin className="w-4 h-4" />
        </div>
        <span className="font-semibold text-[var(--text-main)] text-sm">Location Shared</span>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[var(--text-main)] font-medium">{address}</p>
        {landmark && (
          <p className="text-xs text-[var(--text-muted)]">Near {landmark}</p>
        )}
      </div>

      {/* Google Maps link */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open in Google Maps"
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[var(--amber)] hover:bg-[var(--amber-hover)] text-[#001A41] text-xs font-bold rounded-lg transition-colors whitespace-nowrap shadow-xs"
      >
        <MapPin className="w-3.5 h-3.5" />
        <span>Open in Google Maps</span>
      </a>
    </div>
  );
}
