import { ShieldX, Mail, ArrowLeft, AlertTriangle } from 'lucide-react';
import { logout } from '@/app/(auth)/actions';

export const metadata = {
  title: 'Account Suspended | TailorApp',
  description: 'Your TailorApp account has been suspended.',
};

export default function SuspendedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-[#040e1e] text-slate-100 relative overflow-hidden selection:bg-red-900 selection:text-white">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-red-900/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6 text-center z-10">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-2xl shadow-red-900/30">
              <ShieldX className="w-10 h-10 text-red-400" />
            </div>
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-3xl border border-red-500/30 animate-ping opacity-30" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Account Suspended
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
            Your TailorApp tailor account is currently inactive or suspended by platform administrators.
          </p>
        </div>

        {/* What to do card */}
        <div className="bg-[#071A34]/90 backdrop-blur border border-[#0B2545] rounded-3xl p-5 sm:p-6 text-left space-y-3.5 shadow-xl">
          <p className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Next Steps to Reactivate</span>
          </p>
          <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-[#040e1e] border border-[#0B2545] flex items-center justify-center text-[10px] font-bold text-[#81c784] shrink-0 font-mono">
                1
              </span>
              <span>Review any account notification or policy email you received.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-[#040e1e] border border-[#0B2545] flex items-center justify-center text-[10px] font-bold text-[#81c784] shrink-0 font-mono">
                2
              </span>
              <span>Contact customer support if you need assistance or review.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-[#040e1e] border border-[#0B2545] flex items-center justify-center text-[10px] font-bold text-[#81c784] shrink-0 font-mono">
                3
              </span>
              <span>Once reactivated, sign in again to resume managing measurements.</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="mailto:support@tailorapp.com"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 text-red-300 text-xs sm:text-sm font-bold rounded-xl transition"
          >
            <Mail className="w-4 h-4" />
            <span>Contact Support</span>
          </a>

          <form action={logout} className="w-full sm:w-auto">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#071A34] hover:bg-[#0B2545] border border-[#0B2545] text-slate-300 text-xs sm:text-sm font-medium rounded-xl transition cursor-pointer"
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
