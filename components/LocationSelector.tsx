'use client';

import React, { useEffect, useState } from 'react';
import { nigeriaLocations, nigerianStates } from '@/lib/nigeria-locations';
import { ChevronDown, Info, Crosshair, Loader2 } from 'lucide-react';

interface LocationSelectorProps {
  selectedState: string;
  selectedLga: string;
  onStateChange: (state: string) => void;
  onLgaChange: (lga: string) => void;
  statePlaceholder?: string;
  lgaPlaceholder?: string;
  className?: string;
  showDetectLocation?: boolean;
}

export function LocationSelector({
  selectedState,
  selectedLga,
  onStateChange,
  onLgaChange,
  statePlaceholder = 'Select State',
  lgaPlaceholder = 'Select LGA/City',
  className = '',
  showDetectLocation = true,
}: LocationSelectorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem('bukieBrain_lastState');
    const savedLga = localStorage.getItem('bukieBrain_lastLga');
    
    // Only set from local storage initially if we don't already have values
    if (!selectedState && savedState) {
      onStateChange(savedState);
    }
    if (!selectedLga && savedLga && savedState) {
      // Validate that the saved LGA belongs to the saved State
      const validLgas = nigeriaLocations[savedState] || [];
      if (validLgas.includes(savedLga)) {
        onLgaChange(savedLga);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (selectedState) {
        localStorage.setItem('bukieBrain_lastState', selectedState);
      } else {
        localStorage.removeItem('bukieBrain_lastState');
      }
      
      if (selectedLga) {
        localStorage.setItem('bukieBrain_lastLga', selectedLga);
      } else {
        localStorage.removeItem('bukieBrain_lastLga');
      }
    }
  }, [selectedState, selectedLga, isMounted]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Simple reverse geocoding using bigdatacloud open api or nominatim
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          
          if (data && data.principalSubdivision) {
            // Find closest match for state
            const detectedStateName = data.principalSubdivision.replace(' State', '').replace('Federal Capital Territory', 'FCT');
            const stateMatch = nigerianStates.find(s => s.toLowerCase() === detectedStateName.toLowerCase());
            
            if (stateMatch) {
              onStateChange(stateMatch);
              
              // Find closest match for LGA
              const validLgas = nigeriaLocations[stateMatch] || [];
              const detectedCity = data.city || data.locality || '';
              const lgaMatch = validLgas.find(lga => lga.toLowerCase() === detectedCity.toLowerCase());
              
              if (lgaMatch) {
                onLgaChange(lgaMatch);
              } else {
                onLgaChange('');
              }
            } else {
              alert('Could not determine a supported location automatically.');
            }
          }
        } catch (error) {
          console.error(error);
          alert('Failed to detect location.');
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        alert('Could not get your location. Please ensure you have granted location permissions.');
      }
    );
  };

  const lgas = selectedState ? nigeriaLocations[selectedState] || [] : [];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* State Selector */}
        <div className="relative w-full">
          <select
            value={selectedState}
            onChange={(e) => {
              onStateChange(e.target.value);
              onLgaChange(''); // Reset LGA when state changes
            }}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent cursor-pointer text-[#0A192F] font-medium"
          >
            <option value="" disabled>
              {statePlaceholder}
            </option>
            {nigerianStates.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Tooltip trigger */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 group">
            <Info className="w-4 h-4 text-gray-400 hover:text-[#0A192F] cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg hidden sm:block">
              Required to match your job context with relevant local talents or listings.
              <div className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-gray-900 border-r-[6px] border-r-transparent"></div>
            </div>
          </div>
        </div>

        {/* LGA Selector */}
        <div className="relative w-full">
          <select
            value={selectedLga}
            onChange={(e) => onLgaChange(e.target.value)}
            disabled={!selectedState}
            className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent cursor-pointer text-[#0A192F] font-medium disabled:opacity-50 disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>
              {lgaPlaceholder}
            </option>
            {lgas.map((lga) => (
              <option key={lga} value={lga}>
                {lga}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-10 flex items-center pointer-events-none">
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
          
          {/* Tooltip trigger */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 group">
            <Info className="w-4 h-4 text-gray-400 hover:text-[#0A192F] cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg hidden sm:block">
              Helps pinpoint exact geographical areas for optimal job targeting and discovery.
              <div className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-gray-900 border-r-[6px] border-r-transparent"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Detect Location Button */}
      {showDetectLocation && (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0A192F] hover:text-[#004D2C] transition-colors disabled:opacity-50 px-1 py-1"
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Crosshair className="w-3.5 h-3.5" />
            )}
            Detect my location
          </button>
        </div>
      )}
    </div>
  );
}

