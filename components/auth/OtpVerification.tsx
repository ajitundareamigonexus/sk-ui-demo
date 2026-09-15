'use client';

import { useState } from 'react';
import { KeyRound, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface OtpVerificationProps {
  email: string;
  loading: boolean;
  error: string;
  success: string;
  resendCooldown: number;
  submitLabel: string;
  onBack: () => void;
  onSubmit: (otp: string) => void | Promise<void>;
  onResend: () => void | Promise<void>;
}

export default function OtpVerification({
  email,
  loading,
  error,
  success,
  resendCooldown,
  submitLabel,
  onBack,
  onSubmit,
  onResend,
}: OtpVerificationProps) {
  const [otpValue, setOtpValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otpValue)) {
      return;
    }
    onSubmit(otpValue);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/10 mb-3">
          <KeyRound size={22} className="text-teal-400" />
        </div>
        <p className="text-sm font-semibold text-foreground">OTP Sent!</p>
        <p className="text-xs text-muted mt-1">
          Enter the OTP sent to{' '}
          <span className="text-teal-400 font-bold">{email}</span>
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-muted">Enter OTP</label>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          placeholder="123456"
          value={otpValue}
          onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full h-14 rounded-xl bg-background border border-border px-4 text-center text-2xl font-mono font-bold tracking-widest outline-none focus:border-primary transition-colors"
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="text-muted hover:text-foreground transition-colors flex items-center gap-1 disabled:opacity-50"
        >
          <ArrowLeft size={12} /> Change email
        </button>
        <button
          type="button"
          onClick={onResend}
          disabled={resendCooldown > 0 || loading}
          className="text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={12} />
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
        </button>
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
        disabled={loading || otpValue.length !== 6}
        className="w-full h-12 rounded-xl bg-primary text-primary-contrast font-bold text-sm hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-md"
        style={{ boxShadow: '0 4px 16px var(--glow)' }}
      >
        {loading ? (
          <div className="w-5 h-5 rounded-full border-2 border-primary-contrast border-t-transparent animate-spin" />
        ) : (
          <>{submitLabel} <ArrowRight size={16} /></>
        )}
      </button>
    </form>
  );
}