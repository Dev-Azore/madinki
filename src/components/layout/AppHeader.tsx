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
    <header className="sticky top-0 z-30 bg-[#071A34]/95 backdrop-blur-md border-b border-[#0B2545]">
      <div className="flex items-center justify-between px-4 h-14 max-w-2xl mx-auto">
        {/* Tailor Avatar + Name (links to Profile) */}
        <Link
          href="/profile"
          className="flex items-center gap-2.5 group p-1 -ml-1 rounded-xl hover:bg-[#0B2545]/60 transition"
          title="View Profile"
        >
          {/* Personalized Avatar */}
          <div className="w-8 h-8 rounded-xl bg-[#040e1e] border border-[#2e7d32]/60 flex items-center justify-center text-xs font-bold text-[#81c784] shadow shadow-[#040e1e] flex-shrink-0 group-hover:scale-105 group-hover:border-[#2e7d32] transition font-mono">
            {initials}
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-sm font-bold text-white group-hover:text-[#81c784] transition truncate max-w-[140px]">
              {name}
            </span>
            {plan === 'premium' ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#2e7d32]/20 text-[#81c784] border border-[#2e7d32]/40">
                PRO
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#040e1e] text-slate-400 border border-[#0B2545]">
                Tailor
              </span>
            )}
          </div>
        </Link>

        {/* Right Action: Install App + Profile Shortcut + Sign Out */}
        <div className="flex items-center gap-2">
          <PwaInstallButton className="hidden sm:inline-flex" />

          <Link
            href="/profile"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-[#0B2545] rounded-xl border border-transparent hover:border-[#0B2545] transition"
          >
            <User className="w-3.5 h-3.5 text-[#81c784]" />
            <span className="hidden sm:inline">Profile</span>
          </Link>

          <form action={logout}>
            <button
              id="app-signout-btn"
              type="submit"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition cursor-pointer"
              aria-label="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
