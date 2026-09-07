import { Suspense } from 'react';
import JobsScreen from '../../components/jobs/JobsScreen';

export default function JobsPage() {
  return (
    <Suspense>
      <JobsScreen />
    </Suspense>
  );
}
