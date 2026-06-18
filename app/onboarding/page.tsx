'use client';
import { LogoBase64 } from '@/lib/logo';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'motion/react';
import { Briefcase, Hammer, LogOut, ArrowRight, User, Loader2 } from 'lucide-react';


export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<'employer' | 'worker' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          router.push('/login');
          return;
        }

        const userObj = session.user;
        setUserId(userObj.id);
        setUserName(userObj.user_metadata?.full_name || userObj.email || 'User');

        // Fetch current profile if role already setup to initialize choice
        const { data: profile, error: dbError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userObj.id)
          .single();

        if (!dbError && profile) {
          setSelected(profile.role);
        }
      } catch (err: any) {
        console.error('Error in onboarding load:', err);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, [supabase, router]);

  const handleRoleSelection = async (role: 'employer' | 'worker') => {
    if (!userId) return;
    setErrorMsg('');
    setSaving(true);
    setSelected(role);

    try {
      // 1. Update profiles table: set role to 'employer' or 'worker'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // 2. Insert into bukie_passports if worker to guarantee database consistency
      if (role === 'worker') {
        const { error: passportError } = await supabase
          .from('bukie_passports')
          .upsert({
            user_id: userId,
            skills: [],
            is_verified: false,
          }, { onConflict: 'user_id' });
        
        if (passportError) {
          console.warn('Could not upsert default passport entry:', passportError.message);
        }
      }

      // 3. Redirect matching the selected role gate flow
      if (role === 'employer') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard/passport-setup');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not update your role preference. Please try again.');
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-3">
          <Image src={LogoBase64} alt="Loading..." width={40} height={40} className="animate-pulse shadow-md rounded-xl bg-white p-[2px]" />
          <span className="text-sm font-medium text-gray-500 font-mono">Verifying authentication...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-[#0A192F] p-4 md:p-8">
      {/* Top Bar with user info and Logout */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center py-4 border-b border-gray-200/60 mb-8" id="onboarding-header">
        <div className="flex items-center gap-2">
          <Image src={LogoBase64} alt="BukieBrainJobs Logo" width={32} height={32} className="rounded-lg shadow border-b-2 border-[#004D2C] bg-white p-[2px]" />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 font-medium bg-white px-3 py-1.5 rounded-full border border-gray-100">
            <User className="w-3.5 h-3.5 text-[#0A192F]" />
            <span>Hi, {userName}</span>
          </div>
          <button
            id="onboarding-logout-btn"
            type="button"
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-800 font-bold uppercase tracking-wider bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm transition-all hover:bg-red-50 hover:border-red-100 cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Role Selection Space */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl w-full mx-auto pb-12" id="onboarding-body">
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight"
          >
            Let&apos;s Set Up Your Space
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mt-2 text-sm text-gray-500 max-w-md mx-auto"
          >
            Choose your path below to customize your BukieBrainJobs dashboard. You can update this later in settings.
          </motion.p>
        </div>

        {errorMsg && (
          <div className="mb-6 max-w-lg mx-auto w-full bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100 text-center" id="onboarding-error">
            {errorMsg}
          </div>
        )}

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mx-auto">
          {/* Card A: Employer */}
          <motion.div
            id="employer-role-card"
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`bg-white p-8 rounded-2xl shadow-md border-2 transition-all cursor-pointer flex flex-col justify-between h-72 ${
              selected === 'employer'
                ? 'border-[#0A192F] ring-2 ring-[#0A192F]/10 bg-green-50/10'
                : 'border-transparent hover:border-gray-200'
            }`}
            onClick={() => handleRoleSelection('employer')}
          >
            <div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-[#0A192F] mb-5 border border-green-100">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">I want to Hire</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Post local jobs with &quot;sachet&quot; options, inspect bids, and connect with trusted verified artisans in your LGA.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#0A192F] mt-4">
              <span>Select Employer</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>

          {/* Card B: Worker / Artisan */}
          <motion.div
            id="worker-role-card"
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`bg-white p-8 rounded-2xl shadow-md border-2 transition-all cursor-pointer flex flex-col justify-between h-72 ${
              selected === 'worker'
                ? 'border-[#0A192F] ring-2 ring-[#0A192F]/10 bg-green-50/10'
                : 'border-transparent hover:border-gray-200'
            }`}
            onClick={() => handleRoleSelection('worker')}
          >
            <div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-[#004D2C] mb-5 border border-amber-100">
                <Hammer className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">I am an Artisan</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                Find local work, submit bid packages, and build your digital *BukiePassport* to win client trust.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#004D2C] mt-4">
              <span>Select Artisan</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </motion.div>
        </div>

        {/* Loading Overlay */}
        {saving && (
          <div className="fixed inset-0 bg-[#0A192F]/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white px-6 py-4 rounded-xl flex items-center gap-3 shadow-xl border border-gray-100">
              <Loader2 className="w-5 h-5 animate-spin text-[#0A192F]" />
              <span className="text-sm font-semibold text-gray-700">Updating your profile...</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
