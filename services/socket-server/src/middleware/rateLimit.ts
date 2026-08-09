// services/socket-server/src/middleware/rateLimit.ts
import { Socket } from 'socket.io'
import { type SocketData } from '@bukiebrainjobs/api-types'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 1000 * 60 // 1 minute
const MAX_CONNECTIONS_PER_WINDOW = 30 // Max connections per user per minute

// Track connection attempts per user
const connectionAttempts = new Map<string, { count: number; lastReset: number }>()

export function rateLimitMiddleware(socket: Socket<unknown, unknown, unknown, SocketData>, next: (err?: Error) => void) {
  const userId = socket.handshake.query.userId as string ||
               socket.handshake.headers['x-user-id'] as string ||
               socket.id
  
  const now = Date.now()
  
  // Initialize or reset tracking for this user
  if (!connectionAttempts.has(userId)) {
    connectionAttempts.set(userId, { count: 0, lastReset: now })
  }
  
  const userAttempts = connectionAttempts.get(userId)!
  
  // Reset counter if window has passed
  if (now - userAttempts.lastReset > RATE_LIMIT_WINDOW) {
    userAttempts.count = 0
    userAttempts.lastReset = now
  }
  
  // Check if rate limit exceeded
  if (userAttempts.count >= MAX_CONNECTIONS_PER_WINDOW) {
    console.warn(`Rate limit exceeded for user: ${userId}`)
    return next(new Error('Rate limit exceeded'))
  }
  
  // Increment counter and allow connection
  userAttempts.count++
  next()
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  const window = RATE_LIMIT_WINDOW * 2 // Clean up entries older than 2 windows
  
  for (const [userId, data] of connectionAttempts) {
    if (now - data.lastReset > window) {
      connectionAttempts.delete(userId)
    }
  }
}, RATE_LIMIT_WINDOW)

export const getRateLimitConfig = () => ({
  windowMs: RATE_LIMIT_WINDOW,
  maxConnections: MAX_CONNECTIONS_PER_WINDOW,
})
