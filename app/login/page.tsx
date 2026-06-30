'use client';

import { LogoLink } from '@/components/LogoLink';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';
import { SmoothCollapse } from '@/components/SmoothCollapse';

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState('');
  const [nextUrl, setNextUrl] = useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next');
      if (next) {
        setNextUrl(next);
      }
      const error = params.get('error');
      if (error === 'auth_failed') {
        const details = params.get('details');
        if (details) {
          setErrorMsg(`Authentication failed: ${details}`);
        } else {
          setErrorMsg('Authentication failed or was cancelled. Please try again.');
        }
      } else if (error === 'missing_code') {
        setErrorMsg('Authorization code is missing from the login provider. Please try again.');
      }
    }
  }, []);

  const handleWorkOSAuth = () => {
    setErrorMsg('');
    const target = nextUrl ? `/api/auth/workos-login?next=${encodeURIComponent(nextUrl)}` : '/api/auth/workos-login';
    window.location.href = target;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 py-16 bg-brand-bg text-brand-navy relative font-sans">
      <button 
        onClick={() => router.push('/')} 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-brand-navy/60 hover:text-brand-navy transition-all duration-200 font-semibold text-xs sm:text-sm z-10 bg-brand-surface/80 hover:bg-brand-surface border border-brand-border/40 px-3.5 py-1.5 rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Brand logo at the top */}
      <div className="flex items-center gap-2.5 mb-8">
        <LogoLink
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
          imageClassName="rounded-xl shadow-sm border border-brand-border/40 bg-brand-bg p-[2px]"
          width={36}
          height={36}
          showText={false}
        />
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-brand-navy tracking-tight">
          BukieBrainJobs
        </h1>
      </div>

      <FadeUp delay={0.1} className="w-full max-w-md bg-brand-bg rounded-2xl border border-brand-border/40 shadow-[0_8px_30px_rgba(10,25,47,0.02)] overflow-hidden flex-shrink-0" id="login-wizard-card">
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <span className="inline-flex items-center gap-1 bg-brand-green/10 text-brand-green text-xs font-bold px-2.5 py-1 rounded-full mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Secure Action Gateway
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-navy mb-2 tracking-tight">
              Ready to take the next step?
            </h2>
            <p className="text-sm text-brand-navy/60 font-medium leading-relaxed">
              This action requires a verified BukieBrainJobs profile. Authenticate securely with WorkOS AuthKit to continue.
            </p>
          </div>

          <div className="text-xs text-brand-navy/50 leading-relaxed font-medium">
            By logging in or creating an account, you agree to the BukieBrainJobs Terms. You also acknowledge our Cookie and Privacy policies.
          </div>

          <SmoothCollapse isOpen={!!errorMsg}>
            <div className="flex items-start gap-2.5 bg-red-50 text-red-700 p-3.5 rounded-xl text-xs sm:text-sm border border-red-100/50 mb-4" id="identity-error">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span className="leading-relaxed font-medium">{errorMsg}</span>
            </div>
          </SmoothCollapse>

          <div className="space-y-3.5">
            {/* WorkOS Google Auth Redirect */}
            <button
              onClick={handleWorkOSAuth}
              className="w-full bg-brand-surface hover:bg-brand-surface/80 text-brand-navy font-semibold py-3 px-4 rounded-xl border border-brand-border/50 transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer text-xs sm:text-sm"
              id="google-workos-auth-button"
            >
              {/* Google Brand SVG */}
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            {/* General AuthKit Button */}
            <button
              onClick={handleWorkOSAuth}
              className="w-full bg-[#0A192F] hover:bg-[#0A192F]/90 text-white font-semibold py-3.5 px-4 rounded-xl transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer text-xs sm:text-sm shadow-md"
              id="workos-auth-button"
            >
              {/* Secure Lock Shield SVG */}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-green animate-pulse">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>Continue with AuthKit (WorkOS)</span>
            </button>

            <div className="flex items-center gap-4 text-brand-navy/30 text-xs font-semibold py-1">
              <div className="flex-1 h-px bg-brand-border/40"></div>
              <span>OR</span>
              <div className="flex-1 h-px bg-brand-border/40"></div>
            </div>

            {/* Email Redirect Button */}
            <button
              onClick={handleWorkOSAuth}
              className="w-full bg-brand-surface hover:bg-brand-surface/80 text-brand-navy font-semibold py-3 px-4 rounded-xl border border-brand-border/50 transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer text-xs sm:text-sm"
              id="email-workos-auth-button"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-navy/60">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>Continue with Email</span>
            </button>
          </div>
        </div>
      </FadeUp>

      {/* Footer */}
      <div className="mt-auto pt-16 text-center text-xs sm:text-sm text-brand-navy/50 font-medium">
        <p className="mb-2">© {new Date().getFullYear()} BukieBrainJobs</p>
        <div className="flex items-center justify-center gap-4 text-xs">
          <button className="hover:text-brand-navy transition-colors cursor-pointer">About us</button>
          <span className="text-brand-navy/20">•</span>
          <button className="hover:text-brand-navy transition-colors cursor-pointer">Privacy Center</button>
          <span className="text-brand-navy/20">•</span>
          <button className="hover:text-brand-navy transition-colors cursor-pointer">Terms</button>
        </div>
      </div>
    </main>
  );
}
