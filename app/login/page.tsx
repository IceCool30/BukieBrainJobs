'use client';

import { LogoBase64 } from '@/lib/logo';
import Image from 'next/image';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Eye, EyeOff, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';
import { SmoothCollapse } from '@/components/SmoothCollapse';

type Step = 'identity_gateway' | 'password_gateway';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [step, setStep] = useState<Step>('identity_gateway');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Internal toggle for unified sign in/sign up processing
  const [isSignUp, setIsSignUp] = useState(false);

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
    <main className="flex min-h-screen flex-col items-center p-4 pt-12 sm:pt-24 bg-white text-[#0A192F] relative">
      <button 
        onClick={() => router.back()} 
        className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-gray-500 hover:text-[#0A192F] transition-colors font-medium text-sm sm:text-base"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      {/* Brand logo at the top */}
      <div className="flex items-center gap-3 mb-8">
        <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={40} height={40} className="rounded-[12px] shadow-sm border border-gray-200 bg-white p-[2px]" />
        <h1 className="text-3xl font-bold text-[#0A192F] font-sans tracking-tight">
          BukieBrainJobs
        </h1>
      </div>

      <FadeUp delay={0.1} className="w-full max-w-md bg-white rounded-3xl border border-gray-200 overflow-hidden" id="login-wizard-card">
        {step === 'identity_gateway' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0A192F] mb-2 tracking-tight">Ready to take the next step?</h2>
              <p className="text-gray-600">Create an account or sign in.</p>
            </div>

            <div className="text-[13px] text-gray-500 leading-relaxed font-medium">
              By creating an account or logging in, you understand and agree to the BukieBrainJobs Terms. You also acknowledge our Cookie and Privacy policies. You will receive updates regarding community tasks.
            </div>

            <SmoothCollapse isOpen={!!errorMsg}>
              <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100 mb-4" id="identity-error">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            </SmoothCollapse>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full bg-white text-[#0A192F] font-bold py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-150 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {/* Google Brand SVG */}
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 text-gray-400 text-sm font-medium">
              <div className="flex-1 h-px bg-gray-200"></div>
              or
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-bold text-[#0A192F]">
                  Email address *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm transition-shadow"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0A192F] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#112a4f] transition-all duration-150 active:scale-[0.98]"
              >
                Continue with Email
              </button>
            </form>
          </div>
        )}

        {step === 'password_gateway' && (
          <div className="p-6 sm:p-8">
            <button
              onClick={() => {
                setStep('identity_gateway');
                setErrorMsg('');
                setMessage('');
              }}
              className="flex items-center gap-2 text-[#0A192F] font-bold mb-6 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <h2 className="text-2xl font-black text-[#0A192F] mb-6 tracking-tight">
              Enter your secure account password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="block text-sm font-bold text-[#0A192F]">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm transition-shadow pr-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-[#0A192F] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <SmoothCollapse isOpen={!!errorMsg}>
                <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-sm border border-red-100" id="password-error">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              </SmoothCollapse>

              <SmoothCollapse isOpen={!!message}>
                <div className="flex items-start gap-2 bg-green-50 text-[#0A192F] p-3 rounded-xl text-sm border border-green-100" id="password-message">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#004D2C] mt-0.5" />
                  <span>{message}</span>
                </div>
              </SmoothCollapse>

              <div className="flex items-center gap-2 text-sm text-[#0A192F] font-medium pt-2">
                <input
                  type="checkbox"
                  id="signup-toggle"
                  checked={isSignUp}
                  onChange={(e) => setIsSignUp(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#0A192F] focus:ring-[#0A192F]"
                />
                <label htmlFor="signup-toggle" className="cursor-pointer">
                  I am creating a new account
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0A192F] text-white py-3 px-4 rounded-xl font-bold hover:bg-[#112a4f] transition-all duration-150 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          </div>
        )}
      </FadeUp>
    </main>
  );
}
