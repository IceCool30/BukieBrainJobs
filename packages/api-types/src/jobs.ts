// packages/api-types/src/jobs.ts

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Core Enums
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type JobStatus = 
  | 'OPEN'
  | 'PENDING_ACCEPTANCE'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'PENDING_COMPLETION'
  | 'COMPLETED'
  | 'PAID'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DISPUTED'
  | 'RESOLVED'

export type JobType = 'TASK' | 'PROJECT' | 'RECURRING'

export type UserRole = 
  | 'CLIENT'
  | 'TASKER'
  | 'ADMIN'
  | 'CORPORATE_CLIENT'

export type VerificationStatus = 
  | 'UNVERIFIED'
  | 'PENDING'
  | 'VERIFIED'
  | 'FAILED'
  | 'SUSPENDED'

export const JOB_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  OPEN: ['PENDING_ACCEPTANCE', 'EXPIRED', 'CANCELLED'],
  PENDING_ACCEPTANCE: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['PENDING_COMPLETION', 'DISPUTED'],
  PENDING_COMPLETION: ['COMPLETED', 'DISPUTED'],
  COMPLETED: ['PAID'],
  PAID: [],
  CANCELLED: [],
  EXPIRED: [],
  DISPUTED: ['RESOLVED', 'CANCELLED'],
  RESOLVED: ['PAID', 'CANCELLED'],
}

export function canTransition(from: JobStatus, to: JobStatus): boolean {
  return JOB_STATUS_TRANSITIONS[from].includes(to)
}

export class InvalidTransitionError extends Error {
  constructor(from: JobStatus, to: JobStatus) {
    super(`Invalid state transition: ${from} -> ${to}`)
    this.name = 'InvalidTransitionError'
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Job Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Job {
  id: string
  title: string
  description: string
  status: JobStatus
  jobType: JobType
  clientProfileId: string
  taskerProfileId?: string
  parentJobId?: string
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  scheduledStartAt: string
  scheduledEndAt?: string
  estimatedHours?: number
  actualStartAt?: string
  actualEndAt?: string
  taskerRateKobo: number
  estimatedTotalKobo: number
  actualTotalKobo?: number
  serviceFeeKobo?: number
  trustFeeKobo?: number
  clientTotalKobo?: number
  isRecurring: boolean
  recurringFrequency?: string
  recurringEndsAt?: string
  beforePhotoUrls: string[]
  afterPhotoUrls: string[]
  cancellationReason?: string
  cancelledBy?: string
  expiresAt?: string
  createdAt: string
  updatedAt: string
}

export interface JobQueryParams {
  page?: number
  limit?: number
  status?: JobStatus
  jobType?: JobType
  city?: string
  state?: string
  skillIds?: string[]
  minRate?: number
  maxRate?: number
  startDate?: string
  endDate?: string
  sortBy?: 'createdAt' | 'scheduledStartAt' | 'rate' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface CreateJobRequest {
  title: string
  description: string
  jobType?: JobType
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  scheduledStartAt: string
  scheduledEndAt?: string
  estimatedHours?: number
  taskerRateKobo: number
  estimatedTotalKobo: number
  skillIds: string[]
  isRecurring?: boolean
  recurringFrequency?: string
  recurringEndsAt?: string
  beforePhotoUrls?: string[]
}

export interface UpdateJobRequest {
  title?: string
  description?: string
  status?: JobStatus
  scheduledStartAt?: string
  scheduledEndAt?: string
  estimatedHours?: number
  actualStartAt?: string
  actualEndAt?: string
  taskerRateKobo?: number
  estimatedTotalKobo?: number
  actualTotalKobo?: number
  beforePhotoUrls?: string[]
  afterPhotoUrls?: string[]
  cancellationReason?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Job Status History Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface JobStatusHistory {
  id: string
  jobId: string
  fromStatus?: JobStatus
  toStatus: JobStatus
  changedBy?: string
  reason?: string
  createdAt: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Job Invitation Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface JobInvitation {
  id: string
  jobId: string
  taskerProfileId: string
  sentAt: string
  respondedAt?: string
  accepted?: boolean
  declineReason?: string
}

export interface SendInvitationRequest {
  jobId: string
  taskerProfileId: string
  message?: string
}

export interface RespondToInvitationRequest {
  invitationId: string
  accepted: boolean
  declineReason?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Dispute Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type DisputeStatus = 
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED_CLIENT_FAVOUR'
  | 'RESOLVED_TASKER_FAVOUR'
  | 'RESOLVED_SPLIT'
  | 'CLOSED'

export interface Dispute {
  id: string
  jobId: string
  initiatorId: string
  status: DisputeStatus
  reason: string
  description: string
  resolvedById?: string
  resolvedAt?: string
  resolutionNotes?: string
  resolutionAmountKobo?: number
  evidenceUrls: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateDisputeRequest {
  jobId: string
  reason: string
  description: string
  evidenceUrls?: string[]
}

export interface ResolveDisputeRequest {
  disputeId: string
  resolutionNotes: string
  resolutionAmountKobo?: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Review Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Review {
  id: string
  jobId: string
  reviewerId: string
  revieweeId: string
  overallRating: number
  punctualityRating?: number
  qualityRating?: number
  communicationRating?: number
  comment?: string
  isPublic: boolean
  responseComment?: string
  respondedAt?: string
  createdAt: string
}

export interface SubmitReviewRequest {
  jobId: string
  revieweeId: string
  overallRating: number
  comment?: string
  punctualityRating?: number
  qualityRating?: number
  communicationRating?: number
  isPublic?: boolean
}

export type ReviewRatingType = 'overall' | 'punctuality' | 'quality' | 'communication'
