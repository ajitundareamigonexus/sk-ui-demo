'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { getCurrentUser } from '@/lib/authStore';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthMode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/my-bookings';

  const [mode, setMode] = useState<AuthMode>('login');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirect);
      }
    }
  }, [router, redirect]);

  // Shared resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setResendCooldown(0);
  };

  return (
    <section className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-28 relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-35 dark:opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.25) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-35 dark:opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.2) 0%, transparent 70%)' }}
        />
      </div>

      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_1fr] gap-10 items-center relative z-10">
        {/* Left branding panel */}
        <div className="space-y-6 lg:pr-6">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck size={32} className="text-teal-400" />
            <span className="text-3xl font-black text-primary tracking-wide">Shree Krushna Travels</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black leading-tight">
            Premium travel starts with a <span className="text-teal-400">secure account</span>
          </h1>
          <p className="text-muted leading-relaxed text-sm">
            Sign in with your email using a secure OTP. No passwords needed — quick, safe, and easy access
            to track your rides, view bookings, and manage your travel.
          </p>
        </div>

        {/* Right form card */}
        <div className="rounded-3xl border border-card-border bg-card p-8 shadow-lg relative">
          {/* Tab switcher */}
          <div className="flex border-b border-border mb-6 mt-4">
            <button
              onClick={() => handleModeSwitch('login')}
              type="button"
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${mode === 'login' ? 'border-primary text-foreground' : 'border-transparent text-muted'
                }`}
            >
              Log In
            </button>
            <button
              onClick={() => handleModeSwitch('register')}
              type="button"
              className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all ${mode === 'register' ? 'border-primary text-foreground' : 'border-transparent text-muted'
                }`}
            >
              Create Account
            </button>
          </div>

          {/* Form content */}
          {mode === 'login' ? (
            <LoginForm
              redirect={redirect}
              resendCooldown={resendCooldown}
              setResendCooldown={setResendCooldown}
            />
          ) : (
            <RegisterForm
              redirect={redirect}
              resendCooldown={resendCooldown}
              setResendCooldown={setResendCooldown}
            />
          )}
        </div>
      </div>
    </section>
  );
}
