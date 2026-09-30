'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Loader2, Check, ArrowRightLeft } from 'lucide-react';
import { updateTailorPlanAction } from '@/app/admin/actions';

interface TailorPlanToggleProps {
  tailorId: string;
  tailorName: string;
  currentPlan: 'free' | 'premium';
}

export function TailorPlanToggle({
  tailorId,
  tailorName,
  currentPlan,
}: TailorPlanToggleProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPremium = currentPlan === 'premium';
  const targetPlan = isPremium ? 'free' : 'premium';

  const handleTogglePlan = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await updateTailorPlanAction({
        target_id: tailorId,
        plan: targetPlan,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        setIsLoading(false);
        router.refresh();
      }
    } catch {
      setErrorMessage('Failed to update plan.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isLoading}
        onClick={handleTogglePlan}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer disabled:opacity-50 ${
          isPremium
            ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-300'
            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
        }`}
        title={`Click to switch to ${targetPlan.toUpperCase()} plan`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <ShieldCheck className="w-3.5 h-3.5" />
        )}
        <span>{isPremium ? 'Premium (Active)' : 'Free Tier'}</span>
        <ArrowRightLeft className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {errorMessage && (
        <span className="text-[11px] text-red-600">{errorMessage}</span>
      )}
    </div>
  );
}
