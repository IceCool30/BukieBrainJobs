// services/socket-server/src/index.ts
// Socket.io Server Entry Point

import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { Cluster } from 'ioredis'
import http from 'http'
import { type ServerToClientEvents, type ClientToServerEvents, type InterServerEvents, type SocketData } from '@bukiebrainjobs/api-types'

// Load configuration from environment
const PORT = parseInt(process.env.SOCKET_SERVER_PORT || '3001', 10)

// Initialize Redis for pub/sub
const setupRedis = () => {
  const redisUrl = process.env.REDIS_URL
  if (!redisUrl) {
    console.log('REDIS_URL not configured, using in-memory adapter')
    return null
  }
  
  try {
    const redis = new Cluster([
      { host: new URL(redisUrl).hostname, port: parseInt(new URL(redisUrl).port || '6379', 10) }
    ])
    
    redis.on('error', (err) => {
      console.error('Redis cluster error:', err)
    })
    
    redis.on('connect', () => {
      console.log('Redis cluster connected for Socket.io pub/sub')
    })
    
    return redis
  } catch (error) {
    console.error('Failed to connect to Redis:', error)
    return null
  }
}

// Create HTTP server
const httpServer = http.createServer()

// Create Socket.io server with typed events
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: false,
  },
  transports: ['websocket', 'polling'],
})

// Setup Redis adapter for multi-instance support
const redis = setupRedis()
if (redis) {
  io.adapter(createAdapter(redis, redis.duplicate()))
  console.log('Using Redis adapter for Socket.io')
}

// Import and setup namespaces
import { setupChatNamespace } from './namespaces/chat'
import { setupJobsNamespace } from './namespaces/jobs'

const chatNamespace = setupChatNamespace(io)
const jobsNamespace = setupJobsNamespace(io)

// Import middleware
import { authMiddleware } from './middleware/auth'
import { rateLimitMiddleware } from './middleware/rateLimit'

// Apply global middleware
io.use(authMiddleware)
io.use(rateLimitMiddleware)

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ 
      status: 'ok', 
      timestamp: Date.now(),
      adapter: redis ? 'redis' : 'memory'
    }))
    return
  }
  
  res.writeHead(404, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ error: 'Not Found' }))
})

// Server ready handler
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`)
  
  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} - Reason: ${reason}`)
  })
  
  socket.on('error', (error) => {
    console.error(`Socket error: ${socket.id}`, error)
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`)
  console.log(`Adapter: ${redis ? 'Redis' : 'In-memory'}`)
})

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('Shutting down Socket.io server...')
  io.close()
  redis?.disconnect()
  httpServer.close(() => {
    console.log('Socket.io server shutdown complete')
    process.exit(0)
  })
}

process.on('SIGTERM', gracefulShutdown)
process.on('SIGINT', gracefulShutdown)

export { io, httpServer }
