// packages/api-types/src/payments.ts
// Payment-related types for BukieBrainJobs API

import { Job } from './jobs'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payment Status Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type PaymentStatus = 
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CAPTURED'
  | 'SPLIT_COMPLETE'
  | 'REFUNDED'
  | 'FAILED'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payment Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Payment {
  id: string
  jobId: string
  status: PaymentStatus
  paystackReference: string
  paystackTransactionId?: string
  paystackAccessCode?: string
  amountKobo: number
  taskerShareKobo: number
  platformShareKobo: number
  tipKobo: number
  taskerSubaccountCode?: string
  splitReference?: string
  authorizedAt?: string
  capturedAt?: string
  splitCompletedAt?: string
  refundedAmountKobo?: number
  refundedAt?: string
  refundReason?: string
  createdAt: string
  updatedAt: string
  job?: Job
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payment Request Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PaymentRequest {
  jobId: string
}

export interface CreatePaymentRequest {
  jobId: string
  amountKobo: number
  taskerShareKobo: number
  platformShareKobo: number
  taskerSubaccountCode: string
  paystackReference?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payment Response Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PaymentResponse {
  success: boolean
  data?: {
    authorizationUrl: string
    accessCode: string
    reference: string
    pricing: {
      clientTotalKobo: number
      taskerTotalKobo: number
      platformEarningsKobo: number
      serviceFeeKobo: number
      trustFeeKobo: number
    }
  }
  error?: {
    code: string
    message: string
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Paystack Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PaystackTransactionInitialization {
  email: string
  amount: number
  reference: string
  callback_url: string
  metadata: Record<string, unknown>
  split?: {
    type: string
    bearer_type: string
    subaccounts: Array<{
      subaccount: string
      share: number
    }>
  }
}

export interface PaystackTransactionResponse {
  authorization_url: string
  access_code: string
  reference: string
}

export interface PaystackVerificationResponse {
  status: string
  amount: number
  paidAt: string
  channel: string
  gatewayResponse: string
  reference: string
  id?: string
}

export interface PaystackWebhookEvent {
  event: string
  data: PaystackWebhookData
}

export interface PaystackWebhookData {
  id?: number
  reference: string
  amount: number
  status: string
  metadata?: Record<string, unknown>
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Webhook Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PaymentWebhookEvent {
  id: string
  paymentId: string
  event: string
  payload: Record<string, unknown>
  processedAt: string
  idempotencyKey: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Subaccount Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CreateSubaccountRequest {
  businessName: string
  bankCode: string
  accountNumber: string
  percentageCharge: number
}

export interface CreateSubaccountResponse {
  subaccountCode: string
}

export interface Subaccount {
  subaccountCode: string
  businessName: string
  bankCode: string
  accountNumber: string
  percentageCharge: number
  createdAt: string
  updatedAt: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Refund Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface RefundRequest {
  paymentId: string
  amountKobo: number
  reason: string
}

export interface RefundResponse {
  success: boolean
  refundedAmountKobo: number
  refundReason: string
  refundedAt: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Pricing Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PricingBreakdown {
  taskerRateKobo: number
  hours: number
  jobSubtotalKobo: number
  serviceFeeKobo: number
  trustFeeKobo: number
  clientTotalKobo: number
  taskerTotalKobo: number
  platformEarningsKobo: number
  serviceFeePercentage: number
  trustFeePercentage: number
  platformTotalPercentage: number
  taskerPercentage: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Fee Constants
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLATFORM_FEES = {
  SERVICE_FEE_PERCENTAGE: 0.10,    // 10%
  TRUST_FEE_PERCENTAGE: 0.075,    // 7.5%
  TOTAL_PLATFORM_FEES: 0.175,      // 17.5%
  TASKER_SHARE: 0.825,       // 82.5%
} as const

export type PlatformFees = typeof PLATFORM_FEES

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Export all types for easy importing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━