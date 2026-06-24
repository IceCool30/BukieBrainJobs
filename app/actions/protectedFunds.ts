'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Note: Ensure types/supabase.ts is updated or adjust Database type.
// using 'any' temporarily if Database type is not fully defined with new fields.
// import { Database } from '@/types/supabase'

const BID_COST = 100
const FREE_JOB_LIMIT = 3
const JOB_POST_FEE = 500
const URGENT_FEE = 1500
const FEATURED_FEE = 2000
const BLUE_CHECK_FEE = 3000
const FEATURED_DURATION_DAYS = 7
const PLATFORM_COMMISSION_RATE = 0.10 // 10%

export async function createJobWithPaywall({
  title,
  description,
  budget,
  category,
  is_urgent,
  is_featured
}: {
  title: string
  description: string
  budget: number
  category: string
  is_urgent: boolean
  is_featured: boolean
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, jobs_posted_this_month, last_job_reset_date, is_employer_verified')
    .eq('id', user.id) // Adjusted auth_user_id -> id or profile_id as per previous refactor
    .single()

  if (!profile) throw new Error('Profile not found')

  // Reset monthly counter if new month
  const now = new Date()
  const lastReset = profile.last_job_reset_date ? new Date(profile.last_job_reset_date) : new Date(0)
  if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
    await supabase
      .from('profiles')
      .update({ jobs_posted_this_month: 0, last_job_reset_date: now.toISOString() })
      .eq('id', profile.id)
    profile.jobs_posted_this_month = 0
  }

  let total_fee = 0
  const fee_breakdown: string[] = []

  // 1. Check if job post fee applies
  if ((profile.jobs_posted_this_month || 0) >= FREE_JOB_LIMIT) {
    total_fee += JOB_POST_FEE
    fee_breakdown.push('Job Post: ₦500')
  }

  // 2. Urgent fee
  if (is_urgent) {
    total_fee += URGENT_FEE
    fee_breakdown.push('Urgent Tag: ₦1,500')
  }

  // 3. Featured fee
  if (is_featured) {
    total_fee += FEATURED_FEE
    fee_breakdown.push('Featured Boost: ₦2,000')
  }

  // 4. Check wallet and deduct if needed
  if (total_fee > 0) {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('profile_id', profile.id)
      .single()

    if (!wallet || wallet.balance < total_fee) {
      throw new Error(`Insufficient balance. You need ₦${total_fee} to post this job. Top up wallet.`)
    }

    // Deduct fees
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ balance: wallet.balance - total_fee })
      .eq('profile_id', profile.id)

    if (walletError) throw walletError

    // Log transaction
    await supabase.from('transactions').insert({
      profile_id: profile.id,
      amount: -total_fee,
      type: 'job_post_fee',
      description: `Job posting fees: ${fee_breakdown.join(', ')}`,
      status: 'completed'
    })
  }

  // 5. Calculate featured expiry
  const featured_expires_at = is_featured 
    ? new Date(Date.now() + FEATURED_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString()
    : null

  // 6. Create job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      employer_id: profile.id,
      title,
      description,
      budget,
      category,
      is_urgent,
      is_featured,
      featured_expires_at,
      stage: 'open',
      platform_fee_percent: PLATFORM_COMMISSION_RATE
    })
    .select('id') // using id instead of job_id
    .single()

  if (jobError) throw jobError

  // 7. Increment job counter
  await supabase
    .from('profiles')
    .update({ jobs_posted_this_month: (profile.jobs_posted_this_month || 0) + 1 })
    .eq('id', profile.id)

  revalidatePath('/dashboard/jobs')
  return { success: true, job_id: job.id }
}

export async function acceptBidAndLockFunds(bid_id: string) {
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

  // 1. Get bid + job + employer wallet
  const { data: bid } = await supabase
    .from('bids')
    .select('*, jobs!inner(*), profiles!bids_profile_id_fkey(id)') // Using profile_id
    .eq('id', bid_id)
    .single()

  if (!bid) throw new Error('Bid not found')
  if (bid.jobs.status !== 'open') throw new Error('Job no longer open')

  const { data: employerWallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', bid.jobs.employer_id)
    .single()

  if (!employerWallet || employerWallet.balance < bid.jobs.budget) {
    throw new Error('Insufficient funds. Top up wallet to accept bid and lock Protected Funds.')
  }

  // 2. Move money: Employer wallet -> Protected Funds
  const { error: deductError } = await supabase
    .from('wallets')
    .update({ balance: employerWallet.balance - bid.jobs.budget })
    .eq('profile_id', bid.jobs.employer_id)

  if (deductError) throw deductError

  // 3. Create Protected Funds record
  const { error: escrowError } = await supabase
    .from('protected_funds')
    .insert({
      job_id: bid.job_id,
      employer_id: bid.jobs.employer_id,
      artisan_id: bid.profile_id,
      amount: bid.jobs.budget,
      status: 'locked',
      platform_fee_percent: bid.jobs.platform_fee_percent || PLATFORM_COMMISSION_RATE
    })

  if (escrowError) throw escrowError

  // 4. Update job and bid status
  await supabase
    .from('jobs')
    .update({ stage: 'in_progress', accepted_bid_id: bid_id })
    .eq('id', bid.job_id)

  await supabase
    .from('bids')
    .update({ status: 'accepted' })
    .eq('id', bid_id)

  // Reject all other bids
  await supabase
    .from('bids')
    .update({ status: 'rejected' })
    .eq('job_id', bid.job_id)
    .neq('id', bid_id)

  // 5. Log transaction
  await supabase.from('transactions').insert({
    profile_id: bid.jobs.employer_id,
    amount: -bid.jobs.budget,
    type: 'escrow_lock',
    description: `Protected Funds locked for job: ${bid.jobs.title}`,
    status: 'completed'
  })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function releaseProtectedFunds(job_id: string) {
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

  // 1. Get escrow record
  const { data: escrow } = await supabase
    .from('protected_funds')
    .select('*, jobs!inner(*)')
    .eq('job_id', job_id)
    .eq('status', 'locked')
    .single()

  if (!escrow) throw new Error('No locked funds for this job')
  if (escrow.jobs.employer_id !== user.id) throw new Error('Only employer can release funds')

  const commission = Math.floor(escrow.amount * (escrow.platform_fee_percent || PLATFORM_COMMISSION_RATE))
  const artisan_payout = escrow.amount - commission

  // 2. Pay artisan
  const { data: artisanWallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', escrow.artisan_id)
    .single()

  await supabase
    .from('wallets')
    .update({ balance: (artisanWallet?.balance || 0) + artisan_payout })
    .eq('profile_id', escrow.artisan_id)

  // 3. Log artisan payout
  await supabase.from('transactions').insert({
    profile_id: escrow.artisan_id,
    amount: artisan_payout,
    type: 'job_payout',
    description: `Payment for job: ${escrow.jobs.title}`,
    status: 'completed'
  })

  // 4. Log platform commission
  await supabase.from('transactions').insert({
    profile_id: escrow.employer_id,
    amount: -commission,
    type: 'platform_fee',
    description: `10% platform fee for job: ${escrow.jobs.title}`,
    status: 'completed'
  })

  // 5. Update records
  await supabase
    .from('protected_funds')
    .update({ status: 'released', released_at: new Date().toISOString() })
    .eq('job_id', job_id)

  await supabase
    .from('jobs')
    .update({ stage: 'completed' })
    .eq('id', job_id)

  revalidatePath('/dashboard')
  return { success: true, payout: artisan_payout, fee: commission }
}

export async function purchaseBlueCheck() {
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, is_employer_verified')
    .eq('id', user.id)
    .single()

  if (!profile) throw new Error('Profile not found')
  if (profile.is_employer_verified) throw new Error('Already verified')

  const { data: wallet } = await supabase
    .from('wallets')
    .select('balance')
    .eq('profile_id', profile.id)
    .single()

  if (!wallet || wallet.balance < BLUE_CHECK_FEE) {
    throw new Error('Insufficient balance. Top up ₦3,000 for Blue Check.')
  }

  await supabase
    .from('wallets')
    .update({ balance: wallet.balance - BLUE_CHECK_FEE })
    .eq('profile_id', profile.id)

  await supabase
    .from('profiles')
    .update({ is_employer_verified: true })
    .eq('id', profile.id)

  await supabase.from('transactions').insert({
    profile_id: profile.id,
    amount: -BLUE_CHECK_FEE,
    type: 'blue_check_fee',
    description: 'Employer Blue Check verification',
    status: 'completed'
  })

  revalidatePath('/dashboard')
  return { success: true }
}
