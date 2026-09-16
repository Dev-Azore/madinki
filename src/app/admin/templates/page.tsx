import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Layers,
  Sparkles,
  ArrowLeft,
  Calendar,
  Globe,
  Ruler,
} from 'lucide-react';
import { CreateGlobalTemplateModal } from '@/components/admin/CreateGlobalTemplateModal';
import { DeleteGlobalTemplateButton } from '@/components/admin/DeleteGlobalTemplateButton';

export const dynamic = 'force-dynamic';

export default async function AdminGlobalTemplatesPage() {
  const supabase = await createClient();

  // Fetch all global templates with fields
  const { data: globalTemplates } = await supabase
    .from('templates')
    .select(`
      id,
      name,
      is_global,
      created_at,
      template_fields (
        id,
        field_name,
        unit,
        order_index
      )
    `)
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  const templates = (globalTemplates || []).map((t) => ({
    ...t,
    template_fields: (t.template_fields || []).sort(
      (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
    ),
  }));

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2e7d32]/20 border border-[#2e7d32]/30 text-[#81c784] text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            Platform Library
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Global Style Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            System-wide default garment templates provided to all tailors on the platform.
          </p>
        </div>

        <CreateGlobalTemplateModal />
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto text-slate-500">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">No Global Templates Published</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create standard Nigerian & global presets (e.g. Royal Kaftan, Senator Wear, Abaya, Babban Riga) for all tailors.
            </p>
          </div>
          <CreateGlobalTemplateModal />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#81c784] px-2.5 py-0.5 rounded-full bg-[#2e7d32]/20 border border-[#2e7d32]/30">
                      Global Preset
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2">{tpl.name}</h3>
                  </div>
                  <DeleteGlobalTemplateButton
                    templateId={tpl.id}
                    templateName={tpl.name}
                  />
                </div>

                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-slate-500" />
                  <span>{tpl.template_fields.length} measurement points defined</span>
                </p>

                {/* Fields Preview */}
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Points:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {tpl.template_fields.map((f: { id: string; field_name: string; unit: string | null }) => (
                      <span
                        key={f.id}
                        className="text-[11px] px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 font-mono"
                      >
                        {f.field_name} {f.unit ? `(${f.unit})` : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Created {new Date(tpl.created_at).toLocaleDateString('en-GB')}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Live for all tailors
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
