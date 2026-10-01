'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardList, BookOpen, Ruler, Sparkles } from 'lucide-react';

export function BottomNav() {
  const pathname = usePathname();

  const isHomeActive = pathname === '/dashboard';
  const isCustomersActive = pathname.startsWith('/clients');
  const isMeasureActive = pathname.startsWith('/measurements');
  const isStylesActive = pathname.startsWith('/templates');
  const isLedgerActive = pathname.startsWith('/ledger');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-2 pt-1 pointer-events-none safe-area-pb">
      {/* ── 3D Floating Glassmorphic Dock ── */}
      <div
        className="max-w-md mx-auto pointer-events-auto bg-white/95 backdrop-blur-2xl border border-slate-200/90 rounded-3xl p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12),0_4px_16px_rgba(27,94,32,0.06)] relative flex items-center justify-between"
        style={{
          boxShadow:
            '0 16px 36px -6px rgba(11, 37, 69, 0.12), 0 6px 16px -2px rgba(27, 94, 32, 0.08), inset 0 1px 2px rgba(255, 255, 255, 0.85)',
        }}
      >
        {/* Left Side: 1. Customers */}
        <Link
          href="/clients"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 group cursor-pointer active:scale-90 active:translate-y-0.5 ${
            isCustomersActive ? 'text-[#1b5e20]' : 'text-slate-400 hover:text-slate-800'
          }`}
          aria-label="Customers"
        >
          <div
            className={`p-1.5 rounded-xl transition-all duration-300 transform-gpu group-hover:-translate-y-1 group-hover:-rotate-12 group-hover:scale-120 group-active:rotate-6 ${
              isCustomersActive
                ? 'bg-emerald-50 text-[#1b5e20] shadow-xs'
                : 'group-hover:bg-slate-100/90 text-slate-400'
            }`}
          >
            <Users className="w-5 h-5 transition-transform duration-300" />
          </div>
          <span
            className={`text-[10px] tracking-tight leading-none transition-all duration-200 mt-0.5 ${
              isCustomersActive
                ? 'font-black text-[#1b5e20] scale-105'
                : 'font-semibold text-slate-500 group-hover:text-slate-900'
            }`}
          >
            Customers
          </span>
          {isCustomersActive && (
            <span className="w-1 h-1 rounded-full bg-[#1b5e20] mt-0.5 animate-pulse" />
          )}
        </Link>

        {/* Left Side: 2. Measure */}
        <Link
          href="/measurements/new"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 group cursor-pointer active:scale-90 active:translate-y-0.5 ${
            isMeasureActive ? 'text-[#1b5e20]' : 'text-slate-400 hover:text-slate-800'
          }`}
          aria-label="Measure"
        >
          <div
            className={`p-1.5 rounded-xl transition-all duration-300 transform-gpu group-hover:-translate-y-1 group-hover:rotate-12 group-hover:scale-120 group-active:-rotate-12 ${
              isMeasureActive
                ? 'bg-emerald-50 text-[#1b5e20] shadow-xs'
                : 'group-hover:bg-slate-100/90 text-slate-400'
            }`}
          >
            <ClipboardList className="w-5 h-5 transition-transform duration-300" />
          </div>
          <span
            className={`text-[10px] tracking-tight leading-none transition-all duration-200 mt-0.5 ${
              isMeasureActive
                ? 'font-black text-[#1b5e20] scale-105'
                : 'font-semibold text-slate-500 group-hover:text-slate-900'
            }`}
          >
            Measure
          </span>
          {isMeasureActive && (
            <span className="w-1 h-1 rounded-full bg-[#1b5e20] mt-0.5 animate-pulse" />
          )}
        </Link>

        {/* Centerpiece: 3. Home (Sleek 3D Elevated Button with Rotational Micro-Interactions) */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-3.5 z-20">
          <Link
            href="/dashboard"
            className="group flex flex-col items-center cursor-pointer focus:outline-none active:scale-90 active:translate-y-0.5"
            aria-label="Home Dashboard"
          >
            {/* 3D Elevated Sleek Orb */}
            <div
              className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 transform-gpu cursor-pointer ${
                isHomeActive
                  ? 'bg-gradient-to-tr from-[#0e3310] via-[#1b5e20] to-[#2e7d32] text-white scale-105 group-hover:scale-115 group-hover:rotate-12 active:rotate-45 active:scale-90'
                  : 'bg-gradient-to-tr from-[#1b5e20] to-[#2e7d32] text-white/95 scale-100 group-hover:scale-115 group-hover:-rotate-12 active:rotate-45 active:scale-90'
              }`}
              style={{
                boxShadow: isHomeActive
                  ? '0 8px 20px -3px rgba(27, 94, 32, 0.5), 0 4px 10px -2px rgba(27, 94, 32, 0.3), inset 0 1.5px 3px rgba(255, 255, 255, 0.45), inset 0 -1.5px 3px rgba(0, 0, 0, 0.25)'
                  : '0 6px 16px -3px rgba(11, 37, 69, 0.25), 0 3px 8px -2px rgba(27, 94, 32, 0.15), inset 0 1.5px 3px rgba(255, 255, 255, 0.4), inset 0 -1.5px 2px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Inner 3D specular highlight ring */}
              <div className="absolute inset-0.5 rounded-[10px] border border-white/30 pointer-events-none" />

              {/* Ambient radial glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/20 rounded-xl pointer-events-none" />

              <LayoutDashboard className="w-5 h-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 drop-shadow-xs" />
            </div>

            <span
              className={`text-[10px] mt-0.5 tracking-tight transition-all duration-200 ${
                isHomeActive
                  ? 'font-black text-[#1b5e20] scale-105 drop-shadow-2xs'
                  : 'font-bold text-slate-700 group-hover:text-[#1b5e20]'
              }`}
            >
              Home
            </span>
          </Link>
        </div>

        {/* Right Side: 4. My Styles */}
        <Link
          href="/templates"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 group cursor-pointer active:scale-90 active:translate-y-0.5 ${
            isStylesActive ? 'text-[#1b5e20]' : 'text-slate-400 hover:text-slate-800'
          }`}
          aria-label="My Styles"
        >
          <div
            className={`p-1.5 rounded-xl transition-all duration-300 transform-gpu group-hover:-translate-y-1 group-hover:-rotate-12 group-hover:scale-120 group-active:rotate-12 ${
              isStylesActive
                ? 'bg-emerald-50 text-[#1b5e20] shadow-xs'
                : 'group-hover:bg-slate-100/90 text-slate-400'
            }`}
          >
            <Ruler className="w-5 h-5 transition-transform duration-300" />
          </div>
          <span
            className={`text-[10px] tracking-tight leading-none transition-all duration-200 mt-0.5 ${
              isStylesActive
                ? 'font-black text-[#1b5e20] scale-105'
                : 'font-semibold text-slate-500 group-hover:text-slate-900'
            }`}
          >
            My Styles
          </span>
          {isStylesActive && (
            <span className="w-1 h-1 rounded-full bg-[#1b5e20] mt-0.5 animate-pulse" />
          )}
        </Link>

        {/* Right Side: 5. E-Book (At the last) */}
        <Link
          href="/ledger"
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-300 group cursor-pointer active:scale-90 active:translate-y-0.5 ${
            isLedgerActive ? 'text-[#1b5e20]' : 'text-slate-400 hover:text-slate-800'
          }`}
          aria-label="E-Book Ledger"
        >
          <div
            className={`p-1.5 rounded-xl transition-all duration-300 transform-gpu group-hover:-translate-y-1 group-hover:rotate-12 group-hover:scale-120 group-active:-rotate-12 ${
              isLedgerActive
                ? 'bg-emerald-50 text-[#1b5e20] shadow-xs'
                : 'group-hover:bg-slate-100/90 text-slate-400'
            }`}
          >
            <BookOpen className="w-5 h-5 transition-transform duration-300" />
          </div>
          <span
            className={`text-[10px] tracking-tight leading-none transition-all duration-200 mt-0.5 ${
              isLedgerActive
                ? 'font-black text-[#1b5e20] scale-105'
                : 'font-semibold text-slate-500 group-hover:text-slate-900'
            }`}
          >
            E-Book
          </span>
          {isLedgerActive && (
            <span className="w-1 h-1 rounded-full bg-[#1b5e20] mt-0.5 animate-pulse" />
          )}
        </Link>
      </div>
    </nav>
  );
}
