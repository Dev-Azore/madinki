'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Loader2, X, AlertCircle, Layers } from 'lucide-react';
import { createGlobalTemplateAction } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';

export function CreateGlobalTemplateModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [fields, setFields] = useState<Array<{ field_name: string; unit: string }>>([
    { field_name: 'Chest / Bust (Kirji)', unit: 'in' },
    { field_name: 'Shirt Length (Tsawon Riga)', unit: 'in' },
    { field_name: 'Shoulder Width (Kafada)', unit: 'in' },
    { field_name: 'Sleeve Length (Hannu)', unit: 'in' },
  ]);

  const handleAddField = () => {
    setFields((prev) => [...prev, { field_name: '', unit: 'in' }]);
  };

  const handleRemoveField = (index: number) => {
    if (fields.length <= 1) return;
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: 'field_name' | 'unit', val: string) => {
    setFields((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: val };
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter a template name.');
      return;
    }

    const validFields = fields.filter((f) => f.field_name.trim().length > 0);
    if (validFields.length === 0) {
      setErrorMessage('Please provide at least one valid measurement field name.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await createGlobalTemplateAction({
        name: name.trim(),
        fields: validFields,
      });

      if (res.error) {
        setErrorMessage(res.error);
        setIsLoading(false);
      } else {
        setIsOpen(false);
        setIsLoading(false);
        setName('');
        router.refresh();
      }
    } catch {
      setErrorMessage('Failed to create global template.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => {
          setErrorMessage(null);
          setIsOpen(true);
        }}
        className="bg-[#1b5e20] hover:bg-[#144818] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-[#1b5e20]/20"
      >
        <Plus className="w-4 h-4" />
        <span>Create Global Template</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in-up">
          <div className="bg-white border border-slate-200/90 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#1b5e20] flex items-center justify-center border border-emerald-200">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Create Global Style Template</h3>
                  <p className="text-xs text-slate-500">Available to all tailors on the platform</p>
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

            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Template Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Template / Garment Style Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Kaftan (Male)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              {/* Measurement Fields */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Measurement Points ({fields.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="text-xs text-[#1b5e20] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Point</span>
                  </button>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {fields.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400 w-5 text-right shrink-0">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        required
                        value={f.field_name}
                        onChange={(e) => handleFieldChange(idx, 'field_name', e.target.value)}
                        placeholder="Point name (e.g. Chest)"
                        className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 focus:border-[#1b5e20] focus:ring-1 focus:ring-[#1b5e20] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 outline-none"
                      />
                      <select
                        value={f.unit}
                        onChange={(e) => handleFieldChange(idx, 'unit', e.target.value)}
                        className="w-20 px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-700 outline-none focus:border-[#1b5e20]"
                      >
                        <option value="in">in</option>
                        <option value="cm">cm</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        disabled={fields.length <= 1}
                        className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg disabled:opacity-30 cursor-pointer transition"
                        title="Remove point"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#1b5e20] hover:bg-[#144818] text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-[#1b5e20]/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Layers className="w-4 h-4" />
                      <span>Save & Publish Global Style</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
