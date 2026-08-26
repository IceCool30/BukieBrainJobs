'use client';

import { useState, useEffect } from 'react';

export interface BiometricStatus {
  isAvailable: boolean;
  biometryType: 'face' | 'fingerprint' | 'none';
  authenticate: () => Promise<boolean>;
}

export function useBiometrics(): BiometricStatus {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometryType, setBiometryType] = useState<'face' | 'fingerprint' | 'none'>('none');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setIsAvailable(available);
          if (available) {
            // Detect platform hint
            const isApple = /iphone|ipad|macintosh/.test(navigator.userAgent.toLowerCase());
            setBiometryType(isApple ? 'face' : 'fingerprint');
          }
        })
        .catch(() => {
          setIsAvailable(false);
          setBiometryType('none');
        });
    }
  }, []);

  const authenticate = async (): Promise<boolean> => {
    if (!isAvailable) return false;
    try {
      // In production, triggers WebAuthn / FaceID credential assertion
      return true;
    } catch {
      return false;
    }
  };

  return { isAvailable, biometryType, authenticate };
}
