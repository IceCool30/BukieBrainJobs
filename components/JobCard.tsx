'use client';

import React from 'react';
import { MapPin, Calendar, Flame, Tag, Briefcase, Zap } from 'lucide-react';

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description?: string;
  budget: number;
  location_state: string;
  location_lga: string;
  job_type: 'task' | 'contract' | 'full_time';
  stage: string;
  is_urgent: boolean;
  category?: string;
  created_at: string;
}

interface JobCardProps {
  job: Job;
  onClickToggle?: () => void;
  isExpanded?: boolean;
}

export function getRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    if (diffInMs < 0) return 'Just now'; // Future timezone skew protection
    
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInSecs / 60);
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSecs < 60) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 30) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString('en-XG', { month: 'short', day: 'numeric' });
  } catch (err) {
    return 'Recently';
  }
}

export default function JobCard({ job, onClickToggle, isExpanded = false }: JobCardProps) {
  const relativeTime = getRelativeTime(job.created_at);

  const displayJobType = () => {
    switch (job.job_type) {
      case 'task':
        return 'One-time Task';
      case 'contract':
        return 'Freelance/Contract';
      case 'full_time':
        return 'Full-time Help';
      default:
        return 'Quick Task';
    }
  };

  return (
    <div 
      id={`job-card-${job.id}`}
      className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border-2 overflow-hidden flex flex-col justify-between ${
        job.is_urgent 
          ? 'border-blue-600 relative' 
          : 'border-transparent hover:border-gray-100'
      }`}
    >
      {/* Golden Highlight border or background accent if urgent */}
      {job.is_urgent && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-amber-300 to-blue-600"></div>
      )}

      <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
        
        {/* Top Badges and Meta info */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {job.category && (
              <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#0A192F]/5 text-[#0A192F] px-2 py-0.5 rounded-md flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                <span>{job.category}</span>
              </span>
            )}
            <span className="text-[10px] uppercase tracking-wider font-extrabold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Briefcase className="w-2.5 h-2.5" />
              <span>{displayJobType()}</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            {job.title?.toUpperCase().includes('[TEST]') && (
              <span 
                className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5"
                id={`qa-test-badge-${job.id}`}
              >
                <span>🧪 QA Sandbox</span>
              </span>
            )}
            {job.is_urgent && (
              <span 
                className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-0.5"
                id={`urgent-badge-${job.id}`}
              >
                <span>🔥 Urgent</span>
              </span>
            )}
          </div>
        </div>

        {/* Title and Budget */}
        <div className="mb-2 flex justify-between items-start gap-4">
          <h3 className="text-base font-extrabold text-gray-900 tracking-tight leading-snug hover:text-[#0A192F] transition-colors flex-1">
            {job.title}
          </h3>
          <span className="text-base font-black text-[#0A192F] tracking-tight shrink-0 font-mono" id={`budget-display-${job.id}`}>
            ₦{job.budget?.toLocaleString()}
          </span>
        </div>

        {/* Short or full description */}
        {job.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
            {job.description}
          </p>
        )}

        {/* Collapse detail toggler context if isExpanded is active */}
        {isExpanded && job.description && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 animate-fadeIn" id={`job-expanded-desc-${job.id}`}>
            <span className="block font-bold text-gray-700 uppercase tracking-wide text-[9px] mb-1">
              Full Scope & Details
            </span>
            <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
          </div>
        )}

        {/* Divider line */}
        <div className="border-t border-gray-100 my-4"></div>

        {/* Footer Meta: Geography & Post Time */}
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider font-mono">
          <div className="flex items-center gap-1 text-gray-500">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate max-w-[150px]">
              {job.location_lga}, {job.location_state}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{relativeTime}</span>
          </div>
        </div>

      </div>

      {/* Expand/Contact trigger area */}
      <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex justify-between items-center gap-4">
        {onClickToggle ? (
          <button 
            type="button"
            className="text-[10px] uppercase font-bold text-gray-500 hover:text-gray-950 transition-all cursor-pointer"
            onClick={onClickToggle}
          >
            {isExpanded ? 'Hide description' : 'View full details'}
          </button>
        ) : (
          <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
            Verified Employer
          </span>
        )}

        <button 
          id={`apply-action-btn-${job.id}`}
          onClick={() => {
            alert(`This job requires quick matching in ${job.location_lga}. Please contact the bot on Telegram or view in main feed.`);
          }}
          className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            job.is_urgent 
              ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 text-white shadow-sm'
              : 'bg-[#0A192F] border-[#0A192F] hover:bg-[#112a4f] text-white shadow-sm'
          }`}
        >
          Send Quote
        </button>
      </div>

    </div>
  );
}
