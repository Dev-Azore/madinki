'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Scissors,
  Loader2,
  AlertCircle,
  Save,
  Layers,
} from 'lucide-react';
import { createTemplate, updateTemplate } from './actions';
import { TemplateFieldInput } from '@/lib/validation/template';

// Curated preset templates tailored for Nigerian & contemporary tailoring
const PRESETS = [
  {
    name: 'Royal Kaftan (Male)',
    fields: [
      { field_name: 'Tsawon Riga (Shirt Length)', unit: 'in' },
      { field_name: 'Fadin Kafada (Shoulder)', unit: 'in' },
      { field_name: 'Kirji (Chest)', unit: 'in' },
      { field_name: 'Tsawon Hannu (Sleeve)', unit: 'in' },
      { field_name: 'Kugun Wando (Trouser Waist)', unit: 'in' },
      { field_name: 'Tsawon Wando (Trouser Length)', unit: 'in' },
      { field_name: 'Cinye (Thigh Width)', unit: 'in' },
      { field_name: 'Kafa (Ankle Width)', unit: 'in' },
    ],
  },
  {
    name: 'Babban Riga 3-Piece',
    fields: [
      { field_name: 'Tsawon Robe (Robe Length)', unit: 'in' },
      { field_name: 'Fadin Hannu (Wing Span)', unit: 'in' },
      { field_name: 'Kirjin Buba (Inner Chest)', unit: 'in' },
      { field_name: 'Tsawon Buba (Inner Length)', unit: 'in' },
      { field_name: 'Wuyan Riga (Neck)', unit: 'in' },
      { field_name: 'Tsawon Wando (Trouser Length)', unit: 'in' },
      { field_name: 'Kafan Wando (Ankle)', unit: 'in' },
    ],
  },
  {
    name: 'Executive Senator Wear',
    fields: [
      { field_name: 'Top Length (Riga)', unit: 'in' },
      { field_name: 'Shoulder (Kafada)', unit: 'in' },
      { field_name: 'Chest (Kirji)', unit: 'in' },
      { field_name: 'Sleeve (Hannu)', unit: 'in' },
      { field_name: 'Trouser Waist (Kugu)', unit: 'in' },
      { field_name: 'Trouser Length (Wando)', unit: 'in' },
      { field_name: 'Trouser Thigh (Cinye)', unit: 'in' },
    ],
  },
  {
    name: 'Female Gown / Abaya',
    fields: [
      { field_name: 'Bust (Kirji)', unit: 'in' },
      { field_name: 'Underbust (Karkashin Kirji)', unit: 'in' },
      { field_name: 'Waist (Kunkuru)', unit: 'in' },
      { field_name: 'Hip (Kugu)', unit: 'in' },
      { field_name: 'Shoulder to Floor / Gown Length', unit: 'in' },
      { field_name: 'Skirt Length (Tsawon Siket)', unit: 'in' },
      { field_name: 'Sleeve Length (Hannu)', unit: 'in' },
    ],
  },
  {
    name: 'Men’s Shirt & Trousers',
    fields: [
      { field_name: 'Neck / Collar', unit: 'in' },
      { field_name: 'Chest', unit: 'in' },
      { field_name: 'Shoulder Width', unit: 'in' },
      { field_name: 'Sleeve Length', unit: 'in' },
      { field_name: 'Shirt Length', unit: 'in' },
      { field_name: 'Trouser Waist', unit: 'in' },
      { field_name: 'Trouser Inseam', unit: 'in' },
      { field_name: 'Trouser Outseam', unit: 'in' },
    ],
  },
];

interface TemplateFormProps {
  initialData?: {
    id: string;
    name: string;
    template_fields: {
      id?: string;
      field_name: string;
      unit: string | null;
      order_index: number;
    }[];
  };
}

export function TemplateForm({ initialData }: TemplateFormProps) {
  const router = useRouter();
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || '');
  const [fields, setFields] = useState<TemplateFieldInput[]>(
    initialData?.template_fields && initialData.template_fields.length > 0
      ? initialData.template_fields.map((f, idx) => ({
          id: f.id,
          field_name: f.field_name,
          unit: f.unit || 'in',
          order_index: idx,
        }))
      : [
          { field_name: 'Tsawon Riga (Length)', unit: 'in', order_index: 0 },
          { field_name: 'Kirji (Chest)', unit: 'in', order_index: 1 },
          { field_name: 'Kafada (Shoulder)', unit: 'in', order_index: 2 },
          { field_name: 'Hannu (Sleeve)', unit: 'in', order_index: 3 },
        ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleAddField = () => {
    setFields((prev) => [
      ...prev,
      { field_name: '', unit: 'in', order_index: prev.length },
    ]);
  };

  const handleRemoveField = (index: number) => {
    if (fields.length <= 1) {
      setGeneralError('A template must contain at least one measurement point.');
      return;
    }
    setGeneralError(null);
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (
    index: number,
    key: 'field_name' | 'unit',
    value: string
  ) => {
    setFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, [key]: value } : f))
    );
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setFields((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === fields.length - 1) return;
    setFields((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleApplyPreset = (preset: (typeof PRESETS)[0]) => {
    if (name.trim() === '') {
      setName(preset.name);
    }
    setFields(
      preset.fields.map((f, idx) => ({
        field_name: f.field_name,
        unit: f.unit,
        order_index: idx,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setFieldErrors({});

    if (!name.trim()) {
      setFieldErrors({ name: ['Template name is required'] });
      return;
    }

    const emptyFieldIndex = fields.findIndex((f) => !f.field_name.trim());
    if (emptyFieldIndex !== -1) {
      setGeneralError(`Measurement point #${emptyFieldIndex + 1} is missing a name.`);
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && initialData) {
        const res = await updateTemplate({
          id: initialData.id,
          name: name.trim(),
          fields: fields.map((f, idx) => ({
            ...f,
            field_name: f.field_name.trim(),
            order_index: idx,
          })),
        });

        if (res.error) {
          setGeneralError(res.error);
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
          setIsSubmitting(false);
          return;
        }

        router.push('/templates');
        router.refresh();
      } else {
        const res = await createTemplate({
          name: name.trim(),
          fields: fields.map((f, idx) => ({
            ...f,
            field_name: f.field_name.trim(),
            order_index: idx,
          })),
        });

        if (res.error) {
          setGeneralError(res.error);
          if (res.fieldErrors) setFieldErrors(res.fieldErrors);
          setIsSubmitting(false);
          return;
        }

        router.push('/templates');
        router.refresh();
      }
    } catch {
      setGeneralError('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto animate-fade-in-up">
      {generalError && (
        <div className="flex items-start gap-3 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Preset Quick Loader */}
      {!isEditing && (
        <div className="p-4 sm:p-5 bg-white border border-emerald-200 rounded-2xl space-y-2.5 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>Popular Traditional Presets</span>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-xs font-bold text-slate-700 hover:text-[#1b5e20] transition-all cursor-pointer shadow-xs"
              >
                + {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Template Name Input */}
      <div className="p-4 sm:p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs">
        <label
          htmlFor="template-name"
          className="block text-xs font-bold uppercase tracking-wider text-slate-600"
        >
          Template Name <span className="text-[#1b5e20]">*</span>
        </label>
        <input
          id="template-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Royal Kaftan, Senator Suit, Babban Riga, Female Gown"
          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl text-[#0B2545] placeholder-slate-400 focus:outline-none text-base font-bold shadow-xs transition"
          disabled={isSubmitting}
        />
        {fieldErrors.name && (
          <p className="text-xs text-red-600 font-medium">{fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Measurement Fields List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0B2545] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#1b5e20]" />
              <span>Measurement Points ({fields.length})</span>
            </h2>
            <p className="text-xs text-slate-500">
              Set the exact body points to measure for this style.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddField}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1b5e20] border border-emerald-300 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Point</span>
          </button>
        </div>

        <div className="space-y-2">
          {fields.map((field, index) => (
            <div
              key={index}
              className="p-3 bg-white border border-slate-200 hover:border-[#2e7d32]/40 rounded-xl flex items-center gap-2 sm:gap-3 transition-colors shadow-xs"
            >
              {/* Order Number & Reorder */}
              <div className="flex flex-col items-center gap-0.5 text-slate-400">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0 || isSubmitting}
                  title="Move up"
                  className="p-1 hover:text-[#0B2545] disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold text-[#1b5e20]">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === fields.length - 1 || isSubmitting}
                  title="Move down"
                  className="p-1 hover:text-[#0B2545] disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Field Name Input */}
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={field.field_name}
                  onChange={(e) =>
                    handleFieldChange(index, 'field_name', e.target.value)
                  }
                  placeholder={`Measurement point name (e.g., Tsawon Riga, Hannu)`}
                  className="w-full px-3 py-2 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-lg text-sm text-[#0B2545] placeholder-slate-400 focus:outline-none font-medium shadow-xs"
                  disabled={isSubmitting}
                />
              </div>

              {/* Unit Selector */}
              <div className="w-24 sm:w-28 shrink-0">
                <select
                  value={field.unit || ''}
                  onChange={(e) =>
                    handleFieldChange(index, 'unit', e.target.value)
                  }
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 focus:border-[#2e7d32] rounded-lg text-xs font-bold text-[#1b5e20] focus:outline-none shadow-xs"
                  disabled={isSubmitting}
                >
                  <option value="in">Inches (in)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="m">Meters (m)</option>
                  <option value="yd">Yards (yd)</option>
                  <option value="">No unit</option>
                </select>
              </div>

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveField(index)}
                disabled={fields.length <= 1 || isSubmitting}
                title="Remove field"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddField}
          disabled={isSubmitting}
          className="w-full py-2.5 border-2 border-dashed border-slate-300 hover:border-[#2e7d32]/50 text-slate-600 hover:text-[#0B2545] bg-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Measurement Point</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium border border-slate-200 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white rounded-xl text-sm font-bold shadow-sm shadow-[#2e7d32]/25 transition disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isEditing ? 'Save Changes' : 'Create Template'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
