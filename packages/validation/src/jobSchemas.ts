// packages/validation/src/jobSchemas.ts
import { z } from 'zod'
import { JobStatus, JobType } from '@bukiebrainjobs/api-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Job Creation Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const CreateJobSchema = z.object({
  title: z.string()
    .min(10, 'Title must be at least 10 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  jobType: z.enum(['TASK', 'PROJECT', 'RECURRING']).default('TASK'),
  
  // Location
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  
  // Scheduling
  scheduledStartAt: z.string().datetime(),
  scheduledEndAt: z.string().datetime().optional(),
  estimatedHours: z.number().min(0.5).max(24).optional(),
  
  // Pricing (in kobo)
  taskerRateKobo: z.number().int().min(100, 'Rate must be at least N1.00'),
  estimatedTotalKobo: z.number().int().min(100, 'Total must be at least N1.00'),
  
  // Recurring
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.enum(['weekly', 'biweekly', 'monthly']).optional(),
  recurringEndsAt: z.string().datetime().optional(),
  
  // Skills
  skillIds: z.array(z.string().uuid()).min(1, 'At least one skill is required'),
  
  // Evidence URLs
  beforePhotoUrls: z.array(z.string().url()).default([]),
})

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  id: z.string().uuid(),
  status: z.enum(['OPEN', 'PENDING_ACCEPTANCE', 'CONFIRMED', 'IN_PROGRESS', 'PENDING_COMPLETION', 'COMPLETED', 'PAID', 'CANCELLED', 'EXPIRED', 'DISPUTED', 'RESOLVED']).optional(),
  actualStartAt: z.string().datetime().optional(),
  actualEndAt: z.string().datetime().optional(),
  actualTotalKobo: z.number().int().optional(),
  cancellationReason: z.string().max(500).optional(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Job Query Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JobQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
  status: z.enum(['OPEN', 'PENDING_ACCEPTANCE', 'CONFIRMED', 'IN_PROGRESS', 'PENDING_COMPLETION', 'COMPLETED', 'PAID', 'CANCELLED', 'EXPIRED', 'DISPUTED', 'RESOLVED']).optional(),
  jobType: z.enum(['TASK', 'PROJECT', 'RECURRING']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  skillIds: z.array(z.string().uuid()).optional(),
  minRate: z.number().int().optional(),
  maxRate: z.number().int().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'scheduledStartAt', 'rate', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const JobIdParamSchema = z.object({
  jobId: z.string().uuid(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Job Status Transition Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JobStatusTransitionSchema = z.object({
  jobId: z.string().uuid(),
  toStatus: z.enum(['OPEN', 'PENDING_ACCEPTANCE', 'CONFIRMED', 'IN_PROGRESS', 'PENDING_COMPLETION', 'COMPLETED', 'PAID', 'CANCELLED', 'EXPIRED', 'DISPUTED', 'RESOLVED']),
  reason: z.string().max(500).optional(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Job Invitation Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const JobInvitationSchema = z.object({
  jobId: z.string().uuid(),
  taskerProfileId: z.string().uuid(),
  message: z.string().max(500).optional(),
})

export const JobInvitationResponseSchema = z.object({
  invitationId: z.string().uuid(),
  accepted: z.boolean(),
  declineReason: z.string().max(500).optional(),
})

// Type exports
export type CreateJobInput = z.infer<typeof CreateJobSchema>
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>
export type JobQueryInput = z.infer<typeof JobQuerySchema>
export type JobIdParamInput = z.infer<typeof JobIdParamSchema>
export type JobStatusTransitionInput = z.infer<typeof JobStatusTransitionSchema>
export type JobInvitationInput = z.infer<typeof JobInvitationSchema>
export type JobInvitationResponseInput = z.infer<typeof JobInvitationResponseSchema>