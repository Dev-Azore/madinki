'use client';

import Link from 'next/link';
import { logout } from '@/app/(auth)/actions';
import { LogOut, Scissors, User } from 'lucide-react';

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
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-2xs">
      <div className="flex items-center justify-between px-3.5 sm:px-4 h-14 max-w-3xl mx-auto">
        {/* Brand wordmark left */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 group shrink-0"
          title="Atelier Dashboard"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-slate-900 tracking-tight group-hover:text-[#1b5e20] transition-colors leading-none">
              TailorApp
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase leading-none mt-0.5">
              Atelier
            </span>
          </div>
        </Link>

        {/* Right cluster: Profile Chip & Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Profile link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 pl-1.5 pr-2 sm:pr-3 py-1 rounded-2xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/80 hover:border-emerald-200 transition-all duration-200 group shadow-2xs"
            title="View Atelier Profile"
          >
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/90 flex items-center justify-center text-[10.5px] font-black text-[#1b5e20] font-mono shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
              {initials}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition truncate max-w-[90px] sm:max-w-[140px]">
                {name}
              </span>
              {plan === 'premium' ? (
                <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-100 to-amber-50 text-amber-800 border border-amber-300">
                  PRO
                </span>
              ) : (
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200/70 text-slate-600 border border-slate-300/60 hidden xs:inline-block">
                  Free
                </span>
              )}
            </div>
          </Link>

          {/* Sign out button */}
          <form action={logout}>
            <button
              id="app-signout-btn"
              type="submit"
              className="flex items-center justify-center w-9 h-9 rounded-2xl text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200/80 hover:border-red-200 transition-all duration-200 cursor-pointer shadow-2xs"
              aria-label="Sign out"
              title="Sign out of Atelier"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default AppHeader;
