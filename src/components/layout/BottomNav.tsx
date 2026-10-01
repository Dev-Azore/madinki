'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ClipboardList, Ruler } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home', Icon: LayoutDashboard },
  { href: '/clients', label: 'Customers', Icon: Users },
  { href: '/measurements/new', label: 'Measure', Icon: ClipboardList },
  { href: '/templates', label: 'My Styles', Icon: Ruler },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-slate-200/70 shadow-lg safe-area-pb">
      <div className="flex items-center justify-around max-w-lg mx-auto px-2">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(href.replace('/new', ''));
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center gap-0.5 px-4 py-3.5 min-w-[56px] transition-all duration-200 ${
                isActive ? 'text-[#1b5e20]' : 'text-slate-400 hover:text-slate-600'
              }`}
              aria-label={label}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-50 scale-110'
                  : 'hover:bg-slate-100 scale-100'
              }`}>
                <Icon className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
              </div>
              <span className={`text-[10px] leading-none font-medium transition-colors ${
                isActive ? 'text-[#1b5e20] font-bold' : 'text-slate-400'
              }`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
