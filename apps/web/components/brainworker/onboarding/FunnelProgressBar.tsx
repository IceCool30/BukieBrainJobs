// apps/web/components/brainworker/onboarding/FunnelProgressBar.tsx
// Phase 4 GREEN: Funnel Stepper & Progress Component
// Authoritative References:
// - docs/specs/BW-001-architecture-contract.md (Section 2.1)
// - docs/specs/BW-001-ux-design-specification.md (Section 3.2.1)
// - docs/specs/BW-001-test-first-implementation-plan.md (Suite 5: STP-001 to STP-002)

'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { OnboardingStep } from '../../../lib/brainworker/types';

export interface FunnelProgressBarProps {
  currentStep: OnboardingStep;
  completedSteps?: OnboardingStep[] | undefined;
  onStepClick?: ((step: OnboardingStep) => void) | undefined;
  className?: string | undefined;
}

interface StepMeta {
  key: OnboardingStep;
  label: string;
  stepNumber: number;
}

const STEPS: StepMeta[] = [
  { key: 'identity', label: 'Identity', stepNumber: 1 },
  { key: 'trade', label: 'Trade', stepNumber: 2 },
  { key: 'credentials', label: 'Credentials', stepNumber: 3 },
  { key: 'review', label: 'Review', stepNumber: 4 },
];

export function FunnelProgressBar({
  currentStep,
  completedSteps = [],
  onStepClick,
  className = '',
}: FunnelProgressBarProps): React.ReactElement {
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);
  const currentStepNumber =
    currentStepIndex !== -1 ? STEPS[currentStepIndex].stepNumber : 1;

  return (
    <nav
      aria-label="Onboarding Progress"
      className={`w-full bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 ${className}`}
    >
      {/* Mobile Step Status Header */}
      <div className="flex items-center justify-between sm:hidden mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Onboarding Progress
        </span>
        <span className="text-xs font-bold text-[#001A41]">
          {`Step ${currentStepNumber} of 4`}
        </span>
      </div>

      {/* Mobile progress bar track */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden sm:hidden mb-3">
        <div
          className="h-full bg-[#001A41] transition-all duration-300 rounded-full"
          style={{ width: `${(currentStepNumber / 4) * 100}%` }}
        />
      </div>

      {/* Stepper list */}
      <ol
        role="list"
        className="flex items-center justify-between gap-2 sm:gap-4"
      >
        {STEPS.map((step, idx) => {
          const isCurrent = step.key === currentStep;
          const isCompleted = completedSteps.includes(step.key);
          const isClickable = Boolean(onStepClick && (isCompleted || isCurrent));

          return (
            <li
              key={step.key}
              role="listitem"
              aria-label={step.label}
              aria-current={isCurrent ? 'step' : undefined}
              data-completed={isCompleted ? 'true' : 'false'}
              className="flex-1 flex items-center"
            >
              <div
                onClick={() => {
                  if (isClickable && onStepClick) {
                    onStepClick(step.key);
                  }
                }}
                className={`flex items-center gap-3 w-full ${
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'bg-[#001A41] text-white ring-4 ring-blue-100'
                      : isCompleted
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 stroke-[3]" aria-hidden="true" />
                  ) : (
                    <span>{step.stepNumber}</span>
                  )}
                </div>

                <div className="hidden sm:block min-w-0">
                  <p
                    className={`truncate text-xs font-medium ${
                      isCurrent
                        ? 'text-[#001A41] font-bold'
                        : isCompleted
                        ? 'text-slate-900 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`hidden sm:block h-0.5 w-full mx-2 ${
                    isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
