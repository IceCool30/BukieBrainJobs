import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthScreen from '../../components/auth/AuthScreen';

export const metadata: Metadata = {
  title: 'Reset Password | BukieBrainJobs',
  description: 'Set a new password for your BukieBrainJobs account.',
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#F8F9FF]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#001A41] border-t-transparent" />
        </div>
      }
    >
      <AuthScreen initialMode="reset_password" />
    </Suspense>
  );
}
