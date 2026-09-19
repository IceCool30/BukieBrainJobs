'use client';

import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { JobStatus } from '@bukiebrainjobs/types';

interface LifecycleStepIndicatorProps {
  jobStatus: JobStatus;
  isDeclined?: boolean;
}

interface StepDef {
  key: string;
  label: string;
  sublabel?: string;
}

const LIFECYCLE_STEPS: StepDef[] = [
  { key: 'request', label: 'Request Recorded', sublabel: 'Intake submitted' },
  { key: 'response', label: 'Worker Response', sublabel: 'Awaiting answer' },
  { key: 'confirmed', label: 'Booking Confirmed', sublabel: 'Commitment locked' },
  { key: 'delivery', label: 'Service Delivery', sublabel: 'Active work' },
  { key: 'completion', label: 'Completed', sublabel: 'Finished and closed' },
];

export function LifecycleStepIndicator({ jobStatus, isDeclined = false }: LifecycleStepIndicatorProps) {
  // Determine current step index (0-indexed)
  let currentStepIndex = 0;
  let isTerminalNegative = false;

  switch (jobStatus) {
    case 'OPEN':
      currentStepIndex = 0;
      break;
    case 'PENDING_ACCEPTANCE':
      currentStepIndex = 1;
      break;
    case 'CONFIRMED':
      currentStepIndex = 2;
      break;
    case 'IN_PROGRESS':
    case 'PENDING_COMPLETION':
    case 'DISPUTED':
    case 'RESOLVED':
      currentStepIndex = 3;
      break;
    case 'COMPLETED':
    case 'PAID':
      currentStepIndex = 4;
      break;
    case 'CANCELLED':
    case 'EXPIRED':
      isTerminalNegative = true;
      currentStepIndex = 1;
      break;
    default:
      currentStepIndex = 0;
  }

  return (
    <div className="w-full" role="region" aria-label="Booking lifecycle progression">
      {/* Desktop Horizontal Layout */}
      <nav aria-label="Progress steps" className="hidden sm:block">
        <ol className="flex items-center justify-between w-full relative">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = !isTerminalNegative && idx < currentStepIndex;
            const isCurrent = !isTerminalNegative && idx === currentStepIndex;
            const isFuture = !isTerminalNegative && idx > currentStepIndex;

            return (
              <li
                key={step.key}
                className="flex-1 relative flex flex-col items-center group"
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Connecting connector line */}
                {idx < LIFECYCLE_STEPS.length - 1 && (
                  <div
                    className={`absolute top-4 left-1/2 w-full h-0.5 -z-0 transition-colors duration-300 ${
                      isCompleted ? 'bg-[#296A4B]' : 'bg-slate-200'
                    }`}
                    aria-hidden="true"
                  />
                )}

                {/* Node Circle */}
                <div
                  className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                    isTerminalNegative && idx === currentStepIndex
                      ? 'bg-slate-200 text-slate-600 ring-4 ring-slate-100'
                      : isDeclined && idx === 1
                      ? 'bg-amber-100 text-amber-800 ring-4 ring-amber-50'
                      : isCompleted
                      ? 'bg-[#296A4B] text-white'
                      : isCurrent
                      ? 'bg-[#001A41] text-white ring-4 ring-blue-100 scale-105'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isTerminalNegative && idx === currentStepIndex ? (
                    <X className="w-4 h-4 text-slate-600" aria-hidden="true" />
                  ) : isDeclined && idx === 1 ? (
                    <AlertCircle className="w-4 h-4 text-amber-800" aria-hidden="true" />
                  ) : isCompleted ? (
                    <Check className="w-4 h-4 text-white" aria-hidden="true" />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>

                {/* Step Labels */}
                <div className="mt-2 text-center">
                  <span
                    className={`block text-xs font-semibold ${
                      isCurrent
                        ? 'text-[#001A41]'
                        : isCompleted
                        ? 'text-[#296A4B]'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">
                    {isDeclined && idx === 1 ? 'Declined' : step.sublabel}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Mobile Compact Vertical Layout */}
      <div className="sm:hidden space-y-2" aria-label="Progress steps (mobile)">
        {LIFECYCLE_STEPS.map((step, idx) => {
          const isCompleted = !isTerminalNegative && idx < currentStepIndex;
          const isCurrent = !isTerminalNegative && idx === currentStepIndex;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-3 p-2 rounded-xl transition ${
                isCurrent ? 'bg-blue-50/60 border border-blue-100' : 'bg-transparent'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 ${
                  isTerminalNegative && idx === currentStepIndex
                    ? 'bg-slate-200 text-slate-600'
                    : isDeclined && idx === 1
                    ? 'bg-amber-100 text-amber-800'
                    : isCompleted
                    ? 'bg-[#296A4B] text-white'
                    : isCurrent
                    ? 'bg-[#001A41] text-white ring-2 ring-blue-100'
                    : 'bg-white border border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <div className="flex-1 flex items-center justify-between text-xs">
                <span
                  className={`font-semibold ${
                    isCurrent
                      ? 'text-[#001A41]'
                      : isCompleted
                      ? 'text-[#296A4B]'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isDeclined && idx === 1
                    ? 'Declined'
                    : isCompleted
                    ? 'Done'
                    : isCurrent
                    ? 'Current'
                    : 'Pending'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
