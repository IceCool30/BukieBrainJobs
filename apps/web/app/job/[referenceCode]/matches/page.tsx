import { Suspense } from 'react';
import type { Metadata } from 'next';
import MatchResultsScreen from '../../../../components/matching/MatchResultsScreen';

/**
 * WEB-012: Customer Job Matching route.
 *
 * Route: /job/[referenceCode]/matches
 *
 * The referenceCode segment uses the durable human-readable reference code
 * (e.g. REQ-84920), not the internal UUID, per the WEB-012 URL contract.
 *
 * Route parameters are treated as untrusted input by MatchResultsScreen and
 * the matching repository. No server-side data fetching occurs in this phase;
 * the mock adapter runs client-side behind the IMatchingRepository interface.
 */

interface Props {
  params: Promise<{ referenceCode: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { referenceCode } = await params;
  return {
    title: `Match Results: ${referenceCode} | BukieBrainJobs`,
    description: 'Review BrainWorkers who may be a good fit for your job request.',
    robots: { index: false, follow: false },
  };
}

export default async function MatchResultsPage({ params }: Props) {
  const { referenceCode } = await params;

  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen bg-[#f8f9ff] flex items-center justify-center"
          aria-busy="true"
          aria-label="Loading match results"
        >
          <div className="h-8 w-8 rounded-full border-2 border-[#001A41] border-t-transparent animate-spin" />
        </div>
      }
    >
      <MatchResultsScreen referenceCode={referenceCode} />
    </Suspense>
  );
}
