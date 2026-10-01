'use client';

import { useState } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Loader2,
  Save,
  Layers,
  Sparkles,
} from 'lucide-react';
import { saveLedgerSettings } from './actions';
import {
  LedgerColumnConfig,
  DEFAULT_LEDGER_COLUMNS,
} from '@/lib/validation/ledger';

interface LedgerColumnCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  columns: LedgerColumnConfig[];
  onSave: (newCols: LedgerColumnConfig[]) => void;
}

export function LedgerColumnCustomizer({
  isOpen,
  onClose,
  columns,
  onSave,
}: LedgerColumnCustomizerProps) {
  const [cols, setCols] = useState<LedgerColumnConfig[]>(columns);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleColumn = (id: string) => {
    setCols((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleResetToDefault = () => {
    setCols(DEFAULT_LEDGER_COLUMNS);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await saveLedgerSettings(cols);
      if (res.error) {
        setError(res.error);
        setIsSaving(false);
        return;
      }
      onSave(cols);
      setIsSaving(false);
      onClose();
    } catch {
      setError('Failed to save column settings.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#1b5e20] flex items-center justify-center font-bold shadow-2xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Customize Ledger Columns
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Choose which fields appear in your E-Book table
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
          <p className="text-xs text-red-600 font-bold p-2.5 bg-red-50 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        {/* Columns List */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {cols.map((col) => (
            <label
              key={col.id}
              className={`p-3 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                col.enabled
                  ? 'bg-emerald-50/50 border-emerald-300 text-slate-900'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={col.enabled}
                  onChange={() => handleToggleColumn(col.id)}
                  className="w-4 h-4 text-[#1b5e20] rounded-md border-slate-300 focus:ring-[#1b5e20]"
                />
                <div>
                  <span className="text-xs font-bold block">{col.label}</span>
                  {col.hausaLabel && (
                    <span className="text-[10px] text-slate-500 block italic">
                      {col.hausaLabel}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                  col.enabled
                    ? 'bg-[#1b5e20] text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {col.enabled ? 'Active' : 'Hidden'}
              </span>
            </label>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 flex items-center justify-between border-t border-slate-100">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs text-slate-500 hover:text-slate-900 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#1b5e20] to-[#144818] text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Columns</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
