'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  Briefcase, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Zap, 
  ArrowRight, 
  HelpCircle,
  Clock,
  MapPin,
  ExternalLink,
  MessageSquare,
  Lock,
  UserCheck
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export default function Home() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [sessionUser, setSessionUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setSessionUser(session.user);
        }
      } catch (err) {
        console.error('Session extract err:', err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [supabase]);

  // Handle CTA navigations
  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <main className="min-h-screen bg-white text-[#0A192F] flex flex-col font-sans selection:bg-[#0A192F] selection:text-white overflow-x-hidden">
      
      {/* 1. TOP NAV BAR */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100 px-4 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          
          {/* Logo Brand */}
          <div 
            onClick={() => handleNavigation('/')}
            className="flex items-center gap-2 cursor-pointer group"
            id="nav-logo-btn"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 w-fit">
              <Image src="/logo-primary.png" alt="BukieBrainJobs Logo" width={36} height={36} className="rounded-xl shadow-md border-b-2 border-[#004D2C] transition-transform group-hover:scale-105 duration-200 bg-white p-[2px]" />
              <span className="text-xl font-black text-[#0A192F] tracking-tight">BukieBrainJobs</span>
            </div>
          </div>

          {/* Quick Action links */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavigation('/jobs')}
              className="text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 cursor-pointer"
              id="nav-browse-jobs"
            >
              Browse Jobs
            </button>

            {loading ? (
              <div className="w-16 h-6 bg-gray-100 animate-pulse rounded-lg" />
            ) : sessionUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className="bg-[#0A192F] hover:bg-[#112a4f] text-white text-[11px] font-bold uppercase tracking-wider py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  id="nav-dashboard-user"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>My Dashboard</span>
                </button>
                {sessionUser.email?.toLowerCase() === 'solomonogarbukie@gmail.com' && (
                  <button
                    onClick={() => handleNavigation('/admin/qa-sandbox')}
                    className="bg-[#0A192F] hover:bg-gray-800 text-white text-[10px] font-mono tracking-wider py-2 px-3 rounded-xl transition-all cursor-pointer hidden sm:inline-flex items-center gap-1"
                    id="nav-sandbox-direct"
                  >
                    <Lock className="w-3 h-3 text-[#004D2C]" />
                    <span>QA Sandbox</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => handleNavigation('/login')}
                className="bg-[#0A192F] hover:bg-gray-800 text-white text-[11px] font-bold uppercase tracking-wider py-2 px-4.5 rounded-xl shadow-sm transition-all cursor-pointer"
                id="nav-login-btn"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. HERO SPLASH STAGE */}
      <section className="relative py-16 px-4 bg-gradient-to-b from-white to-[#F4F5F7] border-b border-gray-100 overflow-hidden" id="hero-section">
        {/* Dynamic Abstract Background Elements */}
        <div className="absolute top-20 right-[-10%] w-[450px] h-[450px] bg-[#0A192F]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-10 left-[-10%] w-[350px] h-[350px] bg-[#004D2C]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Sachet Market Indicator Flag */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 text-[#0A192F] text-[10.5px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xs"
            id="badge-pwa-telegram"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#004D2C] fill-[#004D2C]" />
            <span>Dual Bot Integration • Telegram &amp; WhatsApp Live PWA</span>
          </motion.div>

          {/* Majestic High-Contrast Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-gray-900 tracking-tight leading-[1.05]"
            id="hero-title"
          >
            Nigeria&apos;s Premium <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A192F] via-[#112a4f] to-[#004D2C]">
              &quot;Sachet&quot; Job Marketplace
            </span>
          </motion.h1>

          {/* Context Explainer */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed"
            id="hero-description"
          >
            On-demand artisan connections matching budget-friendly local tasks with physical service compliance. Log quick micro-tasks starting from ₦1,000 up to premium service allocations.
          </motion.p>

          {/* Primary Action Button Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-3"
            id="hero-action-buttons"
          >
            <button
              onClick={() => handleNavigation('/jobs')}
              className="w-full sm:w-auto bg-[#0A192F] hover:bg-[#112a4f] text-white text-xs font-extrabold uppercase tracking-widest py-4 px-8 rounded-xl transition-all shadow-md shadow-green-900/10 flex items-center justify-center gap-2 cursor-pointer group"
              id="primary-explore-btn"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => handleNavigation('/dashboard')}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-[#0A192F] border border-gray-200 text-xs font-extrabold uppercase tracking-widest py-4 px-8 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              id="primary-post-btn"
            >
              <Briefcase className="w-4 h-4 text-[#0A192F]" />
              <span>Post A &quot;Sachet&quot; Job</span>
            </button>
          </motion.div>

        </div>
      </section>

      {/* 3. CORE VALUE CHANNELS - INTERACTIVE MATRIX */}
      <section className="py-16 px-4 max-w-7xl mx-auto space-y-12" id="marketplace-value-grid">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-[#0A192F] uppercase tracking-widest">Architectural Advantage</span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Elegantly Packaged Performance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Sachet Micro-tasking */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between" id="value-sachet-card">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-green-50 text-[#0A192F] rounded-xl flex items-center justify-center border border-green-100 shadow-xs">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase text-gray-950 tracking-tight">The &quot;Sachet&quot; Model</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Break work down into quick, secure, bite-sized tasks. Low entry commissions make it practical to hire verified local technicians for single-day operations seamlessly.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-50 mt-4">
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">MINIMUM FEE: ~ ₦1,000</span>
            </div>
          </div>

          {/* Card 2: Interactive Real-time Bots */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between" id="value-bots-card">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-amber-50 text-[#004D2C] rounded-xl flex items-center justify-center border border-amber-100 shadow-xs">
                <Send className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase text-gray-950 tracking-tight">Full-Duplex Bot Routing</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Integrated webhooks automatically broadcast highly-formatted flyers across active WhatsApp chats and public Telegram channels the instant a task goes urgent.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-50 mt-4 flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">TELEGRAM:</span>
              <span className="text-[10.5px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded font-mono">@api/bot/telegram</span>
            </div>
          </div>

          {/* Card 3: Secure Cash Escrow */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between" id="value-escrow-card">
            <div className="space-y-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold uppercase text-gray-950 tracking-tight">Guaranteed Pay Clearances</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Safe payment processing utilizing active Paystack secure checkouts. Inspection and task delivery fees are held safely until artisans fulfill performance conditions.
              </p>
            </div>
            <div className="pt-4 border-t border-gray-50 mt-4">
              <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">SECURED BY: PAYSTACK API</span>
            </div>
          </div>

        </div>
      </section>

      {/* 4. REAL-TIME TELEGRAM FLYER DEMO (Aesthetic UI Mockup) */}
      <section className="bg-white border-y border-gray-100 py-16 px-4" id="telegram-flyer-section">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-5">
            <div className="inline-block bg-[#0A192F]/10 text-[#0A192F] font-black font-mono text-[9px] uppercase tracking-widest px-3 py-1 rounded">
              Omnichannel Broadcasting
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              Instantly Broadcast To Telegram Channels
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              When you post an urgent sachet job needing lightning-fast attention, our background notification dispatch engine formats a beautifully detailed flyer card and broadcasts it directly to subscriber pipelines instantly.
            </p>
            <div className="flex gap-4 items-center">
              <div className="flex -space-x-2">
                <div className="w-7 h-7 bg-gray-200 border border-white rounded-full flex items-center justify-center text-[9px] font-bold">1</div>
                <div className="w-7 h-7 bg-gray-300 border border-white rounded-full flex items-center justify-center text-[9px] font-bold">2</div>
                <div className="w-7 h-7 bg-gray-400 border border-white rounded-full flex items-center justify-center text-[9px] font-bold">3</div>
              </div>
              <span className="text-xs text-gray-400 font-medium">Over 500+ Nigerian artisans receiving real-time payloads.</span>
            </div>
          </div>

          {/* Interactive Telegram Simulator Mockup */}
          <div className="bg-[#0A192F] text-white p-5 rounded-3xl shadow-xl border border-gray-800 relative" id="flyer-mockup-wrapper">
            <div className="absolute top-3 right-3 flex gap-1.5">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
              <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            </div>

            <div className="flex items-center gap-2 border-b border-gray-800 pb-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                BB
              </div>
              <div>
                <div className="text-xs font-bold">BukieBrainJobs Bot</div>
                <div className="text-[9px] text-[#0A192F] font-bold uppercase tracking-wider">● Broadcasting Live</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-[#26292D] p-4 rounded-2xl border border-gray-800 text-[11.5px] font-sans leading-relaxed">
                <span className="text-orange-400 font-bold block mb-1">🔥 URGENT SACHET FLYER ALERT:</span>
                <span className="block font-semibold border-b border-gray-800 pb-1.5 mb-1.5 text-white">
                  💼 Position: Plumbing Connection &amp; Leakage Sealing
                </span>
                <div className="space-y-1 text-gray-300 text-[11px]">
                  <div>💰 <strong className="text-white">Budget:</strong> ₦12,500 <span className="text-[9px] text-gray-400">(Escrow Guaranteed)</span></div>
                  <div>📍 <strong className="text-white">Location State:</strong> Lagos State (Ikeja LGA)</div>
                </div>
                <div className="mt-3 text-[10px] text-gray-400 italic">
                  Apply immediately for verified jobs and secure artisan connections!
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>Viewed by 482 artisans</span>
                <span>11:42 AM</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. ACTIVE MARKET STATS AND DIRECT STEPS */}
      <section className="py-16 px-4 bg-white max-w-7xl mx-auto space-y-12" id="instructions-section">
        <div className="text-center space-y-1 max-w-lg mx-auto">
          <span className="text-[10px] font-bold text-[#0A192F] uppercase tracking-widest font-mono">Operations Layout</span>
          <h2 className="text-xl font-bold tracking-tight">How It Works in 3 Quick Steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="space-y-2 bg-white p-6 rounded-2xl border border-gray-100">
            <div className="w-7 h-7 bg-[#0A192F] text-[#004D2C] rounded-full flex items-center justify-center font-bold text-xs mx-auto">1</div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">Post A Micro-task</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Define what you need repaired or done, specify the LGA location, and pay the low scale inspection deposit.</p>
          </div>

          <div className="space-y-2 bg-white p-6 rounded-2xl border border-gray-100">
            <div className="w-7 h-7 bg-[#0A192F] text-[#004D2C] rounded-full flex items-center justify-center font-bold text-xs mx-auto">2</div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">Immediate Bot Push</h3>
            <p className="text-xs text-gray-400 leading-relaxed">The system formats digital flyer parameters, then broadcasts them directly to WhatsApp groups and Telegram.</p>
          </div>

          <div className="space-y-2 bg-white p-6 rounded-2xl border border-gray-100">
            <div className="w-7 h-7 bg-[#0A192F] text-[#004D2C] rounded-full flex items-center justify-center font-bold text-xs mx-auto">3</div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900">Approve &amp; Close</h3>
            <p className="text-xs text-gray-400 leading-relaxed">Review incoming candidates, complete instant messaging matches, audit progress, and release the escrow funds.</p>
          </div>
        </div>
      </section>

      {/* 6. SYSTEM FOOTER */}
      <footer className="mt-auto bg-[#0A192F] text-white py-12 px-4 border-t border-gray-800" id="landing-footer">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 p-1.5 w-fit">
              <Image src="/logo-primary.png" alt="BukieBrainJobs Logo" width={32} height={32} className="rounded-xl shadow-md border border-[#004D2C] bg-white p-[2px]" />
              <span className="text-lg font-black tracking-tight text-[#0A192F]">BukieBrainJobs</span>
            </div>
            </div>
            <p className="text-[11px] text-gray-400 font-medium">
              Nigeria&apos;s Sachet Job Platform • Integrated with Telegram &amp; WhatsApp Webhook Web Engine
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-xs font-bold text-gray-400">
            <button onClick={() => handleNavigation('/jobs')} className="hover:text-white transition-colors cursor-pointer">
              Open Jobs
            </button>
            <span className="text-gray-700 font-normal">|</span>
            <button onClick={() => handleNavigation('/login')} className="hover:text-white transition-colors cursor-pointer">
              Sign In Marketplace
            </button>
            <span className="text-gray-700 font-normal">|</span>
            <button onClick={() => handleNavigation('/dashboard')} className="hover:text-white transition-colors cursor-pointer">
              Post Task
            </button>
            {sessionUser?.email?.toLowerCase() === 'solomonogarbukie@gmail.com' && (
              <>
                <span className="text-gray-700 font-normal">|</span>
                <button 
                  onClick={() => handleNavigation('/admin/qa-sandbox')} 
                  className="text-amber-400 hover:text-white transition-colors font-mono uppercase tracking-wider text-[10px] cursor-pointer"
                >
                  CEO Sandbox Panel
                </button>
              </>
            )}
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-gray-800/60 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 font-mono gap-4">
          <span>&copy; 2026 BukieBrainJobs. All rights preserved. Registered under Nigerian Corporate Escrow.</span>
          <div className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>PWA Enabled</span>
          </div>
        </div>
      </footer>

    </main>
  );
}
