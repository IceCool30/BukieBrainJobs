'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  UserCheck, 
  Users, 
  Search, 
  ArrowLeft, 
  Loader2, 
  AlertTriangle,
  Mail,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Hammer,
  BadgeCent,
  ShieldAlert
} from 'lucide-react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';


export default function CEOAdminPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  // Data State
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const CEO_EMAIL = 'solomonogarbukie@gmail.com';

  const fetchUsersAndPassports = async () => {
    if (!isSupabaseConfigured()) {
      return;
    }
    try {
      // 1. Fetch Profiles
      const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*');

      if (profileErr) throw profileErr;

      // 2. Fetch Passports
      const { data: passports, error: passportErr } = await supabase
        .from('bukie_passports')
        .select('*');

      if (passportErr) {
        console.warn('Could not load some passport entries:', passportErr);
      }

      // 3. Client-side Safe Map Join to avoid relational mapping constraints
      const joinedData = (profiles || []).map((prof: any) => {
        const pass = (passports || []).find((p: any) => p.profile_id === prof.id);
        return {
          ...prof,
          passport: pass || null
        };
      });

      setMembers(joinedData);
    } catch (err: any) {
      console.error('Error fetching admin dashboard data:', err);
      setStatusMessage('Failed to sync master database arrays.');
    }
  };

  useEffect(() => {
    async function checkSecurityGate() {
      if (!isSupabaseConfigured()) {
        setCurrentUserEmail(CEO_EMAIL);
        setAuthorized(true);
        setMembers([
          {
            id: 'mock-worker-1',
            full_name: 'Solomon Ogar',
            role: 'worker',
            location_state: 'Lagos',
            location_lga: 'Ikeja',
            email: 'solomonogarbukie@gmail.com',
            phone: '+2348031234567',
            passport: {
              id: 'mock-pass-1',
              skills: ['Plumbing', 'Electrical'],
              years_experience: 5,
              bio: 'Top-tier certified plumber',
              is_verified: true,
              verification_grade: 'A'
            }
          },
          {
            id: 'mock-worker-2',
            full_name: 'Tunde Bakare',
            role: 'worker',
            location_state: 'Abuja',
            location_lga: 'Garki',
            email: 'tunde@example.com',
            phone: '+2348039876543',
            passport: {
              id: 'mock-pass-2',
              skills: ['Tiling', 'Carpentry'],
              years_experience: 3,
              bio: 'Skilled wood artisan',
              is_verified: false,
              verification_grade: null
            }
          }
        ]);
        setLoading(false);
        return;
      }
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          router.push('/login');
          return;
        }

        const email = session.user.email || '';
        setCurrentUserEmail(email);

        // Security check matching solomonogarbukie@gmail.com
        if (email.toLowerCase() === CEO_EMAIL.toLowerCase()) {
          setAuthorized(true);
          await fetchUsersAndPassports();
        } else {
          setAuthorized(false);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    checkSecurityGate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleToggleVerify = async (userId: string, currentVerifiedStatus: boolean) => {
    setActionLoadingId(userId);
    setStatusMessage('');

    try {
      // Toggle value: true if currently false or null
      const nextVerifyStatus = !currentVerifiedStatus;

      // Check if passport exists to determine partial payload
      const targetMember = members.find((m) => m.id === userId);
      const hasPassportRecord = !!targetMember?.passport;

      const payload: Record<string, any> = {
        profile_id: userId,
        is_verified: nextVerifyStatus,
        updated_at: new Date().toISOString()
      };

      // Ensure some defaults if upserting a fresh passport
      if (!hasPassportRecord) {
        payload.bio = 'Active professional worker profile initialized by administration.';
        payload.skills = ['General Maintenance'];
        payload.hourly_rate = null;
      }

      const { error } = await supabase
        .from('bukie_passports')
        .upsert(payload, { onConflict: 'profile_id' });

      if (error) throw error;

      setStatusMessage(`User verification status successfully toggled to ${nextVerifyStatus ? 'VERIFIED' : 'UNVERIFIED'}!`);
      await fetchUsersAndPassports();
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err?.message || 'Failed to update user verification.');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg text-brand-navy">
        <div className="flex flex-col items-center gap-3">
          <LogoLink
            className="bg-brand-surface rounded-[1.5rem] shadow-xs border border-brand-border/60 flex items-center gap-1.5 p-1 w-fit mb-3 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="text-xs font-mono text-brand-navy/60 font-bold uppercase tracking-wide">
            Authorizing security clearance...
          </span>
        </div>
      </main>
    );
  }

  // Gates non-CEO email accounts
  if (!authorized) {
    return (
      <main className="min-h-screen bg-brand-bg text-brand-navy py-12 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-brand-surface rounded-2xl shadow-xs border border-brand-border/60 p-8 text-center"
          id="admin-gate-unauthorized"
        >
          <div className="w-16 h-16 bg-red-50/50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
            <ShieldAlert className="w-8 h-8 text-red-600 animate-bounce" />
          </div>
          <h1 className="text-xl font-bold text-brand-navy tracking-tight font-display">CEO Access Only</h1>
          <p className="text-xs text-brand-navy/60 mt-2 leading-relaxed">
            This module represents absolute business root authority at BukieBrainJobs. Your account <strong className="text-brand-navy">{currentUserEmail || 'unknown'}</strong> is unauthorized.
          </p>
          <div className="mt-4 p-3 bg-red-50/50 text-red-700 rounded-xl text-[10px] font-mono leading-relaxed text-left border border-red-100">
            SECURE_GATEWATCH: ACCESS_DENIED <br />
            REQUIRED_UID: {CEO_EMAIL}
          </div>
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

  // Filter display users by Search query
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (m.full_name || '').toLowerCase().includes(q);
    const emailMatch = (m.email || '').toLowerCase().includes(q);
    const roleMatch = (m.role || '').toLowerCase().includes(q);
    return nameMatch || emailMatch || roleMatch;
  });

  return (
    <main className="min-h-screen bg-brand-bg text-brand-navy py-8 px-4 flex flex-col">
      <div className="max-w-6xl w-full mx-auto space-y-6" id="admin-panel-container">
        
        {/* Navigation Action */}
        <div className="flex justify-between items-center bg-brand-surface p-4 rounded-2xl border border-brand-border/60 shadow-xs">
          <button
            onClick={() => router.push('/dashboard')}
            className="group inline-flex items-center gap-2 text-xs font-bold text-brand-navy/60 hover:text-brand-navy uppercase tracking-wider transition-all cursor-pointer font-display"
            id="back-btn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/qa-sandbox')}
              className="inline-flex items-center gap-1.5 text-xs font-bold bg-brand-navy/5 hover:bg-brand-navy/10 text-brand-navy px-3 py-1.5 rounded-xl border border-brand-border/60 transition-all font-display"
            >
              <Hammer className="w-3.5 h-3.5" />
              <span>QA Sandbox</span>
            </button>
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-green font-semibold flex items-center gap-1 bg-brand-green/10 px-2.5 py-1.5 rounded-xl border border-brand-green/20">
              <Sparkles className="w-3.5 h-3.5 fill-brand-green stroke-none animate-spin" />
              <span>CEO Control Central</span>
            </span>
          </div>
        </div>

        {/* Brand Banner */}
        <div className="bg-brand-navy text-white rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xs border border-brand-navy/80">
          <div className="absolute right-0 top-0 w-48 h-48 bg-brand-green/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-brand-green/10 border-2 border-brand-green rounded-2xl flex items-center justify-center text-brand-green font-black text-2xl font-display shadow-xs">
              CEO
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight flex items-center gap-2 font-display">
                <span>BukieBrain Verification Terminal</span>
              </h1>
              <p className="text-xs text-white/75 mt-1.5 leading-relaxed max-w-xl font-medium">
                Administrative desk for Solomon Ogar Bukie. Grant trust credentials, inspect registered provider portfolios, and trigger instantaneous manual verification of Worker identities.
              </p>
            </div>
          </div>
        </div>

        {/* Supervision Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="supervision-dashboard-grid">
          {/* Total Registered Users */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/60 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-navy/60">
                  Total Registered Users
                </span>
                <h3 className="text-3xl font-black text-brand-navy mt-1 tracking-tight font-display">
                  {members.length}
                </h3>
              </div>
              <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-xl border border-brand-border/40">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-brand-green font-bold mt-3 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-brand-green inline-block animate-pulse"></span>
              <span>System Online & Syncing</span>
            </p>
          </div>

          {/* Active Protected Funds */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/60 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-navy/60">
                  Active Protected Funds
                </span>
                <h3 className="text-3xl font-black text-brand-navy mt-1 tracking-tight font-display">
                  8
                </h3>
              </div>
              <div className="p-2.5 bg-brand-navy/5 text-brand-navy rounded-xl border border-brand-border/40">
                <BadgeCent className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-brand-navy/50 font-medium mt-3 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-brand-green inline-block"></span>
              <span>All Protected Deposits Secured</span>
            </p>
          </div>

          {/* Open Dispute Tickets */}
          <div className="bg-brand-surface p-6 rounded-2xl border border-brand-border/60 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-navy/60">
                  Open Dispute Tickets
                </span>
                <h3 className="text-3xl font-black text-brand-navy mt-1 tracking-tight font-display">
                  0
                </h3>
              </div>
              <div className="p-2.5 bg-brand-green/10 text-brand-green rounded-xl border border-brand-green/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-brand-green font-bold mt-3 flex items-center gap-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-brand-green inline-block"></span>
              <span>All Disputes Resolved</span>
            </p>
          </div>
        </div>

        {/* Database notification updates bar */}
        {statusMessage && (
          <div className="bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs px-4 py-3 rounded-xl font-bold flex items-center gap-2 font-display" id="flash-status">
            <Check className="w-4 h-4 text-brand-green shrink-0 animate-bounce" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Table & Filtering Block */}
        <div className="bg-brand-surface rounded-2xl border border-brand-border/60 shadow-xs p-6 space-y-6" id="profiles-master-block">
          
          {/* Filtering Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-navy/60" />
              <span className="text-sm font-bold uppercase tracking-wider text-brand-navy font-display">
                Register Database ({filteredMembers.length} users)
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by candidate name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-bg border border-brand-border/60 focus:border-brand-green focus:bg-brand-surface text-xs px-4 py-2.5 pl-10 rounded-xl transition-all outline-none text-brand-navy placeholder-brand-navy/30 font-medium"
              />
            </div>
          </div>

          {/* Master Table Grid */}
          <div className="overflow-x-auto rounded-xl border border-brand-border/60 bg-brand-bg">
            <table className="w-full text-left text-xs text-brand-navy/70 border-collapse">
              <thead className="bg-brand-surface text-brand-navy/50 uppercase font-bold text-[10px] tracking-wider border-b border-brand-border/60">
                <tr>
                  <th scope="col" className="px-6 py-4 font-display">Participant Detail</th>
                  <th scope="col" className="px-6 py-4 font-display">Role System</th>
                  <th scope="col" className="px-6 py-4 font-display">Bio / Passport Status</th>
                  <th scope="col" className="px-6 py-4 text-center font-display">Identity Badge</th>
                  <th scope="col" className="px-6 py-4 text-center font-display">Action Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-brand-navy/40 font-mono">
                      No matching participants identified in this workspace search.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const hasPassport = !!member.passport;
                    const isVerified = member.passport?.is_verified === true;
                    return (
                      <tr key={member.id} className="hover:bg-brand-surface/50 transition-colors">
                        
                        {/* Detail */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-brand-navy/5 rounded-xl flex items-center justify-center text-brand-navy font-black font-display border border-brand-border/40">
                              {member.full_name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div>
                              <span className="font-extrabold text-brand-navy block text-sm">
                                {member.full_name || 'Anonymous User'}
                              </span>
                              <span className="text-[10px] text-brand-navy/40 font-mono font-medium tracking-wide">
                                ID: {member.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            member.role === 'worker' 
                              ? 'bg-brand-navy/5 text-brand-navy border border-brand-border/60' 
                              : 'bg-blue-50/50 text-blue-700 border border-blue-200'
                          }`}>
                            {member.role === 'worker' ? 'Get Hired' : member.role === 'employer' ? 'Hire Talent' : (member.role || 'Unspecified')}
                          </span>
                        </td>

                        {/* Passport / Bio */}
                        <td className="px-6 py-4 max-w-xs">
                          {hasPassport ? (
                            <div className="space-y-1">
                              <p className="font-medium text-brand-navy/80 line-clamp-2 leading-relaxed">
                                {member.passport.bio}
                              </p>
                              {member.passport.skills && member.passport.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                {(Array.isArray(member.passport?.skills) ? member.passport.skills : []).map((sk: string, i: number) => (
                                    <span key={i} className="text-[9px] bg-brand-navy/5 text-brand-navy/70 font-bold px-1.5 py-0.5 rounded uppercase">
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-brand-navy/40 italic text-[11px]">
                              No Passport document built yet.
                            </span>
                          )}
                        </td>

                        {/* Verification badge status */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-brand-green bg-brand-green/10 border border-brand-green/20 px-2.5 py-1 rounded-full">
                                <ShieldCheck className="w-3.5 h-3.5 fill-brand-green text-brand-bg" />
                                <span>Verified Hub</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-brand-navy/40 bg-brand-navy/5 border border-brand-border/40 px-2.5 py-1 rounded-full">
                                <X className="w-3 h-3 text-brand-navy/40" />
                                <span>Unverified</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action Console Toggle */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            {actionLoadingId === member.id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-brand-green" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleVerify(member.id, isVerified)}
                                className={`text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer border font-display ${
                                  isVerified 
                                    ? 'bg-amber-50/50 text-amber-800 border-amber-200 hover:bg-amber-100/50' 
                                    : 'bg-brand-green text-white border-transparent hover:bg-brand-green/90'
                                }`}
                              >
                                {isVerified ? 'Unverify User' : 'Verify User'}
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </main>
  );
}
