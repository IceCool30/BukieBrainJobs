import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthScreen from '../../components/auth/AuthScreen';

export const metadata: Metadata = {
  title: 'Sign In | BukieBrainJobs',
  description: 'Sign in to your BukieBrainJobs account to manage your bookings and service requests.',
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
        </div>
      }
    >
      <AuthScreen initialMode="signin" />
    </Suspense>
  );
}
