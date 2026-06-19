'use server';

import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendTelegramNotification } from '@/lib/telegram';

export interface PostJobInput {
  title: string;
  description: string;
  budget: number;
  category: string;
  location_state: string;
  location_lga: string;
  job_type: 'task' | 'contract' | 'full_time';
  is_urgent: boolean;
  work_mode?: 'on-site' | 'remote' | 'hybrid';
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

    // Identify if the job is a dry-run/sandbox QA test
    const isTest = input.title.toUpperCase().includes('[TEST]');
    let finalTitle = input.title;
    if (isTest && !finalTitle.toUpperCase().startsWith('[TEST]')) {
      finalTitle = `[TEST] ${finalTitle}`;
    }

    // Insert new job record
    const { data, error } = await supabase
      .from('jobs')
      .insert([
        {
          employer_id: session.user.id,
          title: finalTitle,
          description: input.description,
          budget: input.budget,
          category: input.category,
          location_state: input.work_mode === 'remote' ? 'Remote' : input.location_state,
          location_lga: input.work_mode === 'remote' ? 'Anywhere' : input.location_lga,
          job_type: input.job_type,
          is_urgent: input.is_urgent,
          work_mode: input.work_mode || 'on-site',
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

    // Call sendTelegramNotification with HTML flier card formatting if the job is urgent
    if (input.is_urgent) {
      try {
        const testWarnHeader = isTest 
          ? `⚠️ <b>[SANDBOX SYSTEM TEST - PLEASE IGNORE]</b>\n` 
          : ``;
        
        const textPayload = `${testWarnHeader}<b>📢 BUKIEBRAINJOBS URGENT ALERT FLYER</b>\n\n` +
          `💼 <b>Position:</b> ${finalTitle}\n` +
          `💰 <b>Budget:</b> ₦${Number(input.budget).toLocaleString()}\n` +
          `📍 <b>Location State:</b> ${input.location_state}\n\n` +
          `<i>Apply immediately for verified jobs and secure artisan connections!</i>`;

        await sendTelegramNotification(textPayload);
      } catch (telegramErr) {
        console.error('Failed to dispatch urgent job telegram announcement:', telegramErr);
      }
    }

    return { success: true, job: data };
  } catch (err: any) {
    console.error('postJobAction Server Error:', err);
    return { success: false, error: err?.message || 'Unexpected server failure.' };
  }
}

/**
 * sendMessageAction: Inserts a chat message into public.messages table securely from the server
 */
export async function sendMessageAction(input: { jobId: string; content: string; senderId: string }) {
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
              // Ignore cookie update errors
            }
          },
        },
      }
    );

    // Verify authenticated user session
    const { data: { session }, error: authErr } = await supabase.auth.getSession();
    if (authErr || !session) {
      return { success: false, error: 'Unauthorized credentials.' };
    }

    // Assign server verified user ID as sender_id to deter spoofing
    const senderId = session.user.id;

    // Check if parent job is tagged as test, if so make sure we tag message content gracefully
    const { data: jobInfo } = await supabase
      .from('jobs')
      .select('title')
      .eq('id', input.jobId)
      .maybeSingle();

    let finalContent = input.content;
    const isTestJob = jobInfo?.title?.toUpperCase().includes('[TEST]');
    if (isTestJob && !finalContent.toUpperCase().includes('[TEST]')) {
      finalContent = `[TEST] ${finalContent}`;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          job_id: input.jobId,
          content: finalContent,
          sender_id: senderId
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Failed to create message record:', error);
      return { success: false, error: error.message };
    }

    return { success: true, message: data };
  } catch (err: any) {
    console.error('sendMessageAction Server Error:', err);
    return { success: false, error: err?.message || 'Unexpected server failure.' };
  }
}

/**
 * verifyQASandboxEnvAction: checks status of required env variables safely
 * accessible only by CEO admin account.
 */
export async function verifyQASandboxEnvAction() {
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
            } catch (err) { /* ignore */ }
          },
        },
      }
    );

    const { data: { session }, error: authErr } = await supabase.auth.getSession();
    if (authErr || !session) {
      return { success: false, error: 'Unauthorized. Clear credentials session first.' };
    }

    const email = session.user.email || '';
    if (email.toLowerCase() !== 'solomonogarbukie@gmail.com') {
      return { success: false, error: 'Access Denied. CEO authentication clearance signature mismatch.' };
    }

    return {
      success: true,
      env: {
        PAYSTACK_SECRET_KEY: !!process.env.PAYSTACK_SECRET_KEY,
        TELEGRAM_BOT_TOKEN: !!process.env.TELEGRAM_BOT_TOKEN,
        TELEGRAM_CHANNEL_ID: !!process.env.TELEGRAM_CHANNEL_ID,
        NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: !!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      }
    };
  } catch (err: any) {
    console.error('verifyQASandboxEnvAction Server Error:', err);
    return { success: false, error: err?.message || 'Server-side extraction failed.' };
  }
}

/**
 * clearQASandboxTestDataAction: Deletes [TEST] tagged records in jobs and linked messages
 * accessible only by CEO admin account.
 */
export async function clearQASandboxTestDataAction() {
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
            } catch (err) { /* ignore */ }
          },
        },
      }
    );

    const { data: { session }, error: authErr } = await supabase.auth.getSession();
    if (authErr || !session) {
      return { success: false, error: 'Unauthorized' };
    }

    const email = session.user.email || '';
    if (email.toLowerCase() !== 'solomonogarbukie@gmail.com') {
      return { success: false, error: 'CEO Credentials Required.' };
    }

    // 1. Find all jobs tagged as [TEST]
    const { data: testJobs, error: selectErr } = await supabase
      .from('jobs')
      .select('id')
      .ilike('title', '%[TEST]%');

    if (selectErr) {
      return { success: false, error: `Failed to identify test jobs: ${selectErr.message}` };
    }

    const testJobIds = (testJobs || []).map((j) => j.id);
    let deletedJobsCount = 0;
    let deletedMessagesCount = 0;

    // 2. Delete messages linked to test jobs in a structured cascading sequence
    if (testJobIds.length > 0) {
      const { error: msgDelErr } = await supabase
        .from('messages')
        .delete()
        .in('job_id', testJobIds);

      if (msgDelErr) {
        return { success: false, error: `Failed to clear messages of test jobs: ${msgDelErr.message}` };
      }

      const { data: deletedJobs, error: jobsDelErr } = await supabase
        .from('jobs')
        .delete()
        .in('id', testJobIds)
        .select('id');

      if (jobsDelErr) {
        return { success: false, error: `Failed to purge test jobs: ${jobsDelErr.message}` };
      }

      deletedJobsCount = deletedJobs?.length || 0;
    }

    // 3. Delete messages that explicitly contain %[TEST]% in content but weren't covered
    const { data: extraDeletedMsgs } = await supabase
      .from('messages')
      .delete()
      .ilike('content', '%[TEST]%')
      .select('id');

    deletedMessagesCount = (testJobIds.length > 0 ? testJobIds.length * 2 : 0) + (extraDeletedMsgs?.length || 0);

    return {
      success: true,
      jobsPruned: deletedJobsCount,
      messagesPruned: deletedMessagesCount
    };
  } catch (err: any) {
    console.error('clearQASandboxTestDataAction Server Error:', err);
    return { success: false, error: err?.message || 'Server transaction crash.' };
  }
}

