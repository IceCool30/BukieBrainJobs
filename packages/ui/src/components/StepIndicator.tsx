import React from 'react';

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

export interface StepIndicatorProps {
  /** Array of step definitions */
  steps: StepItem[];
  /** 0-indexed current active step */
  currentStepIndex: number;
  /** Layout orientation: 'horizontal' (default) or 'vertical' */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS classes */
  className?: string;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStepIndex,
  orientation = 'horizontal',
  className = '',
}) => {
  if (orientation === 'vertical') {
    return (
      <div className={`space-y-6 ${className}`}>
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.id} className="flex items-start gap-4 relative">
              {/* Vertical Track Line */}
              {idx < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 -bottom-6 w-0.5 ${
                    isDone ? 'bg-[#296A4B]' : 'bg-[#E9ECEF]'
                  }`}
                />
              )}

              {/* Node */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold shrink-0 transition-all z-10 ${
                  isDone
                    ? 'bg-[#296A4B] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-[#001A41] text-white ring-4 ring-[#001A41]/10 shadow-md scale-105'
                    : 'bg-white border-2 border-[#E9ECEF] text-slate-400'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              {/* Label & Description */}
              <div className="pt-0.5">
                <div
                  className={`font-display text-xs font-bold ${
                    isCurrent ? 'text-[#001A41]' : isDone ? 'text-[#296A4B]' : 'text-slate-500'
                  }`}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="font-body text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Horizontal Stepper
  const progressPercent = steps.length > 1 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Background Track Line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#E9ECEF] -translate-y-1/2 z-0" />

        {/* Active Progress Line */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#296A4B] -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold transition-all duration-300 ${
                  isDone
                    ? 'bg-[#296A4B] text-white shadow-sm'
                    : isCurrent
                    ? 'bg-[#001A41] text-white ring-4 ring-[#001A41]/10 shadow-md scale-110'
                    : 'bg-white border-2 border-[#E9ECEF] text-slate-400'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>

              <span
                className={`text-[11px] font-bold mt-2 text-center transition-colors max-w-[90px] leading-tight ${
                  isCurrent ? 'text-[#001A41]' : isDone ? 'text-[#296A4B]' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
