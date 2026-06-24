'use server'

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function setUserRole(role: 'employer' | 'worker') {
  const cookieStore = cookies();
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return redirect('/?error=not_authenticated');
  }

  // Update role only. Passport already exists from auth callback.
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ role: role })
    .eq('id', user.id); // profiles.id = auth.users.id = profile_id

  if (updateError) {
    console.error('Role update failed:', updateError);
    return redirect('/onboarding?error=update_failed');
  }

  // Route based on role
  if (role === 'worker') {
    redirect('/dashboard/passport-setup'); // Artisan goes to Blue Check setup
  } else {
    redirect('/dashboard'); // Employer goes to post jobs
  }
}
