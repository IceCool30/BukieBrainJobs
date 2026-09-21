import { Suspense } from 'react';
import ProfileScreen from '../../components/profile/ProfileScreen';

export const metadata = {
  title: 'Customer Profile & Settings | BukieBrainJobs',
  description: 'Manage your personal information, saved service addresses, credentials, and notification settings.',
};

export default function ProfilePage() {
  return (
    <Suspense>
      <ProfileScreen />
    </Suspense>
  );
}
