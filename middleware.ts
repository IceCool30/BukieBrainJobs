import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder',
    {
      cookies: {
        getAll() {
          return req.cookies.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Fetch session (this also refreshes the browser token if it was near expiration)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();

  // Check route groups and login states
  if (!session) {
    // Restrict access for unauthenticated users
    if (url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/onboarding')) {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  } else {
    // Prevent authenticated users from visiting the login page again
    if (url.pathname === '/login') {
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }

    // Optional Check: If going to the main /dashboard, make sure they have chosen a role
    if (url.pathname === '/dashboard') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile || !profile.role) {
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    }
  }

  return res;
}

// Ensure middleware only intercepts paths it is supposed to handle
export const config = {
  matcher: ['/dashboard', '/onboarding', '/login'],
};
