import { ShieldX, Mail, ArrowLeft, AlertTriangle } from 'lucide-react';
import { logout } from '@/app/(auth)/actions';

export const metadata = {
  title: 'Account Suspended | Madinki',
  description: 'Your Madinki account has been suspended.',
};

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#f8fafc] text-slate-900 relative overflow-hidden selection:bg-red-600 selection:text-white">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-slate-200/40 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6 text-center z-10">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center shadow-sm">
              <ShieldX className="w-10 h-10 text-red-600" />
            </div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-3xl border border-red-300 animate-ping opacity-30" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Account Suspended
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Your Madinki tailor account is currently inactive or suspended by platform administrators.
          </p>
        </div>

        {/* What to do card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 text-left space-y-3.5 shadow-sm">
          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Next Steps to Reactivate</span>
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-[#1b5e20] shrink-0 font-mono">
                1
              </span>
              <span>Review any account notification or policy email you received.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-[#1b5e20] shrink-0 font-mono">
                2
              </span>
              <span>Contact customer support if you need assistance or review.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-[#1b5e20] shrink-0 font-mono">
                3
              </span>
              <span>Once reactivated, sign in again to resume managing measurements.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:support@madinki.com"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs sm:text-sm font-bold rounded-xl transition"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support</span>
          </a>

          <form action={logout} className="w-full sm:w-auto">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-xl transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
