import { Suspense } from 'react';
import DashboardScreen from '../../components/dashboard/DashboardScreen';

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardScreen />
    </Suspense>
  );
}
