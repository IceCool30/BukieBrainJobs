'use client';
import { LogoBase64 } from '@/lib/logo';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';
import { FadeUp } from '@/components/FadeUp';

export default function LoginPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName || email)}`
            },
            emailRedirectTo: `${window.location.origin}/api/auth/callback`
          }
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          // If auto-confirm is enabled or email confirmation is required:
          if (data?.session) {
            setMessage('Registration successful! Redirecting...');
            setTimeout(() => {
              router.push('/onboarding');
            }, 1500);
          } else {
            setMessage('Account created! Please check your email inbox to confirm your registration.');
          }
        }
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          setMessage('Login successful! Redirecting...');
          setTimeout(() => {
            router.push('/onboarding');
          }, 1000);
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-white text-[#0A192F]">
      <FadeUp delay={0.1} className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]" id="login-card">
        {/* Brand Header */}
        <div className="bg-[#0A192F] p-8 text-center relative overflow-hidden" id="login-brand-header">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#0A192F] opacity-20 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#004D2C] opacity-20 rounded-full blur-lg"></div>

          <div className="flex justify-center items-center gap-2 mb-2">
            {/* Logo structure: 3D "B" representation utilizing inline design */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit">
              <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={28} height={28} className="rounded-[10px] shadow-sm border border-gray-200 bg-white p-[2px]" />
              <span className="font-black text-[16px] tracking-tight text-[#0A192F] pr-2 whitespace-nowrap">BukieBrainJobs</span>
            </div>
          </div>
          <p className="text-gray-400 text-xs tracking-wide uppercase font-semibold">
            Nigeria&apos;s &quot;Sachet&quot; Job Marketplace
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <div className="flex border-b border-gray-100 mb-6">
            <button
              id="signin-tab-btn"
              type="button"
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                !isSignUp
                  ? 'border-[#0A192F] text-[#0A192F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setIsSignUp(false);
                setErrorMsg('');
                setMessage('');
              }}
            >
              Sign In
            </button>
            <button
              id="signup-tab-btn"
              type="button"
              className={`flex-1 pb-3 text-center text-sm font-semibold border-b-2 transition-all ${
                isSignUp
                  ? 'border-[#0A192F] text-[#0A192F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => {
                setIsSignUp(true);
                setErrorMsg('');
                setMessage('');
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" id="login-form">
            {/* Full Name (Sign Up Only) */}
            {isSignUp && (
              <div id="field-fullname">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  id="fullname-input"
                  type="text"
                  required
                  placeholder="e.g. Kola Adesina"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            {/* Email */}
            <div id="field-email">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password */}
            <div id="field-password">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                id="password-input"
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Notification / Alert messages */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100" id="login-error">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 bg-green-50 text-[#0A192F] p-3 rounded-xl text-xs border border-green-100" id="login-message">
                <Sparkles className="w-4 h-4 shrink-0 text-[#004D2C]" />
                <span>{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="get-started-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#0A192F] text-white py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md shadow-green-900/10 hover:bg-[#112a4f] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-[0.98] transition-all"
            >
              {loading ? (
                <span>Loading...</span>
              ) : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started (Sign Up)</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Get Started (Sign In)</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Notice */}
          <div className="mt-6 text-center">
            <span className="text-xs text-gray-400 font-medium">
              Secured with Supabase Auth
            </span>
          </div>
        </div>
      </FadeUp>
    </main>
  );
}
