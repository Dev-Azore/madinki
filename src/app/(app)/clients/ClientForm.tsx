'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Phone,
  FileText,
  Loader2,
  AlertCircle,
  Save,
  Ruler,
} from 'lucide-react';
import { createClientAction, updateClientAction } from './actions';

interface ClientFormProps {
  initialData?: {
    id: string;
    name: string;
    phone: string | null;
    notes: string | null;
  };
}

export function ClientForm({ initialData }: ClientFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [notes, setNotes] = useState(initialData?.notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectAfterSave, setRedirectAfterSave] = useState<'profile' | 'measure'>(
    'profile'
  );
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent, targetRedirect: 'profile' | 'measure' = 'profile') => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: ['Client name is required'] });
      return;
    }

    setIsSubmitting(true);
    setRedirectAfterSave(targetRedirect);

    try {
      if (isEditing && initialData) {
        const res = await updateClientAction({
          id: initialData.id,
          name: name.trim(),
          phone: phone.trim() || null,
          notes: notes.trim() || null,
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
          notes: notes.trim() || null,
        });

        if (res.error || !res.data) {
          setGeneralError(res.error || 'Failed to create client');
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
          setIsSubmitting(false);
          return;
        }

        if (targetRedirect === 'measure') {
          router.push(`/measurements/new?clientId=${res.data.id}`);
        } else {
          router.push(`/clients/${res.data.id}`);
        }
        router.refresh();
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={(e) => handleSubmit(e, 'profile')}
      className="space-y-4 max-w-xl mx-auto animate-fade-in-up"
    >
      {generalError && (
        <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Name Input */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
        <label
          htmlFor="client-name"
          className="block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Customer Name <span className="text-[#1b5e20]">*</span>
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="client-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Faisal Abubakar"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base font-medium shadow-xs transition"
            disabled={isSubmitting}
          />
        </div>
        {fieldErrors.name && (
          <p className="text-xs text-red-600 font-medium">{fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Phone Input */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
        <label
          htmlFor="client-phone"
          className="block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Phone Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
        </label>
        <div className="relative">
          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="client-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g., +234 803 123 4567"
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none text-sm sm:text-base font-medium shadow-xs transition"
            disabled={isSubmitting}
          />
        </div>
        {fieldErrors.phone && (
          <p className="text-xs text-red-600 font-medium">{fieldErrors.phone[0]}</p>
        )}
      </div>

      {/* Notes Input */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
        <label
          htmlFor="client-notes"
          className="block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Fitting Preferences & Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <textarea
            id="client-notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Prefers high-collar Kaftan, likes tapered sokoto, wedding delivery for Dec."
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-medium shadow-xs transition"
            disabled={isSubmitting}
          />
        </div>
        {fieldErrors.notes && (
          <p className="text-xs text-red-600 font-medium">{fieldErrors.notes[0]}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium border border-slate-200 transition cursor-pointer text-center"
        >
          Cancel
        </button>

        {!isEditing && (
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'measure')}
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#1b5e20] border border-emerald-300 rounded-xl text-sm font-bold transition cursor-pointer"
          >
            {isSubmitting && redirectAfterSave === 'measure' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ruler className="w-4 h-4 text-[#1b5e20]" />
            )}
            <span>Save & Take Measurement</span>
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded-xl text-sm font-bold shadow-sm shadow-[#2e7d32]/20 transition disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting && redirectAfterSave === 'profile' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Save Customer'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
