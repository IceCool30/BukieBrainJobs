'use client';
import { useEffect, useState } from 'react';

/**
 * Mobile shell signal for homepage and chrome.
 * True when either:
 * - viewport is mobile width (below Tailwind md / 768px), or
 * - the session is an installed standalone web app (display-mode or iOS standalone).
 * Desktop width keeps the full website homepage.
 */
const MOBILE_MAX_WIDTH_PX = 767;

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;

  const displayModeStandalone =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(display-mode: standalone)').matches;

  const iosStandalone =
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

  return displayModeStandalone || iosStandalone;
}

function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`).matches;
  }
  return window.innerWidth <= MOBILE_MAX_WIDTH_PX;
}

function shouldUseMobileShell(): boolean {
  return isStandaloneDisplay() || isMobileViewport();
}

export function useIsPwa() {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    const update = () => setIsPwa(shouldUseMobileShell());
    update();

    const cleanups: Array<() => void> = [];

    if (typeof window.matchMedia === 'function') {
      const standaloneMedia = window.matchMedia('(display-mode: standalone)');
      const mobileMedia = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH_PX}px)`);

      const onChange = () => update();

      if (typeof standaloneMedia.addEventListener === 'function') {
        standaloneMedia.addEventListener('change', onChange);
        mobileMedia.addEventListener('change', onChange);
        cleanups.push(() => {
          standaloneMedia.removeEventListener('change', onChange);
          mobileMedia.removeEventListener('change', onChange);
        });
      } else {
        standaloneMedia.addListener(onChange);
        mobileMedia.addListener(onChange);
        cleanups.push(() => {
          standaloneMedia.removeListener(onChange);
          mobileMedia.removeListener(onChange);
        });
      }
    } else {
      const onResize = () => update();
      window.addEventListener('resize', onResize);
      cleanups.push(() => window.removeEventListener('resize', onResize));
    }

    return () => {
      for (const cleanup of cleanups) cleanup();
    };
  }, []);

  return isPwa;
}
