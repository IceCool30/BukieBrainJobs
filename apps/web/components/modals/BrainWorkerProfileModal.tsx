'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, Star, BadgeCheck, ShieldCheck, Wrench, CheckCircle2, Calendar, MapPin, Award } from 'lucide-react';
import { BrainWorker } from '../../lib/mock/homepage-data';

interface BrainWorkerProfileModalProps {
  worker: BrainWorker | null;
  isOpen: boolean;
  onClose: () => void;
  onBookWorker: (worker: BrainWorker) => void;
}

export default function BrainWorkerProfileModal({
  worker,
  isOpen,
  onClose,
  onBookWorker,
}: BrainWorkerProfileModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !worker) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#001A41]/65 p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="worker-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl relative flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-700 bg-white/80 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="bg-[#001A41] text-white p-6 sm:p-8 relative overflow-hidden rounded-t-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-white/20 shrink-0 bg-slate-800">
              <Image
                src={worker.avatarUrl}
                alt={worker.name}
                fill
                sizes="96px"
                className="object-cover"
              />
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ABEEC8]/20 text-[#ABEEC8] text-xs font-semibold border border-[#ABEEC8]/30">
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>Profile information</span>
              </div>
              <h2 id="worker-modal-title" className="font-display font-bold text-xl sm:text-2xl text-white">
                {worker.name}
              </h2>
              <p className="text-sm text-slate-300 font-medium">{worker.title}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#ABEEC8]" />
                  {worker.location}
                </span>
                <span className="flex items-center gap-1 font-semibold text-white">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {worker.rating.toFixed(1)} ({worker.reviewCount} reviews)
                </span>
                <span className="text-slate-400">·</span>
                <span>{worker.completedJobs} jobs completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 flex-grow">
          {/* Verification Badges Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F8F9FF] border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#296A4B] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#001A41]">Profile information</div>
                <div className="text-[11px] text-slate-500">Review what is listed</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-[#296A4B] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#001A41]">Service details</div>
                <div className="text-[11px] text-slate-500">See the listed skills</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Wrench className="w-5 h-5 text-[#296A4B] shrink-0" />
              <div>
                <div className="text-xs font-bold text-[#001A41]">Job details</div>
                <div className="text-[11px] text-slate-500">Get clear on the scope</div>
              </div>
            </div>
          </div>

          {/* Skills & Specialties */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Skills listed here
            </h3>
            <div className="flex flex-wrap gap-2">
              {worker.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#296A4B]" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Price and review details */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-900 block">Starting price</span>
                <span className="text-lg font-extrabold text-[#001A41]">{worker.startingRate}</span>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#296A4B]">
                  <ShieldCheck className="w-4 h-4" />
                  What to review
                </span>
                <p className="text-[11px] text-slate-500">Review the scope and price before you continue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50/70 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 text-center sm:text-left">
            Review the service details before you move ahead.
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onBookWorker(worker);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#001A41] hover:bg-[#000F2D] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              Review booking details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
