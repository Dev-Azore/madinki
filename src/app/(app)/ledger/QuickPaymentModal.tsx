'use client';

import { useState } from 'react';
import {
  X,
  Wallet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { recordLedgerPayment, LedgerEntryItem } from './actions';

interface QuickPaymentModalProps {
  isOpen: boolean;
  entry: LedgerEntryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickPaymentModal({
  isOpen,
  entry,
  onClose,
  onSuccess,
}: QuickPaymentModalProps) {
  if (!isOpen || !entry) return null;

  const total = entry.total_amount;
  const currentDeposit = entry.deposit_amount;
  const balance = Math.max(0, total - currentDeposit);

  const [paymentAmount, setPaymentAmount] = useState<string>(balance.toString());
  const [markDelivered, setMarkDelivered] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = parseFloat(paymentAmount) || 0;
  const newBalance = Math.max(0, balance - parsedAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAmount <= 0) {
      setError('Please enter a valid payment amount greater than ₦0.');
      return;
    }
    if (parsedAmount > balance) {
      setError(`Payment cannot exceed the remaining balance of ₦${balance.toLocaleString()}.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await recordLedgerPayment({
        id: entry.id,
        paymentAmount: parsedAmount,
        markDelivered: markDelivered || newBalance === 0,
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
      setError('Failed to record payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const setPreset = (amt: number) => {
    setPaymentAmount(Math.min(balance, amt).toString());
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Collect Payment (Karbar Kudi)
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

        {/* Financial Breakdown Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Total Bill
            </span>
            <div className="text-xs font-black text-slate-900">
              ₦{total.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
              Already Paid
            </span>
            <div className="text-xs font-black text-emerald-800">
              ₦{currentDeposit.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
              Balance Due
            </span>
            <div className="text-xs font-black text-amber-700">
              ₦{balance.toLocaleString()}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Amount to collect input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              Amount Paying Now (Kudin da Za a Karba)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-black text-base text-emerald-800">
                ₦
              </span>
              <input
                type="number"
                min="1"
                max={balance}
                step="50"
                value={paymentAmount}
                onChange={(e) => {
                  setPaymentAmount(e.target.value);
                  setError(null);
                }}
                className="w-full pl-8 pr-4 py-2.5 bg-white border-2 border-emerald-600 focus:border-emerald-800 rounded-2xl text-slate-900 font-black text-lg focus:outline-none shadow-xs"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Quick Select
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setPreset(balance)}
                className={`px-3 py-1.5 rounded-xl font-black text-[11px] border transition cursor-pointer ${
                  parsedAmount === balance
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                ✨ Pay Full ₦{balance.toLocaleString()}
              </button>
              {balance > 1000 && (
                <button
                  type="button"
                  onClick={() => setPreset(1000)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] border border-slate-200 transition cursor-pointer"
                >
                  ₦1,000
                </button>
              )}
              {balance > 2000 && (
                <button
                  type="button"
                  onClick={() => setPreset(2000)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] border border-slate-200 transition cursor-pointer"
                >
                  ₦2,000
                </button>
              )}
              {balance > 5000 && (
                <button
                  type="button"
                  onClick={() => setPreset(5000)}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[11px] border border-slate-200 transition cursor-pointer"
                >
                  ₦5,000
                </button>
              )}
            </div>
          </div>

          {/* After payment summary */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-emerald-900 font-medium">Remaining balance after payment:</span>
            <span className="font-black text-emerald-900 font-mono text-sm">
              {newBalance === 0 ? '₦0 (Fully Settled ✅)' : `₦${newBalance.toLocaleString()}`}
            </span>
          </div>

          {/* Delivery checkbox */}
          <label className="flex items-start gap-2.5 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition">
            <input
              type="checkbox"
              checked={markDelivered}
              onChange={(e) => setMarkDelivered(e.target.checked)}
              className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700"
            />
            <div className="text-[11px]">
              <span className="font-bold text-slate-800 block">
                Mark as Delivered / Collected (An Karba)
              </span>
              <span className="text-slate-500 text-[10px]">
                Customer is taking the clothes now and order is completed.
              </span>
            </div>
          </label>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-900 hover:to-emerald-950 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm ₦{parsedAmount.toLocaleString()} Payment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
