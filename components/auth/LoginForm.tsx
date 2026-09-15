'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Phone, AlertCircle, ArrowRight, Lock, } from 'lucide-react';
import { loginUserWithOtp, loginUserWithPassword } from '@/services/auth';
import OtpVerification from './OtpVerification';
import { sendOtp } from '@/services/otp';
import { getUserData } from '@/helper/user-data';

type LoginStep = 'email' | 'otp';
type LoginMethod = 'password' | 'otp';

interface LoginFormProps {
  redirect: string;
  resendCooldown: number;
  setResendCooldown: (value: number) => void;
}

interface AuthResponse {
  id?: string | number;
  token?: string;
  role?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
}

export default function LoginForm({
  redirect,
  resendCooldown,
  setResendCooldown,
}: LoginFormProps) {

  const router = useRouter();
  const [loginStep, setLoginStep] = useState<LoginStep>('email');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [loginEmail, setLoginEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (err: any, fallback: string) => {
    return (
      err?.response?.data?.message ||
      (
        typeof err?.response?.data === 'string'
          ? err.response.data
          : null
      ) ||
      err?.message ||
      fallback
    );
  };

  const handleSendOtp = async (
    e?: React.FormEvent
  ) => {

    e?.preventDefault();

    setError('');
    setSuccess('');

    const email =
      loginEmail.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }

    setLoading(true);
    setSuccess('Sending OTP to your email...');

    try {
      const response = await sendOtp({
        email: email,
        action: "Login",
        url: "https://skjolidays.com/login",
        customTemplateCode: "LEADKART_OTP"
      });

      if (response.status === 200) {
        setLoginEmail(email);
        setLoginStep('otp');
        setSuccess('OTP sent to your email.');
        setResendCooldown(30);
      } else {
        setError('Failed to send OTP.');
        setSuccess('');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to send OTP. Please try again.'));
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const redirectTo = (token: any) => {
    const decodedToken = getUserData(token);
    if (decodedToken?.role?.includes('Admin')) {
      router.push('/admin');
    } else {
      router.push('/mybooking');
    }
  }

  const handlePasswordLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const email = loginEmail.trim().toLowerCase();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const response = await loginUserWithPassword(email, password);
      if (response?.token) {
        redirectTo(response?.token);
        setSuccess('Login successful');
      } else {
        setError(response?.message || 'Invalid credentials.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to login.'));

    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (
    otp: string
  ) => {
    setError('');
    setSuccess('');
    const cleanOtp = otp.trim();
    const email = loginEmail.trim().toLowerCase();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email address.');
      return;
    }
    setLoading(true);
    try {
      const response = await loginUserWithOtp(email, cleanOtp);
      if (response?.token) {
        setSuccess('Login successful');
      } else {
        setError(response?.message || 'Invalid OTP. Please try again.');
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Invalid or expired OTP. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) {
      return;
    }
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const email = loginEmail.trim().toLowerCase();
      const response = await sendOtp({
        email: email,
        action: "Login",
        url: "https://lead-kart.com/login",
        customTemplateCode: "LEADKART_OTP"
      });
      if (response.status === 200) {
        setSuccess('OTP resent successfully.');
        setResendCooldown(30);
      } else {
        setError('Failed to resend OTP.');
      }

    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to resend OTP.'));
    } finally {
      setLoading(false);
    }
  };
  const handleBackFromOtp = () => {
    setLoginStep('email');
    setError('');
    setSuccess('');
    setResendCooldown(0);
  };

  if (loginStep === 'otp') {
    return (
      <OtpVerification
        email={loginEmail}
        loading={loading}
        error={error}
        success={success}
        resendCooldown={resendCooldown}
        submitLabel="Verify & Login"
        onBack={handleBackFromOtp}
        onSubmit={handleVerifyOtp}
        onResend={handleResend}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/10 mb-3">
          {loginMethod === 'password' ? (<Lock size={22} className="text-teal-400" />
          ) : (<Phone size={22} className="text-teal-400" />)}
        </div>
        <p className="text-sm text-muted">
          {loginMethod === 'password' ? 'Login with your email and password.' : 'Enter your registered email to receive an OTP.'}
        </p>
      </div>

      <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleSendOtp} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-muted">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-4 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <div className="flex justify-between items-center mt-2 px-1">
            <button
              type="button"
              onClick={() => {
                setLoginEmail('');
                setPassword('');
                setError('');
                setSuccess('');
              }}
              className="text-[11px] text-muted hover:text-foreground transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod(loginMethod === 'password' ? 'otp' : 'password');
                setError('');
                setSuccess('');
              }}
              className="text-[11px] font-bold text-teal-400 hover:text-teal-300 transition-colors"
            >
              {loginMethod === 'password' ? 'Login with OTP' : 'Login with Password'}
            </button>
          </div>
        </div>

        {loginMethod === 'password' && (
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-4 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <AlertCircle size={14} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary text-primary-contrast font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md mt-4"
          style={{ boxShadow: '0 4px 16px var(--glow)' }}
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-primary-contrast border-t-transparent animate-spin" />
          ) : (
            <>
              {loginMethod === 'password' ? 'Sign In' : 'Send OTP'} <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}