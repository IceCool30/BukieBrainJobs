// packages/validation/src/chatSchemas.ts
import { z } from 'zod'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Chat Message Schemas
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SendMessageSchema = z.object({
  jobId: z.string().uuid(),
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message cannot exceed 2000 characters'),
  contentType: z.enum(['text', 'image', 'location']).default('text'),
  mediaUrl: z.string().url().optional(),
})

export const MessageQuerySchema = z.object({
  jobId: z.string().uuid(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(20),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Chat Filter Schemas (for masking contact info)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Nigerian phone number patterns for filtering
const NigerianPhonePatterns = [
  /\+234[789]\d{9}/,           // +234XXXXXXXXXX
  /0[789]\d{9}/,                // 0XXXXXXXXXX
  /234[789]\d{9}/,             // 234XXXXXXXXXX
]

// Email patterns for filtering
const EmailPatterns = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
]

// Common messaging app patterns
const MessagingAppPatterns = [
  /whatsapp/i,
  /telegram/i,
  /signal/i,
  /viber/i,
  /imo/i,
  /wechat/i,
]

// Social media patterns
const SocialMediaPatterns = [
  /facebook\.com/i,
  /twitter\.com/i,
  /instagram\.com/i,
  /linkedin\.com/i,
  /tiktok\.com/i,
  /snapchat\.com/i,
]

export const containsContactInfo = (content: string): boolean => {
  const lowerContent = content.toLowerCase()
  
  // Check for phone numbers
  const hasPhone = NigerianPhonePatterns.some(pattern => pattern.test(content))
  
  // Check for emails
  const hasEmail = EmailPatterns.some(pattern => pattern.test(content))
  
  // Check for messaging apps
  const hasMessagingApp = MessagingAppPatterns.some(pattern => pattern.test(lowerContent))
  
  // Check for social media
  const hasSocialMedia = SocialMediaPatterns.some(pattern => pattern.test(lowerContent))
  
  // Check for common contact keywords
  const contactKeywords = [
    'call me', 'message me', 'email me', 'contact me',
    'my number is', 'my email is', 'reach me at',
    'whatsapp me', 'telegram me', 'add me on',
    'dm me', 'pm me', 'text me',
    'phone:', 'mobile:', 'email:', 'contact:',
  ]
  
  const hasContactKeyword = contactKeywords.some(keyword => 
    lowerContent.includes(keyword)
  )
  
  return hasPhone || hasEmail || hasMessagingApp || hasSocialMedia || hasContactKeyword
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Message Moderation Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const FlagMessageSchema = z.object({
  messageId: z.string().uuid(),
  reason: z.enum([
    'inappropriate_content',
    'contact_info',
    'spam',
    'scam',
    'offensive_language',
    'other'
  ]),
  notes: z.string().max(500).optional(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Typing Indicator Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const TypingIndicatorSchema = z.object({
  jobId: z.string().uuid(),
  isTyping: z.boolean(),
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Read Receipt Schema
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const MarkMessageAsReadSchema = z.object({
  messageId: z.string().uuid(),
})

// Type exports
export type SendMessageInput = z.infer<typeof SendMessageSchema>
export type MessageQueryInput = z.infer<typeof MessageQuerySchema>
export type FlagMessageInput = z.infer<typeof FlagMessageSchema>
export type TypingIndicatorInput = z.infer<typeof TypingIndicatorSchema>
export type MarkMessageAsReadInput = z.infer<typeof MarkMessageAsReadSchema>