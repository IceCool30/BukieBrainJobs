import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { createClient } from '@supabase/supabase-js';
import { getCookieOptions } from '@/lib/supabase-client';

// Helper to extract the project reference from Supabase URL for cookie naming
function getProjectRef(url: string | undefined): string {
  if (!url) return 'placeholder';
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split('.');
    return parts[0] || 'placeholder';
  } catch (e) {
    return 'placeholder';
  }
}

interface WorkOSUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
}

interface WorkOSAuthResponse {
  user: WorkOSUser;
  access_token: string;
  refresh_token?: string;
}

const supabaseAdmin = createClient(
  (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
  (process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder')
);

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const next = state || searchParams.get('next') || '/';

  if (!code) {
    console.error('WorkOS code parameter is missing from request');
    return NextResponse.redirect(new URL('/login?error=missing_code', req.url));
  }

  try {
    const clientId = process.env.WORKOS_CLIENT_ID;
    const apiKey = process.env.WORKOS_API_KEY;
    const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI;

    if (!clientId || !apiKey || !redirectUri) {
      console.error('Missing required WorkOS configuration in environment:', {
        clientId: !!clientId,
        apiKey: !!apiKey,
        redirectUri: !!redirectUri
      });
      return NextResponse.redirect(new URL('/login?error=auth_failed&details=Server+misconfigured', req.url));
    }

    // 1. Exchange the auth code with WorkOS User Management API
    const response = await fetch('https://api.workos.com/user_management/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: apiKey,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to exchange code with WorkOS:', errorText);
      return NextResponse.redirect(new URL(`/login?error=auth_failed&details=${encodeURIComponent('WorkOS authentication failed')}`, req.url));
    }

    const authData: WorkOSAuthResponse = await response.json();
    const { user: workosUser } = authData;

    if (!workosUser || !workosUser.id || !workosUser.email) {
      console.error('Invalid user payload received from WorkOS:', authData);
      return NextResponse.redirect(new URL('/login?error=auth_failed&details=Invalid+user+payload', req.url));
    }

    // 2. Automated User Syncing & Profile Initialization (No manual admin work needed!)
    const { data: profile, error: profileFetchError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, bukie_passport_id')
      .eq('id', workosUser.id)
      .maybeSingle();

    if (profileFetchError) {
      console.error('Error checking user profile in database:', profileFetchError);
    }

    let hasRole = !!profile?.role;

    if (!profile) {
      console.log('Automated Sync: New WorkOS user signup. Provisioning database records for:', workosUser.id);

      // Create wallet with 5 free bids (per application rule)
      const { error: walletError } = await supabaseAdmin
        .from('wallets')
        .insert({ 
          profile_id: workosUser.id,
          balance: 0, 
          free_bids_remaining: 5 
        });
      if (walletError) {
        console.error('Failed to provision wallet during automated sync:', walletError);
      }

      // Create an empty BukiePassport for security/Blue Check setup
      const { data: passport, error: passportError } = await supabaseAdmin
        .from('bukie_passports')
        .insert({ profile_id: workosUser.id })
        .select('id')
        .single();
      if (passportError) {
        console.error('Failed to provision passport during automated sync:', passportError);
      }

      // Create profile stub
      const fullName = `${workosUser.first_name || ''} ${workosUser.last_name || ''}`.trim() || null;
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({ 
          id: workosUser.id, 
          full_name: fullName,
          avatar_url: workosUser.profile_picture_url || null,
          bukie_passport_id: passport?.id || null 
        });
      
      if (profileError) {
        console.error('Failed to provision profile during automated sync:', profileError);
      }
    }

    // 3. Draft & Sign a Supabase-compatible JWT using our SUPABASE_JWT_SECRET
    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!supabaseJwtSecret) {
      throw new Error('SUPABASE_JWT_SECRET environment variable is missing.');
    }

    const now = Math.floor(Date.now() / 1000);
    const expiration = now + 60 * 60 * 24 * 7; // 7 days token matching standard session

    const supabasePayload = {
      aud: 'authenticated',
      role: 'authenticated',
      sub: workosUser.id,
      email: workosUser.email,
      app_metadata: {
        provider: 'workos',
        providers: ['workos'],
      },
      user_metadata: {
        email: workosUser.email,
        email_verified: true,
        full_name: `${workosUser.first_name || ''} ${workosUser.last_name || ''}`.trim() || undefined,
        avatar_url: workosUser.profile_picture_url || undefined,
      },
      iat: now,
      exp: expiration,
    };

    const secretKey = new TextEncoder().encode(supabaseJwtSecret);
    const customSupabaseJwt = await new SignJWT(supabasePayload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(expiration)
      .sign(secretKey);

    // 4. Construct the standard Supabase Auth Session structure
    const sessionObj = {
      access_token: customSupabaseJwt,
      refresh_token: authData.refresh_token || 'workos_placeholder_refresh_token',
      expires_in: 604800,
      token_type: 'bearer',
      user: {
        id: workosUser.id,
        aud: 'authenticated',
        role: 'authenticated',
        email: workosUser.email,
        email_verified: true,
        phone: '',
        app_metadata: {
          provider: 'workos',
          providers: ['workos']
        },
        user_metadata: {
          email: workosUser.email,
          email_verified: true,
          full_name: `${workosUser.first_name || ''} ${workosUser.last_name || ''}`.trim() || undefined,
          avatar_url: workosUser.profile_picture_url || undefined,
        },
        identities: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    // 5. Serialize and set cookie so the client & middleware instantly pick it up
    const projectRef = getProjectRef(process.env.NEXT_PUBLIC_SUPABASE_URL);
    const cookieName = `sb-${projectRef}-auth-token`;
    const cookieOptions = getCookieOptions(req.nextUrl.hostname);

    const redirectPath = hasRole 
      ? (next === '/' ? '/dashboard' : next) 
      : `/onboarding?next=${encodeURIComponent(next === '/' ? '/dashboard' : next)}`;
      
    const responseRedirect = NextResponse.redirect(new URL(redirectPath, req.url));

    responseRedirect.cookies.set(cookieName, JSON.stringify([
      sessionObj.access_token,
      sessionObj.refresh_token,
      sessionObj.expires_in,
      sessionObj.token_type,
      JSON.stringify(sessionObj.user)
    ]), {
      ...cookieOptions,
      maxAge: 604800,
    });

    return responseRedirect;

  } catch (error: any) {
    console.error('Exception during WorkOS callback processing:', error);
    return NextResponse.redirect(new URL(`/login?error=auth_failed&details=${encodeURIComponent(error.message)}`, req.url));
  }
}
