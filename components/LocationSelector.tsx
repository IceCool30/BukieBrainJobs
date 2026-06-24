'use client';

import React, { useEffect, useState } from 'react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { nigeriaLocations, nigerianStates } from '@/lib/nigeria-locations';
import { Info, Crosshair, Loader2, MapPin } from 'lucide-react';
import { SmartSuggestInput } from './SmartSuggestInput';

interface LocationSelectorProps {
  selectedState: string;
  selectedArea: string;
  onStateChange: (state: string) => void;
  onAreaChange: (area: string) => void;
  statePlaceholder?: string;
  areaPlaceholder?: string;
  className?: string;
  showDetectLocation?: boolean;
}

export function LocationSelector({
  selectedState,
  selectedArea,
  onStateChange,
  onAreaChange,
  statePlaceholder = 'Type or Select State',
  areaPlaceholder = 'Type or Select Area/City',
  className = '',
  showDetectLocation = true,
}: LocationSelectorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [listedLocations, setListedLocations] = useState<{state: string; area: string}[]>([]);

  useEffect(() => {
    setIsMounted(true);
    let savedState = null;
    let savedArea = null;
    try {
      savedState = localStorage.getItem('bukieBrain_lastState');
      savedArea = localStorage.getItem('bukieBrain_lastArea');
    } catch (e) {
      console.warn('localStorage not accessible', e);
    }
    
    // Only set from local storage initially if we don't already have values
    if (!selectedState && savedState) {
      onStateChange(savedState);
    }
    if (!selectedArea && savedArea && savedState) {
      // Validate that the saved Area belongs to the saved State or can be custom
      onAreaChange(savedArea);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch listed locations from database for "easy picks"
  useEffect(() => {
    async function fetchListedLocations() {
      if (!isSupabaseConfigured()) {
        return;
      }
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase
          .from('jobs')
          .select('location_state, location_lga')
          .limit(150);
          
        if (data) {
          const unique: {state: string; area: string}[] = [];
          const seen = new Set<string>();
          data.forEach((item: any) => {
            if (item.location_state) {
              const sClean = item.location_state.trim();
              const lClean = item.location_lga ? item.location_lga.trim() : '';
              if (sClean) {
                const key = `${sClean.toLowerCase()}-${lClean.toLowerCase()}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  unique.push({ state: sClean, area: lClean });
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
      try {
        if (selectedState) {
          localStorage.setItem('bukieBrain_lastState', selectedState);
        } else {
          localStorage.removeItem('bukieBrain_lastState');
        }
        
        if (selectedArea) {
          localStorage.setItem('bukieBrain_lastArea', selectedArea);
        } else {
          localStorage.removeItem('bukieBrain_lastArea');
        }
      } catch (e) {
        console.warn('localStorage not accessible', e);
      }
    }
  }, [selectedState, selectedArea, isMounted]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by your browser.');
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
              
              const validAreas = nigeriaLocations[stateMatch] || [];
              const detectedCity = data.city || data.locality || '';
              const areaMatch = validAreas.find(area => area.toLowerCase() === detectedCity.toLowerCase());
              
              if (areaMatch) {
                onAreaChange(areaMatch);
              } else if (detectedCity) {
                onAreaChange(detectedCity); // Support custom typed city if found or detected
              } else {
                onAreaChange('');
              }
            } else {
              // Try setting raw custom if we can't find direct match
              onStateChange(detectedStateName);
              if (data.city || data.locality) {
                onAreaChange(data.city || data.locality);
              }
            }
          }
        } catch (error) {
          console.error('Failed to detect location.', error);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        console.error('Could not get your location. Please ensure you have granted location permissions.');
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

  // Compile smart list of suggestions for Area
  const getAreaSuggestions = () => {
    const list: string[] = [];
    
    // 1. If "Remote" state, suggest "Anywhere" or similar
    if (selectedState && selectedState.toLowerCase() === 'remote') {
      return ['Anywhere', 'Remote'];
    }

    // 2. Add listed Areas in database matching current state first
    listedLocations.forEach((loc) => {
      if (
        selectedState && 
        loc.state.toLowerCase() === selectedState.toLowerCase() && 
        loc.area && 
        !list.includes(loc.area)
      ) {
        list.push(loc.area);
      }
    });

    // 3. Add standard Nigerian Areas for this state
    const stdAreas = selectedState ? nigeriaLocations[selectedState] || [] : [];
    stdAreas.forEach((area) => {
      if (!list.includes(area)) {
        list.push(area);
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
              onAreaChange(''); // Reset Area default on State change
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

        {/* Area/City Autocomplete Selector */}
        <div className="relative w-full">
          <SmartSuggestInput
            value={selectedArea}
            onChange={onAreaChange}
            placeholder={areaPlaceholder}
            suggestions={getAreaSuggestions()}
            icon={<MapPin className="w-4 h-4 text-gray-400" />}
          />
          
          {/* Tooltip trigger */}
          <div className="absolute inset-y-0 right-10 flex items-center pr-1 group">
            <Info className="w-3.5 h-3.5 text-gray-400 hover:text-[#0A192F] cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg hidden sm:block font-sans">
              Type custom area or select from list. Encourages absolute geographical flexibility.
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
