'use client';

import React, { useEffect, useState } from 'react';
import { nigeriaLocations, nigerianStates } from '@/lib/nigeria-locations';
import { Info, Crosshair, Loader2, MapPin } from 'lucide-react';
import { SmartSuggestInput } from './SmartSuggestInput';

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
  statePlaceholder = 'Type or Select State',
  lgaPlaceholder = 'Type or Select LGA/City',
  className = '',
  showDetectLocation = true,
}: LocationSelectorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [listedLocations, setListedLocations] = useState<{state: string; lga: string}[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const savedState = localStorage.getItem('bukieBrain_lastState');
    const savedLga = localStorage.getItem('bukieBrain_lastLga');
    
    // Only set from local storage initially if we don't already have values
    if (!selectedState && savedState) {
      onStateChange(savedState);
    }
    if (!selectedLga && savedLga && savedState) {
      // Validate that the saved LGA belongs to the saved State or can be custom
      onLgaChange(savedLga);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch listed locations from database for "easy picks"
  useEffect(() => {
    async function fetchListedLocations() {
      try {
        const { createBrowserClient } = await import('@supabase/auth-helpers-nextjs');
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await supabase
          .from('jobs')
          .select('location_state, location_lga')
          .limit(150);
          
        if (data) {
          const unique: {state: string; lga: string}[] = [];
          const seen = new Set<string>();
          data.forEach((item: any) => {
            if (item.location_state) {
              const sClean = item.location_state.trim();
              const lClean = item.location_lga ? item.location_lga.trim() : '';
              if (sClean) {
                const key = `${sClean.toLowerCase()}-${lClean.toLowerCase()}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  unique.push({ state: sClean, lga: lClean });
                }
              }
            }
          });
          setListedLocations(unique);
        }
      } catch (err) {
        console.error('Failed to pre-fetch listed locations:', err);
      }
    }
    fetchListedLocations();
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
          const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await response.json();
          
          if (data && data.principalSubdivision) {
            const detectedStateName = data.principalSubdivision.replace(' State', '').replace('Federal Capital Territory', 'FCT');
            const stateMatch = nigerianStates.find(s => s.toLowerCase() === detectedStateName.toLowerCase());
            
            if (stateMatch) {
              onStateChange(stateMatch);
              
              const validLgas = nigeriaLocations[stateMatch] || [];
              const detectedCity = data.city || data.locality || '';
              const lgaMatch = validLgas.find(lga => lga.toLowerCase() === detectedCity.toLowerCase());
              
              if (lgaMatch) {
                onLgaChange(lgaMatch);
              } else if (detectedCity) {
                onLgaChange(detectedCity); // Support custom typed city if found or detected
              } else {
                onLgaChange('');
              }
            } else {
              // Try setting raw custom if we can't find direct match
              onStateChange(detectedStateName);
              if (data.city || data.locality) {
                onLgaChange(data.city || data.locality);
              }
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

  // Compile smart list of suggestions for State
  const getStateSuggestions = () => {
    const list: string[] = [];
    
    // 1. Add unique listed states from active listings first for easy picks
    listedLocations.forEach((loc) => {
      if (!list.includes(loc.state)) {
        list.push(loc.state);
      }
    });
    
    // 2. Add remaining Nigerian states
    nigerianStates.forEach((state) => {
      if (!list.includes(state)) {
        list.push(state);
      }
    });
    
    // Always support "Remote" as a quick state option
    if (!list.includes('Remote')) {
      list.unshift('Remote');
    }
    
    return list;
  };

  // Compile smart list of suggestions for LGA
  const getLgaSuggestions = () => {
    const list: string[] = [];
    
    // 1. If "Remote" state, suggest "Anywhere" or similar
    if (selectedState && selectedState.toLowerCase() === 'remote') {
      return ['Anywhere', 'Remote'];
    }

    // 2. Add listed LGAs in database matching current state first
    listedLocations.forEach((loc) => {
      if (
        selectedState && 
        loc.state.toLowerCase() === selectedState.toLowerCase() && 
        loc.lga && 
        !list.includes(loc.lga)
      ) {
        list.push(loc.lga);
      }
    });

    // 3. Add standard Nigerian LGAs for this state
    const stdLgas = selectedState ? nigeriaLocations[selectedState] || [] : [];
    stdLgas.forEach((lga) => {
      if (!list.includes(lga)) {
        list.push(lga);
      }
    });

    return list;
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* State Autocomplete Selector */}
        <div className="relative w-full">
          <SmartSuggestInput
            value={selectedState}
            onChange={(stateVal) => {
              onStateChange(stateVal);
              onLgaChange(''); // Reset LGA default on State change
            }}
            placeholder={statePlaceholder}
            suggestions={getStateSuggestions()}
            icon={<MapPin className="w-4 h-4 text-gray-500" />}
          />
          
          {/* Tooltip trigger */}
          <div className="absolute inset-y-0 right-10 flex items-center pr-1 group">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-[#0A192F] cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg hidden sm:block">
              Type custom name or select listed state. Picked states appear right at the top!
              <div className="absolute top-full right-4 w-0 h-0 border-l-[6px] border-l-transparent border-t-[6px] border-t-gray-900 border-r-[6px] border-r-transparent"></div>
            </div>
          </div>
        </div>

        {/* LGA/City Autocomplete Selector */}
        <div className="relative w-full">
          <SmartSuggestInput
            value={selectedLga}
            onChange={onLgaChange}
            placeholder={lgaPlaceholder}
            suggestions={getLgaSuggestions()}
            icon={<MapPin className="w-4 h-4 text-gray-400" />}
          />
          
          {/* Tooltip trigger */}
          <div className="absolute inset-y-0 right-10 flex items-center pr-1 group">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-[#0A192F] cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg hidden sm:block font-sans">
              Type custom LGA or select from list. Encourages absolute geographical flexibility.
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
            className="flex items-center gap-1.5 text-xs font-bold text-[#0A192F] hover:text-blue-600 transition-colors disabled:opacity-50 px-1 py-1"
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
