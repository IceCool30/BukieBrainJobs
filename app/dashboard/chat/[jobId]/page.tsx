'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Tag, 
  DollarSign, 
  Loader2, 
  HelpCircle,
  MessageSquare,
  CheckCircle,
  Wallet
} from 'lucide-react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';
import ChatWindow from '@/components/ChatWindow';
import { LeaveReview } from '@/app/components/LeaveReview';
import { releaseProtectedFunds, acceptBidAndLockFunds } from '@/app/actions/protectedFunds';


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;

  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [artisanProfile, setArtisanProfile] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [releasingFunds, setReleasingFunds] = useState(false);
  const [acceptingBid, setAcceptingBid] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    async function initChatPage() {
      if (!isSupabaseConfigured()) {
        setUser({ id: 'mock-user-id', email: 'employer@example.com' });
        setJob({
          id: jobId,
          title: 'Emergency Plumbing Repair',
          description: 'A kitchen pipe has burst and needs urgent repair.',
          budget: 25000,
          stage: 'open',
          employer_id: 'mock-user-id'
        });
        setBids([
          {
            id: 'mock-bid-1',
            profile_id: 'mock-worker-id',
            bid_amount: 20000,
            proposal: 'I can fix this pipe within 1 hour. Highly experienced.',
            profiles: {
              full_name: 'Solomon Ogar (Artisan)',
              avg_rating: 4.8,
              jobs_completed: 12
            }
          }
        ]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorMsg('');

        // 1. Authenticate user
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        if (authError || !session) {
          router.push('/login');
          return;
        }
        setUser(session.user);

        // 2. Fetch corresponding job details
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .maybeSingle();

        if (jobError) {
          throw jobError;
        }

        if (!jobData) {
          setErrorMsg('The matching job posting could not be found.');
          return;
        }

        setJob(jobData);

        if (jobData.selected_worker_id) {
          const { data: artisanData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', jobData.selected_worker_id)
            .maybeSingle();
          if (artisanData) setArtisanProfile(artisanData);
        } else if (jobData.employer_id === session.user.id && jobData.stage === 'open') {
          // Fetch bids for this job
          const { data: bidsData } = await supabase
            .from('bids')
            .select('*, profiles!bids_profile_id_fkey(full_name, avg_rating, jobs_completed)')
            .eq('job_id', jobId)
            .order('created_at', { ascending: false });
          if (bidsData) setBids(bidsData);
        }

      } catch (err: any) {
        console.error('Failed to initialize chat workspace:', err);
        setErrorMsg('An error occurred loading the secure chat channel.');
      } finally {
        setLoading(false);
      }
    }

    if (jobId) {
      initChatPage();
    }
  }, [jobId, router]);

  const handleReleaseFunds = async () => {
    // Note: removed window.confirm due to iframe restrictions
    setReleasingFunds(true);
    setActionError(null);
    try {
      await releaseProtectedFunds(jobId);
      setJob({ ...job, stage: 'completed' });
    } catch (err: any) {
      setActionError(err.message || 'Failed to release funds');
    } finally {
      setReleasingFunds(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    // Note: removed window.confirm due to iframe restrictions
    setAcceptingBid(bidId);
    setActionError(null);
    try {
      await acceptBidAndLockFunds(bidId);
      // Reload page to enter chat view
      router.refresh();
    } catch (err: any) {
      setActionError(err.message || 'Failed to accept bid and lock funds');
    } finally {
      setAcceptingBid(null);
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
            Entering Secure Chatroom...
          </span>
        </div>
      </main>
    );
  }

  if (errorMsg || !job || !user) {
    return (
      <main className="min-h-screen bg-white text-[#0A192F] py-12 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center"
          id="chat-page-error-container"
        >
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Channel Unavailable</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {errorMsg || 'A secure session could not be established with the database.'}
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

  const isEmployer = job.employer_id === user.id;

  return (
    <main className="min-h-screen bg-white text-[#0A192F] py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6" id="chat-workspace-page">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="group inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-all cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm"
            id="chat-back-btn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Marketplace</span>
          </button>
          
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm">
            <MessageSquare className="w-4 h-4 text-[#0A192F]" />
            <span>Active Guild Discussion</span>
          </div>
        </div>

        {/* Action Error Banner */}
        {actionError && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 text-sm font-bold flex items-center justify-between">
            <span>{actionError}</span>
            <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600">×</button>
          </div>
        )}

        {/* Short Job Metadata Header */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5 flex-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-blue-600 font-mono block">
                Discussing Project
              </span>
              <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                {job.title}
              </h1>
              
              {/* Badges list */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {job.category && (
                  <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-150 inline-flex items-center gap-1">
                    <Tag className="w-3 h-3 text-gray-400" />
                    <span>{job.category}</span>
                  </span>
                )}
                <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-150 inline-flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  <span>{job.location_lga}, {job.location_state}</span>
                </span>
                <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-lg border inline-flex items-center gap-1 ${
                  job.stage === 'completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <CheckCircle className="w-3 h-3" />
                  <span>{job.stage === 'completed' ? 'Completed' : 'In Progress'}</span>
                </span>
              </div>
            </div>

            {/* Actions & Pricing */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="bg-[#0A192F]/5 border border-[#0A192F]/15 px-4 py-3 rounded-2xl text-right md:w-auto w-full flex justify-between md:flex-col items-center md:items-end">
                <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                  Total Budget
                </span>
                <span className="text-base font-black text-[#0A192F] font-mono">
                  ₦{job.budget?.toLocaleString()}
                </span>
              </div>

              {isEmployer && job.stage !== 'completed' && job.stage !== 'disputed' && job.stage !== 'cancelled' && (
                <button
                  onClick={handleReleaseFunds}
                  disabled={releasingFunds}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider py-3 px-5 rounded-xl transition-all shadow-md flex items-center gap-2 w-full justify-center md:w-auto"
                >
                  {releasingFunds ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  <span>Release Funds & Complete</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Leave Review Component if job is completed and user is employer */}
        {isEmployer && job.stage === 'completed' && job.selected_worker_id && (
          <LeaveReview 
            jobId={job.id} 
            artisanId={job.selected_worker_id} 
            artisanName={artisanProfile?.full_name || 'Artisan'}
            jobBudget={job.budget || 0}
          />
        )}

        {isEmployer && job.stage === 'open' ? (
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-black text-gray-900 mb-4">Proposals ({bids.length})</h2>
            {bids.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                <span className="text-sm font-bold text-gray-500">No bids yet. Check back soon!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map(bid => (
                  <div key={bid.id} className="border border-gray-100 rounded-xl p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4 bg-gray-50/50 hover:shadow-md transition-all">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900">{bid.profiles?.full_name || 'Artisan'}</span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          ★ {bid.profiles?.avg_rating || '5.0'}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                          {bid.profiles?.jobs_completed || 0} Jobs
                        </div>
                        <button
                          onClick={() => router.push(`/p/${bid.profile_id}`)}
                          className="text-[10px] font-bold text-blue-600 underline"
                        >
                          View Profile
                        </button>
                      </div>
                      
                      {bid.cover_letter && (
                        <p className="text-xs text-gray-600 font-medium leading-relaxed italic bg-white p-3 rounded-lg border border-gray-100">
                          &quot;{bid.cover_letter}&quot;
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end justify-between shrink-0">
                      <div className="text-right">
                        <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Proposed</span>
                        <span className="text-lg font-black text-[#0A192F] font-mono">₦{(bid.proposed_budget || job.budget)?.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={acceptingBid === bid.id}
                        className="mt-3 bg-[#0A192F] hover:bg-[#112a4f] disabled:opacity-50 text-white text-[10px] font-extrabold uppercase tracking-wider py-2.5 px-5 rounded-lg transition-all flex items-center justify-center min-w-[120px]"
                      >
                        {acceptingBid === bid.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Accept Bid'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          job.stage !== 'open' && (
            <ChatWindow 
              jobId={jobId} 
              currentUserId={user.id} 
              isInspectionPaid={job.inspection_fee_paid} 
            />
          )
        )}

      </div>
    </main>
  );
}
