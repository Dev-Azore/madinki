'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Ruler, Loader2, AlertCircle } from 'lucide-react';
import { getTemplateById } from '../../actions';
import { TemplateForm } from '../../TemplateForm';

interface TemplateData {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  template_fields: {
    id: string;
    field_name: string;
    unit: string | null;
    order_index: number;
  }[];
}

export default function EditTemplatePage() {
  const params = useParams();
  const templateId = params?.id as string;

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;

    let ignore = false;

    async function load() {
      try {
        const res = await getTemplateById(templateId);
        if (ignore) return;
        if (res.error || !res.data) {
          setError(res.error || 'Template not found');
        } else {
          setTemplate(res.data as TemplateData);
        }
      } catch {
        if (!ignore) {
          setError('Failed to load template');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [templateId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/templates"
          className="p-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-[#0B2545] rounded-xl shadow-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <Ruler className="w-6 h-6 text-[#1b5e20]" />
            Edit Garment Style
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Update measurement points and units for this garment style.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1b5e20]" />
          <p className="text-sm">Loading template details...</p>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div>
            <p>{error}</p>
            <Link
              href="/templates"
              className="text-xs text-red-600 underline hover:text-red-800 mt-1 inline-block"
            >
              Back to templates
            </Link>
          </div>
        </div>
      )}

      {!isLoading && !error && template && (
        <TemplateForm initialData={template} />
      )}
    </div>
  );
}
