'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  Save, 
  Loader2, 
  CheckCircle,
  AlertCircle,
  Hammer,
  DollarSign,
  Briefcase,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';


export default function PassportEditorPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // User/Profile state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Form Field States
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  // Auth & Access validation
  useEffect(() => {
    async function initPage() {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          router.push('/login');
          return;
        }

        const currentUser = session.user;
        setUser(currentUser);

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileError || !profileData) {
          setErrorMsg('Could not find profile metadata. Please complete onboarding.');
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Workers only check
        if (profileData.role !== 'worker') {
          // Gated. This page is Workers Only.
          setLoading(false);
          return;
        }

        // Fetch corresponding passport
        const { data: passport, error: passportError } = await supabase
          .from('bukie_passports')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!passportError && passport) {
          setBio(passport.bio || '');
          setSkills(passport.skills ? passport.skills.join(', ') : '');
          setHourlyRate(passport.hourly_rate != null ? String(passport.hourly_rate) : '');
        }
      } catch (err: any) {
        setErrorMsg('An error occurred loading your passport information.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    initPage();
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || profile?.role !== 'worker') return;

    setSaving(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const parsedRate = hourlyRate.trim() !== '' ? parseFloat(hourlyRate) : null;
      if (parsedRate !== null && (isNaN(parsedRate) || parsedRate < 0)) {
        setErrorMsg('Hourly rate must be a positive number.');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('bukie_passports')
        .upsert({
          user_id: user.id,
          bio: bio.trim(),
          skills: skillsArray,
          hourly_rate: parsedRate,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);

    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update passport record.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-3">
          <LogoLink
            className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit mb-3 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wide">
            Retrieving BukiePassport state...
          </span>
        </div>
      </main>
    );
  }

  // Role Gate UI: If not a worker
  if (profile && profile.role !== 'worker') {
    return (
      <main className="min-h-screen bg-white text-[#0A192F] py-12 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center"
          id="role-gate-container"
        >
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Access Restricted</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            The BukiePassport Identity Page is exclusively available for verified artisans and service providers (Workers). Employers can hire and evaluate workers from the master dashboard or search directories.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#0A192F] hover:bg-gray-800 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A192F] py-8 px-4 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-2xl" id="passport-editor-container">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/dashboard')}
          className="group mb-6 inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-all cursor-pointer"
          id="back-to-dashboard-btn"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Dashboard</span>
        </button>

        {/* Success Modal overlay */}
        <AnimatePresence>
          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 shadow-xl border border-green-100 text-center mb-8 flex flex-col items-center justify-center relative overflow-hidden"
              id="passport-success-state"
            >
              <div className="absolute right-0 top-0 w-24 h-24 bg-green-500/5 rounded-full blur-xl animate-pulse"></div>
              <CheckCircle className="w-16 h-16 text-emerald-600 mb-4 animate-bounce" />
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Passport Updated!
              </h2>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                Your credentials and identity are now securely synchronized across local guilds and Telegram notifications.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#0A192F] bg-[#0A192F]/5 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving identity updates...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden"
            id="passport-editor-card"
          >
            {/* Header branding */}
            <div className="bg-[#0A192F] text-white p-6 md:p-8 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#004D2C]/10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-3">
                <LogoLink />
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
                    Edit BukiePassport
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#004D2C] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 fill-amber-500 stroke-none animate-pulse" />
                    Professional Worker ID
                  </span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="m-6 md:m-8 mb-0 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl font-medium flex items-center gap-2" id="passport-editor-error">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              
              {/* Profile Details Header Block */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0A192F]/10 rounded-xl flex items-center justify-center text-[#0A192F] font-black text-lg">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'W'}
                </div>
                <div>
                  <span className="block text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">Active Worker Code</span>
                  <span className="text-sm font-extrabold text-gray-900">{profile?.full_name || 'Artisan Partner'}</span>
                </div>
              </div>

              {/* Bio Pitch (Brief summary of your professional capability) */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>Professional Bio / Pitch *</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Professional certified electrician with 5+ years of practical experience in industrial cabling, generator servicing, and domestic safety systems."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#0A192F] focus:bg-white text-sm px-4 py-3 rounded-xl transition-all outline-none text-gray-900 placeholder-gray-400 font-medium resize-none shadow-sm"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Describe your specialties, general location served, and specific skills to win jobs easily.</span>
              </div>

              {/* Skills (Comma separated list) */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>Core Skills (Comma-separated) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wiring, Generator repair, AC installation, Plumbing"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#0A192F] focus:bg-white text-sm px-4 py-3 rounded-xl transition-all outline-none text-gray-900 placeholder-gray-400 font-medium shadow-sm"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">List distinct skill sets workers can search on. Separate multiple entries with commas.</span>
              </div>

              {/* Hourly Rate (Naira per hour) */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                  <span>Hourly Rate (₦ Naira / Hr) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2500"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#0A192F] focus:bg-white text-sm pl-9 pr-4 py-3 rounded-xl transition-all outline-none text-gray-900 placeholder-gray-400 font-mono font-semibold shadow-sm"
                  />
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Your baseline pricing per hour of onsite artisanal work.</span>
              </div>

              <div className="border-t border-gray-100 my-6"></div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto text-xs text-gray-500 hover:text-gray-900 font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer bg-gray-50 hover:bg-gray-100 text-center"
                  id="cancel-passport-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto min-w-[180px] flex items-center justify-center gap-2 bg-[#0A192F] hover:bg-[#112a4f] text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md shadow-green-900/10 cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-all"
                  id="save-passport-btn"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Updates...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Save BukiePassport</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </motion.div>
        )}

      </div>
    </main>
  );
}
