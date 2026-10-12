import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthScreen from '../../components/auth/AuthScreen';

export const metadata: Metadata = {
  title: 'Forgot Password | BukieBrainJobs',
  description: 'Recover access to your BukieBrainJobs account.',
};

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[var(--bg)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--amber)] border-t-transparent" />
        </div>
      }
    >
      <AuthScreen initialMode="forgot_password" />
    </Suspense>
  );
}
