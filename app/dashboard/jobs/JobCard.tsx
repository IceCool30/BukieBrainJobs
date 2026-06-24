'use client'

import { useState } from 'react';
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
  
  const [proposedBudget, setProposedBudget] = useState(job.budget?.toString() || '');
  const [coverLetter, setCoverLetter] = useState('');

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
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight">{job.title}</h2>
          <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-wider mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" />
              {job.location_lga || 'Local'}, {job.location_state || 'Nigeria'}
            </span>
            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-amber-500" />
              {job.employer?.full_name || 'Employer'}
            </span>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-xl text-center min-w-[120px]">
          <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest">Client Budget</span>
          <span className="text-base font-black text-blue-700 font-mono">₦{job.budget?.toLocaleString()}</span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
        {job.description}
      </p>
      
      {success ? (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-3 rounded-xl border border-green-100 font-bold text-sm">
          <CheckCircle className="w-5 h-5" />
          <span>Application submitted successfully! The employer will review your bid.</span>
        </div>
      ) : (
        <>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="text-xs font-extrabold uppercase tracking-wider text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
          >
            {isExpanded ? 'Cancel Application' : 'Apply for Job'}
          </button>

          <AnimatePresence>
            {isExpanded && (
              <motion.form 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden space-y-4 border-t border-gray-100 pt-6"
                onSubmit={handleApply}
              >
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Your Proposed Budget (₦)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={proposedBudget}
                      onChange={(e) => setProposedBudget(e.target.value)}
                      placeholder="e.g. 50000"
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Cover Letter / Proposal
                  </label>
                  <div className="relative">
                    <PenTool className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Why are you the best fit for this job?"
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100">
                    {error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading} 
                  className="w-full bg-[#0A192F] hover:bg-gray-800 disabled:bg-gray-300 text-white text-xs font-extrabold uppercase tracking-wider py-4 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Bid & Pay ₦100</span>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
