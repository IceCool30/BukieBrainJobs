// packages/utils/src/pricing.ts
// Pricing Utility Functions for BukieBrainJobs
// Based on TECHNICAL_SPEC.md Section 11

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuration Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Platform fees as percentages (in decimal form)
const PLATFORM_FEES = {
  // Service fee: 10% of job total
  SERVICE_FEE_PERCENTAGE: 0.10,
  
  // Trust & Support fee: 7.5% of job total
  TRUST_FEE_PERCENTAGE: 0.075,
  
  // Total platform fees: 17.5%
  TOTAL_PLATFORM_FEES_PERCENTAGE: 0.175,
  
  // Platform's share of the fees: 100% (goes to platform)
  PLATFORM_SHARE_PERCENTAGE: 1.0,
  
  // Tasker's share: 82.5% (100% - 17.5%)
  TASKER_SHARE_PERCENTAGE: 0.825,
}

// Minimum rates (in kobo - Naira * 100)
const MINIMUM_RATES = {
  MINIMUM_HOURLY_RATE_KOBO: 500 * 100, // N500/hour minimum
  MINIMUM_JOB_TOTAL_KOBO: 100 * 100, // N100 minimum job total
  MAXIMUM_HOURLY_RATE_KOBO: 10000 * 100, // N10,000/hour maximum
  MAXIMUM_JOB_DURATION_HOURS: 24, // Maximum job duration
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Type Definitions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PricingBreakdown {
  // Input values
  taskerRateKobo: number
  hours: number
  
  // Calculated amounts (all in kobo)
  jobSubtotalKobo: number
  serviceFeeKobo: number
  trustFeeKobo: number
  clientTotalKobo: number
  taskerTotalKobo: number
  platformEarningsKobo: number
  
  // Percentage breakdown
  serviceFeePercentage: number
  trustFeePercentage: number
  platformTotalPercentage: number
  taskerPercentage: number
}

interface PricingOptions {
  tipKobo?: number
  discountKobo?: number
  isRecurring?: boolean
  recurringFrequency?: 'weekly' | 'biweekly' | 'monthly'
  recurringSessions?: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Main Pricing Function
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate pricing for a job based on Tasker rate and duration
 * @param taskerRateKobo Tasker's hourly rate in kobo (Naira * 100)
 * @param hours Duration in hours
 * @param options Optional pricing options
 * @returns Complete pricing breakdown
 */
export function calculatePricing(
  taskerRateKobo: number,
  hours: number,
  options: PricingOptions = {}
): PricingBreakdown {
  const {
    tipKobo = 0,
    discountKobo = 0,
  } = options
  
  // Ensure minimum values
  const clampedRate = Math.max(
    MINIMUM_RATES.MINIMUM_HOURLY_RATE_KOBO,
    Math.min(
      MINIMUM_RATES.MAXIMUM_HOURLY_RATE_KOBO,
      taskerRateKobo
    )
  )
  
  const clampedHours = Math.max(0.5, Math.min(MINIMUM_RATES.MAXIMUM_JOB_DURATION_HOURS, hours))
  
  // Calculate job subtotal (Tasker rate * hours)
  // Use Decimal.js-style calculation to avoid floating point issues
  const jobSubtotalKobo = Math.round(clampedRate * clampedHours)
  
  // Ensure minimum job total
  const finalJobSubtotal = Math.max(
    MINIMUM_RATES.MINIMUM_JOB_TOTAL_KOBO,
    jobSubtotalKobo
  )
  
  // Calculate fees
  const serviceFeeKobo = Math.round(finalJobSubtotal * PLATFORM_FEES.SERVICE_FEE_PERCENTAGE)
  const trustFeeKobo = Math.round(finalJobSubtotal * PLATFORM_FEES.TRUST_FEE_PERCENTAGE)
  
  // Calculate totals
  const platformTotalKobo = serviceFeeKobo + trustFeeKobo
  const clientTotalKobo = finalJobSubtotal + platformTotalKobo + (tipKobo || 0) - (discountKobo || 0)
  
  // Ensure client total is at least the job subtotal
  const finalClientTotal = Math.max(finalJobSubtotal, clientTotalKobo)
  
  // Tasker gets their rate * hours (no fees deducted from their earnings)
  const taskerTotalKobo = finalJobSubtotal
  
  // Platform keeps the fees
  const platformEarningsKobo = platformTotalKobo
  
  return {
    taskerRateKobo: clampedRate,
    hours: clampedHours,
    jobSubtotalKobo: finalJobSubtotal,
    serviceFeeKobo,
    trustFeeKobo,
    clientTotalKobo: finalClientTotal,
    taskerTotalKobo,
    platformEarningsKobo,
    serviceFeePercentage: PLATFORM_FEES.SERVICE_FEE_PERCENTAGE * 100,
    trustFeePercentage: PLATFORM_FEES.TRUST_FEE_PERCENTAGE * 100,
    platformTotalPercentage: PLATFORM_FEES.TOTAL_PLATFORM_FEES_PERCENTAGE * 100,
    taskerPercentage: PLATFORM_FEES.TASKER_SHARE_PERCENTAGE * 100,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Currency Formatting Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Format kobo amount as Nigerian Naira currency
 * @param amountKobo Amount in kobo
 * @param showDecimal Whether to show decimal places
 * @returns Formatted string (e.g., "₦1,500.00" or "₦1,500")
 */
export function formatCurrency(amountKobo: number, showDecimal: boolean = true): string {
  const naira = amountKobo / 100
  
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: showDecimal ? 2 : 0,
    maximumFractionDigits: showDecimal ? 2 : 0,
  }).format(naira)
  
  return formatted
}

/**
 * Format kobo amount as plain number with optional decimals
 * @param amountKobo Amount in kobo
 * @param decimals Number of decimal places
 * @returns Formatted string (e.g., "1500" or "1500.00")
 */
export function formatAmount(amountKobo: number, decimals: number = 0): string {
  const naira = amountKobo / 100
  
  return naira.toFixed(decimals)
}

/**
 * Convert kobo to Naira (number)
 * @param amountKobo Amount in kobo
 * @returns Amount in Naira (float)
 */
export function koboToNaira(amountKobo: number): number {
  return amountKobo / 100
}

/**
 * Convert Naira to kobo
 * @param naira Amount in Naira (can be decimal)
 * @returns Amount in kobo (integer)
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Recurring Payment Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate recurring payment schedule
 * @param pricing Base pricing for one session
 * @param frequency Recurring frequency
 * @param sessions Number of sessions
 * @returns Array of payment amounts and dates
 */
export function calculateRecurringPayments(
  pricing: PricingBreakdown,
  frequency: 'weekly' | 'biweekly' | 'monthly',
  sessions: number
): Array<{
  sessionNumber: number
  amountKobo: number
  dueDate: Date
}> {
  const payments: Array<{ sessionNumber: number; amountKobo: number; dueDate: Date }> = []
  const today = new Date()
  
  // Set start date to today
  let currentDate = new Date(today)
  
  for (let i = 1; i <= sessions; i++) {
    payments.push({
      sessionNumber: i,
      amountKobo: pricing.clientTotalKobo,
      dueDate: new Date(currentDate),
    })
    
    // Increment date based on frequency
    switch (frequency) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7)
        break
      case 'biweekly':
        currentDate.setDate(currentDate.getDate() + 14)
        break
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1)
        break
    }
  }
  
  return payments
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Refund Calculation Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate refund amounts for job cancellation
 * @param jobTotalKobo Total job amount in kobo
 * @param cancellationReason Reason for cancellation
 * @param timeUntilStart Hours until job start time
 * @returns Refund breakdown for client and Tasker
 */
export function calculateRefund(
  jobTotalKobo: number,
  cancellationReason: 'client' | 'tasker' | 'admin' | 'dispute',
  timeUntilStart: number
): {
  clientRefundKobo: number
  taskerRefundKobo: number
  platformRefundKobo: number
  cancellationFeeKobo: number
  reason: string
} {
  // Define refund policies based on time and reason
  const cancellationFeePercentage = timeUntilStart >= 24 
    ? 0    // No fee if cancelled >= 24 hours before
    : 0.15 // 15% fee if cancelled < 24 hours before
  
  const cancellationFeeKobo = Math.round(jobTotalKobo * cancellationFeePercentage)
  
  switch (cancellationReason) {
    case 'client':
      // Client cancels: client gets refund minus cancellation fee, Tasker gets nothing
      return {
        clientRefundKobo: jobTotalKobo - cancellationFeeKobo,
        taskerRefundKobo: 0,
        platformRefundKobo: cancellationFeeKobo,
        cancellationFeeKobo,
        reason: 'Client cancelled job',
      }
    
    case 'tasker':
      // Tasker cancels: client gets full refund + Tasker penalty (10% of job value)
      const penaltyKobo = Math.round(jobTotalKobo * 0.10)
      return {
        clientRefundKobo: jobTotalKobo + penaltyKobo,
        taskerRefundKobo: -penaltyKobo, // Tasker owes penalty
        platformRefundKobo: 0,
        cancellationFeeKobo: 0,
        reason: 'Tasker cancelled job',
      }
    
    case 'admin':
      // Admin cancels: full refund to client
      return {
        clientRefundKobo: jobTotalKobo,
        taskerRefundKobo: 0,
        platformRefundKobo: 0,
        cancellationFeeKobo: 0,
        reason: 'Admin cancelled job',
      }
    
    case 'dispute':
      // Dispute resolution: partial refund based on dispute resolution
      // For now, assume 50% refund as default
      const disputeRefund = Math.round(jobTotalKobo * 0.50)
      return {
        clientRefundKobo: disputeRefund,
        taskerRefundKobo: jobTotalKobo - disputeRefund,
        platformRefundKobo: 0,
        cancellationFeeKobo: 0,
        reason: 'Dispute resolution',
      }
    
    default:
      return {
        clientRefundKobo: jobTotalKobo,
        taskerRefundKobo: 0,
        platformRefundKobo: 0,
        cancellationFeeKobo: 0,
        reason: 'Unknown cancellation reason',
      }
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Split Payment Functions (for Paystack integration)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Generate Paystack split payment configuration
 * @param taskerSubaccountCode Tasker's Paystack subaccount code
 * @param taskerShareKobo Amount to go to Tasker in kobo
 * @param platformShareKobo Amount to go to platform in kobo
 * @returns Paystack split configuration object
 */
export function getPaystackSplitConfig(
  taskerSubaccountCode: string,
  taskerShareKobo: number,
  platformShareKobo: number
): {
  type: 'flat'
  bearer_type: 'account'
  subaccounts: Array<{
    subaccount: string
    share: number
  }>
} {
  return {
    type: 'flat' as const,
    bearer_type: 'account' as const,
    subaccounts: [
      {
        subaccount: taskerSubaccountCode,
        share: taskerShareKobo,
      },
    ],
  }
}

/**
 * Validate Paystack split configuration
 * @param totalAmountKobo Total transaction amount
 * @param splitConfig Split configuration
 * @returns Whether the split is valid
 */
export function validatePaystackSplit(
  totalAmountKobo: number,
  splitConfig: ReturnType<typeof getPaystackSplitConfig>
): boolean {
  const totalShare = splitConfig.subaccounts.reduce(
    (sum, subaccount) => sum + subaccount.share,
    0
  )
  
  // Total share should not exceed total amount
  return totalShare <= totalAmountKobo
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Exports
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export {
  PLATFORM_FEES,
  MINIMUM_RATES,
}

export type { PricingBreakdown, PricingOptions }