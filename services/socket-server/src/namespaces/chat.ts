// services/socket-server/src/namespaces/chat.ts
// Chat Namespace for Socket.io

import { Namespace, Server, Socket } from 'socket.io'
import { type ServerToClientEvents, type ClientToServerEvents, type SocketData } from '@bukiebrainjobs/api-types'
import { type Message } from '@bukiebrainjobs/api-types'

// Active rooms map: jobId -> Set of socket IDs
type ActiveRooms = Map<string, Set<string>>
const activeRooms: ActiveRooms = new Map()

// User to socket mapping: userId -> Set of socket IDs
type UserSockets = Map<string, Set<string>>
const userSockets: UserSockets = new Map()

function addUserSocket(userId: string, socketId: string): void {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set())
  }
  userSockets.get(userId)!.add(socketId)
}

function removeUserSocket(userId: string, socketId: string): void {
  const sockets = userSockets.get(userId)
  if (sockets) {
    sockets.delete(socketId)
    if (sockets.size === 0) {
      userSockets.delete(userId)
    }
  }
}

export function setupChatNamespace(io: Server<ClientToServerEvents, ServerToClientEvents, unknown, SocketData>) {
  const chatNamespace = io.of('/chat')
  
  chatNamespace.use((socket, next) => {
    const userId = socket.handshake.auth?.userId
    const role = socket.handshake.auth?.role
    if (!userId || !role) {
      return next(new Error('Authentication required'))
    }
    socket.data.userId = userId
    socket.data.role = role
    addUserSocket(userId, socket.id)
    next()
  })
  
  chatNamespace.on('connection', (socket) => {
    console.log(`Chat namespace: user ${socket.data.userId} connected`)
    
    socket.on('join_room', (data: { jobId: string }) => {
      const { jobId } = data
      if (!jobId) {
        socket.emit('error', { message: 'jobId is required' })
        return
      }
      socket.join(`job:${jobId}`)
      if (!activeRooms.has(jobId)) {
        activeRooms.set(jobId, new Set())
      }
      activeRooms.get(jobId)!.add(socket.id)
      socket.data.jobId = jobId
      socket.to(`job:${jobId}`).emit('chat:user_joined', {
        userId: socket.data.userId,
        role: socket.data.role,
        jobId,
      })
    })
    
    socket.on('leave_room', (data: { jobId: string }) => {
      const { jobId } = data
      if (!jobId) return
      socket.leave(`job:${jobId}`)
      const room = activeRooms.get(jobId)
      if (room) {
        room.delete(socket.id)
        if (room.size === 0) activeRooms.delete(jobId)
      }
      if (socket.data.jobId === jobId) socket.data.jobId = undefined
      socket.to(`job:${jobId}`).emit('chat:user_left', {
        userId: socket.data.userId,
        role: socket.data.role,
        jobId,
      })
    })
    
    socket.on('chat:send_message', async (data: { jobId: string; content: string; contentType?: string; mediaUrl?: string }, callback?: any) => {
      const { jobId, content, contentType } = data
      if (!jobId || !content) {
        socket.emit('error', { message: 'jobId and content are required' })
        if (callback) callback({ success: false })
        return
      }
      const message: Partial<Message> = {
        jobId,
        senderId: socket.data.userId,
        content,
        contentType: contentType || 'text',
        mediaUrl: data.mediaUrl || null,
        isRead: false,
        createdAt: new Date(),
      }
      chatNamespace.to(`job:${jobId}`).emit('chat:message', message)
      socket.emit('chat:message', message)
      if (callback) callback({ success: true, data: message })
    })
    
    socket.on('chat:typing', (data: { jobId: string; isTyping: boolean }) => {
      const { jobId, isTyping } = data
      if (!jobId) return
      socket.to(`job:${jobId}`).emit('chat:typing', {
        userId: socket.data.userId,
        role: socket.data.role,
        isTyping,
        jobId,
      })
    })
    
    socket.on('chat:read', (data: { jobId: string; messageId: string }) => {
      const { jobId, messageId } = data
      if (!jobId || !messageId) return
      socket.to(`job:${jobId}`).emit('chat:read', {
        userId: socket.data.userId,
        messageId,
        jobId,
      })
    })
    
    socket.on('disconnect', () => {
      removeUserSocket(socket.data.userId, socket.id)
      if (socket.data.jobId) {
        const room = activeRooms.get(socket.data.jobId)
        if (room) {
          room.delete(socket.id)
          if (room.size === 0) activeRooms.delete(socket.data.jobId)
        }
      }
    })
  })
  return chatNamespace
}
