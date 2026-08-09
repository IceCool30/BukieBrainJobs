// packages/api-types/src/verification.ts
// Verification-related types for BukieBrainJobs API

import { VerificationStatus } from './jobs'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Verification Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface VerificationRequest {
  ninNumber?: string
  bvnNumber?: string
  selfieImageUrl?: string
}

interface VerificationResponse {
  success: boolean
  jobId?: string
  status?: VerificationStatus
  message?: string
  error?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Smile Identity Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SmileIdentityRequest {
  userId: string
  ninNumber?: string
  bvnNumber?: string
  firstName: string
  lastName: string
  phone: string
  selfieImageUrl?: string
}

interface SmileIdentityResponse {
  success: boolean
  jobId?: string
  partnerJobId?: string
  status?: VerificationStatus
  message?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Smile Identity Webhook Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SmileWebhookPayload {
  jobId: string
  partnerParams: {
    userId?: string
    jobId?: string
  }
  result: {
    Partner_Params?: Record<string, string>
    ResultType?: string
    ResultCode?: string
    ResultText?: string
    Action?: string
    Actions?: Record<string, string>
  }
  actions: {
    Verify_ID_Number?: string
    Liveness_Check?: string
    Document_Verification?: string
    Face_Match?: string
  }
}

interface SmileWebhookEvent {
  event: string
  data: SmileWebhookPayload
  signature?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Document Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type DocumentType = 'nin' | 'bvn' | 'selfie' | 'id_card' | 'passport' | 'driver_license'

interface Document {
  id: string
  userId: string
  documentType: DocumentType
  documentUrl: string
  mimeType: string
  fileName: string
  verified: boolean
  verifiedAt?: string
  createdAt: string
}

interface UploadDocumentRequest {
  documentType: DocumentType
  documentUrl: string
  mimeType?: string
  fileName?: string
}

interface UploadDocumentResponse {
  success: boolean
  document: Document
  message?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Verification Status Update Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UpdateVerificationStatusRequest {
  userId: string
  verificationStatus: VerificationStatus
  ninNumber?: string
  bvnNumber?: string
  smileJobId?: string
}

interface UpdateVerificationStatusResponse {
  success: boolean
  userId: string
  verificationStatus: VerificationStatus
  verifiedAt?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Verification Query Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface VerificationQueryParams {
  status?: VerificationStatus
  userId?: string
  page?: number
  limit?: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Verification Statistics Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface VerificationStats {
  totalVerified: number
  totalPending: number
  totalFailed: number
  totalSuspended: number
  verificationRate: number
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Export all types for easy importing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type {
  VerificationRequest,
  VerificationResponse,
  SmileIdentityRequest,
  SmileIdentityResponse,
  SmileWebhookPayload,
  SmileWebhookEvent,
  DocumentType,
  Document,
  UploadDocumentRequest,
  UploadDocumentResponse,
  UpdateVerificationStatusRequest,
  UpdateVerificationStatusResponse,
  VerificationQueryParams,
  VerificationStats,
}