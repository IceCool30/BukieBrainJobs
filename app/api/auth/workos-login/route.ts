import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const next = searchParams.get('next') || '/';

  const clientId = process.env.WORKOS_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_WORKOS_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    console.error('WorkOS variables missing for redirect initialization:', {
      clientId: !!clientId,
      redirectUri: !!redirectUri,
    });
    return NextResponse.redirect(new URL('/login?error=auth_failed&details=Server+misconfigured', req.url));
  }

  // Construct target redirection URL for WorkOS AuthKit
  const workosUrl = new URL('https://api.workos.com/user_management/authorize');
  workosUrl.searchParams.set('client_id', clientId);
  workosUrl.searchParams.set('redirect_uri', redirectUri);
  workosUrl.searchParams.set('response_type', codeForExchange(next));
  
  function codeForExchange(target: string) {
    // We can pass target redirection state down or redirect directly
    return 'code';
  }

  // State parameter can carry user next destination path
  workosUrl.searchParams.set('state', next);

  return NextResponse.redirect(workosUrl);
}
