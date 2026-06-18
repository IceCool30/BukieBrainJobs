'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
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
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';


export default function CEOAdminPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

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
        const pass = (passports || []).find((p: any) => p.user_id === prof.id);
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
  }, [supabase, router]);

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
        user_id: userId,
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
        .upsert(payload, { onConflict: 'user_id' });

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
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-3">
          <LogoLink
            className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit mb-3 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wide">
            Authorizing security clearance...
          </span>
        </div>
      </main>
    );
  }

  // Gates non-CEO email accounts
  if (!authorized) {
    return (
      <main className="min-h-screen bg-white text-[#0A192F] py-12 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center"
          id="admin-gate-unauthorized"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <ShieldAlert className="w-8 h-8 text-red-600 animate-bounce" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">CEO Access Only</h1>
          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            This module represents absolute business root authority at BukieBrainJobs. Your account <strong className="text-gray-900">{currentUserEmail || 'unknown'}</strong> is unauthorized.
          </p>
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-[10px] font-mono leading-relaxed text-left border border-red-100">
            SECURE_GATEWATCH: ACCESS_DENIED <br />
            REQUIRED_UID: {CEO_EMAIL}
          </div>
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

  // Filter display users by Search query
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = (m.full_name || '').toLowerCase().includes(q);
    const emailMatch = (m.email || '').toLowerCase().includes(q);
    const roleMatch = (m.role || '').toLowerCase().includes(q);
    return nameMatch || emailMatch || roleMatch;
  });

  return (
    <main className="min-h-screen bg-white text-[#0A192F] py-8 px-4 flex flex-col">
      <div className="max-w-6xl w-full mx-auto space-y-6" id="admin-panel-container">
        
        {/* Navigation Action */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => router.push('/dashboard')}
            className="group inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-all cursor-pointer"
            id="back-btn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Dashboard</span>
          </button>
          <span className="text-[10px] uppercase font-mono tracking-widest text-[#004D2C] font-semibold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 fill-amber-500 stroke-none animate-spin" />
            <span>CEO Control Central</span>
          </span>
        </div>

        {/* Brand Banner */}
        <div className="bg-[#0A192F] text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-md">
          <div className="absolute right-0 top-0 w-48 h-48 bg-[#004D2C]/10 rounded-full blur-3xl"></div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#0A192F] border-2 border-[#004D2C] rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg">
              CEO
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-black tracking-tight flex items-center gap-2">
                <span>BukieBrain Verification Terminal</span>
              </h1>
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed max-w-xl font-medium">
                Administrative desk for Solomon Ogar Bukie. Grant trust credentials, inspect registered provider portfolios, and trigger instantaneous manual verification of Worker identities.
              </p>
            </div>
          </div>
        </div>

        {/* Database notification updates bar */}
        {statusMessage && (
          <div className="bg-emerald-50 border border-emerald-100/80 text-emerald-800 text-xs px-4 py-3 rounded-xl font-bold flex items-center gap-2" id="flash-status">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Table & Filtering Block */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-md p-6 space-y-6" id="profiles-master-block">
          
          {/* Filtering Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-sm font-black uppercase tracking-wider text-gray-800">
                Register Database ({filteredMembers.length} users)
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search by candidate name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#0A192F] focus:bg-white text-xs px-4 py-2.5 pl-10 rounded-xl transition-all outline-none text-gray-900 placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Master Table Grid */}
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-left text-xs text-gray-500 border-collapse">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] tracking-wider border-b border-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-4">Participant Detail</th>
                  <th scope="col" className="px-6 py-4">Role System</th>
                  <th scope="col" className="px-6 py-4">Bio / Passport Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Identity Badge</th>
                  <th scope="col" className="px-6 py-4 text-center">Action Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-mono">
                      No matching participants identified in this workspace search.
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => {
                    const hasPassport = !!member.passport;
                    const isVerified = member.passport?.is_verified === true;
                    return (
                      <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                        
                        {/* Detail */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-[#0A192F]/5 rounded-xl flex items-center justify-center text-gray-800 font-black">
                              {member.full_name?.charAt(0).toUpperCase() || 'P'}
                            </div>
                            <div>
                              <span className="font-extrabold text-gray-900 block text-sm">
                                {member.full_name || 'Anonymous User'}
                              </span>
                              <span className="text-[10px] text-gray-400 font-mono font-medium tracking-wide">
                                ID: {member.id.substring(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            member.role === 'worker' 
                              ? 'bg-[#0A192F]/5 text-[#0A192F] border border-[#0A192F]/15' 
                              : 'bg-blue-50 text-blue-700 border border-blue-100'
                          }`}>
                            {member.role || 'Unspecified'}
                          </span>
                        </td>

                        {/* Passport / Bio */}
                        <td className="px-6 py-4 max-w-xs">
                          {hasPassport ? (
                            <div className="space-y-1">
                              <p className="font-medium text-gray-600 line-clamp-2 leading-relaxed">
                                {member.passport.bio}
                              </p>
                              {member.passport.skills && member.passport.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {member.passport.skills.map((sk: string, i: number) => (
                                    <span key={i} className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded uppercase">
                                      {sk}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">
                              No Passport document built yet.
                            </span>
                          )}
                        </td>

                        {/* Verification badge status */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            {isVerified ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-sky-800 bg-sky-50 border border-sky-100 px-2 rounded-full py-0.5">
                                <ShieldCheck className="w-3.5 h-3.5 fill-sky-500 text-white" />
                                <span>Verified Hub</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-gray-400 bg-gray-50 border border-gray-100 px-2 rounded-full py-0.5">
                                <X className="w-3 h-3 text-gray-400" />
                                <span>Unverified</span>
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Action Console Toggle */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center">
                            {actionLoadingId === member.id ? (
                              <Loader2 className="w-5 h-5 animate-spin text-[#0A192F]" />
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleVerify(member.id, isVerified)}
                                className={`text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm cursor-pointer border ${
                                  isVerified 
                                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100' 
                                    : 'bg-[#0A192F] text-white border-transparent hover:bg-[#112a4f]'
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
