'use client';

import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hammer, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  User, 
  Users, 
  Phone, 
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { LocationSelector } from '@/components/LocationSelector';

interface RoleSelectionFormProps {
  fullName?: string;
  nextUrl?: string;
  setUserRole: (
    role: 'employer' | 'worker',
    fullName?: string,
    state?: string,
    lga?: string,
    phone?: string,
    redirectTo?: string
  ) => Promise<never>;
}

export function RoleSelectionForm({ fullName: initialFullName, nextUrl, setUserRole }: RoleSelectionFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedRole, setSelectedRole] = useState<'employer' | 'worker' | null>(null);
  
  // Profile Inputs
  const [fullName, setFullName] = useState(initialFullName || '');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [lga, setLga] = useState('');
  const [formError, setFormError] = useState('');

  const [isPending, startTransition] = useTransition();

  const handleNextStep = () => {
    if (!selectedRole) return;
    setStep(2);
  };

  const handleBackStep = () => {
    setStep(1);
    setFormError('');
  };

  const handleSubmit = () => {
    if (!selectedRole) return;
    if (!fullName.trim()) {
      setFormError('Please enter your full name or nickname.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Please enter your contact phone number.');
      return;
    }
    if (!state) {
      setFormError('Please select or type your state.');
      return;
    }

    setFormError('');
    startTransition(async () => {
      try {
        await setUserRole(selectedRole, fullName, state, lga, phone, nextUrl);
      } catch (err) {
        console.error('Failed to complete onboarding:', err);
        setFormError('Something went wrong during onboarding. Please try again.');
      }
    });
  };

  return (
    <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-3xl border border-brand-border/40 p-6 sm:p-10 shadow-xl overflow-hidden relative">
      
      {/* Decorative ambient background blur behind form */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-brand-green/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-brand-navy/5 rounded-full blur-2xl pointer-events-none" />

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-brand-border/30">
        <div className="flex items-center gap-1.5 text-xs font-bold text-brand-green">
          <ShieldCheck className="w-4 h-4 animate-pulse" />
          <span>BukiePassport Identity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-2 w-10 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-brand-green' : 'bg-brand-border/40'}`} />
          <span className={`h-2 w-10 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-brand-green' : 'bg-brand-border/40'}`} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* Title Block */}
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-3xl font-display font-black text-brand-navy tracking-tight leading-none">
                Select Your Role
              </h1>
              <p className="text-sm text-brand-navy/60 font-medium max-w-md">
                Are you here to hire verified local artisans, or to offer your own skills and make money?
              </p>
            </div>

            {/* Role Cards Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Employer Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedRole('employer')}
                type="button"
                className={`relative rounded-2xl p-6 text-left border-2 flex flex-col justify-between min-h-[200px] transition-all duration-200 cursor-pointer ${
                  selectedRole === 'employer'
                    ? 'border-brand-green bg-brand-green/[0.03] shadow-[0_8px_24px_rgba(0,135,90,0.08)]'
                    : 'border-brand-border/40 bg-white hover:border-brand-border hover:bg-brand-bg/40'
                }`}
                id="role-employer-card"
              >
                {/* Visual Circle Indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedRole === 'employer' ? 'bg-brand-green border-brand-green text-white' : 'border-brand-border'
                  }`}>
                    {selectedRole === 'employer' && <CheckCircle2 className="w-4.5 h-4.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                    selectedRole === 'employer' ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' : 'bg-brand-bg border-brand-border/40 text-brand-navy/50'
                  }`}>
                    <Users className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-navy font-display">Hire Talent</h3>
                    <p className="text-xs text-brand-navy/60 font-medium leading-relaxed mt-1">
                      Post local jobs, review matching bids, escrow payments securely, and hire artisans with peace of mind.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-brand-navy/40 uppercase tracking-wider block mt-4 border-t border-brand-border/20 pt-3">
                  Employers & Managers
                </span>
              </motion.button>

              {/* Worker Card */}
              <motion.button
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedRole('worker')}
                type="button"
                className={`relative rounded-2xl p-6 text-left border-2 flex flex-col justify-between min-h-[200px] transition-all duration-200 cursor-pointer ${
                  selectedRole === 'worker'
                    ? 'border-brand-green bg-brand-green/[0.03] shadow-[0_8px_24px_rgba(0,135,90,0.08)]'
                    : 'border-brand-border/40 bg-white hover:border-brand-border hover:bg-brand-bg/40'
                }`}
                id="role-worker-card"
              >
                {/* Visual Circle Indicator */}
                <div className="absolute top-4 right-4">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedRole === 'worker' ? 'bg-brand-green border-brand-green text-white' : 'border-brand-border'
                  }`}>
                    {selectedRole === 'worker' && <CheckCircle2 className="w-4.5 h-4.5 stroke-[3]" />}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                    selectedRole === 'worker' ? 'bg-brand-green/10 border-brand-green/20 text-brand-green' : 'bg-brand-bg border-brand-border/40 text-brand-navy/50'
                  }`}>
                    <Hammer className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-brand-navy font-display">Get Hired</h3>
                    <p className="text-xs text-brand-navy/60 font-medium leading-relaxed mt-1">
                      Apply for gigs, create a verified local reputation, complete passports, and withdraw earnings directly.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold text-brand-navy/40 uppercase tracking-wider block mt-4 border-t border-brand-border/20 pt-3">
                  Artisans & Specialists
                </span>
              </motion.button>
            </div>

            {/* Action Footer */}
            <div className="flex justify-end pt-4">
              <motion.button
                whileHover={selectedRole ? { scale: 1.02 } : {}}
                whileTap={selectedRole ? { scale: 0.98 } : {}}
                disabled={!selectedRole}
                onClick={handleNextStep}
                className={`px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  selectedRole 
                    ? 'bg-brand-green text-white shadow-md hover:bg-brand-green/90' 
                    : 'bg-brand-border/40 text-brand-navy/45 cursor-not-allowed border border-brand-border/30'
                }`}
                id="onboarding-next-btn"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-5"
          >
            {/* Title Block */}
            <div className="flex items-center gap-2 text-brand-green mb-1">
              <button 
                onClick={handleBackStep} 
                className="p-1 rounded-full hover:bg-brand-border/30 text-brand-navy/55 hover:text-brand-navy transition-colors cursor-pointer"
                title="Go Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-navy/40">Step 2 of 2</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-display font-black text-brand-navy tracking-tight leading-none">
                Tell Us About Yourself
              </h1>
              <p className="text-xs text-brand-navy/60 font-medium">
                Set up your public card and location to facilitate smart local job matches.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-1">
              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-navy/60 uppercase tracking-wider block">
                  Full Name / Business Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-brand-navy/40" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Solomon Ogar"
                    className="w-full bg-white border border-brand-border/60 hover:border-brand-border focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-brand-navy outline-none transition-all placeholder:text-brand-navy/35"
                    required
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-navy/60 uppercase tracking-wider block">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-brand-navy/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 08031234567"
                    className="w-full bg-white border border-brand-border/60 hover:border-brand-border focus:border-brand-green focus:ring-1 focus:ring-brand-green rounded-xl py-3 pl-11 pr-4 text-sm font-medium text-brand-navy outline-none transition-all placeholder:text-brand-navy/35"
                    required
                  />
                </div>
              </div>

              {/* Location Selectors */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-brand-navy/60 uppercase tracking-wider block">
                  Where are you located? (Nigeria)
                </label>
                <LocationSelector
                  selectedState={state}
                  selectedArea={lga}
                  onStateChange={setState}
                  onAreaChange={setLga}
                  statePlaceholder="Search State (e.g. Lagos)"
                  areaPlaceholder="Search Area / LGA (e.g. Ikeja)"
                  showDetectLocation={true}
                  className="w-full"
                />
              </div>
            </div>

            {formError && (
              <motion.p 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-bold text-rose-500 bg-rose-50 border border-rose-100 p-3 rounded-xl"
              >
                ⚠️ {formError}
              </motion.p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleBackStep}
                disabled={isPending}
                className="flex-1 py-3.5 rounded-xl border border-brand-border/60 text-brand-navy/70 hover:bg-brand-bg/40 font-bold transition-all text-sm cursor-pointer text-center"
              >
                Back
              </button>
              
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-2 py-3.5 bg-brand-green hover:bg-brand-green/90 text-white rounded-xl font-bold transition-all text-sm shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                id="onboarding-submit-btn"
              >
                {isPending ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span>Completing Setup...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Enter Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
