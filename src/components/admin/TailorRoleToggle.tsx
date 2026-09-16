'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ShieldAlert, Loader2, AlertTriangle, X } from 'lucide-react';
import { updateUserRoleAction } from '@/app/admin/actions';

interface TailorRoleToggleProps {
  userId: string;
  userName: string;
  currentRole: 'tailor' | 'admin';
  isSelf?: boolean;
}

export function TailorRoleToggle({
  userId,
  userName,
  currentRole,
  isSelf,
}: TailorRoleToggleProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAdmin = currentRole === 'admin';
  const targetRole = isAdmin ? 'tailor' : 'admin';

  const handleConfirmRoleChange = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await updateUserRoleAction({
        target_id: userId,
        role: targetRole,
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
      setErrorMessage('Failed to update user role.');
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
        title={isSelf ? 'You cannot alter your own admin role' : undefined}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
          isSelf ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'
        } ${
          isAdmin
            ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
        }`}
      >
        {isAdmin ? (
          <>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Administrator</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Tailor Role</span>
          </>
        )}
      </button>

      {/* Confirmation Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in-up">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isAdmin
                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      : 'bg-[#2e7d32]/20 text-[#81c784] border border-[#2e7d32]/30'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {isAdmin ? 'Demote Administrator to Tailor' : 'Promote Tailor to Administrator'}
                  </h3>
                  <p className="text-xs text-slate-400">{userName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {isAdmin
                ? `Are you sure you want to remove administrator privileges from ${userName}? They will no longer be able to access the admin console.`
                : `Are you sure you want to promote ${userName} to an Administrator? They will be granted full access to the admin console, platform statistics, tailor accounts, and global templates.`}
            </p>

            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-800 rounded-xl text-xs text-red-200">
                {errorMessage}
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleConfirmRoleChange}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50 ${
                  isAdmin
                    ? 'bg-slate-700 hover:bg-slate-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm {isAdmin ? 'Demotion' : 'Promotion'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
