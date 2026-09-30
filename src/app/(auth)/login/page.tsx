'use client';

import { useActionState, useState, useEffect, Suspense } from 'react';
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
  ChevronLeft,
} from 'lucide-react';
import { loginTailorWithPassword } from '../actions';
import { Button } from '@/components/ui/button';

type PasswordState =
  | Record<string, never>
  | { errors: Record<string, string[]> }
  | { error: string };

const initialPasswordState: PasswordState = {};

function SessionTimeoutBanner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  if (reason === 'session_timeout') {
    return (
      <div className="mb-5 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-800 flex items-start gap-3 shadow-xs animate-fade-in-up">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed font-medium">
          Your session expired due to inactivity. Please sign in again to resume your work.
        </span>
      </div>
    );
  }

  return null;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Clear any residual session activity timestamp on login page
  useEffect(() => {
    try {
      localStorage.removeItem('tailor_app_last_activity');
    } catch {
      // ignore
    }
  }, []);

  const [passwordState, passwordAction, passwordPending] = useActionState<PasswordState, FormData>(
    loginTailorWithPassword,
    initialPasswordState
  );

  const passwordErrors = 'errors' in passwordState ? passwordState.errors : {};
  const passwordError = 'error' in passwordState ? passwordState.error : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 text-slate-900 relative overflow-hidden selection:bg-[#1b5e20] selection:text-white">
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-slate-200/50 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-50/60 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6 z-10">
        {/* Top Back link & Brand Badge */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-bold uppercase tracking-wider shadow-xs">
            <Scissors className="w-3.5 h-3.5 text-[#1b5e20]" />
            Tailor Portal
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1b5e20] to-[#144818] flex items-center justify-center shadow-md shadow-emerald-900/10 border border-emerald-300">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm max-w-xs">
            Sign in to access your digital measurement book and client records.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#1b5e20] via-[#2e7d32] to-emerald-400" />
          <div className="p-6 sm:p-8">
          <Suspense fallback={null}>
            <SessionTimeoutBanner />
          </Suspense>

          <form action={passwordAction} className="space-y-4">
            {passwordError && (
              <div className="rounded-2xl bg-red-50 border border-red-200 p-3.5 text-xs text-red-600 flex items-start gap-2.5 animate-fade-in-up">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{passwordError}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="login-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tailor@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] transition"
                />
              </div>
              {passwordErrors.email && (
                <p className="text-xs text-red-600">{passwordErrors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="login-password"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.password && (
                <p className="text-xs text-red-600">{passwordErrors.password[0]}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                id="login-submit"
                type="submit"
                disabled={passwordPending}
                className="w-full bg-[#1b5e20] hover:bg-[#144818] text-white font-bold py-3 rounded-xl shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
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

          {/* Card Footer */}
          <div className="pt-6 mt-6 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account yet?{' '}
              <Link
                href="/register"
                className="text-[#1b5e20] hover:underline font-bold transition-colors ml-1"
              >
                Create Free Account →
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
