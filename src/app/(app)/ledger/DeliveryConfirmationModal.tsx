'use client';

import { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Scissors,
  ShieldAlert,
} from 'lucide-react';
import { recordLedgerPayment, updateLedgerStatus, LedgerEntryItem } from './actions';

interface DeliveryConfirmationModalProps {
  isOpen: boolean;
  entry: LedgerEntryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeliveryConfirmationModal({
  isOpen,
  entry,
  onClose,
  onSuccess,
}: DeliveryConfirmationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !entry) return null;

  const total = entry.total_amount;
  const deposit = entry.deposit_amount;
  const balance = Math.max(0, total - deposit);
  const hasZeroDeposit = deposit === 0;

  // Option 1: Customer paid the remaining balance / full total now
  const handleConfirmPaidInFull = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      if (balance > 0) {
        const res = await recordLedgerPayment({
          id: entry.id,
          paymentAmount: balance,
          markDelivered: true,
        });
        if (res.error) {
          setError(res.error);
          setIsSubmitting(false);
          return;
        }
      } else {
        const res = await updateLedgerStatus({
          id: entry.id,
          status: 'delivered',
        });
        if (res.error) {
          setError(res.error);
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Option 2: Customer did not pay remaining balance — deliver with debt recorded
  const handleDeliverWithDebt = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await updateLedgerStatus({
        id: entry.id,
        status: 'delivered',
      });
      if (res.error) {
        setError(res.error);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Bayar da Kayan Dinki (Hand Over Clothes)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {entry.client_name} · {entry.style_type || 'Plain'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-bold">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Financial Details */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Jimillar Kudin Dinki (Total Price):</span>
            <strong className="text-slate-900 font-mono font-black text-sm">
              ₦{total.toLocaleString()}
            </strong>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-700">Kudin Ajiya da ya biya (Deposit):</span>
            <strong className="text-emerald-800 font-mono font-bold">
              {hasZeroDeposit ? '₦0 (Babu ajiya)' : `₦${deposit.toLocaleString()}`}
            </strong>
          </div>
          <div className="border-t border-slate-200/60 pt-2 flex items-center justify-between text-xs">
            <span className="text-amber-800 font-black">
              {hasZeroDeposit ? 'Kudin da ya rage ba a biya ba:' : 'Ragowar Kudi (Remaining Balance):'}
            </span>
            <strong className="text-amber-800 font-mono font-black text-base">
              ₦{balance.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Tailor Confirmation Prompt */}
        {balance > 0 ? (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
              <span className="font-black block flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                Tabbatar da Biyan Kudin Dinki
              </span>
              <p className="text-[11px] leading-relaxed text-amber-800">
                {hasZeroDeposit ? (
                  <>Mai kayan bai biya ko sisi na ajiya a baya ba. Shin ya biya duka <strong>₦{total.toLocaleString()}</strong> kafin ya karba, ko kuma da bashi ya tafi?</>
                ) : (
                  <>Akwai sauran <strong>₦{balance.toLocaleString()}</strong> da ba a biya ba. Shin mai kayan ya biya ragowar kafin ya tafi, ko kuma da bashi ya karba?</>
                )}
              </p>
            </div>

            {/* 2 Big Action Buttons */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmPaidInFull}
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {hasZeroDeposit
                        ? `Eh, Ya Biya Duka ₦${total.toLocaleString()} (Paid Full)`
                        : `Eh, Ya Biya Ragowar ₦${balance.toLocaleString()} (Paid Full)`}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDeliverWithDebt}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>
                      A&apos;a, Ya Karbi Kaya da Bashi (Delivered on Debt: ₦{balance.toLocaleString()})
                    </span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              Idan ya karba da bashi, za a rubuta bashin <strong>₦{balance.toLocaleString()}</strong> a asusun {entry.client_name} kuma tsarin zai ci gaba da lissafa shi.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
              <span>An biya kudin wannan aiki duka (₦0 Balance). Za a iya bayar da kaya.</span>
            </div>

            <button
              type="button"
              onClick={handleConfirmPaidInFull}
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bayar da Kayan (Mark as Delivered)</span>
                </>
              )}
            </button>
          </div>
        )}

        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
          >
            A&apos;a, koma baya (Cancel)
          </button>
        </div>
      </div>
    </div>
  );
}
