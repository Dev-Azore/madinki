'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, CheckCircle2, Loader2, AlertTriangle, X } from 'lucide-react';
import { updateTailorStatusAction } from '@/app/admin/actions';

interface TailorStatusToggleProps {
  tailorId: string;
  tailorName: string;
  currentStatus: 'active' | 'suspended';
  isSelf?: boolean;
}

export function TailorStatusToggle({
  tailorId,
  tailorName,
  currentStatus,
  isSelf,
}: TailorStatusToggleProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSuspended = currentStatus === 'suspended';
  const targetAction = isSuspended ? 'reactivate' : 'suspend';

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await updateTailorStatusAction({
        target_id: tailorId,
        action: targetAction,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        setIsOpen(false);
        setIsLoading(false);
        router.refresh();
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        disabled={isSelf}
        onClick={() => {
          if (isSelf) return;
          setErrorMessage(null);
          setIsOpen(true);
        }}
        title={isSelf ? 'You cannot suspend your own account' : undefined}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
          isSelf ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
        } ${
          isSuspended
            ? 'bg-emerald-50 hover:bg-emerald-100 text-[#1b5e20] border border-emerald-300'
            : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
        }`}
      >
        {isSuspended ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Reactivate</span>
          </>
        ) : (
          <>
            <Ban className="w-3.5 h-3.5" />
            <span>Suspend</span>
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSuspended
                      ? 'bg-emerald-50 text-[#1b5e20] border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isSuspended ? 'Reactivate Tailor Account' : 'Suspend Tailor Account'}
                  </h3>
                  <p className="text-xs text-slate-500">{tailorName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {isSuspended
                ? `Are you sure you want to reactivate ${tailorName}'s account? The tailor will immediately regain full access to their dashboard, clients, and measurements.`
                : `Are you sure you want to suspend ${tailorName}'s account? The tailor will be immediately blocked from accessing their dashboard and redirected to the suspended notice page. Their data is fully preserved.`}
            </p>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleConfirm}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                  isSuspended
                    ? 'bg-[#1b5e20] hover:bg-[#144818] text-white shadow-sm shadow-[#1b5e20]/20'
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm {isSuspended ? 'Reactivation' : 'Suspension'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
