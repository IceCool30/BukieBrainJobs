import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.message) {
      return NextResponse.json({ ok: true });
    }

    const { message } = body;
    const text = message.text || '';
    const chatId = message.chat?.id;

    if (chatId === undefined) {
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/postjob')) {
      // Split target text after "/postjob" by "|"
      const content = text.substring('/postjob'.length).trim();
      const parts = content.split('|').map((part: string) => part.trim());

      const title = parts[0] || 'Untitled Job';
      const location = parts[1] || 'Remote';
      const amountVal = parts[2] ? parseInt(parts[2]) : 0;
      const urgency = parts[3] || 'standard';

      // Create Supabase client lazily using keys from environment
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Supabase keys are missing');
        return NextResponse.json({ ok: true });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Insert job into Supabase database
      const { data: job, error } = await supabase
        .from('jobs')
        .insert([
          {
            title,
            location,
            amount: amountVal,
            urgency,
            source: 'telegram',
            chat_id: String(chatId),
            status: 'pending_payment',
          },
        ])
        .select('id')
        .single();

      if (error) {
        console.error('Failed to insert job into Supabase:', error);
        return NextResponse.json({ ok: true });
      }

      const jobId = job?.id;
      let paymentLink = '';

      try {
        const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'YOUR_BOT_USERNAME';
        const callbackUrl = `https://t.me/${botUsername}`;

        const initRes = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 50000,
            email: `${chatId}@telegram.bukiejobs.com`,
            reference: jobId,
            callback_url: callbackUrl,
            metadata: { chat_id: chatId, source: 'telegram' },
          }),
        });

        if (!initRes.ok) {
          throw new Error(`Paystack init failed: ${initRes.status}`);
        }

        const initData = await initRes.json();
        paymentLink = initData?.data?.authorization_url || '';
      } catch (paystackError) {
        console.error('Failed to initialize Paystack transaction:', paystackError);
      }

      if (!paymentLink) {
        // Fallback reference URL only in case of complete API failure
        paymentLink = `https://paystack.com/pay/bukiejobs?amount=50000&reference=${jobId}`;
      }

      const replyText = `Job created: ${title}. Pay ₦500 to publish: ${paymentLink}`;

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
          }),
        }).catch((err) => {
          console.error('Failed to send Telegram sendMessage:', err);
        });
      } else {
        console.warn('TELEGRAM_BOT_TOKEN not configured');
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram POST webhook:', error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET(req: Request) {
  return NextResponse.json({ ok: true, service: 'Telegram Webhook' });
}

