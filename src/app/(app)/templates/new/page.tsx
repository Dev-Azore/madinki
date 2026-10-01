'use client';

import Link from 'next/link';
import { ArrowLeft, Ruler } from 'lucide-react';
import { TemplateForm } from '../TemplateForm';

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/templates"
          className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-[#0B2545] rounded-xl shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Ruler className="w-6 h-6 text-[#1b5e20]" />
            Create Garment Style
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure the measurement points and units for this garment type.
          </p>
        </div>
      </div>

      <TemplateForm />
    </div>
  );
}
