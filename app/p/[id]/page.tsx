'use client';
import { LogoBase64 } from '@/lib/logo';
import { LogoLink } from '@/components/LogoLink';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
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
  Menu,
  Briefcase
} from 'lucide-react';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase-client';
import { QRCodeSVG } from 'qrcode.react';
import { SiteFooter } from '@/components/SiteFooter';
import { Sidebar } from '@/components/Sidebar';
import { getArtisanProfile } from '@/app/actions/reviews';


export default function PublicPassportPage() {
  const router = useRouter();
  const params = useParams();
  const workerId = params?.id as string;

  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [passport, setPassport] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
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
      if (!isSupabaseConfigured()) {
        setCurrentUserId('mock-user-id');
        setProfile({
          id: workerId || 'mock-worker-id',
          full_name: 'Solomon Ogar',
          role: 'worker',
          location_state: 'Lagos',
          location_lga: 'Ikeja',
          phone: '+234 803 123 4567'
        });
        setPassport({
          bio: 'Expert plumber and home repair specialist with 5 years of certified experience.',
          skills: ['Plumbing', 'Electrical Repairs', 'Tiling'],
          is_verified: true,
          verification_grade: 'A',
          hourly_rate: 2500
        });
        setReviews([
          {
            id: 'rev-1',
            rating: 5,
            comment: 'Prompt and highly professional. Highly recommended!',
            profiles: { full_name: 'Emeka Obi' },
            created_at: new Date(Date.now() - 5 * 86400000).toISOString()
          },
          {
            id: 'rev-2',
            rating: 4.8,
            comment: 'Resolved my leak issue instantly.',
            profiles: { full_name: 'Chinyere Alao' },
            created_at: new Date(Date.now() - 12 * 86400000).toISOString()
          }
        ]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setErrorMsg('');

        // Get currently logged in user session (if any)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUserId(session.user.id);
        }

        const data = await getArtisanProfile(workerId);
        setProfile(data.profile);
        setPassport(data.passport || {
          bio: 'Active artisanal service provider verified on the BukieBrain platform.',
          skills: ['General Works'],
          is_verified: false,
          hourly_rate: null
        });
        setReviews(data.reviews || []);

      } catch (err: any) {
        setErrorMsg(err.message || 'An error occurred loading the public passport.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadWorkerPassport();
  }, [workerId, supabase.auth]);

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(currentUrl).catch(e => console.error(e));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isOwner = currentUserId === workerId;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-brand-bg text-brand-navy">
        <div className="flex flex-col items-center gap-3">
          <LogoLink
            className="bg-brand-bg rounded-2xl shadow-sm border border-brand-border/40 flex items-center gap-1.5 p-1 w-fit mb-3 animate-pulse cursor-pointer hover:opacity-80 transition-opacity"
          />
          <span className="text-xs font-mono text-brand-navy/60 font-bold uppercase tracking-wide">
            Reading BukiePassport...
          </span>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main className="min-h-screen bg-brand-bg text-brand-navy py-12 px-4 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-brand-bg rounded-2xl shadow-xl border border-brand-border/40 p-8 text-center"
          id="not-found-passport-container"
        >
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-display font-bold text-brand-navy tracking-tight">Passport Not Found</h1>
          <p className="text-sm text-brand-navy/60 mt-2 leading-relaxed">
            {errorMsg}
          </p>
          <div className="mt-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-semibold py-3.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center justify-center gap-2 active:scale-[0.98]"
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
  const skillsArray = Array.isArray(passport?.skills) ? passport.skills : (passport?.skills ? [passport.skills] : []);
  const hourlyRateDisplay = passport?.hourly_rate ? `₦${passport.hourly_rate.toLocaleString()}/hr` : 'Negotiable';
  const completedJobsCount = profile?.jobs_completed || 0;
  const avgRating = profile?.avg_rating || 5.0;
  const disputes = profile?.dispute_strikes || 0;

  return (
    <div className="min-h-screen bg-brand-bg text-brand-navy flex flex-col relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Header with Logo and Hamburger */}
      <header className="flex justify-between items-center px-4 sm:px-6 py-4 bg-brand-bg border-b border-brand-border/40 sticky top-0 z-50 shadow-[0_1px_3px_rgba(10,25,47,0.01)] backdrop-blur-md">
        <LogoLink />
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="text-brand-navy p-2 hover:bg-brand-surface rounded-xl active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
      </header>

      <main className="flex-grow py-8 px-4 sm:px-6 flex flex-col items-center justify-start w-full max-w-lg mx-auto space-y-6">
        
        {/* Navigation & Actions Header Frame */}
        <div className="w-full flex justify-between items-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="group inline-flex items-center gap-2 text-xs font-bold text-brand-navy/60 hover:text-brand-navy uppercase tracking-wider transition-all duration-200 bg-brand-surface hover:bg-brand-surface/80 px-4 py-2.5 rounded-xl border border-brand-border/30 shadow-sm cursor-pointer"
            id="back-to-jobs-btn"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Marketplace</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-navy/60 hover:text-brand-navy uppercase tracking-wider bg-brand-surface hover:bg-brand-surface/80 px-4 py-2.5 rounded-xl border border-brand-border/30 shadow-sm cursor-pointer transition-all duration-200"
            id="share-passport-btn"
          >
            <Share2 className="w-4 h-4" />
            <span>{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>

        {/* Profile Intro Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-brand-bg rounded-2xl border border-brand-border/40 shadow-[0_8px_30px_rgba(10,25,47,0.02)] p-6 sm:p-8 relative overflow-hidden text-center"
          id="identity-passport-card"
        >
          {/* Design Accent Pattern */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-green/5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex flex-col items-center">
            {/* Avatar Header Block */}
            <div className="relative mb-5">
              <div id="worker-avatar" className="relative w-24 h-24 rounded-2xl border-2 border-brand-border bg-brand-surface shadow-sm flex items-center justify-center text-brand-navy text-4xl font-display font-bold select-none overflow-hidden">
                {profile?.avatar_url || passport?.avatar_url ? (
                  <Image
                    src={profile?.avatar_url || passport?.avatar_url}
                    alt={workerName}
                    width={96}
                    height={96}
                    unoptimized={true}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  workerName.charAt(0).toUpperCase()
                )}
              </div>

              {/* Verified badge status indicator overlay */}
              {isVerifiedWorker && (
                <div 
                  className="absolute -bottom-1 -right-1 bg-brand-green text-white rounded-xl p-1.5 border-2 border-brand-bg shadow-sm flex items-center justify-center"
                  title="BukiePassport Verified Partner"
                  id="verified-badge-pill"
                >
                  <CheckCircle className="w-4 h-4 fill-white text-brand-green" />
                </div>
              )}
            </div>

            {/* Profile Info Text Block */}
            <div className="space-y-1.5 w-full">
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <h2 className="text-2xl font-display font-bold text-brand-navy tracking-tight">{workerName}</h2>
                {isVerifiedWorker && (
                  <span className="text-[10px] text-brand-green bg-brand-green/10 border border-brand-green/20 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              
              <span className="block text-xs font-semibold text-brand-green uppercase tracking-wider font-sans">
                Artisan Specialist • {profile?.location_lga || 'Local'}, {profile?.location_state || 'Nigeria'}
              </span>

              {/* Trust Score block */}
              <div className="pt-2 flex items-center justify-center gap-2 text-xs font-bold text-brand-navy/60" id="trust-rating-score">
                {completedJobsCount === 0 || completedJobsCount === null ? (
                  <span className="text-brand-navy/50 font-semibold bg-brand-surface border border-brand-border/40 px-3 py-1 rounded-full text-[11px] uppercase tracking-wide">
                    New Worker (No Ratings Yet)
                  </span>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-200/50 px-3 py-1.5 rounded-full text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < Math.round(avgRating || 5) ? 'text-amber-500 fill-amber-500' : 'text-brand-navy/15'}`} />
                      ))}
                    </div>
                    <span className="bg-white px-1.5 py-0.5 rounded-md border border-amber-200 text-amber-800 font-mono text-[10px]">
                      {(avgRating || 5.0).toFixed(1)} Score
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metadata Grid System */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stats Box */}
          <div className="bg-brand-surface border border-brand-border/40 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <span className="text-[10px] font-bold text-brand-navy/45 uppercase tracking-wider block">Professional Record</span>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block text-[10px] font-semibold text-brand-navy/50 uppercase tracking-wider">Completed</span>
                <span className="text-base font-bold text-brand-navy font-mono mt-1 block">{completedJobsCount} Jobs</span>
              </div>
              <div className="border-x border-brand-border/60 px-1">
                <span className="block text-[10px] font-semibold text-brand-navy/50 uppercase tracking-wider">Base Rate</span>
                <span className="text-sm font-bold text-brand-navy font-mono mt-1 block leading-tight">{hourlyRateDisplay}</span>
              </div>
              <div>
                <span className="block text-[10px] font-semibold text-brand-navy/50 uppercase tracking-wider">Disputes</span>
                <span className={`text-sm font-bold font-mono mt-1 block ${disputes > 0 ? 'text-red-600' : 'text-brand-green'}`}>
                  {disputes} Strikes
                </span>
              </div>
            </div>
          </div>

          {/* Verification QR Code Box */}
          <div className="bg-brand-surface border border-brand-border/40 rounded-2xl p-5 flex flex-col items-center justify-between text-center" id="qr-code-section">
            <div className="w-full flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-brand-navy/45 uppercase tracking-wider flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-brand-navy/60" />
                <span>BukiePassport QR Link</span>
              </span>
              {passport?.verification_grade && (
                <span className="text-[10px] font-bold bg-brand-green/10 text-brand-green border border-brand-green/20 px-2 py-0.5 rounded-full uppercase">
                  Tier {passport.verification_grade}
                </span>
              )}
            </div>
            
            <div className="p-2 bg-brand-bg border border-brand-border/50 rounded-xl shadow-inner inline-block">
              {currentUrl ? (
                <QRCodeSVG value={currentUrl} size={92} />
              ) : (
                <div className="w-[92px] h-[92px] bg-brand-bg rounded-lg animate-pulse"></div>
              )}
            </div>
            
            <span className="text-[10px] font-bold text-brand-navy/50 uppercase tracking-widest font-mono mt-2 block">
              Scan to Verify or Hire
            </span>
          </div>
        </div>

        {/* Professional Summary & Skills */}
        <div className="w-full bg-brand-bg rounded-2xl border border-brand-border/40 shadow-[0_8px_30px_rgba(10,25,47,0.015)] p-6 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-brand-navy/45 block">Professional Summary</span>
            <p className="text-sm text-brand-navy/85 leading-relaxed font-medium">
              {passport?.bio || 'No professional overview pitch documented in identity file.'}
            </p>
          </div>

          {skillsArray.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-brand-border/30" id="skills-pill-tags">
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-navy/45 block">Artisanal Core Capacities</span>
              <div className="flex flex-wrap gap-1.5">
                {skillsArray.map((skill: string, index: number) => (
                  <span 
                    key={index}
                    className="text-xs text-brand-navy bg-brand-surface border border-brand-border/50 font-semibold px-3 py-1.5 rounded-xl uppercase tracking-wide active:scale-95 transition-all duration-150"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Block */}
        <div className="w-full bg-brand-bg rounded-2xl border border-brand-border/40 shadow-[0_8px_30px_rgba(10,25,47,0.015)] p-6 space-y-4" id="identity-contact-block">
          {isOwner ? (
            <div className="space-y-4 text-center">
              <div className="p-3.5 bg-brand-surface border border-brand-border/40 rounded-xl text-brand-navy/80 text-xs font-semibold flex items-center gap-2 justify-center">
                <Info className="w-4 h-4 text-brand-navy shrink-0" />
                <span>You are viewing your own public BukiePassport page.</span>
              </div>
              <button
                onClick={() => router.push('/dashboard/passport')}
                className="w-full bg-brand-navy hover:bg-brand-navy/90 text-white text-xs sm:text-sm font-semibold py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                Edit Passport Identity
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="block text-[10px] uppercase font-bold tracking-wider text-brand-navy/45">
                Worker Direct Contact
              </span>
              
              {/* Blurred contact block */}
              <div className="flex items-center justify-between bg-brand-surface px-4 py-3 border border-brand-border/40 rounded-xl">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-brand-navy/40" />
                  <span className="text-sm font-bold tracking-wide text-brand-navy/60 font-mono blur-[3px] select-none">
                    +234 812 000 0000
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-amber-700 tracking-wider flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Locked</span>
                </span>
              </div>

              {/* Reveal Trigger */}
              <button
                onClick={() => setShowRevealModal(true)}
                className="w-full bg-brand-navy hover:bg-brand-navy/95 text-white text-xs sm:text-sm font-semibold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98]"
                id="reveal-contact-btn"
              >
                <Coins className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Reveal Contact (₦200)</span>
              </button>
            </div>
          )}
        </div>

        {/* Hire Button */}
        {!isOwner && (
          <button
            onClick={() => router.push(`/dashboard/post-job?artisan_id=${workerId}`)}
            className="w-full bg-brand-green hover:bg-brand-green/90 text-white text-sm sm:text-base font-semibold py-4 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Briefcase className="w-5 h-5" />
            <span>Hire {workerName.split(' ')[0]} Now</span>
          </button>
        )}

        {/* Reviews Section */}
        <div className="w-full space-y-4 pt-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-display font-bold text-brand-navy flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              Client Reviews Ledger
            </h3>
            <span className="text-[10px] font-bold text-brand-navy/50 bg-brand-surface border border-brand-border/30 px-2.5 py-1 rounded-full uppercase">
              {reviews.length} total
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8 bg-brand-surface rounded-2xl border border-brand-border/30 border-dashed">
              <span className="text-xs text-brand-navy/55 font-semibold font-sans">No reviews yet for this artisan.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-brand-bg border border-brand-border/40 rounded-2xl p-5 shadow-[0_4px_16px_rgba(10,25,47,0.01)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-surface border border-brand-border/50 overflow-hidden flex items-center justify-center text-xs font-bold text-brand-navy/60">
                        {review.employer?.avatar_url ? (
                          <Image
                            src={review.employer.avatar_url}
                            alt="Employer Avatar"
                            width={28}
                            height={28}
                            unoptimized={true}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          review.employer?.full_name?.charAt(0) || 'U'
                        )}
                      </div>
                      <span className="text-xs font-bold text-brand-navy flex items-center gap-1">
                        {review.employer?.full_name || 'Anonymous User'}
                        {review.is_blue_check_reviewer && (
                          <span className="text-brand-green" title="Verified Employer">
                            <CheckCircle className="w-3.5 h-3.5 fill-brand-green text-white" />
                          </span>
                        )}
                      </span>
                    </div>
                    <span className="text-[10px] text-brand-navy/40 font-mono">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-brand-navy/15'}`} 
                      />
                    ))}
                  </div>

                  {review.comment && (
                    <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed font-sans font-medium italic">
                      &quot;{review.comment}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

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
              className="fixed inset-x-4 bottom-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-brand-bg rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl z-50 border border-brand-border/40 space-y-5 text-center"
              id="reveal-info-modal"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-100">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h3 className="font-display font-bold text-base text-brand-navy uppercase tracking-wide">
                  Contact Reveal Verification
                </h3>
                <p className="text-xs text-brand-navy/60 mt-2 leading-relaxed font-sans">
                  Direct worker contact details will become unlockable in <strong>Phase 6 (Wallet Payments)</strong>. 
                </p>
                <p className="text-xs text-amber-800 bg-amber-50/50 border border-amber-100 rounded-xl p-3 mt-3 leading-relaxed font-sans font-medium">
                  Once active, clicking this button triggers an immediate <strong>₦200 micro-payment</strong> debit directly from your main wallet balance to release the phone number lock.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRevealModal(false)}
                  className="w-full text-xs text-brand-navy/70 hover:text-brand-navy font-semibold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer bg-brand-surface hover:bg-brand-surface/80 text-center border border-brand-border/30"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setShowRevealModal(false)}
                  className="w-full bg-brand-navy hover:bg-brand-navy/95 text-white text-xs font-semibold uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer text-center active:scale-[0.98]"
                >
                  Acknowledge
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SiteFooter />
    </div>
  );
}
