'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  Tag, 
  DollarSign, 
  Loader2, 
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import ChatWindow from '@/components/ChatWindow';


export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [job, setJob] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    async function initChatPage() {
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
  }, [supabase, jobId, router]);

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

        {/* Short Job Metadata Header */}
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5">
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
              </div>
            </div>

            {/* Pricing bubble card */}
            <div className="bg-[#0A192F]/5 border border-[#0A192F]/15 px-4 py-3 rounded-2xl shrink-0 text-right md:w-auto w-full flex justify-between md:flex-col items-center md:items-end">
              <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
                Total Budget
              </span>
              <span className="text-base font-black text-[#0A192F] font-mono">
                ₦{job.budget?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* The Realtime Chat Box */}
        <ChatWindow 
          jobId={jobId} 
          currentUserId={user.id} 
          isInspectionPaid={job.inspection_fee_paid} 
        />

      </div>
    </main>
  );
}
