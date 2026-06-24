'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function applyToJob(jobId: string, proposedBudget: number, coverLetter: string) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() { return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })) },
        setAll(cookiesToSet: any[]) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { error: 'Not authenticated' };
  }

  // 1. PROFILE + WALLET + PASSPORT CHECK
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, bukie_passport_id')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'worker') {
    return { error: 'Only verified artisans can apply to jobs' };
  }

  const { data: passport } = await supabase
    .from('bukie_passports')
    .select('is_verified, nin_verified, face_verified')
    .eq('id', profile.bukie_passport_id)
    .single();

  // BLUE CHECK GATE: Must have at least NIN verified to bid
  if (!passport?.nin_verified) {
    return { error: 'Complete Blue Check verification to apply for jobs' };
  }

  // 2. WALLET + FREE BIDS CHECK
  const { data: wallet } = await supabase
    .from('wallets')
    .select('profile_id, balance, free_bids_remaining')
    .eq('profile_id', user.id)
    .single();

  if (!wallet) {
    return { error: 'Wallet not found' };
  }

  const BID_COST = 100; // ₦100 per bid after free bids used

  if (wallet.free_bids_remaining <= 0 && wallet.balance < BID_COST) {
    return { error: 'Insufficient balance. Top up wallet to continue bidding' };
  }

  // 3. CHECK IF ALREADY APPLIED
  const { data: existingBid } = await supabase
    .from('bids')
    .select('id')
    .eq('job_id', jobId)
    .eq('profile_id', user.id)
    .single();

  if (existingBid) {
    return { error: 'You already applied to this job' };
  }

  // 4. DEDUCT BID: Free bids first, then wallet balance
  let updateData: any = {};
  if (wallet.free_bids_remaining > 0) {
    updateData = { free_bids_remaining: wallet.free_bids_remaining - 1 };
  } else {
    updateData = { balance: wallet.balance - BID_COST };
    // Log transaction for paid bid
    await supabase.from('transactions').insert({
      profile_id: user.id,
      amount: -BID_COST,
      type: 'bid_fee',
      description: `Bid fee for job ${jobId}`
    });
  }

  const { error: walletError } = await supabase
    .from('wallets')
    .update(updateData)
    .eq('profile_id', wallet.profile_id);

  if (walletError) {
    return { error: 'Failed to process bid payment' };
  }

  // 5. CREATE BID RECORD
  const { error: bidError } = await supabase
    .from('bids')
    .insert({
      job_id: jobId,
      profile_id: user.id,
      status: 'pending',
      bukie_passport_id: profile.bukie_passport_id,
      proposed_budget: proposedBudget,
      cover_letter: coverLetter
    });

  if (bidError) {
    // Rollback wallet if bid fails
    await supabase.from('wallets').update({ 
      free_bids_remaining: wallet.free_bids_remaining,
      balance: wallet.balance 
    }).eq('profile_id', wallet.profile_id);
    return { error: 'Failed to submit application' };
  }

  revalidatePath('/dashboard/jobs');
  return { success: true };
}
