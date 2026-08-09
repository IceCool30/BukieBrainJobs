// packages/validation/src/verificationSchemas.ts
import { z } from 'zod'
import { VerificationStatus } from '@bukiebrainjobs/api-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Verification Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Nigerian NIN (National Identification Number) - 11 digits
const NigerianNINRegex = /^\d{11}$/

// Nigerian BVN (Bank Verification Number) - 11 digits
const NigerianBVNRegex = /^\d{11}$/

export const InitiateVerificationSchema = z.object({
  // At least one verification document is required
  ninNumber: z.string()
    .regex(NigerianNINRegex, 'NIN must be exactly 11 digits')
    .optional(),
  bvnNumber: z.string()
    .regex(NigerianBVNRegex, 'BVN must be exactly 11 digits')
    .optional(),
  // At least one must be provided
}).refine((data) => data.ninNumber || data.bvnNumber, {
  message: 'At least one of NIN or BVN must be provided',
})

export const SmileVerificationSchema = z.object({
  userId: z.string().uuid(),
  // Smile Identity job ID for tracking
  jobId: z.string().optional(),
  // Verification documents
  ninNumber: z.string()
    .regex(NigerianNINRegex, 'NIN must be exactly 11 digits')
    .optional(),
  bvnNumber: z.string()
    .regex(NigerianBVNRegex, 'BVN must be exactly 11 digits')
    .optional(),
  // Selfie for liveness check
  selfieImageUrl: z.string().url().optional(),
})

export const VerificationWebhookSchema = z.object({
  // Smile Identity webhook payload structure
  jobId: z.string(),
  partnerParams: z.record(z.any()).optional(),
  result: z.record(z.any()).optional(),
  actions: z.record(z.any()).optional(),
})

export const UpdateVerificationStatusSchema = z.object({
  userId: z.string().uuid(),
  verificationStatus: z.nativeEnum(VerificationStatus),
  ninNumber: z.string().regex(NigerianNINRegex).optional(),
  bvnNumber: z.string().regex(NigerianBVNRegex).optional(),
  smileJobId: z.string().optional(),
  verifiedAt: z.string().datetime().optional(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Document Upload Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UploadDocumentSchema = z.object({
  documentType: z.enum(['nin', 'bvn', 'selfie', 'id_card', 'other']),
  documentUrl: z.string().url(),
  mimeType: z.string().optional(),
  fileName: z.string().optional(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Verification Query Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const VerificationQuerySchema = z.object({
  status: z.nativeEnum(VerificationStatus).optional(),
  userId: z.string().uuid().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

// Type exports
export type InitiateVerificationInput = z.infer<typeof InitiateVerificationSchema>
export type SmileVerificationInput = z.infer<typeof SmileVerificationSchema>
export type VerificationWebhookInput = z.infer<typeof VerificationWebhookSchema>
export type UpdateVerificationStatusInput = z.infer<typeof UpdateVerificationStatusSchema>
export type UploadDocumentInput = z.infer<typeof UploadDocumentSchema>
export type VerificationQueryInput = z.infer<typeof VerificationQuerySchema>