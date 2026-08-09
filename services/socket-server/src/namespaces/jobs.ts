// services/socket-server/src/namespaces/jobs.ts
import { Server, Socket } from 'socket.io'
import { type ServerToClientEvents, type ClientToServerEvents, type SocketData } from '@bukiebrainjobs/api-types'

export function setupJobsNamespace(io: Server<ClientToServerEvents, ServerToClientEvents, unknown, SocketData>) {
  return io.of('/jobs')
}
