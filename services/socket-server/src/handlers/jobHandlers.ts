// services/socket-server/src/handlers/jobHandlers.ts
import { Server } from 'socket.io'
import { type ServerToClientEvents, type ClientToServerEvents, type SocketData, type JobStatus } from '@bukiebrainjobs/api-types'

export function setupJobHandlers(io: Server<any, any, any, SocketData>) {
  const jobsNamespace = io.of('/jobs')
  
  jobsNamespace.on('connection', (socket: any) => {
    console.log(`Job handler: ${socket.id} connected`)
    
    socket.on('subscribe', (data: { jobId: string }) => {
      const { jobId } = data
      if (jobId) {
        socket.join(`job:${jobId}`)
      }
    })
    
    socket.on('unsubscribe', (data: { jobId: string }) => {
      const { jobId } = data
      if (jobId) {
        socket.leave(`job:${jobId}`)
      }
    })
  })
}

// Broadcast job status to subscribers
export function broadcastJobStatus(
  io: Server<any, any, any, SocketData>,
  jobId: string,
  status: JobStatus,
  previousStatus: JobStatus
): void {
  io.of('/jobs').to(`job:${jobId}`).emit('job_status_updated', jobId, status, previousStatus)
}
