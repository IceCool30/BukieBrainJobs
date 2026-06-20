import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.message) {
      return NextResponse.json({ ok: true });
    }

    const { message } = body;
    const text = (message.text || '').trim();
    const chatId = message.chat?.id;

    if (chatId === undefined) {
      return NextResponse.json({ ok: true });
    }

    // Since the platform is Web & PWA first, and Telegram/WhatsApp are used purely for alerts/confirmations:
    let replyText = '';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://bukiebrain-waitlist.vercel.app';

    if (text === '/start' || text.startsWith('/start payment_success')) {
      replyText = `👋 *Welcome to BukieBrainJobs!*\n\nThis bot is your personal assistant for instant job notifications, real-time alerts, and secure Paystack payment confirmations.\n\n🚀 *Post, Browse, & Verify on Web & PWA:*\nTo post professional services, review bids, or build your verified *BukiePassport*, join us directly on our main platform:\n👉 ${appUrl}\n\n⚡ *Instant Alert Hub:* We will notify you here as soon as a local employer posts an urgent job in your community!`;
    } else {
      replyText = `📢 *BukieBrainJobs Notification Hub*\n\nTo list local jobs, search for verified artisans, or view candidate profiles, please use our main Web App / PWA website:\n👉 ${appUrl}\n\nThis Telegram support channel is dedicated to sending you *instant alerts, secure payment confirmations, and system updates*.`;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (botToken) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: replyText,
          parse_mode: 'Markdown',
        }),
      }).catch((err) => {
        console.error('Failed to send Telegram message:', err);
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram POST webhook:', error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ ok: true, service: 'Telegram Alert Webhook Ready' });
}
