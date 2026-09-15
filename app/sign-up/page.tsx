import type { Metadata } from 'next';
import AuthPage from '@/components/auth/AuthPage';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Login & Signup | Shree Krushna Travels',
  description: 'Log in or sign up to your account to track your rides, view past invoices, or manage system bookings.',
};

export default function AuthPageRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <AuthPage />
    </Suspense>
  );
}
