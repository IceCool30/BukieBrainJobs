import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setUserRole } from './actions';

export default async function OnboardingPage() {
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
              cookieStore.set(name, value, options)
            );
          } catch (err) {
            // Ignore for server components
          }
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  // Check if role already set. If yes, skip onboarding.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-2">Welcome {profile?.full_name || 'to BukieBrainJobs'}</h1>
      <p className="text-muted-foreground mb-8">Choose how you want to use the platform</p>
      
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <form action={async () => {
          'use server';
          await setUserRole('employer');
        }}>
          <button type="submit" className="border rounded-lg p-6 text-left hover:border-primary w-full">
            <h2 className="text-xl font-semibold">I want to hire</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Post jobs and hire verified artisans. Your payments are secured by Protected Funds.
            </p>
          </button>
        </form>

        <form action={async () => {
          'use server';
          await setUserRole('worker');
        }}>
          <button type="submit" className="border rounded-lg p-6 text-left hover:border-primary w-full">
            <h2 className="text-xl font-semibold">I want to work</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Find jobs and get paid. Complete your Blue Check to build trust and win more gigs.
            </p>
          </button>
        </form>
      </div>
    </div>
  );
}
