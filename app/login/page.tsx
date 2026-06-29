'use client';

import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';
import Image from 'next/image';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { ArrowLeft, Eye, EyeOff, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';
import { SmoothCollapse } from '@/components/SmoothCollapse';

type Step = 'identity_gateway' | 'password_gateway';

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [step, setStep] = useState<Step>('identity_gateway');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Internal toggle for unified sign in/sign up processing
  const [isSignUp, setIsSignUp] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      if (error === 'auth_failed') {
        const details = params.get('details');
        if (details) {
          setErrorMsg(`Google login failed: ${details}`);
        } else {
          setErrorMsg('Google login failed or was cancelled. If you are running on a custom domain like Vercel, please make sure your Supabase project URL configuration has both Site URL and Redirect URLs set up correctly.');
        }
      } else if (error === 'missing_code') {
        setErrorMsg('Authorization code is missing. Please try again.');
      }
    }
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    setStep('password_gateway');
  };

  const handleGoogleAuth = async () => {
    setErrorMsg('');
    setLoading(true);
    if (!isSupabaseConfigured()) {
      setMessage('Simulating Google Auth inside the Sandbox environment...');
      setTimeout(() => {
        router.push('/onboarding');
      }, 1000);
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) setErrorMsg(error.message);
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during Google Auth.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    setLoading(true);

    if (!isSupabaseConfigured()) {
      setMessage('Sandbox login successful! Redirecting to onboarding...');
      setTimeout(() => {
        router.push('/onboarding');
      }, 1000);
      return;
    }

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/api/auth/callback`
          }
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          if (data?.session) {
            setMessage('Registration successful! Redirecting...');
            setTimeout(() => router.push('/onboarding'), 1500);
          } else {
            setMessage('Account created! Please check your email inbox to confirm your registration.');
          }
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrorMsg('Invalid login credentials. If you are new, try checking the sign up option below.');
          } else {
            setErrorMsg(error.message);
          }
        } else {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => router.push('/onboarding'), 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
        {step === 'identity_gateway' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-navy mb-2 tracking-tight">Ready to take the next step?</h2>
              <p className="text-sm text-brand-navy/60 font-medium">Create an account or sign in.</p>
            </div>

            <div className="text-xs text-brand-navy/50 leading-relaxed font-medium">
              By creating an account or logging in, you understand and agree to the BukieBrainJobs Terms. You also acknowledge our Cookie and Privacy policies. You will receive updates regarding community jobs.
            </div>

            <SmoothCollapse isOpen={!!errorMsg}>
              <div className="flex items-start gap-2.5 bg-red-50 text-red-700 p-3.5 rounded-xl text-xs sm:text-sm border border-red-100/50 mb-4" id="identity-error">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span className="leading-relaxed font-medium">{errorMsg}</span>
              </div>
            </SmoothCollapse>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-brand-surface hover:bg-brand-surface/80 text-brand-navy font-semibold py-3 px-4 rounded-xl border border-brand-border/50 transition-all duration-150 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
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

            <div className="flex items-center gap-4 text-brand-navy/30 text-xs font-semibold">
              <div className="flex-1 h-px bg-brand-border/40"></div>
              <span>OR</span>
              <div className="flex-1 h-px bg-brand-border/40"></div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-brand-navy/80">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 bg-brand-surface border border-brand-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-xs sm:text-sm transition-all duration-150 text-brand-navy placeholder-brand-navy/35"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-navy hover:bg-brand-navy/95 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
              >
                Continue with Email
              </button>
            </form>
          </div>
        )}

        {step === 'password_gateway' && (
          <div className="p-6 sm:p-8 space-y-6">
            <button
              onClick={() => {
                setStep('identity_gateway');
                setErrorMsg('');
                setMessage('');
              }}
              className="flex items-center gap-1.5 text-brand-navy/60 hover:text-brand-navy font-semibold text-xs sm:text-sm transition-colors cursor-pointer bg-brand-surface hover:bg-brand-surface/80 border border-brand-border/40 px-3.5 py-1.5 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-navy tracking-tight">
              Enter your secure account password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-brand-navy/80">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-brand-surface border border-brand-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-xs sm:text-sm transition-all duration-150 pr-12 text-brand-navy placeholder-brand-navy/30"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-navy/40 hover:text-brand-navy transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <SmoothCollapse isOpen={!!errorMsg}>
                <div className="flex items-start gap-2.5 bg-red-50 text-red-700 p-3.5 rounded-xl text-xs sm:text-sm border border-red-100/50" id="password-error">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-650 mt-0.5" />
                  <span className="leading-relaxed font-medium">{errorMsg}</span>
                </div>
              </SmoothCollapse>

              <SmoothCollapse isOpen={!!message}>
                <div className="flex items-start gap-2.5 bg-brand-green/5 text-brand-green p-3.5 rounded-xl text-xs sm:text-sm border border-brand-green/10" id="password-message">
                  <CheckCircle className="w-4 h-4 shrink-0 text-brand-green mt-0.5" />
                  <span className="leading-relaxed font-medium">{message}</span>
                </div>
              </SmoothCollapse>

              <div className="flex items-center gap-2.5 text-xs sm:text-sm text-brand-navy/80 font-medium pt-1">
                <input
                  type="checkbox"
                  id="signup-toggle"
                  checked={isSignUp}
                  onChange={(e) => setIsSignUp(e.target.checked)}
                  className="w-4 h-4 rounded border-brand-border text-brand-green focus:ring-brand-green cursor-pointer"
                />
                <label htmlFor="signup-toggle" className="cursor-pointer select-none font-sans text-brand-navy/70 text-xs sm:text-sm font-semibold">
                  I am creating a new account (Sign Up)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-navy hover:bg-brand-navy/95 text-white py-3 px-4 rounded-xl font-bold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 cursor-pointer text-xs sm:text-sm"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
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
