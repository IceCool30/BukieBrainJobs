'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { MOCK_CATEGORIES, NIGERIAN_LOCATIONS } from '../../lib/mock/homepage-data';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string | undefined;
}

export default function PostJobModal({ isOpen, onClose, initialCategory }: PostJobModalProps) {
  const defaultCategory = MOCK_CATEGORIES[0]?.id ?? 'cat-1';
  const [submitted, setSubmitted] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [category, setCategory] = useState(initialCategory || defaultCategory);
  const [location, setLocation] = useState('Ikeja, Lagos');
  const [budget, setBudget] = useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setJobTitle('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/60 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="post-job-modal-title"
    >
      <div 
        className="bg-white rounded-[2rem] max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 relative text-[#001A41]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors focus:ring-2 focus:ring-[#001A41]"
          aria-label="Close post job modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-[#296A4B] uppercase tracking-wider bg-[#EEFBF3] px-3 py-1 rounded-full">
                Secondary User Path • Post a Job
              </span>
              <h2 id="post-job-modal-title" className="font-display font-extrabold text-2xl text-[#001A41] mt-2">
                Describe the Job You Need Done
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Post your specific project details to receive competitive quotes from verified BrainWorkers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label font-semibold text-xs text-slate-700">
                  What service or task do you need? *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 20KVA Generator Servicing & Oil Change"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label font-semibold text-xs text-slate-700">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input text-sm bg-white"
                  >
                    {MOCK_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label font-semibold text-xs text-slate-700">
                    Location *
                  </label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="form-input text-sm bg-white"
                  >
                    {NIGERIAN_LOCATIONS.filter(l => l.status === 'active').map((loc, idx) => (
                      <option key={idx} value={`${loc.city}, ${loc.state}`}>
                        {loc.city} ({loc.state})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label font-semibold text-xs text-slate-700">
                  Estimated Budget (Optional, ₦)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₦15,000 - ₦25,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="form-input text-sm"
                />
              </div>

              <div className="bg-[#F8F9FF] p-3 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#296A4B] flex-shrink-0" />
                <span>Zero fee to post. Quotes will arrive from NIN-verified artisans.</span>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="submit"
                  className="btn-primary text-center flex-1 py-3 font-semibold text-sm shadow-md"
                >
                  Submit & Receive Quotes (Mock)
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary py-3 text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-[#EEFBF3] text-[#296A4B] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#ABEEC8]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-display font-bold text-2xl text-[#001A41]">
              Job Posted Successfully!
            </h3>
            <p className="text-slate-600 text-sm max-w-md mx-auto mt-2 leading-relaxed">
              In this UI prototype phase, your mock job titled <strong className="text-[#001A41]">&quot;{jobTitle || 'Service Request'}&quot;</strong> has been posted to our simulated marketplace.
            </p>

            <div className="my-6 bg-[#F8F9FF] border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left space-y-1.5">
              <div className="font-semibold text-[#001A41]">Next Steps in Production:</div>
              <div>• Verified artisans in {location} are notified automatically.</div>
              <div>• Compare incoming quotes and check BukiePassport ratings.</div>
              <div>• Funds remain protected in Escrow until completion.</div>
            </div>

            <button
              onClick={handleReset}
              className="btn-emerald px-8 py-3 text-sm font-semibold shadow"
            >
              Done & Return to Homepage
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
