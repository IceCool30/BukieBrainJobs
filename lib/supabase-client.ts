import { createBrowserClient } from '@supabase/ssr';

let supabaseBrowserClient: any = null;

export function getCookieOptions(hostname: string) {
  const isIframeEnv = hostname.endsWith('.run.app');
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  return {
    path: '/',
    sameSite: (isIframeEnv ? 'none' : 'lax') as 'none' | 'lax',
    secure: isIframeEnv || !isLocalhost,
    maxAge: 604800, // 7 days in seconds
  };
}

export function getSupabaseBrowserClient() {
  if (supabaseBrowserClient) {
    return supabaseBrowserClient;
  }

  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) || 
              process.env.NEXT_PUBLIC_SUPABASE_URL || 
              'https://placeholder.supabase.co';
              
  const key = (typeof window !== 'undefined' && (window as any).__SUPABASE_ANON_KEY__) || 
              process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
              'placeholder';

  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const cookieOptions = getCookieOptions(hostname);

  supabaseBrowserClient = createBrowserClient(url, key, {
    cookieOptions,
  });
  return supabaseBrowserClient;
}

export function isSupabaseConfigured() {
  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) || 
              process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('placeholder');
}
