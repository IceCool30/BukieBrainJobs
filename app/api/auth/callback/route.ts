import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder') // Service role needed to create wallets/passports
);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', request.url));
  }

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
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, {
                ...options,
                sameSite: 'none',
                secure: true,
              })
            );
          } catch (err) {
            // Ignore for Server Components
          }
        },
      },
      cookieOptions: {
        sameSite: 'none',
        secure: true,
      },
    }
  );

  // 1. Exchange code for session
  const { data: authData, error: authError } = await supabase.auth.exchangeCodeForSession(code);
  
  if (authError || !authData.user) {
    console.error('Auth exchange failed:', authError);
    return NextResponse.redirect(new URL('/login?error=auth_failed', request.url));
  }

  const userId = authData.user.id;

  // 2. Check if profile exists. If not, this is first login
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, role, bukie_passport_id')
    .eq('id', userId)
    .single();

  // 3. FIRST LOGIN: Create wallet + passport + profile stub
  if (!profile) {
    console.log('First login detected. Creating wallet and passport for:', userId);
    
    // Create wallet with 5 free bids per Bible rule
    const { error: walletError } = await supabaseAdmin
      .from('wallets')
      .insert({ 
        profile_id: userId,
        balance: 0, 
        free_bids_remaining: 5 
      });
    
    if (walletError) console.error('Wallet creation failed:', walletError);

    // Create empty BukiePassport for Blue Check
    const { data: passport, error: passportError } = await supabaseAdmin
      .from('bukie_passports')
      .insert({ profile_id: userId })
      .select('id')
      .single();
    
    if (passportError) console.error('Passport creation failed:', passportError);

    // Create profile stub and link passport
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ 
        id: userId, 
        bukie_passport_id: passport?.id || null 
      });
    
    if (profileError) console.error('Profile creation failed:', profileError);

    // Force to onboarding for role selection
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 4. RETURNING USER: Smart routing based on profile status
  if (!profile.role) {
    // User exists but never picked role. Send to onboarding.
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // 5. VERIFIED USER: Go to dashboard
  return NextResponse.redirect(new URL(next === '/' ? '/dashboard' : next, request.url));
}
