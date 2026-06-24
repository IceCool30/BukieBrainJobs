import { createBrowserClient } from '@supabase/ssr';

let supabaseBrowserClient: any = null;

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

  const isIframeEnv = typeof window !== 'undefined' && window.location.hostname.endsWith('.run.app');

  supabaseBrowserClient = createBrowserClient(url, key, isIframeEnv ? {
    cookieOptions: {
      sameSite: 'none',
      secure: true,
    },
  } : undefined);
  return supabaseBrowserClient;
}

export function isSupabaseConfigured() {
  const url = (typeof window !== 'undefined' && (window as any).__SUPABASE_URL__) || 
              process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes('placeholder');
}
