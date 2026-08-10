// services/socket-server/src/middleware/auth.ts
import { Socket } from 'socket.io'
import { type SocketData } from '@bukiebrainjobs/api-types'

export function authMiddleware(socket: Socket<any, any, any, SocketData>, next: (err?: Error) => void) {
  // Extract JWT token from handshake headers or query
  const token = socket.handshake.headers.authorization?.replace('Bearer ', '') ||
               socket.handshake.query.token as string | undefined
  
  if (!token) {
    return next(new Error('Authentication required'))
  }
  
  // In production, verify the JWT here
  // For now, just decode and extract user data
  try {
    const decoded = parseToken(token)
    
    if (!decoded || !decoded.sub || !decoded.role) {
      return next(new Error('Invalid authentication token'))
    }
    
    // Set user data on socket
    if (decoded.sub) socket.data.userId = decoded.sub
    if (decoded.role) socket.data.role = decoded.role as string
    if (decoded.phone) socket.data.phone = decoded.phone as string
    
    // Add user to socket rooms for their role
    socket.join(`role:${decoded.role}`)
    socket.join(`user:${decoded.sub}`)
    
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    next(new Error('Invalid authentication token'))
  }
}

// Temporary token parser - replace with proper JWT verification
function parseToken(token: string): { sub?: string; role?: string; phone?: string } | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3 || !parts[1]) return null
    
    const payload = Buffer.from(parts[1], 'base64').toString('utf8')
    return JSON.parse(payload)
  } catch {
    return null
  }
}
