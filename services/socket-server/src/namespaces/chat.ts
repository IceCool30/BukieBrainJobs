// services/socket-server/src/namespaces/chat.ts
// Chat Namespace for Socket.io

import { Namespace, Server, Socket } from 'socket.io'
import { type ServerToClientEvents, type ClientToServerEvents, type SocketData, type Message, type ContentType } from '@bukiebrainjobs/api-types'

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

export function setupChatNamespace(io: Server<any, any, any, SocketData>) {
  const chatNamespace = io.of('/chat')
  
  chatNamespace.use((socket: Socket<any, any, any, SocketData>, next: (err?: Error) => void) => {
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
  
  chatNamespace.on('connection', (socket: Socket<any, any, any, SocketData>) => {
    console.log(`Chat namespace: user ${socket.data.userId} connected`)
    
    socket.on('join_chat', (jobId: string, callback?: (success: boolean, error?: string) => void) => {
      if (!jobId) {
        if (callback) callback(false, 'jobId is required')
        return
      }
      socket.join(`job:${jobId}`)
      if (!activeRooms.has(jobId)) {
        activeRooms.set(jobId, new Set())
      }
      activeRooms.get(jobId)!.add(socket.id)
      socket.data.jobId = jobId
      socket.to(`job:${jobId}`).emit('chat_joined', jobId, {
        id: socket.data.userId || '',
        firstName: socket.data.firstName || '',
        lastName: socket.data.lastName || '',
        role: socket.data.role || 'client',
      })
      if (callback) callback(true)
    })
    
    socket.on('leave_chat', (jobId: string) => {
      if (!jobId) return
      socket.leave(`job:${jobId}`)
      const room = activeRooms.get(jobId)
      if (room) {
        room.delete(socket.id)
        if (room.size === 0) activeRooms.delete(jobId)
      }
      if (socket.data.jobId === jobId) delete socket.data.jobId
      socket.to(`job:${jobId}`).emit('chat_left', jobId, socket.data.userId || '')
    })
    
    socket.on('send_message', async (data: { jobId: string; content: string; contentType?: ContentType; mediaUrl?: string }, callback?: (success: boolean, message?: Message, error?: string) => void) => {
      const { jobId, content, contentType } = data
      if (!jobId || !content) {
        if (callback) callback(false, undefined, 'jobId and content are required')
        return
      }
      const message: Message = {
        id: `msg_${Date.now()}`,
        jobId,
        senderId: socket.data.userId || '',
        content,
        contentType: contentType || 'text',
        isRead: false,
        isFlagged: false,
        createdAt: new Date().toISOString(),
        ...(data.mediaUrl ? { mediaUrl: data.mediaUrl } : {}),
      }
      chatNamespace.to(`job:${jobId}`).emit('new_message', message)
      if (callback) callback(true, message)
    })
    
    socket.on('start_typing', (jobId: string) => {
      if (!jobId) return
      socket.to(`job:${jobId}`).emit('typing', jobId, socket.data.userId || '', true)
    })

    socket.on('stop_typing', (jobId: string) => {
      if (!jobId) return
      socket.to(`job:${jobId}`).emit('typing', jobId, socket.data.userId || '', false)
    })
    
    socket.on('read_message', (messageId: string) => {
      if (!messageId) return
      const readAt = new Date().toISOString()
      if (socket.data.jobId) {
        socket.to(`job:${socket.data.jobId}`).emit('message_read', messageId, readAt)
      }
    })
    
    socket.on('disconnect', () => {
      if (socket.data.userId) {
        removeUserSocket(socket.data.userId, socket.id)
      }
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
