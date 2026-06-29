'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, DollarSign, RotateCcw, Filter, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function JobFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state initialized from URL search params
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [minBudget, setMinBudget] = useState(searchParams.get('minBudget') || '');
  const [isFocused, setIsFocused] = useState(false);

  // Keep state in sync with URL changes (e.g., if reset is clicked)
  useEffect(() => {
    setQ(searchParams.get('q') || '');
    setState(searchParams.get('state') || '');
    setMinBudget(searchParams.get('minBudget') || '');
  }, [searchParams]);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (state.trim()) params.set('state', state.trim());
    if (minBudget.trim()) params.set('minBudget', minBudget.trim());

    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const handleReset = () => {
    setQ('');
    setState('');
    setMinBudget('');
    router.push('/dashboard/jobs');
  };

  const selectBudgetPreset = (amount: string) => {
    const newBudget = minBudget === amount ? '' : amount;
    setMinBudget(newBudget);
    
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    if (state.trim()) params.set('state', state.trim());
    if (newBudget) params.set('minBudget', newBudget);
    
    router.push(`/dashboard/jobs?${params.toString()}`);
  };

  const budgetPresets = [
    { label: '₦10k+', value: '10000' },
    { label: '₦50k+', value: '50000' },
    { label: '₦100k+', value: '100000' },
    { label: '₦200k+', value: '200000' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`w-full bg-brand-bg rounded-2xl border p-5 sm:p-6 transition-all duration-300 space-y-5 ${
        isFocused 
          ? 'border-brand-green/60 shadow-[0_8px_30px_rgba(0,135,90,0.06)] bg-white' 
          : 'border-brand-border/40 shadow-[0_4px_20px_rgba(10,25,47,0.02)]'
      }`} 
      id="job-filter-container"
    >
      
      {/* Top Search bar & Inputs Row */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-12 gap-3">
        
        {/* Search Keyword Input */}
        <div className="md:col-span-5 relative">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 transition-colors duration-200 ${isFocused ? 'text-brand-green' : 'text-brand-navy/40'}`} />
          <input
            type="text"
            placeholder="Search titles, skills, or job briefs..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="w-full pl-11 pr-4 py-3 bg-brand-surface border border-brand-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-xs sm:text-sm font-sans transition-all text-brand-navy placeholder-brand-navy/35 focus:bg-white"
          />
        </div>

        {/* Location State Selection */}
        <div className="md:col-span-4 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-navy/40" />
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-brand-surface border border-brand-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-xs sm:text-sm font-sans transition-all text-brand-navy placeholder-brand-navy/35 appearance-none cursor-pointer focus:bg-white"
          >
            <option value="">Anywhere in Nigeria</option>
            <option value="Lagos">Lagos</option>
            <option value="Abuja">Abuja FCT</option>
            <option value="Rivers">Rivers (Port Harcourt)</option>
            <option value="Kano">Kano</option>
            <option value="Oyo">Oyo (Ibadan)</option>
            <option value="Kaduna">Kaduna</option>
            <option value="Enugu">Enugu</option>
            <option value="Delta">Delta</option>
            <option value="Anambra">Anambra</option>
            <option value="Edo">Edo</option>
          </select>
          {/* Custom Chevron indicator */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-brand-navy/40">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>

        {/* Budget Min Input */}
        <div className="md:col-span-3 relative">
          <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-brand-navy/40" />
          <input
            type="number"
            placeholder="Min Budget (₦)"
            value={minBudget}
            onChange={(e) => setMinBudget(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-brand-surface border border-brand-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-xs sm:text-sm font-sans font-mono transition-all text-brand-navy placeholder-brand-navy/35 focus:bg-white"
          />
        </div>

      </form>

      {/* Advanced Presets, Categories and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1.5 border-t border-brand-border/30">
        
        {/* Left Side: Budget presets (styled as highly-visual pill layout) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-brand-navy/40 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Budget Tier:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {budgetPresets.map((preset) => {
              const isActive = minBudget === preset.value;
              return (
                <motion.button
                  key={preset.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => selectBudgetPreset(preset.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer border flex items-center ${
                    isActive
                      ? 'bg-brand-green text-white border-brand-green shadow-sm shadow-brand-green/10'
                      : 'bg-brand-surface text-brand-navy/70 border-brand-border/60 hover:bg-brand-surface/80 hover:border-brand-border'
                  }`}
                >
                  {preset.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Actions Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Reset Filter Button */}
          <AnimatePresence>
            {(q || state || minBudget) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-brand-navy/60 hover:text-brand-navy bg-brand-surface border border-brand-border/40 hover:bg-brand-surface/80 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Core Search Trigger Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSearch()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-green hover:bg-brand-green/90 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </motion.button>
        </div>

      </div>

    </motion.div>
  );
}
