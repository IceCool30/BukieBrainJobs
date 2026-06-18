'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Sparkles, 
  CheckCircle, 
  ShieldCheck, 
  Phone, 
  Star, 
  Share2, 
  ExternalLink, 
  Lock, 
  Coins, 
  Info, 
  QrCode,
  AlertCircle,
  Loader2,
  Hammer,
  CreditCard,
  UserCheck,
  Menu
} from 'lucide-react';
import { createBrowserClient } from '@supabase/auth-helpers-nextjs';
import { QRCodeSVG } from 'qrcode.react';
import { SiteFooter } from '@/components/SiteFooter';
import { Sidebar } from '@/components/Sidebar';


export default function PublicPassportPage() {
  const router = useRouter();
  const params = useParams();
  const workerId = params?.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Shared & URL handling
  const [currentUrl, setCurrentUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Phase 6 Contact Reveal Modal state
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    async function loadWorkerPassport() {
      if (!workerId) return;
      try {
        setLoading(true);
        setErrorMsg('');

        // Get currently logged in user session (if any)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUserId(session.user.id);
        }

        // 1. Fetch profile info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', workerId)
          .maybeSingle();

        if (profileError) {
          throw new Error('Database connection issue: ' + profileError.message);
        }

        if (!profileData) {
          setErrorMsg('This worker profile page could not be located in our system.');
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // 2. Fetch corresponding passport info
        const { data: passportData, error: passportError } = await supabase
          .from('bukie_passports')
          .select('*')
          .eq('user_id', workerId)
          .maybeSingle();

        if (!passportError && passportData) {
          setPassport(passportData);
        } else {
          // Fallback if worker has profile but hasn't created a passport record yet
          setPassport({
            user_id: workerId,
            bio: 'Active artisanal service provider verified on the BukieBrain platform.',
            skills: ['General Works'],
            is_verified: false,
            hourly_rate: null
          });
        }

      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred loading the public passport.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkerPassport();
  }, [supabase, workerId]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isOwner = currentUserId === workerId;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-[#0A192F]">
        <div className="flex flex-col items-center gap-3">
          <LogoLink
            className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 flex items-center gap-1.5 p-1 w-fit mb-3 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="text-xs font-mono text-gray-500 font-bold uppercase tracking-wide">
            Reading BukiePassport...
          </span>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-white text-[#0A192F] py-12 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center"
          id="not-found-passport-container"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Passport Not Found</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {errorMsg}
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-[#0A192F] hover:bg-gray-800 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Marketplace</span>
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  const workerName = profile?.full_name || 'Artisan Partner';
  const workerRole = profile?.role || 'worker';
  const isVerifiedWorker = passport?.is_verified === true;
  const skillsArray = passport?.skills || [];
  const hourlyRateDisplay = passport?.hourly_rate ? `₦${passport.hourly_rate.toLocaleString()}/hr` : 'Negotiable';

  return (
    <div className="min-h-screen bg-white text-[#0A192F] flex flex-col relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Header with Logo and Hamburger */}
      <header className="flex justify-between items-center px-4 py-3 border-b border-gray-100 shrink-0">
        <LogoLink />
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="text-[#0A192F] ml-1 p-1 hover:bg-gray-100 rounded-full active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#0A192F]">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-1 py-12 px-4 flex flex-col items-center justify-center">
      
      {/* Container wrapper mimicking physical card style */}
      <div className="w-full max-w-md" id="public-passport-wrapper">
        
        {/* Navigation / Header Actions */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="group inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider transition-all cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm"
            id="back-to-jobs-btn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-gray-900 uppercase tracking-wider bg-white px-4 py-2.5 rounded-xl border border-gray-100 shadow-sm cursor-pointer transition-all"
            id="share-passport-btn"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied URL!' : 'Share'}</span>
          </button>
        </div>

        {/* Physical Badge Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl relative"
          id="identity-passport-card"
        >
          {/* Top Banner accent */}
          <div className="bg-[#0A192F] h-24 relative overflow-hidden flex items-center justify-between px-6 active:scale-95 transition-all">
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#004D2C]/10 rounded-full blur-2xl"></div>
            <div className="text-white z-10 flex flex-col">
              <span className="text-[10px] font-black uppercase font-mono tracking-widest text-[#004D2C]">
                BukieBrain Identity
              </span>
              <span className="text-xs text-gray-400 font-medium">Verified Local Artisan System</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-[#0A192F] border border-[#004D2C]/50 flex items-center justify-center font-black text-white text-sm">
              B
            </div>
          </div>

          <div className="p-6 md:p-8 pt-0 -mt-10 flex flex-col items-center">
            {/* Avatar Header block */}
            <div className="relative">
              {/* Profile Avatar Pill */}
              <div id="worker-avatar" className="w-24 h-24 rounded-[24px] border-4 border-white bg-slate-100 shadow-md flex items-center justify-center text-[#0A192F] text-4xl font-extrabold select-none">
                {workerName.charAt(0).toUpperCase()}
              </div>

              {/* Verified badge status indicator overlay */}
              {isVerifiedWorker && (
                <div 
                  className="absolute -bottom-1 -right-1 bg-sky-500 text-white rounded-full p-1.5 border-2 border-white shadow-md flex items-center justify-center"
                  title="BukiePassport Verified Partner"
                  id="verified-badge-pill"
                >
                  <CheckCircle className="w-4 h-4 fill-white text-sky-500" />
                </div>
              )}
            </div>

            {/* Profile Info Text block */}
            <div className="text-center mt-4 space-y-1">
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <span className="text-xl font-extrabold text-gray-900 tracking-tight">{workerName}</span>
                {isVerifiedWorker && (
                  <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                    Verified
                  </span>
                )}
              </div>
              
              <span className="block text-[11px] font-bold text-[#004D2C] uppercase tracking-widest font-mono">
                Artisan Specialist
              </span>

              {/* Trust Score block */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-gray-500" id="trust-rating-score">
                <span>⭐⭐⭐⭐⭐</span>
                <span className="text-gray-900 px-1.5 py-0.5 bg-yellow-50 rounded-lg text-[11px] font-extrabold border border-yellow-200">5.0 Badge</span>
              </div>
            </div>

            <div className="w-full border-t border-gray-100 my-6"></div>

            {/* Premium Rate Metric */}
            <div className="w-full grid grid-cols-2 gap-4 text-center bg-gray-50 rounded-2xl p-4 border border-gray-100/80 mb-6">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Baseline Rate</span>
                <span className="text-lg font-black text-[#0A192F] font-mono">{hourlyRateDisplay}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Status</span>
                <span className="text-lg font-black text-emerald-600 font-mono">Available</span>
              </div>
            </div>

            {/* Bio info */}
            <div className="w-full space-y-2 mb-6 text-center">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">About Me</span>
              <p className="text-sm text-gray-600 leading-relaxed font-medium block">
                {passport?.bio || 'No professional overview pitch documented in identity file.'}
              </p>
            </div>

            {/* Core Skills Pill Tag List */}
            {skillsArray.length > 0 && (
              <div className="w-full space-y-3 mb-6" id="skills-pill-tags">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 text-center block">Artisanal Core Capacities</span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {skillsArray.map((skill: string, index: number) => (
                    <span 
                      key={index}
                      className="text-xs text-[#0A192F] bg-[#0A192F]/5 border border-[#0A192F]/10 font-bold px-3 py-1 rounded-xl uppercase tracking-wide active:scale-95 transition-all"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="w-full border-t border-gray-100 my-6"></div>

            {/* Contact Reveal Logic */}
            <div className="w-full space-y-4" id="identity-contact-block">
              {isOwner ? (
                // Owner Option
                <div className="space-y-2 text-center">
                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-800 text-xs font-semibold flex items-center gap-2 justify-center">
                    <Info className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>You are viewing your own public BukiePassport page.</span>
                  </div>
                  <button
                    onClick={() => router.push('/dashboard/passport')}
                    className="w-full bg-[#0A192F] hover:bg-gray-800 text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <span>Edit Identity Profile</span>
                  </button>
                </div>
              ) : (
                // Non-owner (Employer/Public) Option
                <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl space-y-4 relative overflow-hidden">
                  <span className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 text-center">
                    Worker Direct Contact
                  </span>
                  
                  {/* Blurred contact block */}
                  <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-bold tracking-wide text-gray-500 font-mono blur-sm select-none active:scale-95 transition-all">
                        +234 812 000 0000
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5" />
                      <span>Locked</span>
                    </span>
                  </div>

                  {/* Reveal Trigger */}
                  <button
                    onClick={() => setShowRevealModal(true)}
                    className="w-full bg-[#0A192F] hover:bg-[#112a4f] text-white text-xs font-extrabold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md shadow-green-900/10 cursor-pointer inline-flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                    id="reveal-contact-btn"
                  >
                    <Coins className="w-4 h-4 text-yellow-300" />
                    <span>Reveal Contact (₦200)</span>
                  </button>
                </div>
              )}
            </div>

            <div className="w-full border-t border-gray-100 my-6"></div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center space-y-3" id="qr-code-section">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" />
                <span>BukiePassport QR Link</span>
              </span>
              <div className="p-3 bg-white border-2 border-gray-100 rounded-2xl shadow-inner inline-block">
                {currentUrl ? (
                  <QRCodeSVG value={currentUrl} size={132} />
                ) : (
                  <div className="w-[132px] h-[132px] bg-gray-50 rounded-lg animate-pulse"></div>
                )}
              </div>
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest font-mono text-center">
                Scan to Hire Me
              </span>
            </div>

          </div>
        </motion.div>
      </div>

      {/* Phase 6 Contact Reveal Information Modal */}
      <AnimatePresence>
        {showRevealModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRevealModal(false)}
              className="fixed inset-0 bg-black z-50 pointer-events-auto"
            />
            
            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl z-50 space-y-5 text-center"
              id="reveal-info-modal"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="font-extrabold text-sm text-gray-900 uppercase tracking-wide">
                  Contact Reveal Verification
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Direct worker contact details will become unlockable in <strong>Phase 6 (Wallet Payments)</strong>. 
                </p>
                <p className="text-xs text-amber-700 bg-amber-50/50 border border-amber-100 rounded-xl p-3 mt-3 leading-relaxed">
                  Once active, clicking this button triggers an immediate <strong>₦200 micro-payment</strong> debit directly from your main wallet balance to release the phone number lock.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevealModal(false)}
                  className="w-full text-xs text-gray-500 hover:text-gray-900 font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer bg-gray-100 hover:bg-gray-200 text-center"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setShowRevealModal(false)}
                  className="w-full bg-[#0s06D44] bg-[#0A192F] hover:bg-[#112a4f] text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer text-center active:scale-[0.98] transition-all"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      </main>
      <SiteFooter />
    </div>
  );
}
