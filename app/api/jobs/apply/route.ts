import { applyToJob } from '@/app/dashboard/jobs/actions';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { jobId, proposedBudget, coverLetter } = await request.json();
  
  if (!jobId || !proposedBudget || !coverLetter) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const result = await applyToJob(jobId, proposedBudget, coverLetter);
  
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  
  return NextResponse.json({ success: true });
}
