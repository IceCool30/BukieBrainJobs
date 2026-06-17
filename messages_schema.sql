-- TASK 1: DATABASE UPDATE (SQL) for messaging.
-- Paste and run this SQL script in your Supabase SQL Editor.

-- Ensure the hired/assigned worker column exists on jobs table first
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS selected_worker_id UUID REFERENCES public.profiles(id);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- If policies already exist, drop them first to allow clean re-runs
DROP POLICY IF EXISTS "Users can insert and read their own messages" ON public.messages;
DROP POLICY IF EXISTS "Employers and selected workers can read job messages" ON public.messages;

-- Policy 1: Enable Read/Insert for users where auth.uid() equals sender_id.
CREATE POLICY "Users can insert and read their own messages"
  ON public.messages
  FOR ALL
  TO authenticated
  USING (auth.uid() = sender_id)
  WITH CHECK (auth.uid() = sender_id);

-- Policy 2: Enable Read for users who are the employer_id OR the selected worker for the linked Job.
CREATE POLICY "Employers and selected workers can read job messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT employer_id 
      FROM public.jobs 
      WHERE id = messages.job_id
    )
    OR
    auth.uid() IN (
      SELECT selected_worker_id 
      FROM public.jobs 
      WHERE id = messages.job_id
    )
  );

-- Enable Realtime replication for the messages table if not already added
-- We check if publication exists or handle gracefully
alter publication supabase_realtime add table messages;
