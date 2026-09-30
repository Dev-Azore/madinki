'use client';

import Link from 'next/link';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { ClientForm } from '../ClientForm';

export default function NewClientPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/clients"
          className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-[#0B2545] rounded-xl shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0B2545] flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#1b5e20]" />
            Register New Client
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Add client contact information and style preferences.
          </p>
        </div>
      </div>

      <ClientForm />
    </div>
  );
}
