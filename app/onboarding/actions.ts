'use server'

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function setUserRole(
  role: 'employer' | 'worker',
  fullName?: string,
  state?: string,
  lga?: string,
  phone?: string,
  redirectTo?: string
) {
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
    return redirect('/login?error=not_authenticated');
  }

  // Check if profile exists. If missing, initialize wallet, passport and profile dynamically.
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle();

  if (!existingProfile) {
    console.log('Profile missing during onboarding. Dynamically creating records for:', user.id);
    const supabaseAdmin = createClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
      (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
    );

    // Create wallet with 5 free bids
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .insert({ 
        profile_id: user.id,
        balance: 0, 
        free_bids_remaining: 5 
      });
    if (walletError) console.error('Onboarding wallet creation error:', walletError);

    // Create empty BukiePassport
    const { data: passport, error: passportError } = await supabaseAdmin
      .from('bukie_passports')
      .insert({ profile_id: user.id })
      .select('id')
      .single();
    if (passportError) console.error('Onboarding passport creation error:', passportError);

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ 
        id: user.id, 
        role: role,
        full_name: fullName || null,
        location_state: state || null,
        location_lga: lga || null,
        phone: phone || null,
        bukie_passport_id: passport?.id || null 
      });
    
    if (profileError) {
      console.error('Onboarding profile creation failed:', profileError);
      return redirect('/onboarding?error=create_profile_failed');
    }
  } else {
    // Update role and other profile attributes
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: role,
        full_name: fullName || undefined,
        location_state: state || undefined,
        location_lga: lga || undefined,
        phone: phone || undefined,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Role update failed:', updateError);
      return redirect('/onboarding?error=update_failed');
    }
  }

  // Route based on role
  if (redirectTo && (redirectTo.startsWith('/') || redirectTo.startsWith('http'))) {
    redirect(redirectTo);
  } else if (role === 'worker') {
    redirect('/dashboard/passport-setup'); // Artisan goes to Blue Check setup
  } else {
    redirect('/dashboard'); // Employer goes to post jobs
  }
}
