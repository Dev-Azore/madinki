'use client';

import { useState } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Loader2,
  Save,
  Layers,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
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
  const [newFieldName, setNewFieldName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleColumn = (id: string) => {
    // Keep at least customer name and total enabled
    if (id === 'client_name' || id === 'total_amount') return;
    setCols((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const handleAddCustomColumn = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newFieldName.trim();
    if (!trimmed) return;

    const id = `custom_${trimmed.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    if (cols.some((c) => c.id === id)) {
      setError('A column with this name already exists.');
      return;
    }

    const newCol: LedgerColumnConfig = {
      id,
      label: trimmed,
      enabled: true,
      order: cols.length,
      isCustom: true,
    };

    setCols((prev) => [...prev, newCol]);
    setNewFieldName('');
    setError(null);
  };

  const handleDeleteCustomColumn = (id: string) => {
    setCols((prev) => prev.filter((c) => c.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= cols.length) return;

    const updated = [...cols];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign order index
    const reordered = updated.map((c, idx) => ({ ...c, order: idx }));
    setCols(reordered);
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
      setError('Failed to save column preferences.');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Customize Ledger Columns
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Choose which columns show in your table and add your own custom fields
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

        {/* Add New Custom Column Bar */}
        <form onSubmit={handleAddCustomColumn} className="flex items-center gap-2">
          <input
            type="text"
            value={newFieldName}
            onChange={(e) => setNewFieldName(e.target.value)}
            placeholder="Add custom column (e.g. Fabric Type, Cap Size, Lining)..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-700 rounded-xl text-xs text-slate-900 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!newFieldName.trim()}
            className="px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>

        {/* Columns List */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {cols.map((col, index) => {
            const isMandatory = col.id === 'client_name' || col.id === 'total_amount';

            return (
              <div
                key={col.id}
                className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 transition ${
                  col.enabled
                    ? 'bg-emerald-50/40 border-emerald-200/80 text-slate-900'
                    : 'bg-slate-50/60 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleColumn(col.id)}
                    disabled={isMandatory}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                      col.enabled
                        ? 'bg-emerald-800 border-emerald-900 text-white shadow-2xs'
                        : 'bg-white border-slate-300 text-transparent'
                    } ${isMandatory ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="min-w-0">
                    <span className="font-bold text-xs block truncate">{col.label}</span>
                    {col.isCustom && (
                      <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider">
                        Custom Field
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Reorder arrows */}
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === cols.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete button if custom */}
                  {col.isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomColumn(col.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer ml-1"
                      title="Delete Custom Column"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Standard</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Columns</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
