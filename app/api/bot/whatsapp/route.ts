import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // TODO: Add implementation for WhatsApp webhook
  return NextResponse.json({ ok: true });
}

export async function GET(req: Request) {
  // WhatsApp challenges for webhook verification can be handled here later
  return NextResponse.json({ ok: true, service: 'WhatsApp Webhook' });
}
