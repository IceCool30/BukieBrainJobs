// services/socket-server/src/middleware/auth.ts
import { Socket } from 'socket.io'
import { type SocketData } from '@bukiebrainjobs/api-types'

export function authMiddleware(socket: Socket<unknown, unknown, unknown, SocketData>, next: (err?: Error) => void) {
  // Extract JWT token from handshake headers or query
  const token = socket.handshake.headers.authorization?.replace('Bearer ', '') ||
               socket.handshake.query.token as string | undefined
  
  if (!token) {
    return next(new Error('Authentication required'))
  }
  
  // In production, verify the JWT here
  // For now, just decode and extract user data
  try {
    // This is a placeholder - implement proper JWT verification
    // using the same secret as the web app
    const decoded = parseToken(token)
    
    if (!decoded || !decoded.sub || !decoded.role) {
      return next(new Error('Invalid authentication token'))
    }
    
    // Set user data on socket
    socket.data.userId = decoded.sub
    socket.data.role = decoded.role as string
    socket.data.phone = decoded.phone as string | undefined
    
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
  // In production, use:
  // import { jwtVerify } from 'jose'
  // const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
  // return payload as { sub: string; role: string; phone: string }
  
  // For development, just decode base64 (not secure!)
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = Buffer.from(parts[1], 'base64').toString('utf8')
    return JSON.parse(payload)
  } catch {
    return null
  }
}
