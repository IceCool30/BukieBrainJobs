'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { LogIn, UserPlus, ShieldAlert, Sparkles } from 'lucide-react';

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#F4F5F7] text-[#1A1C1E]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden" id="login-card">
        {/* Brand Header */}
        <div className="bg-[#1A1C1E] p-8 text-center relative overflow-hidden" id="login-brand-header">
          {/* Decorative Pattern */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#006D44] opacity-20 rounded-full blur-xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-[#D4AF37] opacity-20 rounded-full blur-lg"></div>

          <div className="flex justify-center items-center gap-2 mb-2">
            {/* Logo structure: 3D "B" representation utilizing inline design */}
            <div className="w-10 h-10 bg-[#006D44] rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-md border-b-2 border-[#D4AF37]">
              B
            </div>
            <span className="text-2xl font-black text-white tracking-tight">
              Bukie<span className="text-[#006D44]">Brain</span><span className="text-[#D4AF37]">Jobs</span>
            </span>
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
                  ? 'border-[#006D44] text-[#006D44]'
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
                  ? 'border-[#006D44] text-[#006D44]'
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006D44] focus:border-transparent text-sm"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006D44] focus:border-transparent text-sm"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#006D44] focus:border-transparent text-sm"
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
              <div className="flex items-start gap-2 bg-green-50 text-[#006D44] p-3 rounded-xl text-xs border border-green-100" id="login-message">
                <Sparkles className="w-4 h-4 shrink-0 text-[#D4AF37]" />
                <span>{message}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              id="get-started-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full bg-[#006D44] text-white py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md shadow-green-900/10 hover:bg-[#005a37] transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2 mt-4 cursor-pointer"
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
      </div>
    </main>
  );
}
