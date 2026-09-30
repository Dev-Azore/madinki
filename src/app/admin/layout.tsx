import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldAlert,
  Users,
  History,
  LayoutDashboard,
  LogOut,
  Layers,
} from 'lucide-react';
import { logoutAdmin } from '@/app/(auth)/actions';
import { SessionTimeoutProvider } from '@/components/auth/SessionTimeoutProvider';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: profile } = await supabase
    .from('users')
    .select('name, role, status')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    notFound();
  }

  return (
    <SessionTimeoutProvider role="admin">
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col">
        {/* Top Admin Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left: Brand + Admin Badge */}
              <div className="flex items-center gap-3">
                <Link href="/admin" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-base tracking-tight text-slate-900">
                      Madinki
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      Admin Console
                    </span>
                  </div>
                </Link>
              </div>

              {/* Center: Admin Nav Links */}
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tailor Directory & Stats</span>
                </Link>

                <Link
                  href="/admin/templates"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <Layers className="w-3.5 h-3.5 text-[#1b5e20]" />
                  <span>Global Templates</span>
                </Link>

                <Link
                  href="/admin/audit-log"
                  className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <History className="w-3.5 h-3.5 text-amber-600" />
                  <span>Audit Log</span>
                </Link>
              </nav>

              {/* Right: Logout */}
              <div className="flex items-center gap-3">
                <form action={logoutAdmin}>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl text-xs font-semibold transition cursor-pointer border border-transparent hover:border-red-200"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Admin Logout</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Mobile Nav sub-bar */}
          <div className="md:hidden flex items-center justify-around border-t border-slate-200 px-2 py-2 bg-white text-xs">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-[#1b5e20] font-semibold rounded-lg"
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tailors</span>
            </Link>
            <Link
              href="/admin/templates"
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-[#1b5e20] font-semibold rounded-lg"
            >
              <Layers className="w-3.5 h-3.5 text-[#1b5e20]" />
              <span>Templates</span>
            </Link>
            <Link
              href="/admin/audit-log"
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-amber-600 font-semibold rounded-lg"
            >
              <History className="w-3.5 h-3.5 text-amber-600" />
              <span>Audit Log</span>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </SessionTimeoutProvider>
  );
}
