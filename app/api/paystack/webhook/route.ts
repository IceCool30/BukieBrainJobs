import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const supabase = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder') // MUST BE SERVICE ROLE, NOT ANON
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('x-paystack-signature');
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex');
  
  if (hash !== signature) {
    console.log('401: Signature mismatch');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);
  console.log('Webhook event:', event.event);
  
  if (event.event === 'charge.success') {
    const reference = event.data.reference;
    console.log('Processing Paystack payment success:', reference);

    // Extract metadata values
    const metadata = event.data.metadata || {};
    const paymentType = metadata.type || 'standard_activation'; // e.g., 'urgent_boost', 'inspection', 'standard_activation'
    const userId = metadata.profile_id || null;
    
    // Paystack amounts are in kobo (e.g. 1000 NGN = 100000 kobo)
    const normalizedAmount = event.data.amount ? Math.floor(event.data.amount / 100) : 0;

    // 1. Prepare dynamic update query for the jobs table
    const updateData: Record<string, any> = {};
    if (paymentType === 'wallet_funding') {
      // Add funds to wallet
      const { data: wallet } = await supabase.from('wallets').select('balance').eq('profile_id', userId).maybeSingle();
      if (wallet) {
        await supabase.from('wallets').update({ balance: wallet.balance + normalizedAmount }).eq('profile_id', userId);
      } else {
        await supabase.from('wallets').insert([{ profile_id: userId, balance: normalizedAmount }]);
      }
      console.log('Wallet credited for wallet_funding');
    } else if (paymentType === 'urgent_boost') {
      updateData.is_urgent = true;
    } else if (paymentType === 'inspection') {
      updateData.inspection_fee_paid = true;
      updateData.stage = 'inspection';
    } else {
      // Default: regular job post activation
      updateData.stage = 'active';
    }

    // Update the job stage/flags using the new DB structure
    if (Object.keys(updateData).length > 0) {
      const { error: jobError } = await supabase
        .from('jobs')
        .update(updateData)
        .eq('id', reference);
  
      if (jobError) {
        console.warn('Jobs update omitted or errored (reference might not be a job ID):', jobError.message);
      } else {
        console.log('Job status updated successfully to match paid action');
      }
    }

    // 2. Track transaction in the Ledger (transactions table)
    
    const { error: txError } = await supabase
      .from('transactions')
      .insert([
        {
          profile_id: userId,
          amount: normalizedAmount,
          reference: reference,
          type: paymentType,
          status: 'success'
        }
      ]);

    if (txError) {
      console.error('Ledger entry failed:', txError.message);
      // We log but don't crash webhook response so Paystack doesn't keep retrying
    } else {
      console.log('Ledger entry recorded successfully in public.transactions');
    }
    
    // 3. User alerts (via telegram bot chat_id)
    if (metadata.chat_id) {
      const messageText = `✅ *Payment Confirmed!*\n\nReference: \`${reference}\`\nAmount: *₦${normalizedAmount.toLocaleString()}*\n\nYour job has been successfully updated on BukieBrainJobs.`;
      
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: metadata.chat_id,
          text: messageText,
          parse_mode: 'Markdown'
        })
      }).catch((err) => {
        console.error('Failed to notify client via Telegram:', err);
      });
    }
  }
  
  return NextResponse.json({ received: true });
}
