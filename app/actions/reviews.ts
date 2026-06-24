'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createReview(formData: FormData) {
  const job_id = formData.get('job_id') as string
  const artisan_id = formData.get('artisan_id') as string
  const rating = Number(formData.get('rating'))
  const comment = formData.get('comment') as string

  if (!job_id || !artisan_id || !rating || rating < 1 || rating > 5) {
    throw new Error('Missing required review fields')
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check if job is completed and user is employer
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('stage, employer_id')
    .eq('id', job_id)
    .single()

  if (jobError || !job) throw new Error('Job not found')
  if (job.stage !== 'completed') throw new Error('Job must be completed to leave a review')
  if (job.employer_id !== user.id) throw new Error('Only the employer can leave a review')

  // Check if employer is verified
  const { data: employerProfile } = await supabase
    .from('profiles')
    .select('is_employer_verified')
    .eq('id', user.id)
    .single()

  const is_blue_check_reviewer = employerProfile?.is_employer_verified || false

  // Insert review
  const { error: insertError } = await supabase
    .from('reviews')
    .insert({
      job_id,
      employer_id: user.id,
      artisan_id,
      rating,
      comment,
      is_blue_check_reviewer
    })

  if (insertError) {
    if (insertError.code === '23505') {
      throw new Error('You have already reviewed this job')
    }
    throw new Error('Failed to create review: ' + insertError.message)
  }

  revalidatePath(`/p/${artisan_id}`)
  return { success: true }
}

export async function getArtisanProfile(artisan_id: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role, avg_rating, jobs_completed, dispute_strikes')
    .eq('id', artisan_id)
    .single()

  if (error || !profile) {
    throw new Error('Artisan not found')
  }

  const { data: passport } = await supabase
    .from('bukie_passports')
    .select('bio, skills, is_verified, hourly_rate')
    .eq('profile_id', artisan_id)
    .maybeSingle()

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      is_blue_check_reviewer,
      employer:profiles!reviews_employer_id_fkey(full_name, avatar_url)
    `)
    .eq('artisan_id', artisan_id)
    .order('created_at', { ascending: false })
    .limit(10)

  return {
    profile,
    passport,
    reviews: reviews || []
  }
}
