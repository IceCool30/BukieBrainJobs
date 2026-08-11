// services/socket-server/src/namespaces/jobs.ts
import { Server, Socket } from 'socket.io'
import { type ServerToClientEvents, type ClientToServerEvents, type SocketData } from '@bukiebrainjobs/api-types'

export function setupJobsNamespace(io: Server<any, any, any, SocketData>) {
  return io.of('/jobs')
}
