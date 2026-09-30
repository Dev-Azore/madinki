import Link from 'next/link';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Page Not Found — TailorApp',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center px-4 py-16 selection:bg-[#1b5e20] selection:text-white relative overflow-hidden">
      <div className="relative z-10 max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-[#1b5e20] shadow-xs">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#1b5e20] px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            404 Error
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight pt-2">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-600">
            The page you are looking for does not exist, has been moved, or is restricted.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link href="/">
            <Button className="bg-[#1b5e20] hover:bg-[#144818] text-white font-semibold shadow-sm shadow-[#1b5e20]/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
