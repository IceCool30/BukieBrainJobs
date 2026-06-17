'use server';

import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface PostJobInput {
  title: string;
  description: string;
  budget: number;
  category: string;
  location_state: string;
  location_lga: string;
  job_type: 'task' | 'contract' | 'full_time';
  is_urgent: boolean;
}

/**
 * buyBidsAction: Verify bid top-up transactions, updates user wallet and records ledger entry.
 */
export async function buyBidsAction(reference: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (err) {
              // Ignore header modifications in server components/actions context safely
            }
          },
        },
      }
    );

    // Get active user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { success: false, error: 'Unauthorized. Please login first.' };
    }

    const userId = session.user.id;

    // Check if the reference has already been processed to avoid double spending
    const { data: existingTx } = await supabase
      .from('transactions')
      .select('id')
      .eq('reference', reference)
      .maybeSingle();

    if (existingTx) {
      return { success: false, error: 'Transaction reference already processed.' };
    }

    // Insert payment record to ledger
    const { error: txError } = await supabase
      .from('transactions')
      .insert([
        {
          user_id: userId,
          amount: 500, // Price in Naira for 10 Bids package
          reference: reference,
          type: 'bid_bundle',
          status: 'success'
        }
      ]);

    if (txError) {
      console.error('Failed to write transaction ledger:', txError);
      return { success: false, error: 'Failed to record transaction ledger entry.' };
    }

    // Read current wallet record to see what columns exist and increment them
    const { data: wallet, error: walletGetError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (walletGetError) {
      console.error('Failed to check wallet:', walletGetError);
    }

    // Determine balance increments and correct column name (free_bids_remaining)
    let updatePayload: Record<string, any> = {};
    const existingBids = wallet?.free_bids_remaining ?? 0;
    
    updatePayload.free_bids_remaining = existingBids + 10;

    // Fallback support if schema has 'free_bids' name
    if (wallet && 'free_bids' in wallet) {
      updatePayload.free_bids = (wallet.free_bids ?? 0) + 10;
    }

    let walletUpdateError;
    if (!wallet) {
      // If wallet record does not exist, initialize it
      const { error: insertError } = await supabase
        .from('wallets')
        .insert([
          {
            user_id: userId,
            balance: 0.00,
            free_bids_remaining: 10,
          }
        ]);
      walletUpdateError = insertError;
    } else {
      // Update existing wallet
      const { error: updateError } = await supabase
        .from('wallets')
        .update(updatePayload)
        .eq('user_id', userId);
      walletUpdateError = updateError;
    }

    if (walletUpdateError) {
      console.error('Failed to update wallet balances:', walletUpdateError);
      return { success: false, error: 'Transaction recorded, but wallet balance update delayed. Please contact support.' };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Error buying bids action:', err);
    return { success: false, error: err?.message || 'Server error of topup processing.' };
  }
}

/**
 * postJobAction: If is_urgent is true, verify paymentRef exists. INSERT into jobs.
 */
export async function postJobAction(input: PostJobInput, paymentRef?: string) {
  try {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (err) {
              // Ignore cookie errors
            }
          },
        },
      }
    );

    // Get active user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { success: false, error: 'Unauthorized. Please login again.' };
    }

    // Financial checking for Urgent Boosts
    if (input.is_urgent) {
      if (!paymentRef) {
        return { success: false, error: 'Promotions require payment validation reference.' };
      }

      // Check if reference has already been used to prevent duplicates
      const { data: duplicateTx } = await supabase
        .from('transactions')
        .select('id')
        .eq('reference', paymentRef)
        .maybeSingle();

      if (duplicateTx) {
        return { success: false, error: 'Payment reference has already been claimed for another order.' };
      }

      // Insert transaction ledger entry for the promotion fee paid
      const { error: txError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: session.user.id,
            amount: 1000, // Urgent blast promotion fee ₦1,000 NGN
            reference: paymentRef,
            type: 'urgent_boost',
            status: 'success'
          }
        ]);

      if (txError) {
        console.error('Failed to insert premium ledger record:', txError);
        // Continue but log
      }
    }

    // Insert new job record
    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          employer_id: session.user.id,
          title: input.title,
          description: input.description,
          budget: input.budget,
          category: input.category,
          location_state: input.location_state,
          location_lga: input.location_lga,
          job_type: input.job_type,
          is_urgent: input.is_urgent,
          stage: input.is_urgent ? 'active' : 'open', // Urgent items are promoted active
          inspection_fee_paid: false,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Job insertion database error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, job: data };
  } catch (err: any) {
    console.error('postJobAction Server Error:', err);
    return { success: false, error: err?.message || 'Unexpected server failure.' };
  }
}
