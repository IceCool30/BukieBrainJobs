'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { ArrowLeft, Hammer, ShieldCheck, Sparkles, Star, User, Save, ListTodo, BadgeAlert, AlertCircle } from 'lucide-react';

export default function PassportSetupPage() {
  const router = useRouter();
  const authSupabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  
  // Passport states
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string>('');
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function loadPassport() {
      try {
        const { data: { session } } = await authSupabase.auth.getSession();
        if (!session) {
          router.push('/login');
          return;
        }

        const userObj = session.user;
        setUserId(userObj.id);
        setUserName(userObj.user_metadata?.full_name || 'Artisan');

        // Fetch current passport from Supabase
        const { data: passport, error } = await authSupabase
          .from('bukie_passports')
          .select('*')
          .eq('user_id', userObj.id)
          .single();

        if (!error && passport) {
          setBio(passport.bio || '');
          setSkills(passport.skills ? passport.skills.join(', ') : '');
        }
      } catch (err) {
        console.error('Error loading passport page:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPassport();
  }, [authSupabase, router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    setMessage('');
    setErrorMsg('');

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const { error } = await authSupabase
        .from('bukie_passports')
        .upsert({
          user_id: userId,
          bio,
          skills: skillsArray,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        throw new Error(error.message);
      }

      setMessage('BukiePassport successfully initialized & updated!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update passport. Please check database permissions.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-2">
          <Hammer className="w-8 h-8 animate-spin text-[#004D2C]" />
          <span className="text-xs font-mono text-gray-500 font-semibold uppercase">Loading BukiePassport Builder...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#0A192F] flex flex-col">
      {/* Navbar header */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm" id="passport-navbar">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center h-16">
          <button
            id="passport-back-btn"
            type="button"
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-bold uppercase tracking-wider bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-all cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-[#004D2C] uppercase bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
            <Star className="w-3.5 h-3.5 fill-[#004D2C]" />
            <span>Score: 5.0</span>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-8" id="passport-content">
        {/* Header summary */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6 text-center relative overflow-hidden" id="passport-intro">
          <div className="absolute right-0 top-0 w-24 h-24 bg-[#004D2C]/5 rounded-full blur-xl"></div>
          
          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-[#004D2C] mx-auto mb-4 border border-amber-100">
            <Hammer className="w-8 h-8" />
          </div>
          
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Your Verified BukiePassport</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Every professional worker in Nigeria is identified by their QR BukiePassport. Complete details below.
          </p>
        </div>

        {/* Setup Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8" id="passport-form-container">
          <form onSubmit={handleSave} className="space-y-5" id="passport-setup-form">
            
            {/* Bio info */}
            <div id="field-bio">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Professional Bio / Pitch
              </label>
              <textarea
                id="bio-textarea"
                required
                rows={3}
                placeholder="e.g. Experienced general plumber with 4 years serving the Surulere and Ikeja communities. Specialist in burst pipes, toilet maintenance, and water heater installations."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm resize-none"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            {/* Skills array input */}
            <div id="field-skills">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Core Artisanal Skills</span>
                <span className="text-[10px] text-gray-400 capitalize normal-case font-medium">comma-separated</span>
              </label>
              <input
                id="skills-input"
                type="text"
                required
                placeholder="Plumbing, Leak Repair, Pipe Fitting, Water Installation"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A192F] focus:border-transparent text-sm"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            {/* Blue check prompt placeholder */}
            <div className="bg-[#0A192F] text-white p-4 rounded-xl border border-gray-800 flex items-center gap-3" id="blue-check-badge-ad">
              <ShieldCheck className="w-10 h-10 text-[#004D2C] shrink-0" />
              <div>
                <span className="block text-xs font-extrabold text-[#004D2C] uppercase tracking-wider font-mono">Blue Check Passport Verify</span>
                <span className="block text-[10px] text-gray-400 leading-normal mt-0.5">
                  Unlock the Blue Check trusted badge for ₦1,500/year to rank list first for urgent alerts and land gigs 3.5x faster.
                </span>
              </div>
            </div>

            {/* Alert notices */}
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 p-3 rounded-xl text-xs border border-red-100" id="passport-error">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {message && (
              <div className="flex items-start gap-2 bg-green-50 text-[#0A192F] p-3 rounded-xl text-xs border border-green-100" id="passport-message">
                <Sparkles className="w-4 h-4 text-[#004D2C] shrink-0 animate-pulse" />
                <span>{message}</span>
              </div>
            )}

            {/* Action buttons */}
            <button
              id="passport-save-btn"
              type="submit"
              disabled={saving}
              className="w-full bg-[#0A192F] text-white py-3 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md hover:bg-[#112a4f] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              {saving ? (
                <span>Saving details...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Update BukiePassport</span>
                </>
              )}
            </button>

          </form>
        </div>
      </div>
    </main>
  );
}
