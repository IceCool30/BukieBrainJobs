'use client';
import { useEffect, useState } from 'react';

export function useIsPwa() {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    const standalone =
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      ((window.navigator as Navigator & { standalone?: boolean }).standalone === true);
    const narrow = window.innerWidth < 640;
    setIsPwa(standalone || narrow);
  }, []);

  return isPwa;
}
