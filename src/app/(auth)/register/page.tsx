'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Lock,
  Loader2,
  Eye,
  EyeOff,
  Scissors,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Smartphone,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { registerTailor } from '../actions';
import { Button } from '@/components/ui/button';

type RegisterState =
  | Record<string, never>
  | { errors: Record<string, string[]> }
  | { error: string };

const initialState: RegisterState = {};

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [state, formAction, isPending] = useActionState<RegisterState, FormData>(
    registerTailor,
    initialState
  );

  const errors = 'errors' in state ? state.errors : {};
  const error = 'error' in state ? state.error : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 bg-[#040e1e] text-slate-100 relative overflow-hidden selection:bg-[#2e7d32] selection:text-white">
      {/* Background Decorative Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-1/4 -right-20 w-80 h-80 bg-[#2e7d32]/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-[#0B2545]/60 rounded-full blur-3xl" />
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
            Free Account
          </div>
        </div>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2e7d32] to-[#144917] flex items-center justify-center shadow-xl shadow-[#2e7d32]/25 border border-[#81c784]/30">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xs">
            Join independent tailors who manage client measurements digitally without paper loss.
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-[#071A34]/90 backdrop-blur-xl border border-[#0B2545] rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-950/80">
          <form action={formAction} className="space-y-4">
            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-3.5 text-xs text-red-300 flex items-start gap-2.5 animate-fade-in-up">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Full Name / Brand Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="e.g. Master Ibrahim Stitches"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#040e1e] border border-[#0B2545] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] transition"
                />
              </div>
              {errors.name && <p className="text-xs text-red-400">{errors.name[0]}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-email"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tailor@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#040e1e] border border-[#0B2545] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] transition"
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email[0]}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-password"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Min. 8 characters"
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
              {errors.password && <p className="text-xs text-red-400">{errors.password[0]}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="register-confirm"
                className="block text-xs font-bold uppercase tracking-wider text-slate-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-confirm"
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#040e1e] border border-[#0B2545] rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#2e7d32] focus:ring-1 focus:ring-[#2e7d32] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition cursor-pointer"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-400">{errors.confirmPassword[0]}</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                id="register-submit"
                type="submit"
                disabled={isPending}
                className="w-full bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#2e7d32]/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>{isPending ? 'Creating Account…' : 'Start Free Tailor Account'}</span>
              </Button>
            </div>
          </form>

          {/* Card Footer */}
          <div className="pt-6 mt-6 border-t border-[#0B2545] text-center space-y-2">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-[#81c784] hover:text-white font-bold transition-colors ml-1"
              >
                Sign in here →
              </Link>
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2 pt-1 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#81c784] shrink-0" />
            <span>Forever Free Plan for independent tailors & fashion designers</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#81c784] shrink-0" />
            <span>Permanent fitting history snapshots with exact measurement timestamps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
