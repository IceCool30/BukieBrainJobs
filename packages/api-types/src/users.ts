// packages/api-types/src/users.ts
// User-related types for BukieBrainJobs API

import { UserRole, VerificationStatus } from './jobs'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// User Profile Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email?: string
  phone: string
  role: UserRole
  avatarUrl?: string
  city?: string
  state?: string
  latitude?: number
  longitude?: number
  createdAt: string
  updatedAt: string
}

export interface ClientProfile {
  id: string
  userId: string
  isCorporate: boolean
  companyName?: string
  companyRcNumber?: string
  subscriptionTier?: 'basic' | 'pro' | 'enterprise'
  subscriptionEndsAt?: string
  totalJobsPosted: number
  totalAmountSpent: number
  user: UserProfile
  createdAt: string
  updatedAt: string
}

export interface TaskerProfile {
  id: string
  userId: string
  verificationStatus: VerificationStatus
  ninNumber?: string
  bvnNumber?: string
  smileJobId?: string
  verifiedAt?: string
  bio?: string
  yearsExperience: number
  paystackSubaccountCode?: string
  bankAccountName?: string
  bankAccountNumber?: string
  bankCode?: string
  isAvailable: boolean
  availabilityRadius: number
  workingHoursStart: number
  workingHoursEnd: number
  averageRating: number
  totalReviews: number
  totalJobsCompleted: number
  totalEarnings: number
  completionRate: number
  responseRate: number
  onTimeRate: number
  skills: TaskerSkill[]
  badges: Badge[]
  user: UserProfile
  createdAt: string
  updatedAt: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Skill Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Skill {
  id: string
  name: string
  slug: string
  category: string
  description?: string
  iconUrl?: string
  isActive: boolean
  sortOrder: number
}

export interface TaskerSkill {
  id: string
  taskerProfileId: string
  skillId: string
  hourlyRateKobo: number
  isActive: boolean
  certificationUrl?: string
  certifiedAt?: string
  skill?: Skill
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Badge Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type BadgeType = 
  | 'ID_VERIFIED'
  | 'BACKGROUND_CHECKED'
  | 'SKILLS_CERTIFIED'
  | 'TOP_RATED'
  | 'ELITE_TASKER'

export interface Badge {
  id: string
  taskerProfileId: string
  badgeType: BadgeType
  awardedAt: string
  expiresAt?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Authentication Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface AuthUser {
  id: string
  role: UserRole
  phone: string
  firstName?: string
  lastName?: string
  email?: string
  avatarUrl?: string
}

export interface AuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt: string
}

export interface LoginCredentials {
  phone: string
  password: string
}

export interface OTPRequest {
  phone: string
}

export interface OTPVerification {
  phone: string
  otp: string
  pinId?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Notification Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type NotificationType = 
  | 'JOB_INVITE'
  | 'JOB_ACCEPTED'
  | 'JOB_CONFIRMED'
  | 'JOB_STARTED'
  | 'JOB_COMPLETED'
  | 'PAYMENT_RECEIVED'
  | 'REVIEW_RECEIVED'
  | 'DISPUTE_OPENED'
  | 'DISPUTE_RESOLVED'
  | 'VERIFICATION_COMPLETE'
  | 'CHALLENGE_EARNED'
  | 'SYSTEM'

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data?: Record<string, unknown>
  isRead: boolean
  readAt?: string
  targetUrl?: string
  targetId?: string
  createdAt: string
  updatedAt: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// API Response Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Query Parameter Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface QueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: unknown
}

export interface UserQueryParams extends QueryParams {
  role?: UserRole
  verificationStatus?: VerificationStatus
  city?: string
  state?: string
  isAvailable?: boolean
  skillIds?: string[]
  minRating?: number
  maxRating?: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Session Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Session {
  id: string
  userId: string
  token: string
  expiresAt: string
  createdAt: string
  userAgent?: string
  ipAddress?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Saved Taskers Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface SavedTasker {
  id: string
  clientProfileId: string
  taskerProfileId: string
  createdAt: string
  taskerProfile?: TaskerProfile
}

// Export all types for easy importing