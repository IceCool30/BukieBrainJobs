import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // MUST BE SERVICE ROLE, NOT ANON
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-paystack-signature')
  const secret = process.env.PAYSTACK_SECRET_KEY!
  const hash = crypto.createHmac('sha512', secret).update(body).digest('hex')
  
  if (hash !== signature) {
    console.log('401: Signature mismatch')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const event = JSON.parse(body)
  console.log('Webhook event:', event.event)
  
  if (event.event === 'charge.success') {
    const reference = event.data.reference
    console.log('Updating job:', reference)
    
    const { error } = await supabase
      .from('jobs')
      .update({ 
        status: 'active',
        paystack_ref: event.data.reference 
      })
      .eq('id', reference)
    
    if (error) {
      console.log('Supabase error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('Job activated successfully:', reference)
    
    if (event.data.metadata?.chat_id) {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: event.data.metadata.chat_id,
          text: `✅ Payment confirmed! Your job is now live.`
        })
      })
    }
  }
  
  return NextResponse.json({ received: true })
}
