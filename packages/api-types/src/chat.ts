// packages/api-types/src/chat.ts
// Chat-related types for BukieBrainJobs API
// Includes Socket.io event typing for real-time communication

// Database import removed for Phase 1 - using mock data only

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Message Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ContentType = 'text' | 'image' | 'location'

export interface Message {
  id: string
  jobId: string
  senderId: string
  content: string
  contentType: ContentType
  mediaUrl?: string
  isRead: boolean
  readAt?: string
  isFlagged: boolean
  flagReason?: string
  createdAt: string
  sender?: {
    id: string
    firstName: string
    lastName: string
    phone: string
    avatarUrl?: string
  }
}

// Map the Prisma Message type to our API type - disabled for Phase 1
// export function mapMessage(message: MessageType): Message {
//   return {
//     id: message.id,
//     jobId: message.jobId,
//     senderId: message.senderId,
//     content: message.content,
//     contentType: message.contentType as ContentType,
//     mediaUrl: message.mediaUrl,
//     isRead: message.isRead,
//     readAt: message.readAt?.toISOString(),
//     isFlagged: message.isFlagged,
//     flagReason: message.flagReason,
//     createdAt: message.createdAt.toISOString(),
//   }
// }

export interface SendMessageRequest {
  jobId: string
  content: string
  contentType?: ContentType
  mediaUrl?: string
}

export interface MessageQueryParams {
  jobId: string
  page?: number
  limit?: number
}

export interface MessageResponse {
  messages: Message[]
  pagination: {
    page: number
    limit: number
    total: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Socket.io Event Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Socket Data type for storing user information on the socket
export interface SocketData {
  userId?: string
  role?: string
  phone?: string
  firstName?: string
  lastName?: string
  avatarUrl?: string
  fcmToken?: string
}

// Server to Client Events (emitted by server, received by client)
export interface ServerToClientEvents {
  // Connection events
  'connect': () => void
  'disconnect': (reason: string) => void
  'connect_error': (error: { message: string; code?: string }) => void
  
  // Chat events
  'new_message': (message: Message) => void
  'message_read': (messageId: string, readAt: string) => void
  'typing': (jobId: string, userId: string, isTyping: boolean) => void
  'stop_typing': (jobId: string, userId: string) => void
  'message_flagged': (messageId: string, reason: string) => void
  'chat_joined': (jobId: string, user: { id: string; firstName: string; lastName: string; role: string }) => void
  'chat_left': (jobId: string, userId: string) => void
  
  // Job events (broadcast to job participants)
  'job_status_updated': (jobId: string, status: string, fromStatus?: string, reason?: string) => void
  'job_created': (jobId: string) => void
  'job_accepted': (jobId: string, taskerId: string) => void
  'job_started': (jobId: string, startedAt: string) => void
  'job_completed': (jobId: string, completedAt: string) => void
  'job_paid': (jobId: string, paidAt: string) => void
  'job_cancelled': (jobId: string, reason: string, byUserId: string) => void
  
  // Invitation events
  'job_invitation': (jobId: string, fromUserId: string, message?: string) => void
  'invitation_accepted': (jobId: string, taskerId: string) => void
  'invitation_declined': (jobId: string, taskerId: string, reason?: string) => void
  
  // Payment events
  'payment_initiated': (jobId: string, amountKobo: number, reference: string) => void
  'payment_authorized': (jobId: string, amountKobo: number, reference: string) => void
  'payment_captured': (jobId: string, amountKobo: number, reference: string) => void
  'payment_failed': (jobId: string, error: string, reference?: string) => void
  'payment_split_complete': (jobId: string, taskerShareKobo: number) => void
  
  // Verification events
  'verification_initiated': (userId: string, jobId: string) => void
  'verification_complete': (userId: string, status: string, jobId: string) => void
  'verification_failed': (userId: string, reason: string, jobId?: string) => void
  
  // Matching events
  'new_match': (jobId: string, taskerId: string, score: number) => void
  'matches_available': (jobId: string, matches: Array<{ taskerId: string; score: number; distanceKm: number }>) => void
  
  // Notification events
  'new_notification': (notification: { id: string; type: string; title: string; message: string; data?: Record<string, unknown> }) => void
  'notification_read': (notificationId: string) => void
  
  // Location events
  'tasker_location_update': (taskerId: string, latitude: number, longitude: number, accuracy: number) => void
  'job_check_in': (jobId: string, userId: string, latitude: number, longitude: number) => void
  'check_in_confirmed': (jobId: string, userId: string, confirmedAt: string) => void
  
  // Review events
  'new_review': (jobId: string, reviewerId: string, revieweeId: string, rating: number, comment?: string) => void
  'review_responded': (reviewId: string, responseComment: string, respondedAt: string) => void
  
  // Dispute events
  'new_dispute': (jobId: string, initiatorId: string, reason: string) => void
  'dispute_resolved': (jobId: string, resolvedById: string, resolution: Record<string, unknown>) => void
  
  // System events
  'system_announcement': (title: string, message: string, data?: Record<string, unknown>) => void
  'server_restarting': (restartAt: string) => void
  'maintenance_mode': (enabled: boolean, message?: string) => void
}

// Client to Server Events (emitted by client, received by server)
export interface ClientToServerEvents {
  // Connection events
  'register': (user: { userId: string; role: string; phone: string; firstName?: string; lastName?: string; avatarUrl?: string; fcmToken?: string }) => void
  'unregister': () => void
  
  // Chat events
  'send_message': (message: { jobId: string; content: string; contentType?: ContentType; mediaUrl?: string }, callback: (success: boolean, message?: Message, error?: string) => void) => void
  'read_message': (messageId: string) => void
  'mark_messages_read': (jobId: string) => void
  'start_typing': (jobId: string) => void
  'stop_typing': (jobId: string) => void
  'flag_message': (messageId: string, reason: string) => void
  
  // Join/Leave chat rooms
  'join_chat': (jobId: string, callback?: (success: boolean, error?: string) => void) => void
  'leave_chat': (jobId: string) => void
  
  // Job events
  'accept_job': (jobId: string) => void
  'decline_job': (jobId: string, reason?: string) => void
  'start_job': (jobId: string) => void
  'complete_job': (jobId: string, actualEndAt?: string) => void
  'cancel_job': (jobId: string, reason: string) => void
  
  // Invitation events
  'send_invitation': (jobId: string, taskerId: string, message?: string) => void
  'accept_invitation': (jobId: string) => void
  'decline_invitation': (jobId: string, reason?: string) => void
  
  // Payment events
  'initiate_payment': (jobId: string) => void
  'verify_payment': (reference: string) => void
  
  // Location events
  'update_location': (latitude: number, longitude: number, accuracy: number) => void
  'check_in': (jobId: string, latitude: number, longitude: number) => void
  
  // Review events
  'submit_review': (jobId: string, revieweeId: string, overallRating: number, comment?: string, punctualityRating?: number, qualityRating?: number, communicationRating?: number) => void
  
  // Ping/Pong for connection health
  'ping': (callback: (pong: boolean) => void) => void
}

// Inter Server Events (for multi-instance communication)
export interface InterServerEvents {
  // Broadcast events to other server instances
  'broadcast_message': (jobId: string, message: Message) => void
  'broadcast_job_status': (jobId: string, status: string, fromStatus?: string, reason?: string) => void
  'broadcast_payment': (jobId: string, event: string, data: Record<string, unknown>) => void
  'broadcast_location': (taskerId: string, latitude: number, longitude: number) => void
  
  // User connection tracking
  'user_connected': (userId: string, socketId: string) => void
  'user_disconnected': (userId: string, socketId: string) => void
}

// Combined Socket.io types for easy importing

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Chat Room Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ChatRoom {
  jobId: string
  participants: Array<{
    userId: string
    role: string
    firstName: string
    lastName: string
    avatarUrl?: string
    online: boolean
    lastSeenAt?: string
  }>
  unreadCount: number
  lastMessage?: Message
  createdAt: string
}

export interface ChatRoomInfo {
  jobId: string
  otherUser: {
    id: string
    firstName: string
    lastName: string
    role: string
    avatarUrl?: string
    phone: string
    online: boolean
    lastSeenAt?: string
    averageRating?: number
    totalReviews?: number
  }
  unreadCount: number
  lastMessage?: Message
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Message Moderation Types
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type FlagReason = 
  | 'inappropriate_content'
  | 'contact_info'
  | 'spam'
  | 'scam'
  | 'offensive_language'
  | 'other'

export interface FlagMessageRequest {
  messageId: string
  reason: FlagReason
  notes?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Contact Info Detection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Check if message content contains contact information that should be masked
 * @param content Message content to check
 * @returns True if contact info is detected
 */
export function containsContactInfo(content: string): boolean {
  // Nigerian phone number patterns
  const phonePatterns = [
    /\+234[789]\d{9}/,      // +234XXXXXXXXXX
    /0[789]\d{9}/,           // 0XXXXXXXXXX
    /234[789]\d{9}/,        // 234XXXXXXXXXX
  ]
  
  // Email patterns
  const emailPatterns = [
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  ]
  
  // Messaging app patterns
  const messagingPatterns = [
    /whatsapp/i,
    /telegram/i,
    /signal/i,
    /viber/i,
    /imo/i,
    /wechat/i,
  ]
  
  // Social media patterns
  const socialPatterns = [
    /facebook\.com/i,
    /twitter\.com/i,
    /instagram\.com/i,
    /linkedin\.com/i,
    /tiktok\.com/i,
    /snapchat\.com/i,
  ]
  
  const lowerContent = content.toLowerCase()
  
  // Check patterns
  const hasPhone = phonePatterns.some(pattern => pattern.test(content))
  const hasEmail = emailPatterns.some(pattern => pattern.test(content))
  const hasMessaging = messagingPatterns.some(pattern => pattern.test(lowerContent))
  const hasSocial = socialPatterns.some(pattern => pattern.test(lowerContent))
  
  // Check keywords
  const contactKeywords = [
    'call me', 'message me', 'email me', 'contact me',
    'my number is', 'my email is', 'reach me at',
    'whatsapp me', 'telegram me', 'add me on',
    'dm me', 'pm me', 'text me',
    'phone:', 'mobile:', 'email:', 'contact:',
  ]
  
  const hasKeyword = contactKeywords.some(keyword => lowerContent.includes(keyword))
  
  return hasPhone || hasEmail || hasMessaging || hasSocial || hasKeyword
}

/**
 * Mask contact information in message content
 * @param content Message content to mask
 * @returns Content with contact info masked
 */
export function maskContactInfo(content: string): string {
  // Mask Nigerian phone numbers
  let masked = content.replace(/(\+234|0)[789]\d{9}/g, '[PHONE]')
  
  // Mask emails
  masked = masked.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
  
  // Mask messaging app mentions
  const messagingPatterns = [
    /whatsapp/gi,
    /telegram/gi,
    /signal/gi,
    /viber/gi,
    /imo/gi,
    /wechat/gi,
  ]
  
  messagingPatterns.forEach(pattern => {
    masked = masked.replace(pattern, '[MESSENGER]')
  })
  
  // Mask social media URLs
  const socialPatterns = [
    /facebook\.com/gi,
    /twitter\.com/gi,
    /instagram\.com/gi,
    /linkedin\.com/gi,
    /tiktok\.com/gi,
    /snapchat\.com/gi,
  ]
  
  socialPatterns.forEach(pattern => {
    masked = masked.replace(pattern, '[SOCIAL]')
  })
  
  // Mask contact keywords
  const contactKeywords = [
    /call me/gi,
    /message me/gi,
    /email me/gi,
    /contact me/gi,
    /my number is/gi,
    /my email is/gi,
    /reach me at/gi,
  ]
  
  contactKeywords.forEach(pattern => {
    masked = masked.replace(pattern, '[CONTACT]')
  })
  
  return masked
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Export all types for easy importing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━