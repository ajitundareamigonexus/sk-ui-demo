'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, User, Phone, Lock, AlertCircle, ArrowRight, KeyRound, CheckCircle2, Eye, EyeOff, RefreshCw, Loader2, } from 'lucide-react';
import { registerUser, loginUserWithPassword } from '@/services/auth';
import { sendOtp, verifyOtp } from '@/services/otp';
import { getUserData } from '@/helper/user-data';

interface RegistrationResponse {
  id?: string | number;
  token?: string;
  role?: string;
  fullName?: string;
  email?: string;
  mobile?: string;
  preferredLoginType?: string;
}

interface RegisterFormProps {
  redirect: string;
  resendCooldown: number;
  setResendCooldown: (value: number | ((prev: number) => number)) => void;
}

function saveSession(data: RegistrationResponse) {
  if (data.token) {
    sessionStorage.setItem('token', data.token);
    localStorage.setItem('token', data.token);
  }

  const decoded = data.token ? getUserData(data.token) : getUserData();
  const rawRole = (Array.isArray(decoded?.role) ? decoded?.role[0] : decoded?.role) || data.role;
  const role = rawRole?.toUpperCase() === 'ADMIN' ? 'admin' : rawRole?.toUpperCase() === 'AGENT' ? 'agent' : 'user';

  const sessionUser = {
    id: decoded?.uniqueIdentifier || (data.id ? String(data.id) : `u-${Date.now()}`),
    fullName: decoded?.name || data.fullName || '',
    email: decoded?.email || data.email || '',
    mobile: data.mobile || '',
    preferredLoginType: data.preferredLoginType || '',
    role,
    tenantId: decoded?.tenantId,
    appNames: decoded?.appNames,
    uniqueIdentifier: decoded?.uniqueIdentifier,
  };

  localStorage.setItem('role', role);
  localStorage.setItem('fullName', sessionUser.fullName);
  localStorage.setItem('user', JSON.stringify({ ...data, ...sessionUser, ...decoded }));
  localStorage.setItem('sk_active_session', JSON.stringify(sessionUser));
  sessionStorage.setItem('user', JSON.stringify({ ...data, ...sessionUser, ...decoded }));

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('authChange'));

  return sessionUser;
}

export default function RegisterForm({ redirect, resendCooldown, setResendCooldown }: RegisterFormProps) {
  const router = useRouter();
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSendEmailOtp = async () => {
    setError('');
    setSuccess('');
    const email = regEmail.trim().toLowerCase();

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await sendOtp({
        email,
        action: 'Verify',
        url: 'https://skholidays.com/',
        customTemplateCode: 'LEADKART_OTP',
      });
      setOtpSent(true);
      setOtp('');
      setResendCooldown(30);
      setSuccess('Verification OTP has been sent to your email.');
    } catch (err: any) {
      console.error('Send OTP error:', err);
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Failed to send OTP. Please check your email and try again.';
      setError(message);
    } finally {
      setSendingOtp(false);
    }
  };
  const handleVerifyEmailOtp = async () => {
    setError('');
    setSuccess('');
    const email = regEmail.trim().toLowerCase();
    const cleanOtp = otp.trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const verifyResponse = await verifyOtp({
        email,
        otp: cleanOtp,
      });
      setEmailVerified(true);
      setOtpSent(false);
      setOtp('');
      setSuccess('Email address verified successfully!');
    } catch (err: any) {
      console.error('OTP verification error:', err);
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Invalid or expired OTP. Please try again.';
      setError(message);
    } finally {
      setVerifyingOtp(false);
    }
  };
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || sendingOtp) return;
    await handleSendEmailOtp();
  };
  const handleChangeEmail = () => {
    setEmailVerified(false);
    setOtpSent(false);
    setOtp('');
    setError('');
    setSuccess('');
    setResendCooldown(0);
  };
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const fullName = regFullName.trim();
    const email = regEmail.trim().toLowerCase();
    const mobile = regMobile.trim();
    if (!fullName) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    if (!emailVerified) {
      setError('Please verify your email address with OTP before registering.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const response = await registerUser({
        name: fullName,
        email,
        mobile,
        preferredLoginType: 'EMAIL',
        role: 'Customer',
        password: regPassword
      });
      try {
        const loginResponse = await loginUserWithPassword(email, regPassword);
        if (loginResponse?.token) {
          const sessionUser = saveSession(loginResponse);
          setSuccess(`Welcome, ${sessionUser.fullName || fullName}! Your account has been created.`);
          setTimeout(() => {
            router.push(
              sessionUser.role === 'admin'
                ? '/admin'
                : sessionUser.role === 'agent'
                  ? '/agent'
                  : redirect
            );
          }, 800);
          return;
        }
      } catch (loginErr) {
        console.warn('Auto-login after registration could not be completed:', loginErr);
      }

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err: any) {
      console.error('Registration error:', err);
      const message =
        err?.response?.data?.message ||
        (typeof err?.response?.data === 'string' ? err.response.data : null) ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(message);
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-muted">
          Full Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            required
            placeholder="Enter your full name"
            value={regFullName}
            onChange={(e) => setRegFullName(e.target.value)}
            className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-4 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-muted">
          Mobile Number <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="tel"
            required
            placeholder="Enter 10-digit mobile number"
            value={regMobile}
            onChange={(e) =>
              setRegMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
            }
            className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-4 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-semibold text-muted">
            Email Address <span className="text-red-400">*</span>
          </label>
          {emailVerified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500">
              <CheckCircle2 size={13} />
              Verified
            </span>
          )}
        </div>

        <div className="relative flex items-center">
          <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="email"
            required
            disabled={emailVerified || otpSent}
            placeholder="name@example.com"
            value={regEmail}
            onChange={(e) => {
              setRegEmail(e.target.value);
              if (emailVerified) setEmailVerified(false);
            }}
            className={`w-full h-12 rounded-xl bg-background border border-border pl-11 text-sm outline-none focus:border-primary transition-colors ${emailVerified
              ? 'pr-24 border-emerald-500/40 bg-emerald-500/5'
              : 'pr-28'
              }`}
          />

          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {emailVerified ? (
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-xs text-muted hover:text-primary transition-colors px-2 py-1 cursor-pointer"
              >
                Change
              </button>
            ) : !otpSent ? (
              <button
                type="button"
                onClick={handleSendEmailOtp}
                disabled={sendingOtp || !isValidEmail(regEmail)}
                className="h-8 px-3 rounded-lg bg-primary text-primary-contrast text-xs font-semibold hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1 cursor-pointer"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Verify</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-xs text-muted hover:text-primary transition-colors px-2 py-1 cursor-pointer"
              >
                Change
              </button>
            )}
          </div>
        </div>
      </div>
      {otpSent && !emailVerified && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-teal-400" />
              <span className="text-xs font-bold text-foreground">
                Enter 6-Digit OTP
              </span>
            </div>
            <span className="text-[11px] text-muted">Sent to {regEmail}</span>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="flex-1 h-11 rounded-xl bg-background border border-border px-3 text-center text-lg font-mono font-bold tracking-widest outline-none focus:border-primary transition-colors"
            />
            <button
              type="button"
              onClick={handleVerifyEmailOtp}
              disabled={verifyingOtp || otp.length !== 6}
              className="h-11 px-5 rounded-xl bg-teal-500 text-white font-bold text-xs hover:bg-teal-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {verifyingOtp ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify OTP</span>
                  <CheckCircle2 size={14} />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={handleChangeEmail}
              className="text-muted hover:text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || sendingOtp}
              className="text-teal-400 font-medium hover:underline disabled:opacity-40 disabled:no-underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={11} className={sendingOtp ? 'animate-spin' : ''} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      )}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-muted">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type={showPassword ? 'text' : 'password'}
            required
            minLength={8}
            placeholder="Minimum 8 characters"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-11 text-sm outline-none focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-muted">
          Confirm Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            required
            minLength={8}
            placeholder="Re-enter your password"
            value={regConfirmPassword}
            onChange={(e) => setRegConfirmPassword(e.target.value)}
            className="w-full h-12 rounded-xl bg-background border border-border pl-11 pr-11 text-sm outline-none focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
          <CheckCircle2 size={14} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}
      <button
        type="submit"
        disabled={loading || !emailVerified}
        className="w-full h-12 rounded-xl bg-primary text-primary-contrast font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md mt-4"
        style={{
          boxShadow: '0 4px 16px var(--glow)',
        }}
      >
        {loading ? (
          <div className="w-5 h-5 rounded-full border-2 border-primary-contrast border-t-transparent animate-spin" />
        ) : (
          <>
            <span>{emailVerified ? 'Complete Registration' : 'Verify Email to Register'}</span>
            <ArrowRight size={16} />
          </>
        )}
      </button>
    </form>
  );
}