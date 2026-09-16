'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, Check, ArrowRightLeft } from 'lucide-react';
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
            ? 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 border border-amber-400/30'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
        }`}
        title={`Click to switch to ${targetPlan.toUpperCase()} plan`}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        <span>{isPremium ? 'Premium (Active)' : 'Free Tier'}</span>
        <ArrowRightLeft className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {errorMessage && (
        <span className="text-[11px] text-red-400">{errorMessage}</span>
      )}
    </div>
  );
}
