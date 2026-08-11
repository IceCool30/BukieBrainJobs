'use client';

import React from 'react';
import Image from 'next/image';
import { X, Star, ShieldCheck, MapPin, Clock, CheckCircle2, Award, ShieldAlert } from 'lucide-react';
import { BrainWorker } from '../../lib/mock/homepage-data';

interface BrainWorkerModalProps {
  worker: BrainWorker | null;
  isOpen: boolean;
  onClose: () => void;
  onBookClick: (worker: BrainWorker) => void;
}

export default function BrainWorkerModal({
  worker,
  isOpen,
  onClose,
  onBookClick,
}: BrainWorkerModalProps) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !worker) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#001A41]/60 backdrop-blur-sm animate-fade-in" 
      onClick={onClose}
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="worker-modal-title"
    >
      <div 
        className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-100 p-6 sm:p-8 relative text-[#001A41]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors focus:ring-2 focus:ring-[#001A41]"
          aria-label="Close details modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-[#296A4B] shadow-md flex-shrink-0">
            <Image
              src={worker.avatarUrl}
              alt={worker.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 id="worker-modal-title" className="font-display font-bold text-2xl text-[#001A41]">
                {worker.name}
              </h2>
              {worker.verifiedBadge && (
                <span className="inline-flex items-center gap-1 bg-[#296A4B]/10 text-[#296A4B] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#296A4B]/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm font-medium mb-3">{worker.title}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#296A4B]" /> {worker.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <strong className="text-[#001A41]">{worker.rating}</strong> ({worker.reviewCount} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> ~{worker.responseMinutes}m response
              </span>
            </div>
          </div>
        </div>

        {/* Passport & Trust Metrics */}
        <div className="grid grid-cols-3 gap-3 my-6 bg-[#F8F9FF] p-4 rounded-xl text-center border border-slate-100">
          <div>
            <div className="text-xs text-slate-500 font-medium">BukiePassport</div>
            <div className="font-display font-bold text-sm text-[#296A4B] flex items-center justify-center gap-1 mt-0.5">
              <Award className="w-4 h-4" /> {worker.passportTier}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Completed Jobs</div>
            <div className="font-display font-bold text-sm text-[#001A41] mt-0.5">{worker.completedJobs}+</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 font-medium">Est. Rate</div>
            <div className="font-display font-bold text-sm text-[#001A41] mt-0.5">{worker.hourlyRate}</div>
          </div>
        </div>

        {/* Biography */}
        <div className="mb-6">
          <h3 className="font-display font-semibold text-sm text-[#001A41] mb-2 uppercase tracking-wider">About</h3>
          <p className="text-slate-600 text-sm leading-relaxed">{worker.bio}</p>
        </div>

        {/* Skills & Badges */}
        <div className="mb-6">
          <h3 className="font-display font-semibold text-sm text-[#001A41] mb-2 uppercase tracking-wider">Verified Skills</h3>
          <div className="flex flex-wrap gap-2">
            {worker.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" /> {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Safety Protection Notice */}
        <div className="bg-[#EEFBF3] border border-[#ABEEC8] p-4 rounded-xl text-xs text-[#205139] flex items-start gap-3 mb-6">
          <ShieldAlert className="w-5 h-5 text-[#296A4B] flex-shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Protected by BukieGuarantee</strong>
            Payment is held in secure BukieEscrow until work is inspected and approved. Protected up to ₦500,000 against property damage.
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              onBookClick(worker);
              onClose();
            }}
            className="btn-emerald text-center flex-1 py-3 font-semibold text-sm shadow-md"
          >
            Direct Request / Book {worker.name.split(' ')[0]}
          </button>
          <button
            onClick={onClose}
            className="btn-secondary text-center py-3 font-semibold text-sm"
          >
            Keep Browsing
          </button>
        </div>

      </div>
    </div>
  );
}
