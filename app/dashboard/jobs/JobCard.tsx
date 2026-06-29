'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, MapPin, Loader2, DollarSign, PenTool, CheckCircle } from 'lucide-react';

export default function JobCard({ 
  job, 
  applyAction 
}: { 
  job: any, 
  applyAction: (id: string, proposedBudget: number, coverLetter: string) => Promise<{error?: string, success?: boolean}> 
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [proposedBudget, setProposedBudget] = useState(job.budget?.toString() || '');
  const [coverLetter, setCoverLetter] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-6 bg-white border border-gray-100 rounded-3xl min-h-[150px] animate-pulse" />;
  }

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const numericBudget = parseInt((proposedBudget || '').replace(/[^0-9]/g, ''), 10);
    
    if (isNaN(numericBudget) || numericBudget <= 0) {
      setError("Please enter a valid budget.");
      setLoading(false);
      return;
    }
    
    if (!coverLetter.trim()) {
      setError("Please write a short proposal to the employer.");
      setLoading(false);
      return;
    }

    const res = await applyAction(job.id, numericBudget, coverLetter);
    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccess(true);
      setIsExpanded(false);
    }
    setLoading(false);
  }

  return (
    <motion.div 
      id={`job-card-${job.id}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, margin: "-10px" }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      whileHover={{ 
        y: -5, 
        scale: 1.012,
        boxShadow: "0 12px 30px rgba(10, 25, 47, 0.05)",
        borderColor: "rgba(10, 25, 47, 0.15)"
      }}
      whileTap={{ scale: 0.995 }}
      className="bg-brand-bg border border-brand-border/40 rounded-2xl p-6 shadow-[0_4px_16px_rgba(10, 25, 47, 0.02)] transition-all"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-display font-bold text-brand-navy tracking-tight">{job.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-brand-navy/60 uppercase tracking-wider mt-2.5">
            <span className="flex items-center gap-1.5 bg-brand-surface border border-brand-border/40 px-2.5 py-1 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-brand-green" />
              <span>{job.location_lga || 'Local'}, {job.location_state || 'Nigeria'}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-brand-surface border border-brand-border/40 px-2.5 py-1 rounded-lg">
              <Briefcase className="w-3.5 h-3.5 text-brand-green" />
              <span>{job.employer?.full_name || 'Employer'}</span>
            </span>
          </div>
        </div>
        <div className="bg-brand-green/5 border border-brand-green/10 px-4 py-2.5 rounded-xl text-center min-w-[130px] self-stretch md:self-auto">
          <span className="block text-[9px] font-bold text-brand-green uppercase tracking-widest mb-0.5">Client Budget</span>
          <span className="text-base sm:text-lg font-black text-brand-green font-mono">₦{job.budget?.toLocaleString()}</span>
        </div>
      </div>
      
      <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed mb-6 font-medium font-sans">
        {job.description}
      </p>
      
      {success ? (
        <div className="flex items-center gap-2.5 text-brand-green bg-brand-green/5 px-4 py-3.5 rounded-xl border border-brand-green/10 font-bold text-xs sm:text-sm">
          <CheckCircle className="w-5 h-5 text-brand-green" />
          <span>Application submitted successfully! The employer will review your bid.</span>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className={`text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer border ${
              isExpanded 
                ? 'bg-brand-surface text-brand-navy/60 border-brand-border/60 hover:bg-brand-surface/80' 
                : 'bg-brand-green hover:bg-brand-green/95 text-white border-brand-green shadow-sm shadow-brand-green/10'
            }`}
          >
            <span>{isExpanded ? 'Close Brief' : 'View Brief / Submit Bid'}</span>
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.form 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden space-y-4 border-t border-brand-border/30 pt-5 w-full text-left"
                onSubmit={handleApply}
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy/50 uppercase tracking-wider">
                    Your Proposed Budget (₦)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-brand-navy/40 font-mono">₦</span>
                    <input
                      type="text"
                      value={proposedBudget}
                      onChange={(e) => setProposedBudget(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full pl-9 pr-4 py-3 bg-brand-surface border border-brand-border/60 rounded-xl font-mono text-xs sm:text-sm text-brand-navy focus:bg-brand-bg focus:ring-2 focus:ring-brand-green/30 outline-none transition-all placeholder-brand-navy/30"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-brand-navy/50 uppercase tracking-wider">
                    Cover Letter / Proposal
                  </label>
                  <div className="relative">
                    <PenTool className="absolute left-4 top-4 w-4 h-4 text-brand-navy/35" />
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Why are you the best fit for this job?"
                      rows={4}
                      className="w-full pl-11 pr-4 py-3 bg-brand-surface border border-brand-border/60 rounded-xl text-xs sm:text-sm font-medium text-brand-navy focus:bg-brand-bg focus:ring-2 focus:ring-brand-green/30 outline-none transition-all resize-none placeholder-brand-navy/30"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-xs sm:text-sm font-medium rounded-xl border border-red-100/50">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading} 
                  className="w-full bg-brand-navy hover:bg-brand-navy/95 disabled:bg-brand-surface disabled:text-brand-navy/30 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Submitting Bid...</span>
                    </>
                  ) : (
                    <span>Submit Bid & Pay ₦100</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
