'use client';

import React, { useState, useTransition } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Hammer, ShieldCheck, ArrowRight, User, Users } from 'lucide-react';

interface RoleSelectionFormProps {
  fullName?: string;
  setUserRole: (role: 'employer' | 'worker') => Promise<never>;
}

export function RoleSelectionForm({ fullName, setUserRole }: RoleSelectionFormProps) {
  const [selectedRole, setSelectedRole] = useState<'employer' | 'worker' | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleContinue = () => {
    if (!selectedRole) return;
    
    startTransition(async () => {
      try {
        await setUserRole(selectedRole);
      } catch (err) {
        console.error('Failed to set user role:', err);
      }
    });
  };

  return (
    <div className="w-full max-w-3xl px-4 py-8 flex flex-col items-center justify-center font-sans">
      
      {/* Title block */}
      <motion.div 
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="text-center mb-10 max-w-lg space-y-3"
      >
        <span className="text-[10px] sm:text-11px text-brand-green bg-brand-green/10 border border-brand-green/20 font-bold px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 animate-pulse" />
          BukiePassport Onboarding
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-navy tracking-tight">
          Welcome, {fullName || 'to BukieBrainJobs'}
        </h1>
        <p className="text-sm sm:text-base text-brand-navy/60 font-medium">
          Choose your track to begin using the platform. You can hire artisans or build your reputation as a professional.
        </p>
      </motion.div>

      {/* Spacious Track Selector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-10">
        
        {/* Employer Card */}
        <motion.button
          whileHover={{ y: -6, scale: 1.02, borderColor: "rgba(0,135,90,0.5)" }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          onClick={() => setSelectedRole('employer')}
          className={`relative border rounded-2xl p-6 sm:p-8 text-left shadow-sm cursor-pointer overflow-hidden flex flex-col justify-between min-h-[220px] transition-colors duration-300 ${
            selectedRole === 'employer'
              ? 'border-brand-green bg-brand-surface ring-2 ring-brand-green/35 shadow-[0_12px_40px_rgba(0,135,90,0.08)]'
              : 'border-brand-border/60 bg-brand-bg hover:border-brand-border hover:bg-brand-surface/30'
          }`}
          id="role-employer-card"
        >
          {/* Active selection dot indicator overlay */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              selectedRole === 'employer' 
                ? 'bg-brand-green border-brand-green text-white scale-110' 
                : 'border-brand-border bg-white'
            }`}>
              {selectedRole === 'employer' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 15 }}
                  className="w-2.5 h-2.5 bg-white rounded-full" 
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              selectedRole === 'employer'
                ? 'bg-brand-green/15 border-brand-green/20 text-brand-green scale-110'
                : 'bg-brand-surface border-brand-border text-brand-navy/55'
            }`}>
              <Users className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-navy">
                Hire Talent
              </h2>
              <p className="text-xs sm:text-sm text-brand-navy/65 leading-relaxed font-medium">
                Post domestic or professional gigs, browse local artisans, and hire securely. Your payments are fully protected until delivery.
              </p>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="mt-4 pt-4 border-t border-brand-border/30">
            <span className="text-[10px] font-bold text-brand-navy/40 uppercase tracking-wider block">
              Employers, Contractors, Managers
            </span>
          </div>
        </motion.button>

        {/* Worker/Artisan Card */}
        <motion.button
          whileHover={{ y: -6, scale: 1.02, borderColor: "rgba(0,135,90,0.5)" }}
          whileTap={{ scale: 0.985 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          onClick={() => setSelectedRole('worker')}
          className={`relative border rounded-2xl p-6 sm:p-8 text-left shadow-sm cursor-pointer overflow-hidden flex flex-col justify-between min-h-[220px] transition-colors duration-300 ${
            selectedRole === 'worker'
              ? 'border-brand-green bg-brand-surface ring-2 ring-brand-green/35 shadow-[0_12px_40px_rgba(0,135,90,0.08)]'
              : 'border-brand-border/60 bg-brand-bg hover:border-brand-border hover:bg-brand-surface/30'
          }`}
          id="role-worker-card"
        >
          {/* Active selection dot indicator overlay */}
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
              selectedRole === 'worker' 
                ? 'bg-brand-green border-brand-green text-white scale-110' 
                : 'border-brand-border bg-white'
            }`}>
              {selectedRole === 'worker' && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 350, damping: 15 }}
                  className="w-2.5 h-2.5 bg-white rounded-full" 
                />
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-300 ${
              selectedRole === 'worker'
                ? 'bg-brand-green/15 border-brand-green/20 text-brand-green scale-110'
                : 'bg-brand-surface border-brand-border text-brand-navy/55'
            }`}>
              <Hammer className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-display font-bold text-brand-navy">
                Get Hired
              </h2>
              <p className="text-xs sm:text-sm text-brand-navy/65 leading-relaxed font-medium">
                Find local artisan opportunities, build your digital BukiePassport identity, complete Blue Check verifications, and grow your income.
              </p>
            </div>
          </div>

          {/* Bottom badge */}
          <div className="mt-4 pt-4 border-t border-brand-border/30">
            <span className="text-[10px] font-bold text-brand-navy/40 uppercase tracking-wider block">
              Artisans, Specialists, Freelancers
            </span>
          </div>
        </motion.button>

      </div>

      {/* Primary Accent Action Continue Button */}
      <div className="w-full max-w-sm">
        <motion.button
          whileHover={selectedRole && !isPending ? { scale: 1.03 } : {}}
          whileTap={selectedRole && !isPending ? { scale: 0.98 } : {}}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          onClick={handleContinue}
          disabled={!selectedRole || isPending}
          className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
            !selectedRole 
              ? 'bg-brand-surface text-brand-navy/35 border border-brand-border/60 cursor-not-allowed'
              : 'bg-brand-green hover:bg-brand-green/90 text-white cursor-pointer'
          }`}
          id="onboarding-continue-btn"
        >
          <span>{isPending ? 'Processing your profile...' : 'Continue to Dashboard'}</span>
          {!isPending && (
            <motion.div
              animate={{ x: selectedRole ? [0, 4, 0] : 0 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          )}
        </motion.button>
      </div>

    </div>
  );
}
