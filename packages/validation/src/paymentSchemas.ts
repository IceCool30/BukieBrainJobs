// packages/validation/src/paymentSchemas.ts
import { z } from 'zod'
import { PaymentStatus } from '@bukiebrainjobs/api-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payment Initiation Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const InitializePaymentSchema = z.object({
  jobId: z.string().uuid(),
})

export const CreatePaymentSchema = z.object({
  jobId: z.string().uuid(),
  amountKobo: z.number().int().min(100, 'Amount must be at least N1.00'),
  taskerShareKobo: z.number().int().min(1, 'Tasker share must be at least 1 kobo'),
  platformShareKobo: z.number().int().min(1, 'Platform share must be at least 1 kobo'),
  taskerSubaccountCode: z.string().min(1, 'Tasker subaccount code is required'),
  paystackReference: z.string().optional(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payment Webhook Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PaystackWebhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Payment Query Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PaymentQuerySchema = z.object({
  jobId: z.string().uuid().optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

export const PaymentIdParamSchema = z.object({
  paymentId: z.string().uuid(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Refund Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RefundSchema = z.object({
  paymentId: z.string().uuid(),
  amountKobo: z.number().int().min(1, 'Refund amount must be at least 1 kobo'),
  reason: z.string().min(1, 'Refund reason is required'),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Subaccount Schema (for Taskers)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const CreateSubaccountSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  bankCode: z.string().min(3, 'Bank code must be at least 3 characters'),
  accountNumber: z.string().min(10, 'Account number must be at least 10 characters'),
  percentageCharge: z.number().min(0).max(100).default(0),
})

// Type exports
export type InitializePaymentInput = z.infer<typeof InitializePaymentSchema>
export type CreatePaymentInput = z.infer<typeof CreatePaymentSchema>
export type PaystackWebhookInput = z.infer<typeof PaystackWebhookSchema>
export type PaymentQueryInput = z.infer<typeof PaymentQuerySchema>
export type PaymentIdParamInput = z.infer<typeof PaymentIdParamSchema>
export type RefundInput = z.infer<typeof RefundSchema>
export type CreateSubaccountInput = z.infer<typeof CreateSubaccountSchema>