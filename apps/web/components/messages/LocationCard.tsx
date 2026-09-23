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
      className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-xl max-w-[80%] lg:max-w-[60%]"
    >
      {/* Header with icon */}
      <div className="flex items-center gap-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#296A4B]/10 flex items-center justify-center">
          <MapPin className="w-4 h-4 text-[#296A4B]" />
        </div>
        <span className="font-medium text-slate-700">Location Shared</span>
      </div>

      {/* Address */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-slate-700 font-medium">{address}</p>
        {landmark && (
          <p className="text-xs text-slate-500">Near {landmark}</p>
        )}
      </div>

      {/* Google Maps link */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open in Google Maps"
        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#001A41] text-white text-xs font-medium rounded-lg hover:bg-[#001A41]/90 transition-colors whitespace-nowrap"
      >
        <MapPin className="w-3.5 h-3.5" />
        <span>Open in Google Maps</span>
      </a>
    </div>
  );
}
