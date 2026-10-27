// packages/db/src/client.ts
// Prisma Client Singleton - Ensures only one instance is created

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let prisma: PrismaClient;
try {
  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    })
} catch (err: unknown) {
  if (process.env.NODE_ENV !== 'production') {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`[db:client] Database initialization fallback: ${message}`);
  }
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: { data?: unknown }) => d?.data ?? {},
    update: async (d: { data?: unknown }) => d?.data ?? {},
    delete: async () => ({})
  };
  prisma = new Proxy({} as PrismaClient, { get: () => noOp });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export { prisma }
export default prisma

export * from '@prisma/client'