// packages/validation/src/userSchemas.ts
import { z } from 'zod'
import { UserRole, VerificationStatus } from '@bukiebrainjobs/api-types'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// User Registration Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Nigerian phone number regex: +234 followed by 10 digits
export const NigerianPhoneRegex = /^\+234[789]\d{9}$/

export const RegisterClientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email().optional(),
  phone: z.string()
    .regex(NigerianPhoneRegex, 'Phone must be a valid Nigerian number (+2347XXXXXXXX)'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.literal('CLIENT').default('CLIENT'),
  
  // Optional profile data
  city: z.string().optional(),
  state: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

export const RegisterTaskerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email().optional(),
  phone: z.string()
    .regex(NigerianPhoneRegex, 'Phone must be a valid Nigerian number (+2347XXXXXXXX)'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.literal('TASKER').default('TASKER'),
  
  // Professional data
  bio: z.string().max(500).optional(),
  yearsExperience: z.number().int().min(0).max(50).default(0),
  
  // Bank account data (for split payments)
  bankAccountName: z.string().min(2).optional(),
  bankAccountNumber: z.string().min(10).max(10).optional(),
  bankCode: z.string().min(3).max(5).optional(),
  
  // Availability
  isAvailable: z.boolean().default(true),
  availabilityRadius: z.number().int().min(1).max(100).default(10),
  workingHoursStart: z.number().int().min(0).max(23).default(8),
  workingHoursEnd: z.number().int().min(1).max(24).default(20),
  
  // Skills
  skillIds: z.array(z.string().uuid()).min(1, 'At least one skill is required'),
  
  // Location
  city: z.string().min(2, 'City must be at least 2 characters'),
  state: z.string().min(2, 'State must be at least 2 characters'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// User Profile Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UpdateClientProfileSchema = z.object({
  companyName: z.string().optional(),
  companyRcNumber: z.string().optional(),
  subscriptionTier: z.enum(['basic', 'pro', 'enterprise']).optional(),
})

export const UpdateTaskerProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  yearsExperience: z.number().int().min(0).max(50).optional(),
  
  // Bank account data
  bankAccountName: z.string().min(2).optional(),
  bankAccountNumber: z.string().min(10).max(10).optional(),
  bankCode: z.string().min(3).max(5).optional(),
  
  // Availability
  isAvailable: z.boolean().optional(),
  availabilityRadius: z.number().int().min(1).max(100).optional(),
  workingHoursStart: z.number().int().min(0).max(23).optional(),
  workingHoursEnd: z.number().int().min(1).max(24).optional(),
  
  // Verification data
  ninNumber: z.string().min(11).max(11).optional(),
  bvnNumber: z.string().min(11).max(11).optional(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Authentication Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const LoginSchema = z.object({
  phone: z.string()
    .regex(NigerianPhoneRegex, 'Phone must be a valid Nigerian number (+2347XXXXXXXX)'),
  password: z.string().min(1, 'Password is required'),
})

export const RequestOtpSchema = z.object({
  phone: z.string()
    .regex(NigerianPhoneRegex, 'Phone must be a valid Nigerian number (+2347XXXXXXXX)'),
})

export const VerifyOtpSchema = z.object({
  phone: z.string()
    .regex(NigerianPhoneRegex, 'Phone must be a valid Nigerian number (+2347XXXXXXXX)'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
  pinId: z.string().optional(), // From Termii response
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// User Query Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const UserQuerySchema = z.object({
  role: z.string().optional(),
  verificationStatus: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  isAvailable: z.boolean().optional(),
  minRating: z.number().min(0).max(5).optional(),
  skillIds: z.array(z.string().uuid()).optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(10),
})

export const UserIdParamSchema = z.object({
  userId: z.string().uuid(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Saved Taskers Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SaveTaskerSchema = z.object({
  taskerProfileId: z.string().uuid(),
})

// Type exports
export type RegisterClientInput = z.infer<typeof RegisterClientSchema>
export type RegisterTaskerInput = z.infer<typeof RegisterTaskerSchema>
export type UpdateClientProfileInput = z.infer<typeof UpdateClientProfileSchema>
export type UpdateTaskerProfileInput = z.infer<typeof UpdateTaskerProfileSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type RequestOtpInput = z.infer<typeof RequestOtpSchema>
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>
export type UserQueryInput = z.infer<typeof UserQuerySchema>
export type UserIdParamInput = z.infer<typeof UserIdParamSchema>
export type SaveTaskerInput = z.infer<typeof SaveTaskerSchema>