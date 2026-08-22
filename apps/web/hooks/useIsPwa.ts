'use client';
import { useEffect, useState } from 'react';

/**
 * Returns true only when the session is an installed / standalone web app.
 * Mobile browser width must never be treated as PWA.
 * Desktop browser and responsive mobile web use the normal website experience.
 */
function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;

  const displayModeStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;

  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return displayModeStandalone || iosStandalone;
}

export function useIsPwa() {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    const update = () => setIsPwa(isStandaloneDisplay());
    update();

    if (typeof window.matchMedia !== 'function') return;

    const media = window.matchMedia('(display-mode: standalone)');
    const onChange = () => update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    }

    media.addListener(onChange);
    return () => media.removeListener(onChange);
  }, []);

  return isPwa;
}
