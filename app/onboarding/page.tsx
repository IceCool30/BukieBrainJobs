'use client';

import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { motion } from 'motion/react';
import { LogOut, User, Loader2 } from 'lucide-react';

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
  
  // React state to track user's selection
  const [selectedRole, setSelectedRole] = useState<'employer' | 'artisan' | null>(null);
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
          if (profile.role === 'worker') {
            setSelectedRole('artisan');
          } else if (profile.role === 'employer') {
            setSelectedRole('employer');
          }
        }
      } catch (err: any) {
        console.error('Error in onboarding load:', err);
      } finally {
        setLoading(false);
      }
    }
    checkUser();
  }, [supabase, router]);

  const handleSubmit = async () => {
    if (!userId || !selectedRole) return;
    setErrorMsg('');
    setSaving(true);

    try {
      // Map artisan back to worker for DB schema consistency
      const dbRole = selectedRole === 'artisan' ? 'worker' : 'employer';

      // 1. Update profiles table: set role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: dbRole })
        .eq('id', userId);

      if (profileError) {
        throw new Error(profileError.message);
      }

      // 2. Insert into bukie_passports if worker to guarantee database consistency
      if (dbRole === 'worker') {
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
      if (dbRole === 'employer') {
        router.push('/dashboard');
      } else {
        router.push('/dashboard/passport-setup'); // Assuming worker setup page
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
          <LogoLink
            className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="text-sm font-medium text-gray-500 font-mono">Verifying authentication...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-white text-[#0A192F] p-4 md:p-8 relative">
      {/* Top Bar with user info and Logout */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center py-4 mb-16" id="onboarding-header">
        <div className="flex items-center gap-2">
          <LogoLink
            className="bg-white flex items-center gap-2 w-fit cursor-pointer hover:opacity-80 transition-opacity"
            imageClassName="rounded-lg shadow-sm border border-gray-200 p-[2px]"
            width={32}
            height={32}
            showText={true}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-sm text-[#0A192F] font-bold">
            <User className="w-4 h-4 text-[#0A192F]" />
            <span>Hi, {userName}</span>
          </div>
          <button
            id="onboarding-logout-btn"
            type="button"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#0A192F] font-bold transition-all cursor-pointer"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Role Selection Space */}
      <div className="flex-1 flex flex-col items-center max-w-2xl w-full mx-auto pb-12" id="onboarding-body">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold text-[#0A192F] tracking-tight mb-4"
          >
            Welcome. Let us get you set up.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-base text-gray-500"
          >
            Are you here to hire or here to work? Pick one and we will take it from there.
          </motion.p>
        </div>

        {errorMsg && (
          <div className="mb-6 w-full bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100 text-center font-medium" id="onboarding-error">
            {errorMsg}
          </div>
        )}

        {/* Interactive Selection Cards */}
        <div className="flex flex-col gap-4 w-full mb-8">
          {/* Card 1: Employer */}
          <motion.div
            id="employer-role-card"
            whileHover={{ y: -2 }}
            className={`p-6 rounded-2xl transition-all cursor-pointer border-2 flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] focus-visible:border-transparent ${
              selectedRole === 'employer'
                ? 'border-[#0A192F] bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => setSelectedRole('employer')}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedRole('employer');
              }
            }}
          >
            <h3 className="text-xl font-bold text-[#0A192F] mb-2">I want to hire someone</h3>
            <p className="text-sm text-[#0A192F]/70 font-medium leading-relaxed">
              Post a job, chat with applicants, and pay only when the work is done. Your money stays safe until you confirm everything is good.
            </p>
          </motion.div>

          {/* Card 2: Artisan */}
          <motion.div
            id="worker-role-card"
            whileHover={{ y: -2 }}
            className={`p-6 rounded-2xl transition-all cursor-pointer border-2 flex flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F] focus-visible:border-transparent ${
              selectedRole === 'artisan'
                ? 'border-[#0A192F] bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
            onClick={() => setSelectedRole('artisan')}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedRole('artisan');
              }
            }}
          >
            <h3 className="text-xl font-bold text-[#0A192F] mb-2">I want to find work</h3>
            <p className="text-sm text-[#0A192F]/70 font-medium leading-relaxed">
              Browse jobs near you, apply in one tap, and build your reputation. A verified profile helps employers trust you faster.
            </p>
          </motion.div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedRole || saving}
          className="w-full bg-[#0A192F] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#112a4f] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-3 shadow-lg shadow-blue-900/10 active:scale-[0.98]"
        >
          {saving && <Loader2 className="w-5 h-5 animate-spin" />}
          That is me. Continue.
        </button>

        {/* Loading Overlay (Optional extra feedback if desired, keeping minimal here) */}
      </div>
    </main>
  );
}

