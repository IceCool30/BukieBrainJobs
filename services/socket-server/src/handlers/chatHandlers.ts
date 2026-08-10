// services/socket-server/src/handlers/chatHandlers.ts
import { Server } from 'socket.io'
import { type ServerToClientEvents, type ClientToServerEvents, type SocketData } from '@bukiebrainjobs/api-types'

export function setupChatHandlers(io: Server<any, any, any, SocketData>) {
  const chatNamespace = io.of('/chat')
  
  chatNamespace.on('connection', (socket: any) => {
    console.log(`Chat handler: ${socket.id} connected`)
    
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
