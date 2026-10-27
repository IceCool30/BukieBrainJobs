import { Server, Socket } from 'socket.io'
import { type ServerToClientEvents, type ClientToServerEvents, type SocketData } from '@bukiebrainjobs/api-types'
import { logger } from '../logger'

export function setupChatHandlers(io: Server<any, any, any, SocketData>) {
  const chatNamespace = io.of('/chat')
  
  chatNamespace.on('connection', (socket: Socket) => {
    logger.info('Chat client connected', { socketId: socket.id, namespace: '/chat' })
    
    // Handle job-specific chat rooms
    socket.on('join_chat', (jobId: string) => {
      if (jobId) {
        socket.join(`job:${jobId}`)
      }
    })
    
    socket.on('leave_chat', (jobId: string) => {
      if (jobId) {
        socket.leave(`job:${jobId}`)
      }
    })
  })
}
