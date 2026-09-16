'use client';

import { useActionState, useState, useEffect, Suspense } from 'react';
import { Mail, Lock, Loader2, Eye, EyeOff, ShieldAlert, ArrowRight, AlertCircle } from 'lucide-react';
import { loginAdminWithPassword } from '@/app/(auth)/actions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type LoginState =
  | Record<string, never>
  | { errors: Record<string, string[]> }
  | { error: string };

const initialState: LoginState = {};

function SessionTimeoutBanner() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  if (reason === 'session_timeout') {
    return (
      <div className="mb-4 rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-3 text-xs text-amber-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <span>Your administrator session expired due to inactivity. Please sign in again.</span>
      </div>
    );
  }

  return null;
}

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  // Clear any residual session activity timestamp on admin login page
  useEffect(() => {
    try {
      localStorage.removeItem('tailor_app_last_activity');
    } catch {
      // ignore
    }
  }, []);

  /**
   * Dedicated loginAdminWithPassword Server Action.
   * Strictly permits users with role === 'admin'.
   * Rejects non-admin attempts.
   */
  const [state, action, isPending] = useActionState<LoginState, FormData>(
    loginAdminWithPassword,
    initialState
  );

  const errors = 'errors' in state ? state.errors : {};
  const globalError = 'error' in state ? state.error : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-slate-950 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm space-y-6">
        {/* Brand mark */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-900/20">
            <ShieldAlert className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Console</h1>
            <p className="text-slate-400 text-sm mt-1">TailorApp Platform Administration</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
              Restricted Access
            </span>
          </div>
        </div>

        {/* Login card */}
        <div className="bg-slate-900/70 backdrop-blur border border-slate-700/50 rounded-2xl p-6 shadow-2xl shadow-slate-950/50">
          <Suspense fallback={null}>
            <SessionTimeoutBanner />
          </Suspense>
          <form action={action} className="space-y-4">
            {globalError && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-400">
                {globalError}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email[0]}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-slate-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="admin-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password[0]}</p>
              )}
            </div>

            <button
              id="admin-login-submit"
              type="submit"
              disabled={isPending}
              className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {isPending ? 'Signing in…' : 'Access Admin Console'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-600">
          Not an administrator?{' '}
          <Link href="/login" className="text-slate-400 hover:text-slate-200 transition">
            Sign in to TailorApp
          </Link>
        </p>
      </div>
    </div>
  );
}
