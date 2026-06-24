'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

const DISPUTE_TIMEOUT_DAYS = 7
const ARTISAN_NO_RESPONSE_PENALTY = 1.0 // 100% refund to employer if artisan ghosts

export async function raiseDispute({
  job_id,
  reason,
  evidence_urls
}: {
  job_id: string
  reason: string
  evidence_urls: string[]
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() { return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })) },
        setAll(cookiesToSet: any[]) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // 1. Verify job + escrow state
  const { data: escrow } = await supabase
   .from('protected_funds')
   .select('*, jobs!inner(*)')
   .eq('job_id', job_id)
   .eq('status', 'locked')
   .single()

  if (!escrow) throw new Error('No locked funds to dispute')
  if (escrow.employer_id !== user.id) throw new Error('Only employer can raise dispute')
  if (escrow.jobs.stage !== 'in_progress') throw new Error('Job must be in progress to dispute')

  // 2. Check if dispute already exists
  const { data: existing } = await supabase
   .from('disputes')
   .select('id')
   .eq('job_id', job_id)
   .single()

  if (existing) throw new Error('Dispute already active for this job')

  // 3. Create dispute record
  const expires_at = new Date(Date.now() + DISPUTE_TIMEOUT_DAYS * 24 * 60 * 60 * 1000).toISOString()

  const { data: dispute, error } = await supabase
   .from('disputes')
   .insert({
      job_id,
      employer_id: escrow.employer_id,
      artisan_id: escrow.artisan_id,
      escrow_id: escrow.id, // using id assuming escrow_id might just be id
      reason,
      evidence_urls,
      status: 'open',
      expires_at
    })
   .select('id')
   .single()

  if (error) throw error

  // 4. Freeze job
  await supabase
   .from('jobs')
   .update({ stage: 'disputed' })
   .eq('id', job_id) // using id for job_id

  revalidatePath('/dashboard')
  return { success: true, dispute_id: dispute.id, expires_at }
}

export async function addArtisanDefense({
  dispute_id,
  response_text,
  evidence_urls
}: {
  dispute_id: string
  response_text: string
  evidence_urls: string[]
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() { return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })) },
        setAll(cookiesToSet: any[]) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: dispute } = await supabase
   .from('disputes')
   .select('*')
   .eq('id', dispute_id)
   .eq('status', 'open')
   .single()

  if (!dispute) throw new Error('Dispute not found or closed')
  if (dispute.artisan_id !== user.id) throw new Error('Only artisan can defend')

  await supabase
   .from('disputes')
   .update({
      artisan_response: response_text,
      artisan_evidence_urls: evidence_urls,
      artisan_responded_at: new Date().toISOString()
    })
   .eq('id', dispute_id)

  revalidatePath('/dashboard')
  return { success: true }
}

export async function resolveDisputeByAdmin({
  dispute_id,
  employer_payout_percent, // 0 to 1.0
  admin_notes
}: {
  dispute_id: string
  employer_payout_percent: number
  admin_notes: string
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() { return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })) },
        setAll(cookiesToSet: any[]) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // TODO: Add admin role check here
  // if (!isAdmin(user.id)) throw new Error('Admin only')

  const { data: dispute } = await supabase
   .from('disputes')
   .select('*, protected_funds!inner(*)')
   .eq('id', dispute_id)
   .eq('status', 'open')
   .single()

  if (!dispute) throw new Error('Dispute not found')

  const total_amount = dispute.protected_funds.amount
  const employer_refund = Math.floor(total_amount * employer_payout_percent)
  const artisan_payout = total_amount - employer_refund

  // Platform takes no fee on disputed jobs
  // 1. Refund employer
  if (employer_refund > 0) {
    const { data: empWallet } = await supabase
     .from('wallets')
     .select('balance')
     .eq('profile_id', dispute.employer_id)
     .single()

    await supabase
     .from('wallets')
     .update({ balance: (empWallet?.balance || 0) + employer_refund })
     .eq('profile_id', dispute.employer_id)

    await supabase.from('transactions').insert({
      profile_id: dispute.employer_id,
      amount: employer_refund,
      type: 'dispute_refund',
      description: `Dispute resolution refund for job`,
      status: 'completed'
    })
  }

  // 2. Pay artisan remainder
  if (artisan_payout > 0) {
    const { data: artWallet } = await supabase
     .from('wallets')
     .select('balance')
     .eq('profile_id', dispute.artisan_id)
     .single()

    await supabase
     .from('wallets')
     .update({ balance: (artWallet?.balance || 0) + artisan_payout })
     .eq('profile_id', dispute.artisan_id)

    await supabase.from('transactions').insert({
      profile_id: dispute.artisan_id,
      amount: artisan_payout,
      type: 'dispute_payout',
      description: `Dispute resolution payout for job`,
      status: 'completed'
    })
  }

  // 3. Close dispute + escrow
  await supabase
   .from('disputes')
   .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      admin_notes,
      employer_payout_percent,
      resolved_by: user.id
    })
   .eq('id', dispute_id)

  await supabase
   .from('protected_funds')
   .update({ status: 'refunded', released_at: new Date().toISOString() })
   .eq('id', dispute.escrow_id)

  await supabase
   .from('jobs')
   .update({ stage: 'cancelled' })
   .eq('id', dispute.job_id)

  // 4. Reputation hit if artisan at fault
  if (employer_payout_percent > 0.5) {
    await supabase.rpc('increment_dispute_strikes', { artisan_id: dispute.artisan_id })
  }

  revalidatePath('/admin/disputes')
  return { success: true, employer_refund, artisan_payout }
}

export async function autoResolveExpiredDisputes() {
  // Run via Supabase Cron every hour
  const cookieStore = cookies()
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() { return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })) },
        setAll(cookiesToSet: any[]) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  )

  const { data: expired } = await supabase
   .from('disputes')
   .select('*, protected_funds!inner(*)')
   .eq('status', 'open')
   .lt('expires_at', new Date().toISOString())
   .is('artisan_responded_at', null)

  if (!expired) return { resolved: 0 }

  for (const dispute of expired) {
    // Artisan ghosted. Full refund to employer
    await resolveDisputeByAdmin({
      dispute_id: dispute.id,
      employer_payout_percent: ARTISAN_NO_RESPONSE_PENALTY,
      admin_notes: 'Auto-resolved: Artisan failed to respond within 7 days'
    })
  }

  return { resolved: expired.length }
}
