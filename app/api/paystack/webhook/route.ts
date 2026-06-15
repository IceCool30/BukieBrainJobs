import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRole);

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-paystack-signature') || '';
    const secret = process.env.PAYSTACK_SECRET_KEY || '';
    
    const hash = crypto
      .createHmac('sha512', secret)
      .update(body)
      .digest('hex');
    
    if (hash !== signature) {
      console.log('Signature failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    console.log('Webhook event:', event.event);
    
    if (event.event === 'charge.success') {
      const reference = event.data?.reference;
      console.log('Updating job:', reference);
      
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'active' })
        .eq('id', reference);
      
      if (error) {
        console.log('Supabase error:', error);
      }
      
      const chatId = event.data?.metadata?.chat_id;
      if (chatId) {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (botToken) {
          await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: `✅ Payment confirmed! Your job is now live.`
            })
          }).catch((err) => {
            console.error('Failed to send message via Telegram Bot:', err);
          });
        } else {
          console.log('TELEGRAM_BOT_TOKEN is missing');
        }
      }
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error in Paystack webhook handler:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
