import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { applyToJob } from './actions';
import JobCard from './JobCard'; // You'll build this UI component

export default async function JobsDashboard() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'),
    {
      cookies: {
        getAll() { return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value })) },
        setAll(cookiesToSet: any[]) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'worker') {
    redirect('/dashboard'); // Only artisans see job feed
  }

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, description, budget, location_state, location_lga, created_at, employer:profiles(full_name)')
    .eq('stage', 'open')
    .order('created_at', { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Available Jobs</h1>
      <div className="grid gap-4">
        {jobs?.map((job) => (
          <JobCard key={job.id} job={job} applyAction={applyToJob} />
        ))}
      </div>
    </div>
  );
}
