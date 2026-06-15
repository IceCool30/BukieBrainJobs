import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message || !message.text || !message.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const { text, chat } = message;
    const chatId = chat.id;

    if (text.startsWith('/postjob')) {
      const args = text.replace('/postjob', '').trim();
      const parts = args.split('|').map((p: string) => p.trim());
      
      if (parts.length >= 4) {
        const [title, location, amountStr, urgency] = parts;
        
        const { data: job, error } = await supabase
          .from('jobs')
          .insert([
            {
              title,
              location,
              amount: amountStr,
              urgency,
              source: 'telegram',
              chat_id: chatId.toString(),
              status: 'pending_payment',
            },
          ])
          .select()
          .single();

        if (error) {
          console.error('Supabase error:', error);
          await sendTelegramMessage(chatId, 'Error creating job. Please try again.');
          return NextResponse.json({ ok: true });
        }

        const paymentLink = `https://paystack.com/pay/bukiejobs?amount=50000&reference=${job.id}`;
        const reply = `Job created: ${title}. Pay ₦500 to publish: ${paymentLink}`;

        await sendTelegramMessage(chatId, reply);
      } else {
        await sendTelegramMessage(chatId, 'Usage: /postjob Title | Location | Amount | Urgency');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    return NextResponse.json({ ok: true });
  }
}

async function sendTelegramMessage(chatId: string | number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN is not set');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
    }),
  });
}

export async function GET(req: Request) {
  return NextResponse.json({ ok: true, service: 'Telegram Webhook' });
}
