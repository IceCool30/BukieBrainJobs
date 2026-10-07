import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthScreen from '../../components/auth/AuthScreen';

export const metadata: Metadata = {
  title: 'Verify Phone Number | BukieBrainJobs',
  description: 'Enter your 6-digit verification code to access your BukieBrainJobs account.',
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--text-main)] border-t-transparent" />
        </div>
      }
    >
      <AuthScreen initialMode="phone_otp" />
    </Suspense>
  );
}
