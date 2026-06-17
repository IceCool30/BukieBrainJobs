'use server';

import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export interface CreateJobInput {
  title: string;
  description: string;
  budget: number;
  category: string;
  location_state: string;
  location_lga: string;
  job_type: 'task' | 'contract' | 'full_time';
  is_urgent: boolean;
}

export async function createJob(input: CreateJobInput) {
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
              // Ignore setAll exceptions in Server Actions headers block
            }
          },
        },
      }
    );

    // Get active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return { success: false, error: 'Unauthorized. Please login again.' };
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
          stage: 'open',
          inspection_fee_paid: false,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database insertion error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, job: data };
  } catch (err: any) {
    console.error('Server action error:', err);
    return { success: false, error: err?.message || 'Failed to post job' };
  }
}
