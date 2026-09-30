'use client';

import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';
import { LogOut, Scissors, User } from 'lucide-react';
import { PwaInstallButton } from '@/components/pwa/PwaInstallButton';

interface AppHeaderProps {
  name: string;
  plan: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'TR';
}

export function AppHeader({ name, plan }: AppHeaderProps) {
  const initials = getInitials(name);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/70 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        {/* Brand wordmark left */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 group"
          title="Dashboard"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] flex items-center justify-center shadow-xs">
            <Scissors className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight group-hover:text-[#1b5e20] transition-colors">
            TailorApp
          </span>
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5">
          <PwaInstallButton className="hidden sm:inline-flex" />

          <Link
            href="/profile"
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-100 transition group"
            title="Profile"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-[#1b5e20] font-mono shrink-0 group-hover:border-[#1b5e20]/40 transition">
              {initials}
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition truncate max-w-[120px]">
                {name}
              </span>
              {plan === 'premium' ? (
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-300">
                  PRO
                </span>
              ) : (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200">
                  Free
                </span>
              )}
            </div>
          </Link>

          <form action={logout}>
            <button
              id="app-signout-btn"
              type="submit"
              className="flex items-center gap-1 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
