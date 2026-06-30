import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setUserRole } from './actions';
import { RoleSelectionForm } from './RoleSelectionForm';

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  let nextUrl = typeof searchParams?.next === 'string' ? searchParams.next : undefined;
  if (nextUrl && (nextUrl.includes('/onboarding') || nextUrl.includes('/login'))) {
    nextUrl = undefined;
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
    redirect('/login');
  }

  // Check if role already set. If yes, skip onboarding.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role) {
    redirect(nextUrl || '/dashboard');
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center py-12 px-4">
      <RoleSelectionForm 
        fullName={profile?.full_name} 
        nextUrl={nextUrl}
        setUserRole={setUserRole} 
      />
    </div>
  );
}
