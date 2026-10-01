'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  Loader2,
  AlertCircle,
  Save,
  Ruler,
  MessageCircle,
} from 'lucide-react';
import { createClientAction, updateClientAction } from './actions';

interface ClientFormProps {
  initialData?: {
    id: string;
    name: string;
    phone: string | null;
    notes?: string | null;
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || 'CU';
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: ['Customer name is required'] });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && initialData) {
        const res = await updateClientAction({
          id: initialData.id,
          name: name.trim(),
          phone: phone.trim() || null,
          notes: initialData.notes || null,
        });

        if (res.error) {
          setGeneralError(res.error);
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
          setIsSubmitting(false);
          return;
        }

        router.push(`/clients/${initialData.id}`);
        router.refresh();
      } else {
        const res = await createClientAction({
          name: name.trim(),
          phone: phone.trim() || null,
          notes: null,
        });

        if (res.error || !res.data) {
          setGeneralError(res.error || 'Failed to create customer');
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
          setIsSubmitting(false);
          return;
        }

        // Profile is saved, immediately redirect to taking measurement for this customer
        router.push(`/measurements/new?clientId=${res.data.id}`);
        router.refresh();
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please check your connection.');
      setIsSubmitting(false);
    }
  };

  const initials = getInitials(name);

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto animate-fade-in-up pb-12"
    >
      {generalError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-3xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <span className="font-bold text-xs leading-relaxed">{generalError}</span>
        </div>
      )}

      {/* ── Customer Identity Card ── */}
      <div className="p-5 sm:p-6 bg-white border border-slate-200/90 rounded-3xl space-y-4 shadow-xs">
        {/* Dynamic Avatar Preview */}
        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/90 text-[#1b5e20] font-black text-sm flex items-center justify-center font-mono shadow-2xs">
            {initials}
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-slate-900">
              {name.trim() ? name : 'New Customer Profile'}
            </h2>
            <p className="text-xs text-slate-500">
              {phone.trim() ? phone : 'Enter customer name and phone number'}
            </p>
          </div>
        </div>

        {/* Customer Name */}
        <div className="space-y-1.5">
          <label
            htmlFor="client-name"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            Customer Full Name <span className="text-[#1b5e20]">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="client-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: [] }));
              }}
              placeholder="e.g., Alhaji Ibrahim Bello, Fatima Usman"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1b5e20] focus:bg-white focus:ring-2 focus:ring-[#1b5e20]/15 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base font-bold shadow-xs transition"
              disabled={isSubmitting}
            />
          </div>
          {fieldErrors.name && fieldErrors.name.length > 0 && (
            <p className="text-xs text-red-600 font-bold">{fieldErrors.name[0]}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="client-phone"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Phone Number
            </label>
            <span className="text-[11px] text-[#1b5e20] font-bold flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              For WhatsApp slips
            </span>
          </div>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="client-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 0803 123 4567"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-[#1b5e20] focus:bg-white focus:ring-2 focus:ring-[#1b5e20]/15 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base font-semibold shadow-xs transition"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* ── Action Buttons ── */}
      <div className="pt-2 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition cursor-pointer text-center"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1b5e20] via-[#17521c] to-[#113f15] hover:from-[#144818] hover:to-[#0e3310] text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-950/15 transition disabled:opacity-50 cursor-pointer active:scale-95"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : isEditing ? (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          ) : (
            <>
              <Ruler className="w-4 h-4" />
              <span>Save & Take Measurement</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
