'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';


export default function PassportEditorPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

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
      if (!isSupabaseConfigured()) {
        setUser({ id: 'mock-user-id', email: 'worker@example.com' });
        setProfile({ id: 'mock-user-id', full_name: 'Solomon Ogar', role: 'worker', location_state: 'Lagos', location_lga: 'Ikeja' });
        setBio('I am an expert plumber and electrician.');
        setSkills('Plumbing, Electrical, Tiling');
        setHourlyRate('2500');
        setLoading(false);
        return;
      }
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
          .eq('profile_id', currentUser.id)
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
  }, [router, supabase]);

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
          profile_id: user.id,
          bio: bio.trim(),
          skills: skillsArray,
          hourly_rate: parsedRate,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' });

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
      <main className="flex min-h-screen items-center justify-center bg-brand-bg text-brand-navy">
        <div className="flex flex-col items-center gap-3">
          <LogoLink
            className="bg-brand-bg rounded-[1.5rem] shadow-sm border border-brand-border flex items-center gap-1.5 p-1 w-fit mb-3 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="text-xs font-mono text-brand-navy/60 font-bold uppercase tracking-wide">
            Retrieving BukiePassport state...
          </span>
        </div>
      </main>
    );
  }

  // Role Gate UI: If not a worker
  if (profile && profile.role !== 'worker') {
    return (
      <main className="min-h-screen bg-brand-bg text-brand-navy py-12 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-brand-bg rounded-2xl shadow-sm border border-brand-border p-8 text-center animate-fadeIn"
          id="role-gate-container"
        >
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-brand-navy tracking-tight font-display">Access Restricted</h1>
          <p className="text-sm text-brand-navy/60 mt-2 leading-relaxed">
            The BukiePassport Identity Page is exclusively available for verified artisans and service providers (Get Hired track). Those looking to Hire Talent can hire and evaluate workers from the master dashboard or search directories.
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-brand-green hover:bg-brand-green/90 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] font-display"
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
    <main className="min-h-screen bg-brand-bg text-brand-navy py-8 px-4 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-2xl" id="passport-editor-container">
        
        {/* Back Link */}
        <button
          onClick={() => router.push('/dashboard')}
          className="group mb-6 inline-flex items-center gap-2 text-xs font-bold text-brand-navy/60 hover:text-brand-navy uppercase tracking-wider transition-all cursor-pointer font-display"
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
              className="bg-brand-bg rounded-2xl p-8 shadow-sm border border-brand-green/30 text-center mb-8 flex flex-col items-center justify-center relative overflow-hidden"
              id="passport-success-state"
            >
              <CheckCircle className="w-16 h-16 text-brand-green mb-4 animate-bounce" />
              <h2 className="text-2xl font-black text-brand-navy tracking-tight font-display">
                Passport Updated!
              </h2>
              <p className="text-sm text-brand-navy/60 mt-2 max-w-sm">
                Your credentials and identity are now securely synchronized across local guilds and Telegram notifications.
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs font-mono font-semibold uppercase text-brand-navy bg-brand-surface border border-brand-border px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-green" />
                <span>Saving identity updates...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!success && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-bg rounded-2xl shadow-sm border border-brand-border overflow-hidden"
            id="passport-editor-card"
          >
            {/* Header branding */}
            <div className="bg-brand-surface text-brand-navy p-6 md:p-8 relative overflow-hidden border-b border-brand-border">
              <div className="flex items-center gap-3">
                <LogoLink />
                <div>
                  <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-brand-navy font-display">
                    Edit BukiePassport
                  </h1>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-brand-green font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 fill-brand-green stroke-none animate-pulse text-brand-green" />
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
              <div className="p-4 bg-brand-surface rounded-xl border border-brand-border/60 flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center text-brand-green font-black text-lg font-display">
                  {profile?.full_name?.charAt(0).toUpperCase() || 'W'}
                </div>
                <div>
                  <span className="block text-xs font-mono font-bold text-brand-navy/40 uppercase tracking-wider">Active Worker Code</span>
                  <span className="text-sm font-extrabold text-brand-navy">{profile?.full_name || 'Artisan Partner'}</span>
                </div>
              </div>

              {/* Bio Pitch (Brief summary of your professional capability) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 flex items-center gap-1 font-display">
                  <Briefcase className="w-3.5 h-3.5 text-brand-navy/45" />
                  <span>Professional Bio / Pitch *</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Professional certified electrician with 5+ years of practical experience in industrial cabling, generator servicing, and domestic safety systems."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm px-4 py-3 rounded-xl transition-all outline-none text-brand-navy placeholder-brand-navy/40 font-medium resize-none"
                />
                <span className="text-[10px] text-brand-navy/45 mt-1 block">Describe your specialties, general location served, and specific skills to win jobs easily.</span>
              </div>

              {/* Skills (Comma separated list) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 flex items-center gap-1 font-display">
                  <Layers className="w-3.5 h-3.5 text-brand-navy/45" />
                  <span>Core Skills (Comma-separated) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wiring, Generator repair, AC installation, Plumbing"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm px-4 py-3 rounded-xl transition-all outline-none text-brand-navy placeholder-brand-navy/40 font-medium"
                />
                <span className="text-[10px] text-brand-navy/45 mt-1 block">List distinct skill sets workers can search on. Separate multiple entries with commas.</span>
              </div>

              {/* Hourly Rate (Naira per hour) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-brand-navy mb-2 flex items-center gap-1 font-display">
                  <DollarSign className="w-3.5 h-3.5 text-brand-navy/45" />
                  <span>Hourly Rate (₦ Naira / Hr) *</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/45 font-bold text-sm">
                    ₦
                  </span>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 2500"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full bg-brand-bg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent text-sm pl-9 pr-4 py-3 rounded-xl transition-all outline-none text-brand-navy placeholder-brand-navy/40 font-mono font-semibold"
                  />
                </div>
                <span className="text-[10px] text-brand-navy/45 mt-1 block">Your baseline pricing per hour of onsite artisanal work.</span>
              </div>

              <div className="border-t border-brand-border/60 my-6"></div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full sm:w-auto text-xs text-brand-navy/60 hover:text-brand-navy font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer bg-brand-surface hover:bg-brand-border border border-brand-border/60 text-center font-display"
                  id="cancel-passport-btn"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto min-w-[180px] flex items-center justify-center gap-2 bg-brand-green hover:bg-brand-green/90 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.98] font-display"
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

