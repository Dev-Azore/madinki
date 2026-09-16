'use client';

import { useActionState, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Scissors,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronLeft,
} from 'lucide-react';
import { loginTailorWithPassword, loginWithMagicLink } from '../actions';
import { Button } from '@/components/ui/button';

type PasswordState =
  | Record<string, never>
  | { errors: Record<string, string[]> }
  | { error: string };

type MagicState =
  | Record<string, never>
  | { errors: Record<string, string[]> }
  | { error: string }
  | { success: true; message: string };

const initialPasswordState: PasswordState = {};
const initialMagicState: MagicState = {};

function SessionTimeoutBanner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  if (reason === 'session_timeout') {
    return (
      <div className="mb-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 text-xs text-amber-300 flex items-start gap-3 shadow-lg shadow-amber-950/30 animate-fade-in-up">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-medium">
          Your session expired due to inactivity. Please sign in again to resume your work.
        </span>
      </div>
    );
  }

  return null;
}

export default function LoginPage() {
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [showPassword, setShowPassword] = useState(false);

  const [passwordState, passwordAction, passwordPending] = useActionState<PasswordState, FormData>(
    loginTailorWithPassword,
    initialPasswordState
  );
  const [magicState, magicAction, magicPending] = useActionState<MagicState, FormData>(
    loginWithMagicLink,
    initialMagicState
  );

  const isPending = passwordPending || magicPending;

  const passwordErrors = 'errors' in passwordState ? passwordState.errors : {};
  const passwordError = 'error' in passwordState ? passwordState.error : null;
  const magicErrors = 'errors' in magicState ? magicState.errors : {};
  const magicError = 'error' in magicState ? magicState.error : null;
  const magicSuccess = 'success' in magicState ? magicState : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[#040e1e] text-slate-100 relative overflow-hidden selection:bg-[#2e7d32] selection:text-white">
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#2e7d32]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#0B2545]/60 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#2e7d32]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6 z-10">
        {/* Top Back link & Brand Badge */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#071A34] border border-[#2e7d32]/30 text-[#81c784] text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Tailor Portal
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2e7d32] to-[#144917] flex items-center justify-center shadow-xl shadow-[#2e7d32]/25 border border-[#81c784]/30">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xs">
            Sign in to access your digital measurement book and client records.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#071A34]/90 backdrop-blur-xl border border-[#0B2545] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/80">
          <Suspense fallback={null}>
            <SessionTimeoutBanner />
          </Suspense>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-[#040e1e] p-1 mb-6 border border-[#0B2545]">
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'password'
                  ? 'bg-[#2e7d32] text-white shadow-md shadow-[#2e7d32]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setMode('magic')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                mode === 'magic'
                  ? 'bg-[#2e7d32] text-white shadow-md shadow-[#2e7d32]/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Magic Link
            </button>
          </div>

          {mode === 'password' ? (
            <form action={passwordAction} className="space-y-4">
              {passwordError && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-300 flex items-start gap-2.5 animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{passwordError}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="login-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="tailor@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#040e1e] border border-[#0B2545] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] transition"
                  />
                </div>
                {passwordErrors.email && (
                  <p className="text-xs text-red-400">{passwordErrors.email[0]}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#040e1e] border border-[#0B2545] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.password && (
                  <p className="text-xs text-red-400">{passwordErrors.password[0]}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  id="login-submit"
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#2e7d32]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {passwordPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>{passwordPending ? 'Signing In…' : 'Sign In to Studio'}</span>
                </Button>
              </div>
            </form>
          ) : (
            <form action={magicAction} className="space-y-4">
              {magicError && (
                <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-300 flex items-start gap-2.5 animate-fade-in-up">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{magicError}</span>
                </div>
              )}
              {magicSuccess && (
                <div className="rounded-2xl bg-[#2e7d32]/20 border border-[#2e7d32] p-3.5 text-xs text-[#81c784] flex items-start gap-2.5 animate-fade-in-up">
                  <Sparkles className="w-4 h-4 text-[#81c784] shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{magicSuccess.message}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="magic-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="magic-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="tailor@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#040e1e] border border-[#0B2545] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] transition"
                  />
                </div>
                {magicErrors.email && (
                  <p className="text-xs text-red-400">{magicErrors.email[0]}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  id="magic-link-submit"
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#2e7d32]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  {magicPending ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{magicPending ? 'Sending Magic Link…' : 'Send Magic Link'}</span>
                </Button>
              </div>
            </form>
          )}

          {/* Card Footer */}
          <div className="pt-6 mt-6 border-t border-[#0B2545] text-center space-y-2">
            <p className="text-xs text-slate-400">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/register"
                className="text-[#81c784] hover:text-white font-bold transition-colors ml-1"
              >
                Create Free Account →
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-3 gap-2 pt-2 text-center">
          <div className="p-2.5 rounded-2xl bg-[#071A34]/60 border border-[#0B2545] text-[11px] text-slate-400 flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#81c784]" />
            <span>100% Isolated</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#071A34]/60 border border-[#0B2545] text-[11px] text-slate-400 flex flex-col items-center gap-1">
            <Smartphone className="w-4 h-4 text-[#81c784]" />
            <span>Installable App</span>
          </div>
          <div className="p-2.5 rounded-2xl bg-[#071A34]/60 border border-[#0B2545] text-[11px] text-slate-400 flex flex-col items-center gap-1">
            <Sparkles className="w-4 h-4 text-[#81c784]" />
            <span>Free Forever</span>
          </div>
        </div>
      </div>
    </div>
  );
}
