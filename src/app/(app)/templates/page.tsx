'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Ruler,
  Search,
  Edit2,
  Trash2,
  Layers,
  AlertCircle,
  Loader2,
  ChevronRight,
  Scissors,
} from 'lucide-react';
import { getTemplates, deleteTemplate } from './actions';
import { AdBanner } from '@/components/ads/AdBanner';

interface TemplateItem {
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete modal state
  const [templateToDelete, setTemplateToDelete] = useState<TemplateItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTemplates = useCallback(async () => {
    setError(null);
    try {
      const res = await getTemplates();
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setTemplates(res.data as TemplateItem[]);
      }
    } catch {
      setError('Failed to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchTemplates() {
      try {
        const res = await getTemplates();
        if (ignore) return;
        if (res.error) {
          setError(res.error);
        } else if (res.data) {
          setTemplates(res.data as TemplateItem[]);
        }
      } catch {
        if (!ignore) {
          setError('Failed to load templates. Please try again.');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    fetchTemplates();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;
    setIsDeleting(true);

    try {
      const res = await deleteTemplate(templateToDelete.id);
      if (res.error) {
        alert(res.error);
      } else {
        setTemplates((prev) => prev.filter((t) => t.id !== templateToDelete.id));
        setTemplateToDelete(null);
      }
    } catch {
      alert('Failed to delete template. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.template_fields.some((f) =>
      f.field_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2e7d32]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b5e20]">
              Garment Blueprints
            </span>
          </div>
          <h1 className="text-2xl font-black text-[#0B2545] mt-1">
            Measurement Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Create and organize custom garment forms for quick fittings.
          </p>
        </div>

        <Link
          href="/templates/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] active:scale-95 text-white font-bold rounded-xl text-sm shadow-sm shadow-[#2e7d32]/20 transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </Link>
      </div>

      {/* Search Bar with Counter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search templates or measurement fields..."
          className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-300 focus:border-[#2e7d32] focus:ring-2 focus:ring-[#2e7d32]/20 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none shadow-xs transition"
        />
        {templates.length > 0 && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-slate-100 text-[#1b5e20] text-[11px] font-mono border border-slate-200">
            {filteredTemplates.length} of {templates.length}
          </span>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p>{error}</p>
            <button
              onClick={loadTemplates}
              className="text-xs text-red-600 underline hover:text-red-800 mt-1 cursor-pointer"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1b5e20]" />
          <p className="text-sm">Loading templates...</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && templates.length === 0 && (
        <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-3xl max-w-md mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-[#1b5e20] rounded-2xl flex items-center justify-center mx-auto border border-emerald-200">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0B2545]">No templates created yet</h3>
            <p className="text-xs text-slate-600 mt-1">
              Create your custom templates for Kaftan, Babban Riga, Senator, or Gowns to speed up measurement sessions.
            </p>
          </div>
          <Link
            href="/templates/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Template</span>
          </Link>
        </div>
      )}

      {/* Filtered No Results */}
      {!isLoading && !error && templates.length > 0 && filteredTemplates.length === 0 && (
        <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <p className="text-sm">No templates found matching &ldquo;{searchQuery}&rdquo;</p>
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-[#1b5e20] hover:underline mt-1 cursor-pointer font-semibold"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Templates Grid */}
      {!isLoading && !error && filteredTemplates.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="p-5 bg-white border border-slate-200/90 hover:border-[#2e7d32]/50 rounded-2xl transition flex flex-col justify-between group shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-[#1b5e20] flex items-center justify-center font-bold text-sm shadow-xs">
                      <Scissors className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0B2545] text-base group-hover:text-[#1b5e20] transition">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {template.template_fields.length} measurement {template.template_fields.length === 1 ? 'point' : 'points'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/templates/${template.id}/edit`}
                      title="Edit Template"
                      className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setTemplateToDelete(template)}
                      title="Delete Template"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Field Tags Preview */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {template.template_fields.slice(0, 6).map((field) => (
                    <span
                      key={field.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-50 text-[11px] font-medium text-slate-700 border border-slate-200"
                    >
                      {field.field_name}
                      {field.unit && (
                        <span className="text-[#1b5e20] ml-1 font-semibold">({field.unit})</span>
                      )}
                    </span>
                  ))}
                  {template.template_fields.length > 6 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500 border border-slate-200">
                      +{template.template_fields.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3.5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono">
                  ID: #{template.id.slice(0, 6)}
                </span>
                <Link
                  href={`/measurements/new?templateId=${template.id}`}
                  className="flex items-center gap-1 text-xs font-bold text-[#1b5e20] hover:underline"
                >
                  <span>Use for Fitting</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {templateToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-[#0B2545]">Delete Template</h3>
              <p className="text-xs text-slate-600 mt-1">
                Are you sure you want to delete <strong>{templateToDelete.name}</strong>? Existing historical measurement tickets will remain preserved.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setTemplateToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ad Banner bottom */}
      <div className="pt-2">
        <AdBanner slotId="templates_bottom" />
      </div>
    </div>
  );
}
