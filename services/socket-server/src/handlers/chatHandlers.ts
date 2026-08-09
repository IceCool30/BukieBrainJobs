// services/socket-server/src/handlers/chatHandlers.ts
import { Server } from 'socket.io'
import { type ServerToClientEvents, type ClientToServerEvents, type SocketData } from '@bukiebrainjobs/api-types'

export function setupChatHandlers(io: Server<ClientToServerEvents, ServerToClientEvents, unknown, SocketData>) {
  const chatNamespace = io.of('/chat')
  
  chatNamespace.on('connection', (socket) => {
    console.log(`Chat handler: ${socket.id} connected`)
    
    // Handle job-specific chat rooms
    socket.on('join_room', (data: { jobId: string }) => {
      const { jobId } = data
      if (jobId) {
        socket.join(`job:${jobId}`)
      }
    })
    
    socket.on('leave_room', (data: { jobId: string }) => {
      const { jobId } = data
      if (jobId) {
        socket.leave(`job:${jobId}`)
      }
    })
  })
}
