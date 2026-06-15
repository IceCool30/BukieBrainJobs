import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: true });
    }

    if (body.event === 'charge.success') {
      const jobId = body.data?.reference;
      
      if (jobId) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error('Supabase credentials missing in Paystack webhook');
          return NextResponse.json({ ok: true });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: job, error } = await supabase
          .from('jobs')
          .update({ status: 'active' })
          .eq('id', jobId)
          .select()
          .single();

        if (error) {
          console.error('Failed to update job status in Supabase:', error);
          return NextResponse.json({ ok: true });
        }

        if (job && job.source === 'telegram' && job.chat_id) {
          const botToken = process.env.TELEGRAM_BOT_TOKEN;
          if (botToken) {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: job.chat_id,
                text: `✅ Payment confirmed! Job '${job.title}' in ${job.location} is now live. Artisans will contact you soon.`
              }),
            }).catch((err) => {
              console.error('Failed to send Telegram confirmation message:', err);
            });
          } else {
            console.warn('TELEGRAM_BOT_TOKEN not configured in Paystack webhook');
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Paystack webhook:', error);
    return NextResponse.json({ ok: true });
  }
}
