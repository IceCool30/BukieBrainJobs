// apps/web/middleware.ts
// Phase 1 Pass-Through Middleware (AGENTS.md Phase 1 Mock Boundary)

import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  // Pass through all requests in Phase 1 client-side mock mode
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};