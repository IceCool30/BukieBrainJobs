import { NextRequest, NextResponse } from 'next/server';
import { SignJWT, importJWK } from 'jose';

// Define the shape of our WorkOS user profile
interface WorkOSUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
}

/**
 * POST /api/auth/workos-exchange
 * 
 * Intercepts the WorkOS AuthKit JWT access token, verifies it,
 * and signs a Supabase-compatible JWT containing the 'authenticated' role claim.
 */
export async function POST(req: NextRequest) {
  try {
    const { accessToken } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing WorkOS access token' },
        { status: 400 }
      );
    }

    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!supabaseJwtSecret) {
      console.error('SUPABASE_JWT_SECRET is not configured in the environment');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Step 1: Validate the WorkOS token and fetch the user profile
    // Calling the WorkOS User Management /users/me endpoint is the most robust,
    // secure, and framework-agnostic way to verify the token without manual JWKS handling.
    const workosProfileResponse = await fetch('https://api.workos.com/user_management/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!workosProfileResponse.ok) {
      const errorText = await workosProfileResponse.text();
      console.error('Failed to verify token with WorkOS:', errorText);
      return NextResponse.json(
        { error: 'Invalid or expired WorkOS session' },
        { status: 401 }
      );
    }

    const workosUser: WorkOSUser = await workosProfileResponse.json();

    // Step 2: Build the Supabase-compatible JWT payload
    // We inject the "authenticated" role and audience claims so Supabase's 
    // GoTrue Auth Engine and PostgreSQL Row-Level Security (RLS) treat the token natively.
    const now = Math.floor(Date.now() / 1000);
    const expiration = now + 60 * 60; // 1 hour token lifetime

    const supabasePayload = {
      aud: 'authenticated',
      role: 'authenticated',
      sub: workosUser.id, // Maps to auth.uid() inside Supabase PostgreSQL schema
      email: workosUser.email,
      app_metadata: {
        provider: 'workos',
        providers: ['workos'],
      },
      user_metadata: {
        email: workosUser.email,
        email_verified: true,
        full_name: `${workosUser.firstName || ''} ${workosUser.lastName || ''}`.trim() || undefined,
        avatar_url: workosProfileResponse || undefined,
      },
      iat: now,
      exp: expiration,
    };

    // Step 3: Sign the custom JWT with the SUPABASE_JWT_SECRET
    // Since Supabase's JWT secret can be either a raw string or a hex-encoded key,
    // we handle converting it to a Uint8Array.
    const secretKey = new TextEncoder().encode(supabaseJwtSecret);

    const customSupabaseJwt = await new SignJWT(supabasePayload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(expiration)
      .sign(secretKey);

    // Return the signed Supabase JWT to the client
    return NextResponse.json({
      access_token: customSupabaseJwt,
      user: {
        id: workosUser.id,
        email: workosUser.email,
        firstName: workosUser.firstName,
        lastName: workosUser.lastName,
      },
      expires_in: 3600,
    });

  } catch (error: any) {
    console.error('Error during token exchange:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
